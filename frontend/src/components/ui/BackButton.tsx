'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(useAuthStore.getState().isAuthenticated ? '/dashboard' : '/login');
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Volver"
      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-black/25 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition-colors duration-200 hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Volver
    </button>
  );
}
