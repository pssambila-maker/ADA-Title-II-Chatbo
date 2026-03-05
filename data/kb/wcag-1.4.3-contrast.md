---
title: WCAG SC 1.4.3 — Contrast Minimum
authority: primary
source: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
last_updated: 2023-10-05
---

# Success Criterion 1.4.3 — Contrast (Minimum) (Level AA)

## Requirement

The visual presentation of text and images of text has a contrast ratio of at least **4.5:1**, except for the following:

### Large Text
Large-scale text and images of large-scale text have a contrast ratio of at least **3:1**. Large text is defined as:
- **Bold text**: 14 points (approximately 18.66px) and larger
- **Regular text**: 18 points (approximately 24px) and larger

### Incidental
Text or images of text that are part of an inactive user interface component, that are pure decoration, that are not visible to anyone, or that are part of a picture that contains significant other visual content, have no contrast requirement.

### Logotypes
Text that is part of a logo or brand name has no minimum contrast requirement.

## How to Test

### Tools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Chrome DevTools**: Inspect element → color picker shows contrast ratio
- **axe DevTools**: Browser extension automatically flags contrast issues
- **WAVE**: Browser extension that identifies contrast errors
- **Color Contrast Analyzer (CCA)**: Desktop application by The Paciello Group

### Manual Testing Steps
1. Identify all text elements on the page
2. Determine the foreground (text) color and background color
3. Calculate the contrast ratio using a tool
4. Verify large text meets 3:1 and normal text meets 4.5:1
5. Check text over images or gradients at their lowest contrast point

## Common Failures
- Light gray text on white background
- Placeholder text in form fields with insufficient contrast
- Links that are only distinguished by color (without underline or other visual indicator)
- Text overlaid on images without sufficient background contrast
- Disabled button text (note: incidental text is exempt, but it's best practice to maintain reasonable contrast)

## Techniques for Meeting SC 1.4.3

### CSS Examples

Good contrast (passes):
```css
/* Dark text on light background — 12.63:1 ratio */
body { color: #333333; background-color: #ffffff; }

/* White text on dark background — 11.07:1 ratio */
.hero { color: #ffffff; background-color: #1a1a2e; }
```

Poor contrast (fails):
```css
/* Light gray on white — 2.68:1 ratio — FAILS */
.subtitle { color: #999999; background-color: #ffffff; }
```

### Best Practices
- Design with contrast in mind from the start
- Use a design system with pre-vetted accessible color palettes
- Test contrast at every stage of development
- Consider users who may have their own custom styles or high contrast mode enabled
