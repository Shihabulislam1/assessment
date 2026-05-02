'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import RegisterForm from '@/components/auth/RegisterForm';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function RegisterPage() {
  const { user, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized && user) {
      router.push('/');
    }
  }, [initialized, user, router]);

  if (!initialized) {
    return <LoadingSpinner />;
  }

  return (
    <AuthLayout>
      <AuthHeader 
        title="FredoCloud" 
        subtitle="Join our strategic network" 
      />
      <RegisterForm />
    </AuthLayout>
  );
}