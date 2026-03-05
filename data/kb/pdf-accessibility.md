---
title: PDF Document Accessibility
authority: secondary
source: https://www.w3.org/WAI/WCAG21/Techniques/#pdf
last_updated: 2024-01-15
---

# PDF Document Accessibility

## Title II Relevance

Under the ADA Title II digital accessibility rule, PDF documents posted on government websites after the compliance date must meet WCAG 2.1 Level AA. Preexisting PDFs may be excepted if they were posted before the compliance date and are not used for current programs or services.

However, even excepted PDFs must be made available in an accessible format upon request under Title II's effective communication requirements.

## Key Requirements for Accessible PDFs

### 1. Document Structure (Tags)
PDFs must be "tagged" with a logical reading order and structure:
- Headings (H1-H6) properly nested
- Paragraphs tagged as `<P>`
- Lists tagged as `<L>`, `<LI>`, `<Lbl>`, `<LBody>`
- Tables tagged with `<Table>`, `<TR>`, `<TH>`, `<TD>`
- Figures tagged with `<Figure>` and alt text
- Reading order matches visual layout

### 2. Text Accessibility
- Real text (not images of text) — must be searchable and selectable
- Language of document specified
- Language changes within document marked

### 3. Alternative Text
- All images have appropriate alt text
- Decorative images marked as artifacts (background/decoration)
- Complex images have extended descriptions

### 4. Forms
- All form fields have labels
- Required fields are identified
- Error messages are descriptive
- Tab order is logical

### 5. Navigation
- Bookmarks for documents longer than 9 pages
- Table of contents with links
- Page numbering consistent

### 6. Color and Contrast
- Text contrast meets 4.5:1 (normal) or 3:1 (large)
- Information not conveyed by color alone

## Testing Tools

| Tool | Type | Cost |
|------|------|------|
| Adobe Acrobat Pro Accessibility Checker | Built-in | Paid (included with Acrobat Pro) |
| PAC 2024 (PDF Accessibility Checker) | Desktop app | Free |
| CommonLook PDF Validator | Desktop app | Free basic version |
| axe for PDF | Browser/desktop | Free basic version |

## Remediation Approaches

### Option 1: Fix the Source Document
Best approach — fix accessibility in the source (Word, InDesign, etc.) and re-export to PDF:
- Use heading styles (not bold/large text)
- Add alt text to images in the source
- Use proper list formatting
- Ensure tables have header rows marked

### Option 2: Remediate the PDF Directly
Use Adobe Acrobat Pro to:
- Add tags using the Accessibility tools
- Set reading order
- Add alt text to images
- Fix table structure
- Add form field labels

### Option 3: Provide an Alternative
If remediation is not feasible:
- Provide an accessible HTML version
- Provide an accessible Word document
- Offer to provide the information in an alternative format upon request
