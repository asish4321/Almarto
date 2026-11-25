import { ToyLoader } from '@/components/common/ToyLoader';

export default function CustomerLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
      <ToyLoader size="lg" text="Loading your store..." />
      <p className="text-[11px] text-gray-400">Hang on, fetching the good stuff</p>
    </div>
  );
}
