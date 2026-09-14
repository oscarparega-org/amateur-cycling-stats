---
name: acs-frontend-design
description: Apply the Amateur Cycling Stats visual system and route-shell decisions when creating or reshaping frontend pages and components in apps/frontend. Use for ACS UI implementation and review; do not use for backend-only work.
---

# ACS Frontend Design

Build interfaces that feel like race control: direct, legible, and structured by timing lines rather than generic dashboard cards.

## Visual system

- Public pages use race navy `#102A43`, course blue `#2563EB`, signal orange `#F97316`, timing line `#CBD5E1`, paper `#F8FAFC`, and white `#FFFFFF`. Orange belongs to the public race identity; do not carry it into authenticated workspace chrome.
- Protected pages use control navy `#102A43` for the rail, primary actions, and strong text; steel `#5F7382` for secondary links and active markers; fog `#E4E9EC` for hover and selected working states; canvas `#F3F5F6`; white surfaces; and slate `#475569` for secondary text.
- Use Barlow Condensed for page identity: `h1`–`h3`, display numbers, and the number-plate brand mark. Use Source Sans 3 for navigation, controls, body copy, and data.
- Keep content left aligned. Default body lines to less than 80 characters.
- Spend visual emphasis once per view. Public views may use one orange rule, primary action, or timing motif. Protected views are largely monochrome and reserve green and red for real status, success, and destructive meaning.
- Use borders and dividers to encode sections. Avoid grids of interchangeable rounded cards, decorative gradients, soft shadows on every surface, all-caps labels, and ornamental eyebrow text.
- Motion should explain a user-triggered change. Respect reduced-motion preferences and preserve visible keyboard focus.

## Route shells

Protected admin, organizer, and cyclist/user routes use `ProtectedShell` from `@/components/protected/protected-shell`.

- Desktop: persistent 17rem navy left rail, brand and role, optional workspace switcher, role-specific primary navigation, account and sign-out; white contextual header above content.
- Mobile: navy identity header followed by the same workspace context and primary navigation in a compact horizontal form. Do not create a separate mobile information architecture.
- Configure role navigation through `ProtectedNavItem`. Use `match: 'exact'` when a parent item must not stay active for nested sibling sections.
- Keep authorization in App Router layouts before rendering the shell. The shell communicates role and location; it does not enforce access.
- Add role-specific controls through the `workspace` slot or page content. Do not fork the shell to accommodate one role.

Public routes choose chrome by task complexity:

- Use the standard `SiteHeader` for event browsing and other multi-step or navigable public experiences.
- Omit the site header for focused authentication and recovery flows where `AuthShell` already provides brand and orientation.
- A public page may use a local side panel only when it contains real navigation, filters, or persistent context. Do not add a panel merely to balance the composition.

## Forms and interface copy

- Never use input or textarea placeholders. Every control has a persistent, visible label.
- Treat helper text as any supporting sentence that does not change a decision or explain a consequence, regardless of where it appears. Remove promotional taglines and copy that restates the page title, visible data, ordering, available actions, or an empty-state heading.
- Never add helper text below a control. Put short format constraints in the label, such as `Contraseña (8–128 caracteres)`, and let the action name communicate workflow state, such as `Crear borrador`.
- Before keeping supporting copy, ask whether the interface becomes less understandable or could cause a wrong action without it. If not, remove it. For example, keep that a new organization starts inactive or that a verification link expires; remove “find your next starting line” above an already-labeled event list.
- Keep `Opcional` next to a label when omission changes how the field should be interpreted.
- Validation errors, service errors, confirmations, and actionable empty states are not helper text. Render them only when relevant and state what happened or what the person can do next.
- Use sentence case and active, stable action names. The button label and resulting confirmation should use the same verb.
- Do not fill missing domain data with invented prose. Show a concise empty value or omit the section when the absence needs no action.

## Component decisions

Before adding a component, check whether it belongs to one of these layers:

- `components/protected`: shared authenticated shell, navigation, and account chrome.
- `components/auth`: focused account-entry flows.
- `components/admin` or `components/organizer`: role-specific operations only.
- `components/events`: public event presentation shared by public routes.

Reuse existing typography, color, spacing, focus, and reduced-motion rules in `app/globals.css`. Add a new token only when it represents a repeated semantic role, not a single page value.

When reviewing a new page or component, verify desktop and mobile hierarchy, current-route indication, keyboard focus, semantic labels, empty and error states, and the absence of placeholders, filler, promotional taglines, and copy that repeats what the interface already shows.
