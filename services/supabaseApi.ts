import { Slot, Student, Teacher } from '../types';
import { supabase } from './supabaseClient';
import type { Tables, Views } from '../types/supabase';

type SlotRow = Tables['slots'];
type StudentRow = Tables['students'];
type SlotWithStudent = Views['slots_with_students'];

const api = {
  getAvailableSlots: async (teacher: Teacher): Promise<Slot[]> => {
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('teacher', teacher)
      .eq('available', true);

    if (error) throw error;
    return (data || []) as Slot[];
  },

  getAllAppointments: async (teacher: Teacher): Promise<Slot[]> => {
    const { data, error } = await supabase
      .from('slots_with_students')
      .select('*')
      .eq('teacher', teacher)
      .eq('available', false)
      .not('student_number', 'is', null);

    if (error) throw error;
    return (data || []).map((slot: SlotWithStudent) => ({
      id: slot.id,
      date: slot.date,
      time: slot.time,
      teacher: slot.teacher,
      available: slot.available,
      student_number: slot.student_number,
      present: slot.present,
      notes: slot.notes,
      completed: slot.completed,
      studentInfo: slot.student_number ? {
        id: 0,
        student_number: slot.student_number,
        name: slot.student_name || '',
        class: slot.student_class || '',
        topic: slot.student_topic || ''
      } : undefined
    }));
  },

  bookSlot: async (slotId: number, studentData: Omit<Student, 'id'>): Promise<{ success: boolean; message: string }> => {
    try {
      // Check for existing active booking
      const { data: existingBookings } = await supabase
        .from('slots')
        .select('*')
        .eq('student_number', studentData.student_number)
        .eq('completed', false);

      if (existingBookings && existingBookings.length > 0) {
        return { success: false, message: 'Je hebt al een gepland gesprek. Wacht tot dit is afgerond.' };
      }

      // Check slot availability
      const { data: slot } = await supabase
        .from('slots')
        .select('*')
        .eq('id', slotId)
        .single();

      if (!slot || !(slot as SlotRow).available) {
        return { success: false, message: 'Dit tijdslot is niet (meer) beschikbaar.' };
      }

      // Create student if not exists
      const { error: studentError } = await supabase
        .from('students')
        .upsert({
          student_number: studentData.student_number,
          name: studentData.name,
          class: studentData.class,
          topic: studentData.topic
        } as any);

      if (studentError) throw studentError;

      // Update slot
      const { error: slotError } = await supabase
        .from('slots')
        .update({
          student_number: studentData.student_number,
          available: false
        } as any)
        .eq('id', slotId);

      if (slotError) throw slotError;

      return { success: true, message: 'Afspraak succesvol ingepland!' };
    } catch (error) {
      console.error('Error booking slot:', error);
      return { success: false, message: 'Er is een fout opgetreden bij het inplannen van de afspraak.' };
    }
  },

  toggleOrCreateSlot: async (dateString: string, timeString: string, teacher: Teacher): Promise<{ success: boolean; message: string; updatedSlot?: Slot }> => {
    try {
      // Check if slot exists
      const { data: existingSlot } = await supabase
        .from('slots')
        .select('*')
        .eq('date', dateString)
        .eq('time', timeString)
        .eq('teacher', teacher)
        .single();

      if (existingSlot) {
        const typedSlot = existingSlot as SlotRow;
        if (typedSlot.student_number) {
          return { success: false, message: 'Kan een geboekt tijdslot niet wijzigen.' };
        }

        // Toggle existing slot
        const { data: updatedSlot, error } = await supabase
          .from('slots')
          .update({ available: !typedSlot.available } as any)
          .eq('id', typedSlot.id)
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Tijdslot is nu ${(updatedSlot as SlotRow).available ? 'open' : 'gesloten'}.`,
          updatedSlot: updatedSlot as Slot
        };
      }

      // Create new slot
      const { data: createdSlot, error } = await supabase
        .from('slots')
        .insert({
          date: dateString,
          time: timeString,
          teacher: teacher,
          available: true,
          present: false,
          completed: false,
          student_number: null,
          notes: null
        } as any)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Tijdslot aangemaakt en geopend.',
        updatedSlot: createdSlot as Slot
      };
    } catch (error) {
      console.error('Error toggling/creating slot:', error);
      return { success: false, message: 'Er is een fout opgetreden.' };
    }
  },

  updateAppointment: async (slotId: number, details: { present: boolean; notes: string; completed: boolean }): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase
        .from('slots')
        .update({
          present: details.present,
          notes: details.notes,
          completed: details.completed
        } as any)
        .eq('id', slotId);

      if (error) throw error;

      return { success: true, message: 'Afspraak bijgewerkt.' };
    } catch (error) {
      console.error('Error updating appointment:', error);
      return { success: false, message: 'Er is een fout opgetreden bij het bijwerken van de afspraak.' };
    }
  },

  getSlotsForDate: async (date: string, teacher: Teacher): Promise<Slot[]> => {
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('date', date)
      .eq('teacher', teacher);

    if (error) throw error;
    return (data || []) as Slot[];
  },

  deleteSlot: async (slotId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const { data: slot } = await supabase
        .from('slots')
        .select('*')
        .eq('id', slotId)
        .single();

      if (slot && (slot as SlotRow).student_number) {
        return { success: false, message: 'Kan een geboekt tijdslot niet verwijderen.' };
      }

      const { error } = await supabase
        .from('slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      return { success: true, message: 'Tijdslot succesvol verwijderd.' };
    } catch (error) {
      console.error('Error deleting slot:', error);
      return { success: false, message: 'Er is een fout opgetreden bij het verwijderen van het tijdslot.' };
    }
  }
};

export default api;