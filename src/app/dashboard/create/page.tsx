'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CreateInvoice() {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleCreate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("لم يتم تسجيل الدخول");
      return;
    }

    let imageUrl = null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file);

      if (uploadError) {
        alert('فشل رفع الصورة: ' + uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('invoices').insert({
      user_id: user.id,
      title,
      due_date: dueDate,
      image_url: imageUrl,
    });

    if (error) {
      alert('فشل حفظ الفاتورة: ' + error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">إنشاء فاتورة جديدة</h1>

      <label className="block mb-2 font-medium">اسم الفاتورة:</label>
      <input
        type="text"
        className="w-full border p-2 mb-4 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="block mb-2 font-medium">تاريخ الاستحقاق:</label>
      <input
        type="date"
        className="w-full border p-2 mb-4 rounded"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <label className="block mb-2 font-medium">صورة الفاتورة (اختياري):</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
          }
        }}
        className="w-full border p-2 mb-4 rounded"
      />

      <button
        onClick={handleCreate}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        إنشاء الفاتورة
      </button>
    </div>
  );
}
