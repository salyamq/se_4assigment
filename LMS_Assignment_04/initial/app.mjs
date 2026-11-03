export const NOW = '09:00';
export const room = {
  id: 'R101', name: 'Seminar Room', capacity: 20,
  equipment: ['Projector', 'Whiteboard'], blocked: false,
  bookings: [{ start: '10:00', end: '11:00' }, { start: '14:00', end: '15:00' }],
};

export function checkAvailability(selectedRoom, start, end) {
  const valid = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
  const result = (code, message) => ({ available: code === 'available', code, message });
  if (!valid(start) || !valid(end)) return result('invalid_time', 'Enter valid start and end times.');
  const s = minutes(start), e = minutes(end);
  if (s < minutes(NOW)) return result('past', 'Start time cannot be before 09:00.');
  if (e <= s) return result('order', 'End time must be after start time.');
  if (e - s > 120) return result('duration', 'Choose a duration of 120 minutes or less.');
  if (!selectedRoom) return result('no_room', 'Select a room.');
  if (selectedRoom.blocked) return result('blocked', 'This room is blocked for maintenance.');
  if (selectedRoom.bookings.some(b => s < minutes(b.end) && e > minutes(b.start))) {
    return result('overlap', 'This time overlaps an existing booking.');
  }
  return result('available', 'This room is available for the selected time.');
}

export function mount(root) {
  root.innerHTML = `<header><strong>LMS</strong><span>Campus rooms</span></header>
    <main><p class="eyebrow">ROOM AVAILABILITY</p><h1>Find time for your next session.</h1>
    <p>Monday, 2 November 2026 · Fixed current time: 09:00 (Almaty)</p>
    <section><h2>R101 · Seminar Room</h2><p>20 seats · Projector, Whiteboard</p>
    <p>Existing bookings: 10:00 - 11:00, 14:00 - 15:00</p>
    <form novalidate><div class="times"><label>Start time<input id="start" type="time" value="11:00" required></label>
    <label>End time<input id="end" type="time" value="12:00" required></label></div>
    <p id="hint">Maximum duration: 120 minutes.</p><button>Check availability</button></form>
    <p id="result" role="status" aria-live="polite">Choose a time and check availability.</p></section>
    <p>Fictional rooms and bookings. Availability checking only.</p></main>`;
  const start = root.querySelector('#start'), end = root.querySelector('#end');
  const result = root.querySelector('#result'), hint = root.querySelector('#hint');
  const preview = () => {
    // The original prototype repeats format, order and duration checks for its hint.
    const valid = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
    let message = 'Maximum duration: 120 minutes.';
    if (!valid(start.value) || !valid(end.value)) message = 'Enter valid start and end times.';
    else if (minutes(end.value) <= minutes(start.value)) message = 'End time must be after start time.';
    else if (minutes(end.value) - minutes(start.value) > 120) message = 'Choose a duration of 120 minutes or less.';
    hint.textContent = message;
    result.textContent = 'Time changed. Check availability again.';
  };
  start.addEventListener('input', preview);
  end.addEventListener('input', preview);
  root.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    const checked = checkAvailability(room, start.value, end.value);
    result.textContent = checked.message;
    result.dataset.code = checked.code;
    start.setAttribute('aria-invalid', String(['invalid_time', 'past'].includes(checked.code)));
    end.setAttribute('aria-invalid', String(['invalid_time', 'order', 'duration'].includes(checked.code)));
  });
}

if (typeof document !== 'undefined') mount(document.querySelector('#app'));
