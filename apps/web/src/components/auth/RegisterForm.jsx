'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function RegisterForm() {
  const { register, isLoading } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await register(email, password, name);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
      <CardHeader className="pt-8 pb-4 px-8">
        <CardTitle className="text-2xl font-bold tracking-tight">Create account</CardTitle>
        <p className="text-sm text-muted-foreground">Start your strategic journey with us today.</p>
      </CardHeader>
      
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold px-4 py-3 rounded-xl animate-in shake duration-300">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-semibold ml-1">
              Full Name
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="name"
                name="name"
                type="text"
                required
                className="pl-10 h-11 bg-muted/30 border-muted-foreground/10 rounded-xl focus:ring-primary/20 transition-all"
                placeholder="Jane Smith"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="pl-10 h-11 bg-muted/30 border-muted-foreground/10 rounded-xl focus:ring-primary/20 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="pl-10 h-11 bg-muted/30 border-muted-foreground/10 rounded-xl focus:ring-primary/20 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center gap-2 mt-1 px-1">
              <ShieldCheck className="size-3 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground font-medium">
                Min. 8 chars, incl. uppercase & numbers
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Join Now <ArrowRight className="size-4" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="bg-muted/30 px-8 py-6 border-t flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline transition-all">
            Sign in here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
