'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CreateInvoicePage() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('invoices')
      .insert({
        name: title,
        user_id: user.id,
      })
      .select();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      console.error('Insert error:', insertError.message);
    } else if (data && data.length > 0) {
      const newInvoice = data[0];
      console.log("✅ فاتورة جديدة:", newInvoice);
      router.push(`/dashboard/invoices/${newInvoice.id}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleCreate}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-xl font-bold mb-6 text-center">إنشاء فاتورة جديدة</h1>

        <label className="block mb-2 text-sm font-medium">اسم الفاتورة</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? 'جارٍ الإنشاء...' : 'إنشاء'}
        </button>
      </form>
    </div>
  );
}
