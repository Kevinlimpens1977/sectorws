// FIX: Removed self-import of 'Student' which was causing a conflict with the local declaration.

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
  studentInfo?: Student; // Optional, for joined data
}

export const ClassOptions = ["4GT1", "4GT2", "4GT3", "4GT4"];