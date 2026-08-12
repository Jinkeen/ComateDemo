# Data Shape Guidelines

The current demo uses documented plain JavaScript object shapes in `assets/js/mock-data.js`. Keep field names stable across both user journeys.

Core records are job, candidate, interview, assessment, and agent event. All records use stable string IDs and ISO 8601 timestamps when time is needed.

Check required fields before rendering. Avoid ambiguous field names, array indexes as IDs, and inconsistent status strings. When a backend is added, validate API responses at the service boundary.
