export interface Student {
  id: number;
  student_number: string;
  name: string;
  class: string;
  topic: string;
}

export type Teacher = 'Daemen' | 'Martina';
export const Teachers: Teacher[] = ['Daemen', 'Martina'];

export interface Slot {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  teacher: Teacher;
  available: boolean;
  student_number: string | null;
  present: boolean;
  notes: string | null;
  completed: boolean;
  studentInfo?: Student;
}

export const ClassOptions = ["4GT1", "4GT2", "4GT3", "4GT4"];

// Supabase specific types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: number
          student_number: string
          name: string
          class: string
          topic: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      slots: {
        Row: {
          id: number
          date: string
          time: string
          teacher: Teacher
          available: boolean
          student_number: string | null
          present: boolean
          notes: string | null
          completed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['slots']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['slots']['Insert']>
      }
    }
    Views: {
      slots_with_students: {
        Row: {
          id: number
          date: string
          time: string
          teacher: Teacher
          available: boolean
          student_number: string | null
          present: boolean
          notes: string | null
          completed: boolean
          created_at: string
          student_name: string | null
          student_class: string | null
          student_topic: string | null
        }
      }
    }
    Functions: {
      book_slot: {
        Args: {
          p_slot_id: number
          p_student_number: string
          p_student_name: string
          p_student_class: string
          p_student_topic: string
        }
        Returns: boolean
      }
    }
    Enums: {
      teacher_type: Teacher
    }
  }
}