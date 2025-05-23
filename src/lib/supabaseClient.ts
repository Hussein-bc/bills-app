// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vgoodyksqayofgxrznzq.supabase.co'; // Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnb29keWtzcWF5b2ZneHJ6bnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzM2OTAsImV4cCI6MjA2MzYwOTY5MH0.hwtJLldLQSzvUSg6yfv3KWml6L-M7s3zmdn81xhBcuM'; // anon public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
