'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_url: '',
    account_name: '',
    password_encrypted: '',
    payment_day: 1,
    notify: false,
    notify_days_before: 2,
  });

  useEffect(() => {
    if (!id) {
      console.log('🚨 لم يتم استلام ID بعد');
      return;
    }

    const fetchInvoice = async () => {
      console.log('📌 الفاتورة ID:', id);

      const { data, error } = await supabase
  .from('invoices')
  .select('*')
  .eq('id', Number(id))
  .limit(1); // نطلب صف واحد فقط

if (error) {
  setError('خطأ في تحميل الفاتورة');
  console.error(error.message);
} else if (!data || data.length === 0) {
  setError('⚠️ لم يتم العثور على الفاتورة');
  console.warn('No invoice found with ID:', id);
} else {
  const invoice = data[0];
  setFormData({
    company_url: invoice.company_url || '',
    account_name: invoice.account_name || '',
    password_encrypted: invoice.password_encrypted || '',
    payment_day: invoice.payment_day || 1,
    notify: invoice.notify || false,
    notify_days_before: invoice.notify_days_before || 2,
  });
}


      if (error) {
        setError('خطأ في تحميل الفاتورة');
        console.error(error.message);
      } else {
        setFormData({
          company_url: data.company_url || '',
          account_name: data.account_name || '',
          password_encrypted: data.password_encrypted || '',
          payment_day: data.payment_day || 1,
          notify: data.notify || false,
          notify_days_before: data.notify_days_before || 2,
        });
      }

      setLoading(false);
    };

    fetchInvoice();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('invoices')
      .update(formData)
      .eq('id', Number(id));

    if (error) {
      setError('فشل في حفظ التعديلات');
      console.error(error.message);
    } else {
      router.push('/dashboard');
    }

    setLoading(false);
  };

  if (loading) return <p className="p-6">جارٍ تحميل البيانات...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">تفاصيل الفاتورة</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">رابط الشركة</label>
          <input
            type="text"
            name="company_url"
            value={formData.company_url}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">اسم الحساب</label>
          <input
            type="text"
            name="account_name"
            value={formData.account_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">كلمة المرور</label>
          <input
            type="text"
            name="password_encrypted"
            value={formData.password_encrypted}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">اليوم من كل شهر للدفع (مثلاً: 8)</label>
          <input
            type="number"
            name="payment_day"
            min={1}
            max={31}
            value={formData.payment_day}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="notify"
            checked={formData.notify}
            onChange={handleChange}
          />
          <label>تفعيل الإشعار قبل يوم الدفع</label>
        </div>

        <div>
          <label className="block mb-1">كم يوم قبل الدفع تريد التنبيه؟</label>
          <select
            name="notify_days_before"
            value={formData.notify_days_before}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value={1}>1 يوم</option>
            <option value={2}>2 يوم</option>
            <option value={3}>3 أيام</option>
            <option value={5}>5 أيام</option>
          </select>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          حفظ التعديلات
        </button>
      </form>
    </div>
  );
}
