'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Tapix Admin] Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-50 px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-dark-900 mb-4">Admin Error</h2>
        <p className="text-dark-500 mb-6">
          Something went wrong in the admin panel. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
