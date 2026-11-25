import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CheckCircle2, Package, Printer, ArrowRight, Truck, MapPin } from 'lucide-react';

export default async function OrderSuccessPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const { orderNumber } = params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payments: true,
      shipment: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddress = order.shippingAddressSnapshot
    ? JSON.parse(order.shippingAddressSnapshot)
    : null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-lg text-center space-y-6">
        {/* Celebration Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#19152B] mt-2">
            Thank you for shopping on ALMARTO!
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            We have sent an order confirmation message to your registered contact.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#F7F7FB] p-5 rounded-2xl border border-gray-200/60 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block text-[11px]">Order Number</span>
            <span className="font-mono font-bold text-sm text-[#35109B]">{order.orderNumber}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">Estimated Delivery</span>
            <span className="font-bold text-[#19152B] flex items-center space-x-1">
              <Truck className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>
                {order.estimatedDeliveryDate
                  ? new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'In 2-3 business days'}
              </span>
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">Total Paid</span>
            <span className="font-bold text-[#19152B] text-sm">
              ₹{order.totalAmount.toLocaleString('en-IN')} ({order.paymentMethod})
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">Courier Tracking</span>
            <span className="font-bold text-gray-800">
              {order.shipment?.courierPartner || 'Delhivery Express'} ({order.shipment?.awbNumber || 'Manifested'})
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        {shippingAddress && (
          <div className="text-left bg-gray-50 p-4 rounded-xl text-xs text-gray-600 border border-gray-100 flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-[#35109B] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-800 block">Delivery Address:</span>
              <p>
                {shippingAddress.fullName} • {shippingAddress.phone}
                <br />
                {shippingAddress.flatHouse}, {shippingAddress.areaColony}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
              </p>
            </div>
          </div>
        )}

        {/* Items mini-list */}
        <div className="text-left space-y-2 pt-2 border-t border-gray-100">
          <span className="font-bold text-xs text-gray-700 uppercase tracking-wider block">
            Items in this Shipment:
          </span>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 bg-white rounded-lg border overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-contain p-1" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 line-clamp-1">{item.title}</span>
                    <span className="text-gray-400 text-[11px]">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-[#19152B]">₹{item.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-gray-100">
          <Link
            href={`/account/orders/${order.orderNumber}`}
            className="w-full sm:w-auto bg-[#35109B] hover:bg-[#270A77] text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Timeline</span>
          </Link>

          <Link
            href={`/account/orders/${order.orderNumber}/invoice`}
            className="w-full sm:w-auto border border-gray-300 hover:border-[#35109B] text-gray-800 px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>View &amp; Print GST Invoice</span>
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto bg-[#FF7900] hover:bg-[#ea580c] text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
