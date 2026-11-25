import Link from 'next/link';
import { PackageX, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-white">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <PackageX className="w-8 h-8 text-[#FF7900]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#FF7900] bg-orange-50 px-3 py-1 rounded-full inline-block">
            404 Not Found
          </span>
          <h1 className="text-2xl font-black text-gray-900">Page Not Found</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            The page you are looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#FF7900] hover:bg-[#ea580c] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Toys</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
