import test from 'node:test';
import assert from 'node:assert/strict';
import { rooms } from '../final/src/data.mjs';
import { checkAvailability } from '../final/src/availability.mjs';
import { filterRooms, validateAttendees } from '../final/src/filters.mjs';
import { createController } from '../final/src/controller.mjs';
import { regression } from './regression.mjs';

regression(checkAvailability);

test('Catalog contains four distinct complete rooms', () => {
  assert.equal(rooms.length, 4);
  assert.equal(new Set(rooms.map(room => room.id)).size, 4);
  for (const room of rooms) {
    assert.equal(typeof room.name, 'string'); assert.ok(room.name.length > 0);
    assert.equal(typeof room.blocked, 'boolean'); assert.ok(room.capacity > 0);
    assert.ok(Array.isArray(room.equipment)); assert.ok(Array.isArray(room.bookings));
  }
});
test('F1 exact capacity is included', () => assert.ok(filterRooms(rooms, 20).some(room => room.id === 'R101')));
test('F1 insufficient capacity is excluded', () => assert.ok(!filterRooms(rooms, 21).some(room => room.id === 'R101')));
test('F1 zero invalid and fractional attendee values are rejected', () => {
  for (const value of [0, -1, '', 'abc', 1.5, Infinity, '2e1']) {
    assert.ok(validateAttendees(value)); assert.deepEqual(filterRooms(rooms, value), []);
  }
});
test('F2 ALL selected equipment is required', () => assert.deepEqual(
  filterRooms(rooms, 1, ['Projector', 'Computers']).map(room => room.id), ['R202']));
test('F2 equipment combination absent from every room returns empty', () => assert.deepEqual(
  filterRooms(rooms, 1, ['Computers', 'Microphone']), []));
test('F2 no equipment requirement includes every room', () => assert.equal(filterRooms(rooms, 1, []).length, 4));
test('F3 matching blocked room can be listed but never available', () => {
  const [room] = filterRooms(rooms, 60, ['Microphone']);
  assert.equal(room.id, 'R404'); assert.equal(checkAvailability(room, '11:00', '12:00').code, 'blocked');
});
test('Filtering preserves room catalog and ordering', () => {
  const before = JSON.stringify(rooms); filterRooms(rooms, 20, ['Projector']);
  assert.equal(JSON.stringify(rooms), before); assert.equal(rooms[0].id, 'R101');
});
test('F4 no room satisfies excessive capacity', () => assert.deepEqual(filterRooms(rooms, 61), []));

test('Integration F5 room switching recalculates the checked interval', () => {
  const app = createController(rooms);
  assert.equal(app.check().result.code, 'available');
  const view = app.selectRoom('R202');
  assert.equal(view.selected.id, 'R202'); assert.equal(view.result.code, 'overlap');
  assert.equal(view.start, '11:00'); assert.equal(view.end, '12:00');
});
test('Integration F3 switching from available to blocked removes success', () => {
  const app = createController(rooms); app.check();
  assert.equal(app.selectRoom('R404').result.code, 'blocked');
});
test('Integration F4 empty filters clear selection and availability', () => {
  const app = createController(rooms); app.check();
  const view = app.setFilters('61', []);
  assert.equal(view.matches.length, 0); assert.equal(view.selected, null);
  assert.equal(view.result.code, 'no_room'); assert.equal(view.result.available, false);
});
test('Integration filtering out a room selects first match and refreshes', () => {
  const app = createController(rooms); app.check();
  const view = app.setFilters('25', ['Computers']);
  assert.equal(view.selected.id, 'R202'); assert.equal(view.result.code, 'overlap');
});
test('Integration resetting empty filters restores selection', () => {
  const app = createController(rooms); app.setFilters('61', []);
  const view = app.setFilters('1', []);
  assert.equal(view.matches.length, 4); assert.equal(view.selected.id, 'R101');
});
test('Integration changed times replace an old success and recover', () => {
  const app = createController(rooms); app.check();
  assert.equal(app.setTimes('11:00', '13:01').result.code, 'duration');
  assert.equal(app.setTimes('11:00', '13:00').result.code, 'available');
});
test('Integration room changes before first check preserve idle feedback', () => {
  const app = createController(rooms);
  assert.equal(app.selectRoom('R202').result.code, 'idle');
  assert.equal(app.check().result.code, 'overlap');
});
test('Integration invalid attendees hide stale results then recover', () => {
  const app = createController(rooms); app.check();
  assert.equal(app.setFilters('', []).result.code, 'filter_error');
  assert.equal(app.setFilters('1', []).result.code, 'available');
});
test('Integration cannot select a room excluded by filters', () => {
  const app = createController(rooms); app.setFilters('30', ['Computers']);
  assert.equal(app.selectRoom('R101').selected.id, 'R202');
});
