---
version: alpha
name: "Librix"
description: "A dark, focused digital library whose warm book-cover grid recalls a quiet reading room."
colors:
  background: "#0f0d0a"
  surface: "#1e1a15"
  surface-hover: "#252018"
  primary: "#c9a84c"
  primary-light: "#e4c472"
  text: "#f0e8d8"
  text-secondary: "#a89880"
  border: "#3d3025"
  success: "#4a7c6a"
  danger: "#8b3a3a"
typography:
  display:
    fontFamily: "Playfair Display, serif"
  sans:
    fontFamily: "DM Sans, sans-serif"
rounded:
  DEFAULT: "0.5rem"
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
spacing:
  section-gap: "3rem"
  page-max: "80rem"
components:
  button: { }
  card: { }
  dialog: { }
  status-badge: { }
  book-grid: { }
---

# Librix Design System

## Overview

### Creative North Star

A dim reading room where warm cover art and restrained gold wayfinding sit against near-black wood tones.

### Product context and register

- **Audience and primary job:** English-language readers browse public-domain books and manage up to three loans.
- **Target markets and evidence:** Global English-language demo; the current product and Gutendex source define no country-specific market.
- **Locales and language policy:** Owned UI is English; Gutendex metadata is displayed as received.
- **Usage scene:** Responsive personal browsing with moderate information density and no urgent workflow.
- **Register:** Product interface across home, browse, detail, and library routes.
- **Memorable signature:** Gold-lit book covers on a deep brown-black canvas.
- **Restraint:** Forms, navigation, dialogs, and status feedback remain direct and familiar.
- **Anti-references:** Avoid generic blue SaaS dashboards, paper textures, and ornamental antique-library motifs because they compete with the books.
- **Token ownership/runtime mapping:** This file mirrors the canonical runtime variables in `app/globals.css`; changes must update both in one change set.

## Colors

Dark brown surfaces provide hierarchy through tone and borders. Gold is reserved for primary actions and active navigation. Green communicates availability and active borrowing; red is reserved for overdue and return actions. Text and focus indicators must meet WCAG 2.2 AA, while forced-colors mode yields control to system colors.

## Typography

Playfair Display is reserved for page titles, book titles, and literary emphasis. DM Sans carries navigation, controls, metadata, and body copy. Small uppercase labels distinguish metadata from prose. Body content retains readable line height and avoids decorative italics except the quiet footer signature.

## Layout

Pages use centered responsive containers from `max-w-5xl` to `max-w-7xl`, four-pixel-based Tailwind spacing, and generous vertical separation. Browse results use a dense responsive cover grid. Detail and library screens use readable task-focused columns. Loading states reserve comparable geometry to their final content.

## Elevation & Depth

Cards use subtle borders and tonal separation. Book covers may lift and gain a restrained gold glow on hover. The sticky navigation uses blur over an opaque-enough surface. Modal dialogs use the card surface and a dark backdrop without moving page content.

## Shapes

Cards and primary controls use medium rounded corners. Status labels use pill geometry. Dividers are one-pixel strokes. Focus rings remain visible and offset against every dark surface.

## Components

### Foundational visual states

Enabled controls define hover, focus-visible, active, disabled, and busy states. Busy buttons retain their dimensions. Skeletons are used for route-level loading and respect reduced-motion settings. Errors remain visible near the action that failed.

### Buttons and actions

Gold filled buttons carry the primary action. Neutral bordered controls carry cancellation. Red is used for return actions and their final confirmation. Action labels use explicit verbs and disabled controls remove pointer affordance.

### Navigation and data display

The sticky navigation keeps the active route visible in gold. Book grids transform from two to six columns. Badges combine text, color, and a dot so color is never the only status cue.

### Forms and overlays

Search uses a native labeled text input and explicit submission. Returns use the shared application dialog with least-destructive initial focus, Escape support, focus containment, pending state, and focus restoration. Browser alert, confirm, and prompt dialogs are forbidden.

### Iconography

The interface uses small inline symbols and simple two-pixel SVG strokes. Icon-only buttons require an accessible name; unfamiliar actions retain visible text.

### Motion

Motion is brief and limited to route entrance, book hover, and loading feedback. `prefers-reduced-motion` reduces all transitions and animations to effectively immediate state changes.

### Content and data visualization

Copy uses plain English and consistent verbs: Borrow, Return, Read, Search, and Clear. Dates use short English month names. Empty and failure states state what happened and provide a direct recovery action.

## Do's and Don'ts

- **Do:** Preserve the dark reading-room identity and gold action hierarchy.
- **Do:** Keep interactive client boundaries narrow so book content remains server rendered.
- **Don't:** Add gradients, shadows, or animation that compete with book covers.
- **Don't:** introduce screen-local status colors, dialogs, or mutation behavior.
