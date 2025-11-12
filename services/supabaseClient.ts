import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { Teacher } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

type DbTables = Database['public']['Tables'];
type DbResult<T> = { data: T | null; error: Error | null };

// Database helper functions
export async function createSlot(data: DbTables['slots']['Insert']): Promise<DbResult<DbTables['slots']['Row']>> {
  const { data: result, error } = await supabase
    .from('slots')
    .insert([data])
    .select()
    .single();
  return { data: result, error };
}

export async function updateSlot(id: number, data: DbTables['slots']['Update']): Promise<DbResult<DbTables['slots']['Row']>> {
  const { data: result, error } = await supabase
    .from('slots')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  return { data: result, error };
}

export async function createStudent(data: DbTables['students']['Insert']): Promise<DbResult<DbTables['students']['Row']>> {
  const { data: result, error } = await supabase
    .from('students')
    .insert([data])
    .select()
    .single();
  return { data: result, error };
}

export async function updateStudent(id: number, data: DbTables['students']['Update']): Promise<DbResult<DbTables['students']['Row']>> {
  const { data: result, error } = await supabase
    .from('students')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  return { data: result, error };
}

export async function upsertStudent(data: DbTables['students']['Insert']): Promise<DbResult<DbTables['students']['Row']>> {
  const { data: result, error } = await supabase
    .from('students')
    .upsert([data])
    .select()
    .single();
  return { data: result, error };
}

// Authentication helper functions
export async function signInTeacher(teacher: Teacher, password: string) {
  const email = teacher === 'Daemen' ? 'daemen@example.com' : 'martina@example.com';
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutTeacher() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

export async function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}