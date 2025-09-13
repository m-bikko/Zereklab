'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface TestResult {
  success?: boolean;
  error?: string;
  details?: string;
  [key: string]: unknown;
}

export default function TestContactPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-contact');
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        toast.success('Database connection successful!');
      } else {
        toast.error('Database connection failed!');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Network error');
      setResult({ error: 'Network error', details: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testContactCreation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-contact', { method: 'POST' });
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        toast.success('Contact creation test successful!');
      } else {
        toast.error('Contact creation test failed!');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Network error');
      setResult({ error: 'Network error', details: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testRealContactForm = async () => {
    setLoading(true);
    try {
      const testData = {
        name: 'Тестовый Пользователь',
        whatsapp: '+77753084648',
        subject: 'Тестовое сообщение',
        message: 'Это тестовое сообщение для проверки работы формы контактов.',
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      setResult(data);
      
      if (response.ok) {
        toast.success('Real contact form test successful!');
      } else {
        toast.error('Real contact form test failed!');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Network error');
      setResult({ error: 'Network error', details: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Contact Form Debug Page
        </h1>
        
        <div className="mb-8 space-y-4">
          <button
            onClick={testDatabaseConnection}
            disabled={loading}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Database Connection'}
          </button>
          
          <button
            onClick={testContactCreation}
            disabled={loading}
            className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Contact Creation'}
          </button>
          
          <button
            onClick={testRealContactForm}
            disabled={loading}
            className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Real Contact Form'}
          </button>
        </div>

        {result && (
          <div className="rounded-md bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Test Result:</h2>
            <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 rounded-md bg-yellow-50 p-4">
          <h3 className="mb-2 font-semibold text-yellow-800">Instructions:</h3>
          <ol className="list-decimal space-y-1 pl-4 text-yellow-700">
            <li>First, test the database connection</li>
            <li>Then test contact creation</li>
            <li>Finally, test the real contact form</li>
            <li>Check the browser console and server logs for detailed information</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 