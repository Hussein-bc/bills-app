import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // NOT public anon key
);

// Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);
const TWILIO_PHONE = process.env.TWILIO_PHONE!;

export async function GET() {
  try {
    const today = new Date();
    const todayDay = today.getDate();
    const tomorrow = todayDay + 1;

    // جلب المستخدمين
    const { data: users, error: usersError } = await supabase.from('users').select('*');
    if (usersError) throw new Error(usersError.message);

    for (const user of users) {
      // جلب الفواتير المفعلة للتذكير لهذا المستخدم
      const { data: bills, error: billsError } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .eq('reminder', true);

      if (billsError) continue;

      for (const bill of bills) {
        if (bill.due_day === todayDay || bill.due_day === tomorrow) {
          if (user.phone) {
            await twilioClient.messages.create({
              body: `📢 تذكير: لا تنسَ دفع ${bill.title} بتاريخ ${bill.due_day} من الشهر.`,
              from: TWILIO_PHONE,
              to: user.phone,
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
