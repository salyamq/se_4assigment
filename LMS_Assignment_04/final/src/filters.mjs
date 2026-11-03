export function validateAttendees(value) {
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) {
    return 'Enter a whole number of attendees, at least 1.';
  }
  return null;
}

export function filterRooms(rooms, attendees, equipment = []) {
  if (validateAttendees(attendees)) return [];
  return rooms.filter(room => room.capacity >= Number(attendees)
    && equipment.every(item => room.equipment.includes(item)));
}
