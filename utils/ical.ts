export const generateICS = (event: {
    title: string;
    description: string;
    location: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
}) => {
    const formatDate = (dateStr: string) => {
        return dateStr.replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const now = new Date().toISOString();

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Sectorwerkstuk//Planning//NL',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@sectorwerkstuk.nl`,
        `DTSTAMP:${formatDate(now)}`,
        `DTSTART:${formatDate(event.startTime)}`,
        `DTEND:${formatDate(event.endTime)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description}`,
        `LOCATION:${event.location}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'afspraak.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
