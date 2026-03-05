---
title: Keyboard Accessibility and Focus Management
authority: primary
source: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
last_updated: 2023-10-05
---

# Keyboard Accessibility and Focus Management

## Relevant Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| SC 2.1.1 | A | Keyboard: All functionality operable via keyboard |
| SC 2.1.2 | A | No Keyboard Trap: User can navigate away from any component |
| SC 2.1.4 | A | Character Key Shortcuts: Single-character shortcuts can be turned off |
| SC 2.4.3 | A | Focus Order: Focus moves in a meaningful sequence |
| SC 2.4.7 | AA | Focus Visible: Keyboard focus indicator is visible |
| SC 2.5.1 | A | Pointer Gestures: Multi-point gestures have single-pointer alternatives |
| SC 2.5.2 | A | Pointer Cancellation: Operations can be cancelled or undone |
| SC 2.5.4 | A | Motion Actuation: Motion-triggered functions have UI alternatives |

## Keyboard Navigation Basics

All interactive elements must be operable with a keyboard alone:

| Key | Action |
|-----|--------|
| Tab | Move focus to next interactive element |
| Shift + Tab | Move focus to previous interactive element |
| Enter | Activate buttons, links |
| Space | Activate buttons, toggle checkboxes |
| Arrow keys | Navigate within components (menus, tabs, radio groups) |
| Escape | Close dialogs, menus, dismiss popups |

## Focus Visibility (SC 2.4.7)

### CSS Focus Indicators
```css
/* Good: Custom, high-visibility focus indicator */
:focus-visible {
  outline: 3px solid #1a73e8;
  outline-offset: 2px;
}

/* Good: Focus style that works on any background */
:focus-visible {
  outline: 3px solid #005fcc;
  box-shadow: 0 0 0 6px rgba(0, 95, 204, 0.3);
}

/* BAD: Never remove focus outlines without replacement */
*:focus {
  outline: none; /* ACCESSIBILITY VIOLATION */
}
```

### Requirements
- Focus indicator must be visible on all backgrounds
- Should have at least 3:1 contrast ratio against adjacent colors
- Must appear on all interactive elements (links, buttons, inputs, etc.)
- Custom focus styles should be tested across browsers

## Focus Management for Dynamic Content

### Modal Dialogs
```html
<!-- When dialog opens: move focus to dialog -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1">
  <h2 id="dialog-title">Confirm Action</h2>
  <p>Are you sure you want to proceed?</p>
  <button>Cancel</button>
  <button>Confirm</button>
</div>
```

JavaScript focus management:
```javascript
// On open: move focus to dialog
dialog.focus();

// Trap focus within dialog (Tab should cycle within)
// On close: return focus to the element that triggered the dialog
triggerButton.focus();
```

### Single Page Applications (SPAs)
When navigating between "pages" in an SPA:
- Move focus to the main content area or page heading
- Announce the page change to screen readers
- Update the document title

## Common Keyboard Traps

### What Causes Traps
- Custom widgets that capture Tab key events
- Embedded content (iframes, video players) without keyboard exit
- JavaScript-heavy components without proper focus management

### How to Avoid Traps
- Always ensure Escape key closes overlays
- Provide skip links to bypass complex widgets
- Test every interactive component with keyboard-only navigation
- Ensure embedded third-party content supports keyboard navigation

## Skip Navigation Links

Provide a skip link as the first focusable element:
```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header><!-- navigation --></header>
  <main id="main-content" tabindex="-1">
    <!-- page content -->
  </main>
</body>
```

```css
.skip-link {
  position: absolute;
  left: -999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.skip-link:focus {
  position: fixed;
  top: 10px;
  left: 10px;
  width: auto;
  height: auto;
  padding: 12px 24px;
  background: #005fcc;
  color: #ffffff;
  z-index: 9999;
  font-size: 1rem;
}
```

## Testing Keyboard Accessibility

1. **Unplug your mouse** (or disable trackpad)
2. Press **Tab** through every interactive element on the page
3. Verify: Can you reach all buttons, links, form fields?
4. Verify: Is focus order logical (left to right, top to bottom)?
5. Verify: Is the focus indicator always visible?
6. Test all interactive widgets (menus, accordions, modals, tabs)
7. Verify: Can you escape from every component?
8. Verify: Does Enter/Space activate the focused element as expected?
