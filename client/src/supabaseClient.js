import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uwysxlbekjbjazbtfgct.supabase.co';
// Use the LONG key starting with 'eyJ...'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3eXN4bGJla2piamF6YnRmZ2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mzg4NDYsImV4cCI6MjA4OTUxNDg0Nn0.3_vZoO8OGi1imT-MGldXvyU5A1o4qXc1c2Xu6vBbOeQ'; 

export const supabase = createClient(supabaseUrl, supabaseKey);