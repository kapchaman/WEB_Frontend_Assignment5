# Verification notes

Date: 26 October 2026.

- JavaScript syntax checks passed for all three application scripts.
- 19 deterministic logic checks passed in `tests/logic-tests.cjs`.
- Browser interaction checks covered Attack, Defend, Repair, blocked full-HP
  repairs, the active-task limit, task movement, department filters and empty
  search results.
- Form checks covered no initial errors, four invalid fields on submit,
  focus on the callsign, live cross-field feedback, valid card generation and
  reset after success.
- Responsive checks used iframes sized at 1280 and 375 CSS pixels. The
  document scroll width equalled its client width in each (1265 and 360
  respectively, after the 15-pixel scrollbar). No horizontal overflow.
- Browser logs contained extension-origin metadata errors; no application
  JavaScript error was observed. Extension messages are outside this project.
- Report images show actual browser states, with crops for readability.

The game win/loss boundaries, critical hits, exhausted repairs, and modified
constants were checked deterministically, rather than relying on lucky rolls.
Native HTML constraint validation and layout were checked in Chromium. Other
browsers were not separately tested. Refresh deliberately resets session data.
