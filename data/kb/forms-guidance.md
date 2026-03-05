---
title: Accessible Forms and Input Fields
authority: primary
source: https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html
last_updated: 2023-10-05
---

# Accessible Forms and Input Fields

## Relevant Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| SC 1.3.1 | A | Info and Relationships: Labels are programmatically associated |
| SC 1.3.5 | AA | Identify Input Purpose: Input fields have autocomplete attributes |
| SC 2.4.6 | AA | Headings and Labels: Labels describe topic or purpose |
| SC 3.3.1 | A | Error Identification: Errors are identified in text |
| SC 3.3.2 | A | Labels or Instructions: Labels provided for user input |
| SC 3.3.3 | AA | Error Suggestion: Provide suggestions for fixing errors |
| SC 3.3.4 | AA | Error Prevention (Legal/Financial): Allow review before submission |
| SC 4.1.2 | A | Name, Role, Value: All UI components have accessible names |

## Form Labels

### Proper Labeling Techniques

**Using `<label>` element (preferred):**
```html
<!-- Explicit association — best approach -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email" autocomplete="email">

<!-- Wrapping — also valid -->
<label>
  Email Address
  <input type="email" name="email" autocomplete="email">
</label>
```

**Using aria-label (when visible label not feasible):**
```html
<input type="search" aria-label="Search the website">
```

**Using aria-labelledby (complex labeling):**
```html
<span id="qty-label">Quantity</span>
<span id="item-name">Blue Widget</span>
<input type="number" aria-labelledby="qty-label item-name">
```

### Common Failures
```html
<!-- FAIL: No programmatic association -->
<span>Email</span>
<input type="email">

<!-- FAIL: Placeholder is NOT a label -->
<input type="email" placeholder="Enter your email">

<!-- FAIL: Label exists but not associated -->
<label>Email</label>
<input type="email" id="email-field">
```

## Input Purpose (SC 1.3.5)

For input fields that collect personal information, use the `autocomplete` attribute:

```html
<input type="text" autocomplete="given-name" name="firstName">
<input type="text" autocomplete="family-name" name="lastName">
<input type="email" autocomplete="email" name="email">
<input type="tel" autocomplete="tel" name="phone">
<input type="text" autocomplete="street-address" name="address">
<input type="text" autocomplete="postal-code" name="zip">
```

This allows browsers and assistive technology to:
- Auto-fill fields accurately
- Display familiar icons for field types
- Help users with cognitive disabilities understand field purpose

## Error Handling

### Error Identification (SC 3.3.1)
```html
<!-- Good: Error described in text -->
<label for="email">Email Address</label>
<input type="email" id="email" aria-describedby="email-error" aria-invalid="true">
<span id="email-error" role="alert">Please enter a valid email address (e.g., name@example.com)</span>
```

### Error Suggestions (SC 3.3.3)
When an error is detected and suggestions can be provided:
- Identify which field has the error
- Describe the error in text (not just color)
- Provide specific suggestions for correction
- Use `aria-invalid="true"` on the field
- Use `aria-describedby` to link error message

### Error Prevention (SC 3.3.4)
For legal/financial/data-modification transactions:
1. **Reversible**: Submissions can be reversed (e.g., undo, cancel order)
2. **Checked**: Data is checked for errors and user can correct
3. **Confirmed**: User can review, confirm, and correct before final submission

## Required Fields

```html
<!-- Good: Multiple indicators -->
<label for="name">Full Name <span aria-hidden="true">*</span></label>
<input type="text" id="name" required aria-required="true">
<p class="form-note">Fields marked with * are required</p>
```

## Fieldsets and Legends

Group related fields using fieldset and legend:
```html
<fieldset>
  <legend>Shipping Address</legend>
  <label for="street">Street</label>
  <input type="text" id="street" autocomplete="street-address">
  <!-- more fields -->
</fieldset>

<fieldset>
  <legend>Preferred Contact Method</legend>
  <label><input type="radio" name="contact" value="email"> Email</label>
  <label><input type="radio" name="contact" value="phone"> Phone</label>
</fieldset>
```
