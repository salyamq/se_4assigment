import { checkAvailability, validateTimeWindow } from './availability.mjs';
import { filterRooms, validateAttendees } from './filters.mjs';

export function createController(rooms) {
  let criteria = { attendees: '1', equipment: [] };
  let selectedId = rooms[0]?.id ?? null;
  let start = '11:00', end = '12:00', checked = false;
  function view() {
    const matches = filterRooms(rooms, criteria.attendees, criteria.equipment);
    const selected = matches.find(room => room.id === selectedId) ?? null;
    const filterError = validateAttendees(criteria.attendees);
    let result = { code: 'idle', available: false, message: 'Choose a time, then check availability.' };
    if (filterError) result = { code: 'filter_error', available: false, message: filterError };
    else if (!selected) result = { code: 'no_room', available: false, message: 'No matching rooms. Reduce attendees or remove an equipment requirement.' };
    else if (checked) result = checkAvailability(selected, start, end);
    return { matches, selected, start, end, checked, result, filterError, timeError: validateTimeWindow(start, end) };
  }
  return {
    view,
    setFilters(attendees, equipment) {
      criteria = { attendees, equipment: [...equipment] };
      const matches = filterRooms(rooms, attendees, equipment);
      if (!matches.some(room => room.id === selectedId)) selectedId = matches[0]?.id ?? null;
      return view();
    },
    selectRoom(id) {
      if (filterRooms(rooms, criteria.attendees, criteria.equipment).some(room => room.id === id)) selectedId = id;
      return view();
    },
    setTimes(nextStart, nextEnd) { start = nextStart; end = nextEnd; return view(); },
    check() { checked = true; return view(); },
  };
}
