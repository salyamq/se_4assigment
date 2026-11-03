export const DEMO_DATE = '2 November 2026';
export const NOW = '09:00';
export const EQUIPMENT = Object.freeze(['Projector', 'Whiteboard', 'Computers', 'Microphone']);

const catalog = [
  { id: 'R101', name: 'Seminar Room', capacity: 20, equipment: ['Projector', 'Whiteboard'], blocked: false,
    bookings: [{ start: '10:00', end: '11:00' }, { start: '14:00', end: '15:00' }] },
  { id: 'R202', name: 'Computer Lab', capacity: 30, equipment: ['Projector', 'Whiteboard', 'Computers'], blocked: false,
    bookings: [{ start: '11:00', end: '12:30' }] },
  { id: 'R303', name: 'Study Room', capacity: 8, equipment: ['Whiteboard'], blocked: false,
    bookings: [{ start: '13:00', end: '14:00' }] },
  { id: 'R404', name: 'Lecture Hall', capacity: 60, equipment: ['Projector', 'Whiteboard', 'Microphone'], blocked: true,
    bookings: [{ start: '09:30', end: '10:30' }] },
];
export const rooms = Object.freeze(catalog.map(room => Object.freeze({
  ...room, equipment: Object.freeze(room.equipment),
  bookings: Object.freeze(room.bookings.map(booking => Object.freeze(booking))),
})));
