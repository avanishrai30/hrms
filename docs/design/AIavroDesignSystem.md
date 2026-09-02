# AIavro Design System

AIavro is the product and platform identity. Tenant brands, including VC Organics, appear as workspace context and configurable tenant surfaces only. Product chrome, authentication, PWA metadata, system notifications, AI workspace, and platform navigation use AIavro branding.

## Brand Hierarchy

- Product provider: AIavro
- Current tenant workspace: VC Organics
- Tenant branding: extensible through white-label settings, never hardcoded into product shell primitives
- Product logo usage: login, app shell, PWA metadata, notifications, system-level empty/error states
- Tenant identity usage: workspace label, tenant switcher, tenant settings, tenant-scoped reports

## Visual Language

AIavro uses a premium enterprise SaaS language: quiet neutral canvas, graphite typography, precise borders, soft but minimal depth, and small measured accents. The interface should feel operational and trustworthy, not decorative.

## Core Tokens

- Canvas: soft off-white for the main app background
- Surface: white or near-black elevated application surfaces
- Foreground: graphite text with strong contrast
- Border: subtle neutral separation
- Brand: AIavro near-black for product identity and high-emphasis navigation
- Tenant accent: reserved for tenant-controlled accents after tenant branding resolution
- Motion: short state transitions for navigation, focus, loading, and disclosure

## Component Grammar

- Primary navigation uses product-level AIavro identity.
- Secondary navigation is contextual to the active domain.
- Controls use consistent 8px radii.
- Cards are reserved for bounded information groups, not page sections.
- Empty, loading, error, and permission states must use normalized human messages.

## Implementation Notes

The first implementation pass introduces `AiavroMark`, `AiavroWordmark`, updated PWA metadata, normalized frontend API errors, and an AIavro app shell with grouped information architecture.

Phase 2 adds a production shell foundation with collapse behavior, mobile drawer navigation, a route-only command palette, account menu, alerts/help affordances, and shared page primitives. Motion is limited to state changes and honors reduced-motion through Tailwind `motion-reduce` variants.
