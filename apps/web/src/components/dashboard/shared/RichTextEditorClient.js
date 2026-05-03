'use client';

import React, { useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import 'quill-mention/dist/quill.mention.css';
import { Mention, MentionBlot } from 'quill-mention';

import { useWorkspaceStore } from '@/store/workspaceStore';

export default function RichTextEditorClient({ value, onChange, placeholder = 'Write something...', members = [] }) {
  const { currentWorkspace } = useWorkspaceStore();
  const accentColor = currentWorkspace?.accentColor || 'hsl(var(--primary))';

  React.useEffect(() => {
    if (typeof window !== 'undefined' && Quill) {
      window.Quill = Quill;
      if (!Quill.imports['modules/mention']) {
        Quill.register('blots/mention', MentionBlot);
        Quill.register('modules/mention', Mention);
      }
    }
  }, []);

  const mentionList = useMemo(() => {
    return (Array.isArray(members) ? members : [])
      .filter(m => m.user?.id && (m.user?.name || m.user?.email))
      .map(m => ({
        id: m.user.id,
        value: m.user.name || m.user.email,
      }));
  }, [members]);

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
    mention: {
      allowedChars: /^[A-Za-z0-9\s]*$/,
      mentionDenotationChars: ["@"],
      container: '.rich-text-editor',
      source: (searchTerm, renderList) => {
        const matches = mentionList.filter(m =>
          m.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
        renderList(matches, searchTerm);
      },
      renderItem: (item) => {
        return item.value;
      },
      dataAttributes: ['id', 'value'],
      showDenotationChar: true,
      defaultMenuOrientation: 'top',
      fixMentionsToQuill: true,
    },
  }), [mentionList]);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'link', 'image', 'mention',
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="rounded-xl border-muted-foreground/10"
      />
      <style jsx global>{`
        .rich-text-editor {
          position: relative;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border-color: hsl(var(--border));
          background-color: hsl(var(--muted) / 0.3);
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: hsl(var(--border));
          min-height: 150px;
          font-family: inherit;
        }
        .rich-text-editor .ql-editor {
          min-height: 150px;
          font-size: 0.875rem;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground) / 0.5);
          font-style: normal;
        }
        /* Mention styles */
        .ql-mention-list-container {
          z-index: 99999 !important;
          background-color: #fff !important;
          border: 1px solid #000 !important;
          border-radius: var(--radius) !important;
          box-shadow: var(--shadow-lg) !important;
          overflow: hidden !important;
          width: 220px !important;
          padding: 4px !important;
        }
        .ql-mention-list {
          list-style: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .ql-mention-list-item {
          padding: 0.5rem 0.75rem !important;
          font-size: 0.875rem !important;
          cursor: pointer !important;
          color: hsl(var(--popover-foreground)) !important;
          border-radius: calc(var(--radius) - 4px) !important;
          margin: 2px 0 !important;
          transition: all 0.2s;
        }
        .ql-mention-list-item.selected {
          background-color: ${accentColor} !important;
          color: #ffffff !important;
        }
        .mention {
          background-color: ${accentColor}26 !important; /* 15% opacity hex */
          color: ${accentColor} !important;
          padding: 0.1rem 0.3rem !important;
          border-radius: 0.25rem !important;
          font-weight: 500 !important;
          display: inline-block !important;
        }
      `}</style>
    </div>
  );
}
