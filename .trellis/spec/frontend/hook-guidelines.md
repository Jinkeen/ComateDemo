# Hook Guidelines

Hooks use the `use` prefix and live beside the feature that owns them. Add a hook when stateful behavior is reused or when a page needs a clear async data boundary.

Service calls should be wrapped in a feature hook once loading, failure, or refresh behavior exists. Hooks return typed state. They do not render UI and do not import page components.

Simple click state stays in the component. `RolePortalPage` is the current example of local navigation behavior that does not need a custom hook.
