# Navigation Architecture

AIavro uses a two-level application shell.

## Shell Structure

- Product rail: AIavro mark, AIavro wordmark, primary navigation groups
- Workspace context: current tenant display name
- Header: active group, tenant context, search command entry, help
- Secondary nav: route links relevant to the active group
- Mobile dock: employee-safe high-frequency routes

## Route Density

The previous flat sidebar exposed every feature at the same level. The grouped IA reduces scan load and creates stable homes for future SaaS modules.

## Permission Rules

- Admin group requires tenant/admin/security/integration permissions.
- Analytics group requires analytics permission.
- Feature links use existing backend permission codes.
- Routes remain protected by backend guards; frontend visibility is a usability layer only.

## Future Work

- Add account menu and notification center.
- Expand command palette beyond route navigation only after employee/entity search APIs are wired into a dedicated search contract.
- Add tenant switcher only when platform rules permit multiple memberships.
- Move nav definitions to a package if native/mobile clients need the same IA.

## Phase 2 Implementation

The shell includes collapsible desktop navigation, a mobile navigation drawer, active primary and secondary states, Cmd/Ctrl K route navigation, alerts/help entry points, and account sign out. The command palette intentionally avoids fake global search and only lists routes the user can see from permission-filtered navigation.
