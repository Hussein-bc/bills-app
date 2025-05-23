'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Bill = {
  id: string;
  title: string;
  due_day: number;
  reminder: boolean;
  image_url: string | null;
};

export default function BillsPage() {
  const [title, setTitle] = useState('');
  const [dueDay, setDueDay] = useState<number>(1);
  const [reminder, setReminder] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBills = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) console.error(error.message);
      else setBills(data as Bill[]);
    };

    fetchBills();
  }, [router]);

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let imageUrl = null;
    if (image) {
      // رفع الصورة إلى Supabase Storage
      const filePath = `invoices/${user.id}/${image.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, image);

      if (uploadError) {
        alert('فشل في رفع الصورة: ' + uploadError.message);
        return;
      }

      imageUrl = supabase.storage.from('invoices').getPublicUrl(filePath).publicURL;
    }

    const { error } = await supabase.from('bills').insert({
      user_id: user.id,
      title,
      due_day: dueDay,
      reminder,
      image_url: imageUrl,
    });

    if (error) alert('فشل في الإضافة: ' + error.message);
    else {
      setTitle('');
      setDueDay(1);
      setReminder(true);
      setImage(null);
      location.reload(); // تحديث الصفحة تلقائيًا
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">إضافة خدمة فاتورة</h1>

      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="مثال: فاتورة الكهرباء"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          min="1"
          max="31"
          placeholder="يوم الدفع (مثلاً 20)"
          value={dueDay}
          onChange={(e) => setDueDay(Number(e.target.value))}
          className="w-full border p-2 rounded"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
          />
          تفعيل التذكير بالإشعار
        </label>

        <div>
          <label className="block text-sm text-gray-600">رفع صورة الفاتورة (اختياري):</label>
          <input
            type="file"
            onChange={(e) => e.target.files && setImage(e.target.files[0])}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          إضافة الخدمة
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">قائمة الخدمات</h2>
      <ul className="space-y-2">
        {bills.map((bill) => (
          <li
            key={bill.id}
            className="border rounded p-3 shadow flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{bill.title}</p>
              <p className="text-sm text-gray-600">
                الدفع كل شهر في اليوم: {bill.due_day}
              </p>
              <p className="text-sm text-gray-600">
                التذكير: {bill.reminder ? 'مفعّل' : 'غير مفعّل'}
              </p>
              {bill.image_url && (
                <img
                  src={bill.image_url}
                  alt="صورة الفاتورة"
                  className="w-24 h-24 mt-2 rounded"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
