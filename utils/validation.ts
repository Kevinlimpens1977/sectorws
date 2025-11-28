import { z } from 'zod';

export const bookingSchema = z.object({
    name: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten'),
    studentNumber: z.string().regex(/^\d{4,6}$/, 'Leerlingnummer moet 4 tot 6 cijfers bevatten'),
    studentClass: z.string().min(1, 'Selecteer een klas'),
    topic: z.string().min(5, 'Onderwerp moet minimaal 5 karakters bevatten').max(100, 'Onderwerp mag maximaal 100 karakters bevatten'),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
