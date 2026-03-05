---
title: WCAG SC 1.1.1 — Non-text Content (Text Alternatives)
authority: primary
source: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
last_updated: 2023-10-05
---

# Success Criterion 1.1.1 — Non-text Content (Level A)

## Requirement

All non-text content that is presented to the user has a text alternative that serves the equivalent purpose, with the following exceptions:

### Controls and Input
If the non-text content is a control or accepts user input, then it has a name that describes its purpose. (See SC 4.1.2 for additional requirements.)

### Time-Based Media
If non-text content is time-based media (audio, video), text alternatives at least provide a descriptive identification.

### Test Content
If non-text content is a test or exercise that would be invalidated by text, text alternatives describe the nature and purpose.

### Sensory Experience
If non-text content is primarily intended to create a specific sensory experience, text alternatives describe the purpose.

### CAPTCHA
Text alternatives identify and describe the purpose. Alternative forms of CAPTCHA with output modes for different types of sensory perception are provided.

### Decoration, Formatting, Invisible
If non-text content is pure decoration, used only for visual formatting, or is not presented to users, it should be ignored by assistive technology.

## Implementation for Images

### Informative Images
Images that convey information should have alt text describing the information:
```html
<!-- Good: Descriptive alt text -->
<img src="bar-chart.png" alt="Bar chart showing 85% compliance rate in 2024, up from 60% in 2023">

<!-- Bad: Non-descriptive -->
<img src="bar-chart.png" alt="chart">
<img src="bar-chart.png" alt="image">
```

### Decorative Images
Images that serve no informational purpose should have empty alt text:
```html
<!-- Correct: Empty alt for decorative images -->
<img src="decorative-border.png" alt="">

<!-- Also correct: Use CSS instead of HTML for decoration -->
<div style="background-image: url('decorative-border.png')"></div>
```

### Functional Images (Links/Buttons)
Images used as links or buttons should describe the function, not the image:
```html
<!-- Good: Describes the function -->
<a href="/home"><img src="logo.png" alt="Go to homepage"></a>

<!-- Bad: Describes the image instead of function -->
<a href="/home"><img src="logo.png" alt="Company logo"></a>
```

### Complex Images
For complex images like charts, graphs, or diagrams, provide both brief alt text and a longer description:
```html
<figure>
  <img src="org-chart.png" alt="Organization chart showing reporting structure" aria-describedby="org-desc">
  <figcaption id="org-desc">
    The CEO reports to the Board. Three VPs (Engineering, Marketing, Operations) report to the CEO...
  </figcaption>
</figure>
```

## Common Failures
- Missing alt attribute entirely (`<img src="photo.jpg">`)
- Using filename as alt text (`alt="IMG_20240315.jpg"`)
- Using "image of" or "picture of" in alt text (redundant — screen readers already announce it as an image)
- Identical alt text for different images
- Alt text that is too long (generally keep under 125 characters; use longdesc or aria-describedby for complex images)
