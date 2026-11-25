import React from 'react';
import { RotateCcw, CheckCircle2, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function ReturnsPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#19152B]">ALMARTO Pop DIY Returns &amp; Missing Piece Policy</h1>
        <p className="text-xs text-gray-500 mt-1">
          Complete creator protection, free missing piece replacement, and transparent refund timelines
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-gray-100">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <span className="font-bold text-[#35109B] text-sm block mb-1">Lifetime Part Guarantee</span>
            <p className="text-gray-500">Lost a brick, basswood piece, or LED wire? We replace it for free.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <span className="font-bold text-[#FF7900] text-sm block mb-1">7 Days Return Window</span>
            <p className="text-gray-500">Unopened sealed kits are fully returnable with doorstep courier pickup.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <span className="font-bold text-emerald-600 text-sm block mb-1">Instant Refund</span>
            <p className="text-gray-500">Credited to original source (UPI/Card) or bank within 24-48 hours.</p>
          </div>
        </div>

        <h2 className="text-base font-bold text-[#19152B]">Free Missing Piece Lifetime Guarantee</h2>
        <p className="text-gray-600">
          We know how frustrating it is when a tiny brick, screw, or diorama part goes missing during an intricate 6-hour build. Simply take a photo of your manual page with the part circled, message our support team or initiate a replacement from your order dashboard, and our Bangalore fulfillment hub will dispatch the exact replacement part via express courier within 24 hours at zero cost to you.
        </p>

        <h2 className="text-base font-bold text-[#19152B] pt-4 border-t">Pop Toy Specific Guidelines</h2>
        <ul className="space-y-2 text-gray-600">
          <li><strong>Paint-Your-Own Vinyl Kits:</strong> Eligible for return if unpainted and all paint pots/brushes remain sealed. Transit damage covered 100%.</li>
          <li><strong>Mystery DIY Blind Boxes:</strong> To preserve the integrity and surprise odds (including 1:72 chase editions), blind boxes can only be returned if the outer foil and factory seal are intact. Defective inner parts will receive instant direct replacement.</li>
          <li><strong>Miniature Dioramas &amp; Book Nooks:</strong> Full replacement guaranteed for any fractured basswood panels, damaged acrylic dust cases, or faulty LED motion sensor circuits.</li>
          <li><strong>Fluid Art Pouring Kits &amp; Clays:</strong> If any paint pot arrives dried or compromised in transit, we will immediately courier a fresh replacement paint set.</li>
        </ul>
      </div>
    </div>
  );
}
