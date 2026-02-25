'use client';

import { useEffect, useMemo, useState } from 'react';
// Импортируем стили
import 'react-quill/dist/quill.snow.css';

import dynamic from 'next/dynamic';

// Динамически импортируем ReactQuill для избежания SSR проблем
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse rounded-lg border border-gray-300 bg-gray-50 p-4">
      <div className="h-32 rounded bg-gray-200"></div>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Введите текст...',
  height = '200px',
  className = '',
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Настройки для Quill редактора
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'sub' }, { script: 'super' }],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'color',
    'background',
    'script',
    'align',
    'code-block',
  ];

  // Обработка изменений
  const handleChange = (content: string) => {
    onChange(content);
  };

  if (!isMounted) {
    return (
      <div
        className={`animate-pulse rounded-lg border border-gray-300 bg-gray-50 p-4 ${className}`}
      >
        <div className="h-32 rounded bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <style jsx global>{`
        .rich-text-editor .ql-editor {
          min-height: ${height};
          font-size: 14px;
          line-height: 1.6;
        }

        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f9fafb;
        }

        .rich-text-editor .ql-container {
          border-bottom: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          font-family: inherit;
        }

        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }

        .rich-text-editor .ql-snow .ql-tooltip {
          z-index: 1000;
        }

        .rich-text-editor .ql-snow.ql-toolbar button:hover,
        .rich-text-editor .ql-snow .ql-toolbar button:hover,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active,
        .rich-text-editor .ql-snow .ql-toolbar button.ql-active {
          color: #3b82f6;
        }

        .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-snow .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .rich-text-editor .ql-snow .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6;
        }

        .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-snow .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-fill,
        .rich-text-editor .ql-snow .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6;
        }

        /* Кастомные стили для контента */
        .rich-text-editor .ql-editor h1 {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1rem 0 0.5rem 0;
        }

        .rich-text-editor .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.3;
          margin: 0.8rem 0 0.4rem 0;
        }

        .rich-text-editor .ql-editor h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 0.6rem 0 0.3rem 0;
        }

        .rich-text-editor .ql-editor p {
          margin: 0.5rem 0;
        }

        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #3b82f6;
          margin: 1rem 0;
          padding: 0.5rem 0 0.5rem 1rem;
          background: #f8fafc;
          font-style: italic;
        }

        .rich-text-editor .ql-editor ul,
        .rich-text-editor .ql-editor ol {
          margin: 0.5rem 0;
        }

        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 0.5rem;
        }

        .rich-text-editor .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .rich-text-editor .ql-editor a:hover {
          color: #1d4ed8;
        }

        .rich-text-editor .ql-editor code {
          background: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
          font-size: 0.875rem;
        }

        .rich-text-editor .ql-editor pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .rich-text-editor .ql-editor pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }
      `}</style>

      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: 'white',
        }}
      />
    </div>
  );
}
