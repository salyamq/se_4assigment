import { DEMO_DATE, NOW, EQUIPMENT } from './data.mjs';
import { createController } from './controller.mjs';

export function mount(root, rooms) {
  root.innerHTML = `<header class="topbar"><div class="brand">LMS<span>Campus rooms</span></div><span class="topnote">Smart Campus</span></header>
  <main><div class="intro"><p class="eyebrow">ROOM AVAILABILITY</p><h1>A room for your next session.</h1>
  <p>Find the right space by size and equipment, then check your time.</p></div>
  <div class="demo"><strong>Monday, ${DEMO_DATE}</strong><span>Fixed current time: ${NOW} (Almaty)</span></div>
  <div class="workspace"><aside class="panel filters" aria-labelledby="filter-heading"><h2 id="filter-heading">Room requirements</h2>
  <label class="field" for="attendees">Attendees<input id="attendees" type="number" min="1" step="1" value="1" inputmode="numeric" aria-describedby="filter-error"></label>
  <p id="filter-error" class="field-error" aria-live="polite"></p>
  <fieldset><legend>Required equipment</legend>${EQUIPMENT.map(item => `<label class="check"><input type="checkbox" name="equipment" value="${item}">${item}</label>`).join('')}</fieldset>
  <button id="reset" type="button" class="secondary">Reset filters</button>
  <p class="small">A room must meet every selected requirement. Blocked rooms are marked.</p></aside>
  <section aria-labelledby="catalog-heading"><div class="section-title"><h2 id="catalog-heading">Choose a room</h2><span id="count" aria-live="polite"></span></div>
  <div id="rooms" class="room-grid" role="group" aria-label="Matching rooms"></div>
  <div id="empty" class="panel empty" hidden><h3>No matching rooms</h3><p>Reduce attendees or remove an equipment requirement.</p></div>
  <section class="panel availability" aria-labelledby="availability-heading"><div class="section-title"><h2 id="availability-heading">Check availability</h2><span id="selected-label"></span></div>
  <p id="room-details" class="small"></p><div id="bookings" class="bookings"></div>
  <form id="time-form" novalidate><div class="time-row"><label class="field" for="start">Start time<input id="start" type="time" value="11:00" required aria-describedby="time-hint result"></label>
  <label class="field" for="end">End time<input id="end" type="time" value="12:00" required aria-describedby="time-hint result"></label>
  <button id="check" type="submit">Check availability</button></div><p id="time-hint" class="small">Same day only. Start at 09:00 or later. Maximum 120 minutes.</p></form>
  <div id="result" class="result" role="status" aria-live="polite" aria-atomic="true"><strong id="result-title"></strong><p id="result-message"></p></div>
  </section></section></div><p class="footnote">Fictional rooms and bookings. This checker does not create reservations.</p></main>`;
  const get = id => root.querySelector(`#${id}`);
  const controller = createController(rooms);
  const titles = { idle: 'Ready to check', available: 'Available', blocked: 'Unavailable', overlap: 'Unavailable',
    no_room: 'No room selected', filter_error: 'Check your requirements', invalid_time: 'Check your time',
    past: 'Check your time', order: 'Check your time', duration: 'Check your time' };

  function render(view) {
    get('count').textContent = `${view.matches.length} of ${rooms.length} rooms`;
    get('filter-error').textContent = view.filterError ?? '';
    get('attendees').setAttribute('aria-invalid', String(Boolean(view.filterError)));
    get('empty').hidden = view.matches.length > 0;
    get('rooms').replaceChildren(...view.matches.map(room => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'room'; button.dataset.roomId = room.id;
      button.setAttribute('aria-pressed', String(view.selected?.id === room.id));
      const id = document.createElement('span'); id.className = 'room-id'; id.textContent = room.id;
      const name = document.createElement('strong'); name.textContent = room.name;
      const seats = document.createElement('span'); seats.textContent = `${room.capacity} seats`;
      const equipment = document.createElement('span'); equipment.className = 'small'; equipment.textContent = room.equipment.join(' · ');
      const status = document.createElement('span'); status.className = 'room-status'; status.textContent = room.blocked ? 'Blocked - maintenance' : 'Open for time checks';
      button.append(id, name, seats, equipment, status);
      return button;
    }));
    const room = view.selected;
    get('selected-label').textContent = room ? `${room.id} · ${room.name}` : 'No room selected';
    get('room-details').textContent = room ? `${room.capacity} seats · ${room.equipment.join(' · ')}` : '';
    get('bookings').textContent = room ? `Existing bookings: ${room.bookings.length ? room.bookings.map(b => `${b.start} - ${b.end}`).join(', ') : 'None'}` : 'Select a matching room to see its bookings.';
    get('check').disabled = !room;
    const result = view.result;
    get('result').dataset.code = result.code;
    get('result-title').textContent = titles[result.code];
    get('result-message').textContent = room && view.checked ? `${room.id} · ${view.start || 'Start'} - ${view.end || 'End'}. ${result.message}` : result.message;
    get('time-hint').textContent = view.timeError?.message ?? 'Same day only. Start at 09:00 or later. Maximum 120 minutes.';
    get('start').setAttribute('aria-invalid', String(view.checked && ['invalid_time', 'past'].includes(result.code)));
    get('end').setAttribute('aria-invalid', String(view.checked && ['invalid_time', 'order', 'duration'].includes(result.code)));
  }
  const applyFilters = () => render(controller.setFilters(get('attendees').value,
    Array.from(root.querySelectorAll('input[name="equipment"]:checked'), input => input.value)));
  get('attendees').addEventListener('input', applyFilters);
  root.querySelectorAll('input[name="equipment"]').forEach(input => input.addEventListener('change', applyFilters));
  get('reset').addEventListener('click', () => {
    get('attendees').value = '1';
    root.querySelectorAll('input[name="equipment"]').forEach(input => { input.checked = false; });
    applyFilters();
  });
  get('rooms').addEventListener('click', event => {
    const button = event.target.closest('button[data-room-id]');
    if (!button) return;
    render(controller.selectRoom(button.dataset.roomId));
    // Re-rendered buttons retain keyboard focus on the selected room.
    root.querySelector(`button[data-room-id="${button.dataset.roomId}"]`).focus({ preventScroll: true });
  });
  const changeTimes = () => render(controller.setTimes(get('start').value, get('end').value));
  get('start').addEventListener('input', changeTimes);
  get('end').addEventListener('input', changeTimes);
  get('time-form').addEventListener('submit', event => {
    event.preventDefault();
    controller.setTimes(get('start').value, get('end').value);
    const view = controller.check(); render(view);
    if (view.timeError) get(['invalid_time', 'past'].includes(view.result.code) ? 'start' : 'end').focus();
  });
  render(controller.view());
  return controller;
}
