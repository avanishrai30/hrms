# White Label Architecture

## Purpose

Define tenant branding and custom domain support for VC-WMS as a SaaS platform.

## Branding Scope

Tenant branding includes:

- Display name.
- Logo.
- Favicon.
- Primary color.
- Secondary color.
- Accent color.
- PWA name.
- PWA short name.
- Login page theme.
- Email sender name for future notification channels.

VC Organics branding is configured as Tenant #1 branding data. Its primary tenant domain is `hr.vcorganics.com`.

## Branding Resolution

Branding is resolved by:

1. Hostname or custom domain.
2. Tenant slug route.
3. Authenticated tenant session.

The web app loads public-safe branding before login and full tenant settings after authentication.

## Asset Storage

Branding assets are stored in tenant-prefixed private MinIO paths.

Object key format:

```text
tenants/{tenant_id}/branding/{asset_type}/{file_id}
```

Public rendering uses signed or controlled delivery URLs. Uploaded branding assets must pass file validation.

## Custom Domains

Custom domain workflow:

1. Tenant Admin submits domain.
2. Platform generates verification token.
3. Tenant adds DNS TXT or CNAME record.
4. Platform verifies DNS.
5. Platform marks domain as verified.
6. TLS certificate is issued or attached.
7. Domain becomes available for tenant routing.

Custom domains require plan entitlement or explicit tenant override.

## Subdomains

Default tenant access uses platform subdomains:

```text
{tenant_slug}.example.com
```

Tenant slug must be globally unique and immutable after activation unless a migration workflow is approved.

## Theme Delivery

Theme tokens are delivered to the web app as validated values:

- CSS variables.
- PWA manifest values.
- Login page display values.

Tenant branding must not allow arbitrary CSS or script injection.

## White Label Boundaries

Allowed:

- Tenant logo.
- Tenant display name.
- Tenant color tokens.
- Tenant PWA metadata.
- Tenant custom domain.

Not allowed in Phase 1:

- Tenant-supplied JavaScript.
- Tenant-supplied HTML templates.
- Tenant-controlled API domains beyond verified routing.
- Tenant-specific database schema.

## Security Requirements

- Validate image type and size.
- Strip metadata when possible.
- Reject SVG uploads unless sanitized and explicitly approved.
- Prevent open redirects during tenant domain login.
- Restrict CORS to verified platform and tenant domains.
- Audit domain and branding changes.

## Operational Requirements

- Branding changes should take effect without deployment.
- Branding cache keys include tenant ID and branding version.
- Domain changes must support rollback.
- Expired or invalid custom domains must fall back to tenant subdomain.
