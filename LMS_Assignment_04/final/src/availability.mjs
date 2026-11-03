import { NOW } from './data.mjs';

const outcome = (code, message) => ({ available: code === 'available', code, message });

export function toMinutes(value) {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
}

export function validateTimeWindow(start, end) {
  const s = toMinutes(start), e = toMinutes(end);
  if (s === null || e === null) return outcome('invalid_time', 'Enter valid start and end times.');
  if (s < toMinutes(NOW)) return outcome('past', 'Start time cannot be before 09:00.');
  if (e <= s) return outcome('order', 'End time must be after start time.');
  if (e - s > 120) return outcome('duration', 'Choose a duration of 120 minutes or less.');
  return null;
}

export function checkAvailability(room, start, end) {
  const error = validateTimeWindow(start, end);
  if (error) return error;
  if (!room) return outcome('no_room', 'Select a room to check availability.');
  if (room.blocked) return outcome('blocked', 'This room is blocked for maintenance. Choose another room.');
  const s = toMinutes(start), e = toMinutes(end);
  const overlaps = room.bookings.some(b => s < toMinutes(b.end) && e > toMinutes(b.start));
  if (overlaps) return outcome('overlap', 'This time overlaps an existing booking. Choose another time.');
  return outcome('available', 'This room is available for the selected time.');
}
