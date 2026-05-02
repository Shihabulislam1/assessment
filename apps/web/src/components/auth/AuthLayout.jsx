'use client';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background p-4 sm:p-8">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </div>
    </div>
  );
}
