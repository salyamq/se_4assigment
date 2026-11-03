import test from 'node:test';
import assert from 'node:assert/strict';

export function regression(check, prefix = '') {
  const free = () => ({ id: 'T1', name: 'Test room', capacity: 20, equipment: [], blocked: false, bookings: [] });
  const booked = () => ({ ...free(), bookings: [{ start: '10:00', end: '11:00' }] });
  const cases = [
    ['AC1 rejects malformed time', () => assert.equal(check(free(), '9:00', '10:00').code, 'invalid_time')],
    ['AC1 rejects missing time', () => assert.equal(check(free(), '', '10:00').code, 'invalid_time')],
    ['AC1 rejects impossible time', () => assert.equal(check(free(), '24:00', '25:00').code, 'invalid_time')],
    ['AC1 rejects start before fixed current time', () => assert.equal(check(free(), '08:59', '10:00').code, 'past')],
    ['AC1 accepts start at fixed current time', () => assert.equal(check(free(), '09:00', '09:30').available, true)],
    ['AC1 rejects equal endpoints', () => assert.equal(check(free(), '11:00', '11:00').code, 'order')],
    ['AC1 rejects reversed endpoints', () => assert.equal(check(free(), '12:00', '11:00').code, 'order')],
    ['AC2 accepts exactly 120 minutes', () => assert.equal(check(free(), '11:00', '13:00').available, true)],
    ['AC2 rejects 121 minutes', () => assert.equal(check(free(), '11:00', '13:01').code, 'duration')],
    ['AC3 rejects a blocked room with no bookings', () => assert.equal(check({ ...free(), blocked: true }, '11:00', '12:00').code, 'blocked')],
    ['AC4 allows request ending at booking start', () => assert.equal(check(booked(), '09:00', '10:00').available, true)],
    ['AC4 allows request starting at booking end', () => assert.equal(check(booked(), '11:00', '12:00').available, true)],
    ['AC4 rejects one minute overlap', () => assert.equal(check(booked(), '10:59', '12:00').code, 'overlap')],
    ['AC4 rejects identical booking', () => assert.equal(check(booked(), '10:00', '11:00').code, 'overlap')],
    ['AC4 rejects enclosing interval', () => assert.equal(check(booked(), '09:30', '11:30').code, 'overlap')],
    ['AC5 preserves frozen unsorted booking data', () => {
      const r = free();
      r.bookings = [{ start: '14:00', end: '15:00' }, { start: '10:00', end: '11:00' }];
      r.bookings.forEach(Object.freeze); Object.freeze(r.bookings); Object.freeze(r);
      const before = JSON.stringify(r);
      assert.equal(check(r, '11:00', '12:00').available, true);
      assert.equal(JSON.stringify(r), before);
    }],
  ];
  for (const [name, run] of cases) test(prefix + name, run);
}
