import { NextResponse } from 'next/server';
import twilio from 'twilio';

// ضع بيانات Twilio هنا (يفضّل من .env)
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioPhone = process.env.TWILIO_PHONE!;

const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  const body = await req.json();
  const { to, message } = body;

  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhone,
      to,
    });

    return NextResponse.json({ success: true, sid: response.sid });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
