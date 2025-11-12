import { Teacher } from '../types';

export type Tables = {
  slots: {
    id: number;
    date: string;
    time: string;
    teacher: Teacher;
    available: boolean;
    student_number: string | null;
    present: boolean;
    notes: string | null;
    completed: boolean;
    created_at: string;
  };
  students: {
    id: number;
    student_number: string;
    name: string;
    class: string;
    topic: string;
    created_at: string;
  };
};

export type Views = {
  slots_with_students: Tables['slots'] & {
    student_name: string | null;
    student_class: string | null;
    student_topic: string | null;
  };
};

export type Functions = {
  book_slot: {
    Args: {
      p_slot_id: number;
      p_student_number: string;
      p_student_name: string;
      p_student_class: string;
      p_student_topic: string;
    };
    Returns: boolean;
  };
};

export type TableRow<T extends keyof Tables> = Tables[T];
export type ViewRow<T extends keyof Views> = Views[T];
export type TableInsert<T extends keyof Tables> = Omit<Tables[T], 'id' | 'created_at'>;
export type TableUpdate<T extends keyof Tables> = Partial<TableInsert<T>>;

export interface Database {
  public: {
    Tables: {
      [K in keyof Tables]: {
        Row: Tables[K];
        Insert: TableInsert<K>;
        Update: TableUpdate<K>;
      };
    };
    Views: {
      [K in keyof Views]: {
        Row: Views[K];
      };
    };
    Functions: Functions;
    Enums: {
      teacher_type: Teacher;
    };
  };
}