# LMS - Software Engineering Assignment 04

Salim Tokhtobayev - 24B070520 

The final version extends it with four fictional rooms, capacity and ALL-equipment filters, room switching and shared validation. This is an availability checker, not a reservation system.

## Requirements

- Python 3 for the static development server.
- Node.js 18 or newer for automated tests (executed using Node.js v24.22.1).
- A current browser supporting JavaScript ES modules.

There are no packages to install and no build step. No database, account, live API or network dependency is used by the app.

## Run

Extract the archive. Open a terminal in the extracted folder containing this README, then run:

```bash
python3 -m http.server 8000
```

- Initial version: http://localhost:8000/initial/
- Final version: http://localhost:8000/final/
- Browser UI tests: http://localhost:8000/tests/ui.test.html

Use the HTTP server rather than double-clicking an HTML file, because browser ES module loading requires HTTP. On Windows, `py -m http.server 8000` is an alternative. Stop the server with Ctrl+C.

## Test

Run these commands in the same extracted folder:

```bash
node --test --test-reporter=tap tests/initial.test.mjs
node --test --test-reporter=tap tests/final.test.mjs
```

To run both Node suites together:

```bash
node --test
```

The recorded results are 16/16 initial tests and 35/35 final tests. The final suite contains the same 16 original regression checks plus 19 catalog/filter/integration checks. Open the browser UI test URL above to execute a further 9/9 real DOM checks. The page also embeds a narrow-screen preview. Browser tests run in the browser, not Node.

Actual outputs are in `results/initial-tests.txt`, `results/final-tests.txt` and `results/browser-tests.txt`. Timing values may differ on another machine.

## Demonstration

All times refer to 2 November 2026 in Almaty. Fixed current time is 09:00. The browser may display the time inputs in its own 12-hour or 24-hour format.

1. Leave 1 attendee and no equipment requirements. Select R101, use 11:00 - 12:00 and check. It is available.
2. Select R202 without submitting again. Its 11:00 - 12:30 booking changes the result to unavailable.
3. Select R404. It is blocked even when the requested interval does not overlap a booking.
4. Enter 25 attendees and select Projector and Computers. Only R202 matches. For 12:30 - 13:30 it is available.
5. Select Computers and Microphone together, or request 61 attendees. There are no matches. The empty state appears, selection clears and checking is disabled.
6. Reset filters. R101 with 11:00 - 13:00 accepts exactly 120 minutes; 11:00 - 13:01 rejects 121 minutes.
7. R101 accepts 09:00 - 10:00 and 11:00 - 12:00, which touch its existing booking. It rejects 10:59 - 12:00.

Filters preserve the selected room when possible. If it no longer matches, the first matching room is selected. Previously checked results are recalculated immediately when the room, time or filters change. Before the first check, the result stays in the ready state.

## Files

- `initial/`: runnable one-room source before extension and refactoring.
- `final/`: runnable final source; `src/` separates data, availability, filtering, state and presentation.
- `tests/`: shared regression cases, two Node suites and the browser UI harness.
- `results/`: actual executed test outputs.
- `Assignment_04_Report.pdf`: analysis, feature demonstration, before/after diagrams, testing, quality comparison, 200-300 word reflection and AI-use appendix.

## Scope and limitations

All rooms and bookings are fictional. Data is immutable and resets on reload. The prototype only checks intervals on the fixed demonstration day and does not create bookings, support overnight intervals or manage concurrent users. Responsive behavior was checked in a narrow browser iframe, not on a physical mobile device. No test-coverage percentage or performance improvement is claimed.
