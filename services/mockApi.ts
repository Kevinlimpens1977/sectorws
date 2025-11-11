import { Slot, Student, Teacher } from '../types';

const SLOTS_KEY = 'pws_slots';
const STUDENTS_KEY = 'pws_students';

// --- Helper Functions ---
const getInitialData = (): { slots: Slot[]; students: Student[] } => {
  // Return empty arrays to start with a clean slate.
  return { slots: [], students: [] };
};

const loadData = <T,>(key: string, initialData: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialData;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return initialData;
  }
};

const saveData = <T,>(key: string, data: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

const initialData = getInitialData();
let slots: Slot[] = loadData(SLOTS_KEY, initialData.slots);
let students: Student[] = loadData(STUDENTS_KEY, initialData.students);

// --- API Functions ---
const api = {
  getAvailableSlots: async (teacher: Teacher): Promise<Slot[]> => {
    await new Promise(res => setTimeout(res, 200));
    return slots.filter(slot => slot.available && slot.teacher === teacher);
  },

  getAllAppointments: async (teacher: Teacher): Promise<Slot[]> => {
    await new Promise(res => setTimeout(res, 200));
    const bookedSlots = slots.filter(slot => !slot.available && slot.student_number && slot.teacher === teacher);
    return bookedSlots.map(slot => {
      const studentInfo = students.find(s => s.student_number === slot.student_number);
      return { ...slot, studentInfo };
    });
  },

  bookSlot: async (slotId: number, studentData: Omit<Student, 'id'>): Promise<{ success: boolean; message: string }> => {
    await new Promise(res => setTimeout(res, 500));
    const hasActiveBooking = slots.some(
      s => s.student_number === studentData.student_number && !s.completed
    );

    if (hasActiveBooking) {
      return { success: false, message: 'Je hebt al een gepland gesprek. Wacht tot dit is afgerond.' };
    }

    const slot = slots.find(s => s.id === slotId);
    if (!slot || !slot.available) {
      return { success: false, message: 'Dit tijdslot is niet (meer) beschikbaar.' };
    }

    let student = students.find(s => s.student_number === studentData.student_number);
    if (student) {
      Object.assign(student, studentData);
    } else {
      student = { ...studentData, id: students.length + 1 };
      students.push(student);
    }

    slot.available = false;
    slot.student_number = student.student_number;
    slot.completed = false;
    
    saveData(SLOTS_KEY, slots);
    saveData(STUDENTS_KEY, students);

    return { success: true, message: 'Afspraak succesvol ingepland!' };
  },

  toggleOrCreateSlot: async (dateString: string, timeString: string, teacher: Teacher): Promise<{ success: boolean; message: string, updatedSlot?: Slot }> => {
    await new Promise(res => setTimeout(res, 200));
    
    let slot = slots.find(s => s.date === dateString && s.time === timeString && s.teacher === teacher);

    if (slot) { // Slot exists, so toggle it
        if (slot.student_number) {
            return { success: false, message: 'Kan een geboekt tijdslot niet wijzigen.' };
        }
        slot.available = !slot.available;
        saveData(SLOTS_KEY, slots);
        return { success: true, message: `Tijdslot is nu ${slot.available ? 'open' : 'gesloten'}.`, updatedSlot: slot };

    } else { // Slot does not exist, so create it as available
        let maxId = Math.max(0, ...slots.map(s => s.id));
        const newSlot: Slot = {
            id: ++maxId,
            date: dateString,
            time: timeString,
            teacher: teacher,
            available: true, // Create as available (open) by default
            student_number: null,
            present: false,
            notes: null,
            completed: false,
        };
        slots.push(newSlot);
        saveData(SLOTS_KEY, slots);
        return { success: true, message: 'Tijdslot aangemaakt en geopend.', updatedSlot: newSlot };
    }
  },

  updateAppointment: async (slotId: number, details: { present: boolean; notes: string; completed: boolean }): Promise<{ success: boolean; message: string }> => {
    await new Promise(res => setTimeout(res, 500));
    const slot = slots.find(s => s.id === slotId);
    if (!slot) {
      return { success: false, message: 'Afspraak niet gevonden.' };
    }

    slot.present = details.present;
    slot.notes = details.notes;
    slot.completed = details.completed;
    
    if (details.completed) {}

    saveData(SLOTS_KEY, slots);
    return { success: true, message: 'Afspraak bijgewerkt.' };
  },

  getSlotsForDate: async (date: string, teacher: Teacher): Promise<Slot[]> => {
    await new Promise(res => setTimeout(res, 200));
    return slots.filter(slot => slot.date === date && slot.teacher === teacher);
  },

  deleteSlot: async (slotId: number): Promise<{ success: boolean; message: string }> => {
    await new Promise(res => setTimeout(res, 300));
    const slotIndex = slots.findIndex(s => s.id === slotId);
    if (slotIndex === -1) {
      return { success: false, message: 'Tijdslot niet gevonden.' };
    }
    const slot = slots[slotIndex];
    if (slot.student_number) {
      return { success: false, message: 'Kan een geboekt tijdslot niet verwijderen.' };
    }
    
    slots.splice(slotIndex, 1);
    saveData(SLOTS_KEY, slots);
    
    return { success: true, message: 'Tijdslot succesvol verwijderd.' };
  },
};

export default api;