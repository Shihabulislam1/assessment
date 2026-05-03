'use client';

import dynamic from 'next/dynamic';

export const RichTextEditor = dynamic(
  () => import('./RichTextEditorClient'),
  {
    ssr: false,
    loading: () => <div className="h-40 w-full bg-muted animate-pulse rounded-xl" />,
  }
);
