import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {

    const settings = await prisma.websiteSetting.findMany({
      where: {
        key: {
          in: [
            'free_shipping_threshold',
            'standard_shipping_charge',
            'express_shipping_charge',
            'default_courier',
            'shiprocket_api_key',
            'delhivery_api_token',
            'shipping_mode',
          ],
        },
      },
    });

    const config = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      config: {
        freeShippingThreshold: config.free_shipping_threshold || '499',
        standardShippingCharge: config.standard_shipping_charge || '49',
        expressShippingCharge: config.express_shipping_charge || '99',
        defaultCourier: config.default_courier || 'DELHIVERY',
        delhiveryToken: config.delhivery_api_token || 'del_sandbox_token_demo_982',
        shiprocketKey: config.shiprocket_api_key || 'sr_demo_key_7718',
        shippingMode: config.shipping_mode || 'SANDBOX',
      },
      couriers: [
        { id: 'DELHIVERY', name: 'Delhivery Surface & Express', active: true, avgDays: '1-3 Days', coveragePincodes: '19,500+' },
        { id: 'BLUEDART', name: 'BlueDart Apex Air', active: true, avgDays: '1-2 Days', coveragePincodes: '14,000+' },
        { id: 'SHIPROCKET', name: 'Shiprocket Courier Aggregator', active: true, avgDays: '2-4 Days', coveragePincodes: '24,000+' },
        { id: 'DTDC', name: 'DTDC Express', active: false, avgDays: '2-5 Days', coveragePincodes: '12,000+' },
      ],
    });
  } catch (error) {
    console.error('Shipping config fetch error:', error);
    return NextResponse.json({ message: 'Failed to fetch shipping configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {

    const body = await request.json();
    const {
      freeShippingThreshold,
      standardShippingCharge,
      expressShippingCharge,
      defaultCourier,
      delhiveryToken,
      shiprocketKey,
      shippingMode,
    } = body;

    const upserts = [
      { key: 'free_shipping_threshold', value: String(freeShippingThreshold) },
      { key: 'standard_shipping_charge', value: String(standardShippingCharge) },
      { key: 'express_shipping_charge', value: String(expressShippingCharge) },
      { key: 'default_courier', value: String(defaultCourier) },
      { key: 'delhivery_api_token', value: String(delhiveryToken) },
      { key: 'shiprocket_api_key', value: String(shiprocketKey) },
      { key: 'shipping_mode', value: String(shippingMode) },
    ];

    for (const item of upserts) {
      if (item.value !== undefined) {
        await prisma.websiteSetting.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value, group: 'SHIPPING' },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Shipping configuration saved successfully' });
  } catch (error) {
    console.error('Update shipping error:', error);
    return NextResponse.json({ message: 'Failed to update shipping config' }, { status: 500 });
  }
}
