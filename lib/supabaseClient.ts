// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqavvnqxnjzxvntotdnr.supabase.co';  // replace this
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xYXZ2bnF4bmp6eHZudG90ZG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NzAzMjgsImV4cCI6MjA2ODE0NjMyOH0.O8KCVIpuJ9zjRxog1ApQy97qXhSi4RbbvLSKbrSejjM';                     // replace this

export const supabase = createClient(supabaseUrl, supabaseKey);
