'use client';

import { useEffect, useState } from 'react';

export default function NoHydrationError() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="rounded border border-green-400 bg-green-100 p-4 text-green-700">
      ✅ Гидратация прошла успешно! Ошибки гидратации исправлены.
    </div>
  );
}
