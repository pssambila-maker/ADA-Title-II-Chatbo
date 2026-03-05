---
title: WCAG 2.1 Level AA Overview
authority: primary
source: https://www.w3.org/TR/WCAG21/
last_updated: 2023-10-05
---

# WCAG 2.1 Level AA Overview

## What is WCAG 2.1?

The Web Content Accessibility Guidelines (WCAG) 2.1 is a W3C Recommendation that defines how to make web content more accessible to people with disabilities. It covers a wide range of disabilities including visual, auditory, physical, speech, cognitive, language, learning, and neurological disabilities.

## Four Principles (POUR)

WCAG 2.1 is organized around four principles:

### 1. Perceivable
Information and user interface components must be presentable to users in ways they can perceive:
- **1.1 Text Alternatives**: Provide text alternatives for non-text content (SC 1.1.1)
- **1.2 Time-Based Media**: Provide alternatives for time-based media (captions, audio descriptions)
- **1.3 Adaptable**: Content can be presented in different ways without losing structure (SC 1.3.1-1.3.6)
- **1.4 Distinguishable**: Make it easier for users to see and hear content (contrast, resize text, etc.)

### 2. Operable
User interface components and navigation must be operable:
- **2.1 Keyboard Accessible**: All functionality available from a keyboard (SC 2.1.1-2.1.4)
- **2.2 Enough Time**: Users have enough time to read and use content
- **2.3 Seizures and Physical Reactions**: No content that causes seizures (SC 2.3.1)
- **2.4 Navigable**: Provide ways to help users navigate and find content
- **2.5 Input Modalities**: Make it easier to operate functionality through various inputs (SC 2.5.1-2.5.4)

### 3. Understandable
Information and UI operation must be understandable:
- **3.1 Readable**: Make text content readable and understandable (SC 3.1.1-3.1.2)
- **3.2 Predictable**: Web pages appear and operate in predictable ways
- **3.3 Input Assistance**: Help users avoid and correct mistakes (SC 3.3.1-3.3.4)

### 4. Robust
Content must be robust enough to be interpreted by a wide variety of user agents:
- **4.1 Compatible**: Maximize compatibility with current and future tools (SC 4.1.1-4.1.3)

## Level A vs Level AA

- **Level A**: Minimum level of accessibility. 30 success criteria. Addresses the most basic accessibility barriers.
- **Level AA**: Addresses the most common barriers for disabled users. 20 additional success criteria. This is the level required by the ADA Title II rule.
- **Level AAA**: Highest level. Not required but can enhance accessibility further.

## Key Level AA Success Criteria

| Criterion | Title | Summary |
|-----------|-------|---------|
| SC 1.3.4 | Orientation | Content does not restrict view to a single display orientation |
| SC 1.3.5 | Identify Input Purpose | The purpose of input fields can be programmatically determined |
| SC 1.4.3 | Contrast (Minimum) | Text has a contrast ratio of at least 4.5:1 |
| SC 1.4.4 | Resize Text | Text can be resized up to 200% without loss of content |
| SC 1.4.5 | Images of Text | Text is used instead of images of text |
| SC 1.4.10 | Reflow | Content can reflow without two-dimensional scrolling at 320px |
| SC 1.4.11 | Non-text Contrast | UI components and graphics have 3:1 contrast ratio |
| SC 1.4.12 | Text Spacing | No loss of content when text spacing is modified |
| SC 1.4.13 | Content on Hover or Focus | Additional content on hover/focus is dismissible and persistent |
| SC 2.4.5 | Multiple Ways | Multiple ways to locate a web page within a set of pages |
| SC 2.4.6 | Headings and Labels | Headings and labels describe topic or purpose |
| SC 2.4.7 | Focus Visible | Keyboard focus indicator is visible |
| SC 3.1.2 | Language of Parts | The language of parts of content can be determined |
| SC 3.2.3 | Consistent Navigation | Navigation appears in the same relative order |
| SC 3.2.4 | Consistent Identification | Components with same function are identified consistently |
| SC 3.3.3 | Error Suggestion | When errors are detected, suggestions are provided |
| SC 3.3.4 | Error Prevention (Legal) | For legal/financial data, submissions are reversible, checked, or confirmed |
| SC 4.1.3 | Status Messages | Status messages can be programmatically determined |
