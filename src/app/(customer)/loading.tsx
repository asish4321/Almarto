import { ToyLoader } from '@/components/common/ToyLoader';

export default function CustomerLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <ToyLoader size="lg" text="Setting up your store..." />
    </div>
  );
}
