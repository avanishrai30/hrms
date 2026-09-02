# UX Writing

AIavro copy should be direct, calm, and operational.

## Brand Naming

- Use `AIavro` for the product and platform layer.
- Use tenant names only for workspace context.
- Avoid legacy labels such as `VC-WMS` in user-facing product chrome.

## Error Messages

- 401: `Your session has expired. Sign in again to continue.`
- 403: `You do not have access to this area.`
- Network/server: `We could not reach AIavro right now. Try again.`
- Unknown: `Something went wrong.`

Raw backend JSON must never be rendered directly to users.

## Login

The login experience should say:

- AIavro is the platform provider.
- VC Organics is the detected workspace.
- Users enter work email or phone and password.
- The tenant slug may be sent to the backend but should not be a required visible field when the domain/default tenant resolves it.
