'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }) {
  const { initialized, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      fetchUser();
    }
  }, [initialized, fetchUser]);

  return children;
}