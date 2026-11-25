'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Printer, ArrowLeft, ShieldCheck } from 'lucide-react';

interface InvoiceOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  deliveryCharge: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddressSnapshot: string;
  items: {
    id: string;
    title: string;
    sku: string;
    quantity: number;
    price: number;
    mrp: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  }[];
}

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<InvoiceOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-sm">Generating tax invoice...</div>;
  }

  if (!order) {
    return <div className="p-12 text-center text-sm">Invoice not available for this order.</div>;
  }

  const shippingAddress = order.shippingAddressSnapshot
    ? JSON.parse(order.shippingAddressSnapshot)
    : null;

  const isIntrastate = shippingAddress?.state?.toLowerCase().includes('karnataka');

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      {/* Controls Bar */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between no-print">
        <Link
          href={`/account/orders/${order.orderNumber}`}
          className="text-xs font-bold text-[#35109B] hover:underline flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Order Tracking</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="bg-[#35109B] hover:bg-[#270A77] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Invoice Paper Sheet */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-gray-200 text-gray-800 text-xs font-sans print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-gray-900 gap-4">
          <div className="space-y-1">
            <div className="relative h-12 w-44 mb-2">
              <Image src="/logo.png" alt="ALMARTO" fill priority sizes="176px" className="object-contain" />
            </div>
            <p className="font-bold text-sm text-[#19152B]">Almarto Internet Private Limited</p>
            <p className="text-gray-600 leading-snug">
              Bahadurpally, Hyderabad<br />
              Telangana - 500043, India<br />
              <strong>Phone:</strong> 7032503603 | <strong>Email:</strong> almarto14@gmail.com<br />
              <strong>GSTIN:</strong> 36AAACA1234M1Z5
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="bg-[#35109B] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded inline-block mb-1">
              Tax Invoice
            </span>
            <p><strong>Invoice No:</strong> INV-{order.orderNumber}</p>
            <p><strong>Invoice Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
            <p><strong>Order No:</strong> {order.orderNumber}</p>
            <p><strong>Place of Supply:</strong> {shippingAddress?.state || 'Karnataka'} (Code: 29)</p>
          </div>
        </div>

        {/* Billing & Shipping Address */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-gray-200">
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider mb-1.5">
              Bill To / Sold To:
            </h4>
            {shippingAddress ? (
              <p className="text-gray-700 leading-relaxed">
                <strong>{shippingAddress.fullName}</strong><br />
                {shippingAddress.flatHouse}, {shippingAddress.areaColony}<br />
                {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}<br />
                Phone: {shippingAddress.phone}
              </p>
            ) : (
              <p className="text-gray-500">Customer</p>
            )}
          </div>

          <div>
            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider mb-1.5">
              Ship To:
            </h4>
            {shippingAddress ? (
              <p className="text-gray-700 leading-relaxed">
                <strong>{shippingAddress.fullName}</strong><br />
                {shippingAddress.flatHouse}, {shippingAddress.areaColony}<br />
                {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}<br />
                Phone: {shippingAddress.phone}
              </p>
            ) : (
              <p className="text-gray-500">Customer</p>
            )}
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-900 font-bold border-y border-gray-300">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Description &amp; SKU</th>
                <th className="py-2.5 px-2 text-center">HSN</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Gross (₹)</th>
                <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                <th className="py-2.5 px-2 text-center">GST %</th>
                <th className="py-2.5 px-3 text-right">GST (₹)</th>
                <th className="py-2.5 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item, idx) => {
                const itemTotal = item.price * item.quantity;
                const taxRate = item.taxRate || 18.0;
                const taxableVal = Math.round((itemTotal * 100) / (100 + taxRate));
                const itemTax = itemTotal - taxableVal;

                return (
                  <tr key={item.id}>
                    <td className="py-3 px-3 text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <strong className="text-gray-900 block">{item.title}</strong>
                      <span className="text-[10px] text-gray-400 font-mono">SKU: {item.sku}</span>
                    </td>
                    <td className="py-3 px-2 text-center font-mono">8517</td>
                    <td className="py-3 px-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-3 text-right">₹{(item.mrp * item.quantity).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right font-medium">₹{taxableVal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-2 text-center">{taxRate}%</td>
                    <td className="py-3 px-3 text-right">₹{itemTax.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900">₹{itemTotal.toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals & Tax Breakup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t-2 border-gray-900">
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider">
              GST Tax Breakdown
            </h4>
            <div className="bg-gray-50 p-3 rounded-lg border text-[11px] space-y-1">
              {isIntrastate ? (
                <>
                  <div className="flex justify-between">
                    <span>CGST (9.0%):</span>
                    <span>₹{(order.taxAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (9.0%):</span>
                    <span>₹{(order.taxAmount / 2).toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>IGST (18.0%):</span>
                  <span>₹{order.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1 border-t text-gray-900">
                <span>Total Tax Amount:</span>
                <span>₹{order.taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-gray-500">
              <p>Payment Mode: <strong>{order.paymentMethod}</strong> (Status: <strong>{order.paymentStatus}</strong>)</p>
            </div>
          </div>

          <div className="space-y-2 text-right">
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Gross Items Subtotal:</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promotional Coupon Discount:</span>
                  <span>-₹{order.couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery &amp; Packaging:</span>
                <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
              </div>

              <div className="flex justify-between pt-2 border-t-2 border-gray-900 text-base font-black text-[#19152B]">
                <span>Invoice Total:</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Declaration & Signatory */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-end justify-between gap-6">
          <div className="text-[11px] text-gray-500 max-w-sm space-y-1">
            <p className="font-bold text-gray-700">Declaration:</p>
            <p>
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </p>
          </div>

          <div className="text-center sm:text-right">
            <p className="font-bold text-xs text-[#19152B]">For Almarto Internet Private Limited</p>
            <div className="my-3 font-serif italic text-base text-[#35109B] font-bold">
              Authorized Signatory
            </div>
            <p className="text-[10px] text-gray-400">Computer Generated Tax Invoice</p>
          </div>
        </div>
      </div>
    </div>
  );
}
