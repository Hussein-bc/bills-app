'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  primaryButton, dangerButton, formInput,
  cardContainer, fileCard, backButton,
  sectionHeader
} from '@/components/ui/ui';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    company_url: '',
    account_name: '',
    password_encrypted: '',
    payment_day: 1,
    notify: false,
    notify_days_before: 2,
  });
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [month, setMonth] = useState<number>(1);
  const [year, setYear] = useState<number>(2024);
  const [file, setFile] = useState<File | null>(null);
  const [filesList, setFilesList] = useState<any[]>([]);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      console.log("My User ID:", data.user?.id);
    });
  }, []);

  useEffect(() => {
    const fetchInvoice = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (error) {
        setError('خطأ في تحميل الفاتورة');
        console.error(error.message);
      } else if (!data || data.length === 0) {
        setError('⚠️ لم يتم العثور على الفاتورة');
        console.warn('No invoice found with ID:', id);
      } else {
        const invoice = data[0];
        setFormData({
          name: invoice.name || '',
          company_url: invoice.company_url || '',
          account_name: invoice.account_name || '',
          password_encrypted: invoice.password_encrypted || '',
          payment_day: invoice.payment_day || 1,
          notify: invoice.notify || false,
          notify_days_before: invoice.notify_days_before || 2,
        });
      }

      setLoading(false);
    };

    const fetchFiles = async () => {
      const { data, error } = await supabase
        .from('invoice_files')
        .select('*')
        .eq('invoice_id', id)
        .order('uploaded_at', { ascending: false });
      //console.log('📦 الملفات القادمة من Supabase:', data);

      if (!error && data) {
        setFilesList(data);
      }
    };

    if (id) {
      fetchInvoice();
      fetchFiles();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    const value = target.value;
    const type = target.type;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value,
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setError('لم يتم تسجيل الدخول');

    const { error } = await supabase
      .from('invoices')
      .update(formData)
      .eq('id', Number(id))
      .eq('user_id', user.id); // هذا هو المهم

    if (error) {
      setError('فشل في حفظ التعديلات');
      console.error(error.message);
    } else {
      router.push('/dashboard');
    }

    setLoading(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadNotice(null);

    const { data: duplicate } = await supabase
      .from('invoice_files')
      .select('*')
      .eq('invoice_id', id)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (duplicate) {
      setUploadNotice('⚠️ تم بالفعل رفع فاتورة لهذا الشهر والسنة.');
      setUploading(false);
      return;
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('invoice-files')
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: fileUrlData } = supabase.storage
      .from('invoice-files')
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from('invoice_files')
      .insert({
        invoice_id: Number(id),
        file_url: fileUrlData.publicUrl,
        file_type: fileExt,
        month,
        year,
        uploaded_at: new Date(),
      });

    if (insertError) {
      console.error(insertError.message);
    }

    setFile(null);
    setUploading(false);

    const { data, error } = await supabase
      .from('invoice_files')
      .select('*')
      .eq('invoice_id', id)
      .order('uploaded_at', { ascending: false });

    if (!error && data) {
      setFilesList(data);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    const confirmed = window.confirm('هل تريد حذف هذا الملف؟');
    if (!confirmed) return;

    const { error } = await supabase
      .from('invoice_files')
      .delete()
      .eq('id', fileId);

    if (error) {
      console.error('خطأ في الحذف:', error.message);
    } else {
      setFilesList((prev) => prev.filter((f) => f.id !== fileId));
    }
  };

  if (loading) return <p className="p-6">جارٍ تحميل البيانات...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">تفاصيل الفاتورة</h1>
      <h2 className="text-lg font-semibold mb-4">اسم الفاتورة: {formData.name}</h2>
      {uploadNotice && <p className="text-red-600 mb-4">{uploadNotice}</p>}
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

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          حفظ التعديلات
        </button>
      </form>

      <div className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">📚 مكتبة الملفات السابقة</h2>
        {filesList.length === 0 ? (
          <p className="text-gray-500">لا توجد ملفات مرفوعة.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {filesList.map((file) => (

              <div key={file.id} className="border p-2 rounded">
                <p className="text-sm mb-1">📅 {file.month}/{file.year}</p>
                {file.file_type === 'pdf' ? (
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"

                  >
                    عرض PDF
                  </a>
                ) : (

                  <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={file.file_url}
                      alt="صورة الفاتورة"
                      className="w-full h-auto rounded cursor-pointer hover:opacity-80 transition"
                    />
                  </a>


                )}
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="text-red-600 text-sm mt-2 underline"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-2">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="border rounded p-2 w-full"
          />
          <div className="flex gap-4">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border rounded p-2"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>الشهر {i + 1}</option>
              ))}
            </select>
            <input
              type="number"
              min={2000}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border rounded p-2"
              placeholder="السنة (مثلاً: 2024)"
            />
          </div>
          <button
            onClick={handleUpload}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={uploading}
          >
            {uploading ? 'جاري الرفع...' : 'رفع الملف'}
          </button>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
        >
          الرجوع إلى القائمة الرئيسية
        </button>
      </div>
    </div>

  );
}
