'use client';

import { useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

export default function QRRedirect() {
  const router = useRouter();
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (hasRecorded.current) return;

    const recordRedirect = async () => {
      try {
        hasRecorded.current = true;
        await fetch('/api/qr-analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qrCode: 'teqhk',
            redirectUrl: '/ru/',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        });
        router.replace('/ru/');
      } catch (error) {
        console.error('Failed to record QR redirect:', error);
        hasRecorded.current = false; // Reset on error to allow retry
        router.replace('/ru/');
      }
    };

    recordRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Перенаправление...</p>
      </div>
    </div>
  );
}
