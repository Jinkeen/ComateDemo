# State Management

Use the URL hash for current page state and local variables for short lived interaction state. Demo data comes from `window.COMATE_MOCK` in `assets/js/mock-data.js`.

Future backend integration should introduce `assets/js/services/` with async `fetch` functions while preserving page render inputs. Do not store domain records inside HTML attributes or duplicate the same candidate in several files.
