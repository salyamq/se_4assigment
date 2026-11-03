import { mount } from '../final/src/ui.mjs';
import { rooms } from '../final/src/data.mjs';

const root = document.querySelector('#fixture');
const lines = ['LMS real DOM behavior tests', 'Tool: browser ES modules', 'Date: 2 November 2026'];
let passed = 0, failed = 0;
const get = id => root.querySelector(`#${id}`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const input = (id, value) => { get(id).value = value; get(id).dispatchEvent(new Event('input', { bubbles: true })); };
const equipment = item => {
  const checkbox = root.querySelector(`input[value="${item}"]`);
  checkbox.checked = true; checkbox.dispatchEvent(new Event('change', { bubbles: true }));
};
function run(name, action) {
  mount(root, rooms);
  try { action(); passed++; lines.push(`PASS ${name}`); }
  catch (error) { failed++; lines.push(`FAIL ${name}: ${error.message}`); }
}
run('Catalog renders all four rooms', () => assert(get('rooms').children.length === 4, 'Expected 4 room buttons'));
run('Availability is rendered after submitting', () => {
  get('check').click(); assert(get('result').dataset.code === 'available', 'Expected available');
  assert(get('result-message').textContent.includes('R101'), 'Expected selected room in feedback');
});
run('F5 room switch refreshes result and room bookings', () => {
  get('check').click(); root.querySelector('[data-room-id="R202"]').click();
  assert(get('result').dataset.code === 'overlap', 'Old success remained');
  assert(get('bookings').textContent.includes('12:30'), 'Wrong room bookings');
});
run('F3 blocked room never displays success', () => {
  get('check').click(); root.querySelector('[data-room-id="R404"]').click();
  assert(get('result').dataset.code === 'blocked', 'Blocked room appeared available');
});
run('F1 F2 combined capacity and ALL equipment filters render correctly', () => {
  input('attendees', '25'); equipment('Projector'); equipment('Computers');
  assert(get('rooms').children.length === 1, 'Expected one match');
  assert(get('rooms').firstElementChild.dataset.roomId === 'R202', 'Wrong room');
});
run('F4 empty state clears selection and disables checking', () => {
  get('check').click(); input('attendees', '61');
  assert(get('empty').hidden === false, 'Empty state hidden');
  assert(get('check').disabled, 'Check button remained enabled');
  assert(get('result').dataset.code === 'no_room', 'Stale availability remained');
});
run('Reset restores all room cards after no matches', () => {
  input('attendees', '61'); get('reset').click();
  assert(get('rooms').children.length === 4 && !get('check').disabled, 'Reset did not recover');
});
run('Changing invalid time back to valid clears error attributes', () => {
  get('check').click(); input('end', '13:01');
  assert(get('end').getAttribute('aria-invalid') === 'true', 'Missing error attribute');
  input('end', '13:00');
  assert(get('result').dataset.code === 'available', 'Result did not recover');
  assert(get('end').getAttribute('aria-invalid') === 'false', 'Stale error attribute');
});
run('Room keyboard focus survives the render', () => {
  // Synthetic click verifies the focus-restoration handler; native keyboard is checked separately.
  root.style.display = 'block';
  root.querySelector('[data-room-id="R202"]').click();
  assert(document.activeElement.dataset.roomId === 'R202', 'Room focus was lost');
  root.style.display = 'none';
});
lines.push(`Tests: ${passed + failed}; passed: ${passed}; failed: ${failed}`);
document.querySelector('#output').textContent = lines.join('\n');
document.title = failed ? 'FAIL | LMS UI tests' : 'PASS | LMS UI tests';
