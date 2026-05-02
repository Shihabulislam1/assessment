'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function LoginForm() {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
      <CardHeader className="pt-8 pb-4 px-8">
        <CardTitle className="text-2xl font-bold tracking-tight">Sign in</CardTitle>
        <p className="text-sm text-muted-foreground">Welcome back! Please enter your details.</p>
      </CardHeader>
      
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold px-4 py-3 rounded-xl animate-in shake duration-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold ml-1">
              Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="pl-10 h-12 bg-muted/30 border-muted-foreground/10 rounded-xl focus:ring-primary/20 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label htmlFor="password" className="text-sm font-semibold">
                Password
              </label>
              <Link href="#" className="text-xs font-bold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="pl-10 h-12 bg-muted/30 border-muted-foreground/10 rounded-xl focus:ring-primary/20 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Sign in <ArrowRight className="size-4" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="bg-muted/30 px-8 py-6 border-t flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-primary hover:underline transition-all">
            Register for free
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
