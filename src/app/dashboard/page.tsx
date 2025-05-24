'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Invoice = {
  id: number;
  name: string;
  payment_day: number;
  notify: boolean;
  image_url: string | null;
};

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email);

      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Fetch error:', fetchError.message);
      } else {
        setInvoices(data as Invoice[]);
      }
    };

    fetchData();
  }, [router]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">مرحبا، {userEmail}</h1>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
        onClick={() => router.push('/dashboard/create')}
      >
        + إنشاء فاتورة جديدة
      </button>

      <button
        className="text-red-600 underline mb-6 ml-4"
        onClick={async () => {
          await supabase.auth.signOut();
          router.push('/login');
        }}
      >
        تسجيل الخروج
      </button>

      {invoices.length === 0 ? (
        <p>لا توجد فواتير حالياً.</p>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="border p-4 rounded shadow hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold mb-1">{invoice.name}</h2>
              <p className="text-sm text-gray-600 mb-1">
                يوم الدفع الشهري: {invoice.payment_day}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                التذكير: {invoice.notify ? 'مفعل' : 'غير مفعل'}
              </p>
              {invoice.image_url && (
                <img
                  src={invoice.image_url}
                  alt="صورة الفاتورة"
                  className="w-24 h-24 rounded"
                />
              )}
              <button
                onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                className="mt-2 text-blue-600 underline"
              >
                عرض التفاصيل
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
