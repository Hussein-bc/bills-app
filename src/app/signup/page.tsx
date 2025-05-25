'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isEmailValid(email)) {
      setError('الرجاء إدخال بريد إلكتروني صحيح.');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون على الأقل 6 أحرف.');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setError('هذا البريد مسجّل بالفعل.');
      } else {
        setError(error.message);
      }
    } else {
      setSuccessMessage('✅ تم إنشاء الحساب بنجاح. الرجاء التحقق من بريدك الإلكتروني.');
      setTimeout(() => router.push('/login'), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">إنشاء حساب جديد</h1>

        <div>
          <label className="block mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">كلمة المرور</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">تأكيد كلمة المرور</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? 'جارٍ التسجيل...' : 'سجل الآن'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-full mt-4 text-blue-600 underline hover:text-blue-800 text-center"
        >
          الرجوع إلى الصفحة الرئيسية
        </button>
      </form>
    </div>
  );
}
