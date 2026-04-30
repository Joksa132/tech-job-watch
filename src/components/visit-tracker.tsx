'use client';

import { useEffect } from 'react';

export function VisitTracker() {
  useEffect(() => {
    document.cookie = `lastVisit=${new Date().toISOString()}; path=/; max-age=31536000; samesite=lax`;
  }, []);
  return null;
}
