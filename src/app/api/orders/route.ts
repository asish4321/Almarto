import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'ORDER_MANAGER', 'CUSTOMER_SUPPORT', 'FINANCE_MANAGER'].includes(
      user.role
    );

    const where: Record<string, unknown> = {};

    if (!isStaff) {
      // Regular customer only views their own orders
      where.userId = user.id;
    } else if (searchParams.get('customerId')) {
      where.userId = searchParams.get('customerId');
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: true,
          payments: true,
          shipment: {
            include: {
              trackingSteps: {
                orderBy: { timestamp: 'desc' },
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          refunds: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Please log in to place an order' }, { status: 401 });
    }

    const body = await request.json();
    const {
      items,
      shippingAddress,
      paymentMethod = 'COD',
      deliveryOption = 'STANDARD',
      couponCode,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Cart items cannot be empty' }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.pincode) {
      return NextResponse.json({ message: 'Valid delivery address is required' }, { status: 400 });
    }

    // Verify products and calculate prices on server-side
    let calculatedSubtotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product) {
        return NextResponse.json({ message: `Product ${item.productId} no longer exists` }, { status: 400 });
      }

      let price = product.price;
      let mrp = product.mrp;
      let sku = product.sku;
      let title = product.title;
      let availableStock = product.stock;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          price = variant.price;
          mrp = variant.mrp;
          sku = variant.sku;
          title = `${product.title} (${variant.title})`;
          availableStock = variant.stock;
        }
      }

      if (availableStock < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for "${product.title}". Available: ${availableStock}` },
          { status: 400 }
        );
      }

      const itemTotal = price * item.quantity;
      calculatedSubtotal += itemTotal;

      const taxRate = product.taxRate || 18.0;
      const taxAmount = Math.round((itemTotal * taxRate) / (100 + taxRate));

      verifiedOrderItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        title,
        sku,
        image: item.image || '',
        price,
        mrp,
        quantity: item.quantity,
        taxRate,
        taxAmount,
        total: itemTotal,
      });
    }

    // Coupon verification
    let couponDiscount = 0;
    let couponRecord = null;
    if (couponCode) {
      couponRecord = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (
        couponRecord &&
        couponRecord.isActive &&
        new Date() >= couponRecord.validFrom &&
        new Date() <= couponRecord.validUntil &&
        calculatedSubtotal >= couponRecord.minOrderValue
      ) {
        if (couponRecord.type === 'PERCENTAGE') {
          const discountCalc = (calculatedSubtotal * couponRecord.value) / 100;
          couponDiscount = couponRecord.maxDiscount
            ? Math.min(discountCalc, couponRecord.maxDiscount)
            : discountCalc;
        } else {
          couponDiscount = couponRecord.value;
        }
        couponDiscount = Math.min(couponDiscount, calculatedSubtotal);
      }
    }

    const deliveryCharge =
      deliveryOption === 'EXPRESS' ? 99 : calculatedSubtotal < 499 ? 49 : 0;

    const totalAmount = Math.max(0, calculatedSubtotal - couponDiscount + deliveryCharge);
    const taxAmountTotal = verifiedOrderItems.reduce((acc, curr) => acc + curr.taxAmount, 0);

    // Generate Order Number
    const timestampPart = Date.now().toString().slice(-4);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ALM-${timestampPart}-${randomPart}`;

    const courierPartner = shippingAddress.pincode.startsWith('56') ? 'DELHIVERY' : 'BLUEDART';
    const awbNumber = `${courierPartner.slice(0, 3)}${Date.now()}`;

    // Estimated delivery (1-3 days depending on pincode and deliveryOption)
    const deliveryDays = deliveryOption === 'EXPRESS' ? 1 : 3;
    const estimatedDeliveryDate = new Date(Date.now() + 86400000 * deliveryDays);

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'CONFIRMED',
        subtotal: calculatedSubtotal,
        discount: 0,
        couponDiscount,
        deliveryCharge,
        taxAmount: taxAmountTotal,
        totalAmount,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        paymentMethod,
        shippingAddressSnapshot: JSON.stringify(shippingAddress),
        deliveryOption,
        estimatedDeliveryDate,
        items: {
          create: verifiedOrderItems,
        },
        payments: {
          create: {
            amount: totalAmount,
            currency: 'INR',
            method: paymentMethod,
            status: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
            transactionId: `${paymentMethod}-TXN-${Date.now()}`,
          },
        },
        shipment: {
          create: {
            courierPartner,
            awbNumber,
            status: 'LABEL_CREATED',
            estimatedDays: deliveryDays,
            trackingSteps: {
              create: [
                {
                  status: 'MANIFESTED',
                  location: 'Almarto Central Fulfillment Hub, Bengaluru',
                  activity: 'Order confirmed and shipment manifest generated with courier',
                },
              ],
            },
          },
        },
      },
      include: {
        items: true,
        payments: true,
        shipment: true,
      },
    });

    // Deduct stock for ordered items
    for (const item of verifiedOrderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }
    }

    // Record coupon usage
    if (couponRecord) {
      await prisma.couponUsage.create({
        data: {
          couponId: couponRecord.id,
          userId: user.id,
          orderId: newOrder.id,
          discountApplied: couponDiscount,
        },
      });
      await prisma.coupon.update({
        where: { id: couponRecord.id },
        data: {
          usageCount: { increment: 1 },
        },
      });
    }

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Order ${orderNumber} Confirmed!`,
        message: `Thank you for shopping on ALMARTO. Your order has been placed and will be delivered by ${estimatedDeliveryDate.toLocaleDateString(
          'en-IN',
          { weekday: 'short', month: 'short', day: 'numeric' }
        )}.`,
        type: 'ORDER',
        link: `/account/orders/${orderNumber}`,
      },
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      orderNumber: newOrder.orderNumber,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ message: 'Failed to place order' }, { status: 500 });
  }
}
