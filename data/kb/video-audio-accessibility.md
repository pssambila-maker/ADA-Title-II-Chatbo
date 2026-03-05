---
title: Video and Audio Accessibility
authority: primary
source: https://www.w3.org/WAI/WCAG21/Understanding/captions-prerecorded.html
last_updated: 2023-10-05
---

# Video and Audio Accessibility (WCAG 2.1)

## Relevant Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| SC 1.2.1 | A | Audio-only/Video-only: Provide alternative (transcript or audio description) |
| SC 1.2.2 | A | Captions (Prerecorded): Provide captions for prerecorded audio in video |
| SC 1.2.3 | A | Audio Description or Media Alternative (Prerecorded) |
| SC 1.2.4 | AA | Captions (Live): Provide captions for live audio in video |
| SC 1.2.5 | AA | Audio Description (Prerecorded): Provide audio description for prerecorded video |

## Captions

### What Are Captions?
Synchronized text that accompanies audio content in video. Captions include:
- Spoken dialogue (identifying speakers when not obvious)
- Sound effects relevant to understanding ("door slams", "phone rings")
- Musical cues ("[upbeat music playing]")
- Off-screen sounds that provide context

### Caption Quality Requirements
- **Accurate**: Verbatim or near-verbatim transcription
- **Synchronous**: Appear at the same time as the audio
- **Complete**: Include all spoken content and relevant sounds
- **Properly placed**: Do not obscure important visual content
- **Speaker identification**: Label speakers when multiple people are talking

### Caption Formats
- **Closed captions**: Can be toggled on/off by the user (preferred)
- **Open captions**: Burned into the video (always visible)
- File formats: WebVTT (.vtt), SRT (.srt), TTML (.ttml)

### Example WebVTT File
```
WEBVTT

00:00:01.000 --> 00:00:04.000
Welcome to our accessibility training session.

00:00:04.500 --> 00:00:08.000
Today we'll cover the requirements for
WCAG 2.1 Level AA compliance.

00:00:08.500 --> 00:00:12.000
[slide transition sound]
Let's start with an overview of the four principles.
```

## Audio Descriptions

### What Are Audio Descriptions?
A narration track that describes important visual content that is not conveyed through the existing audio. This helps blind or visually impaired users understand:
- On-screen text or graphics
- Actions or gestures
- Scene changes
- Visual information essential to understanding

### When Audio Descriptions Are Required
- **Level A (SC 1.2.3)**: Either audio description OR a full text alternative
- **Level AA (SC 1.2.5)**: Audio description is required for prerecorded video

### Best Practices
- Describe during natural pauses in dialogue
- Be concise but informative
- Describe what is seen, not what to think
- Identify speakers and key visual elements

## Transcripts

### When Transcripts Are Needed
- **Audio-only content** (podcasts, audio recordings): transcript required (SC 1.2.1)
- **Video with audio**: Transcript is NOT a substitute for captions, but provides additional accessibility
- Best practice: Provide transcripts for all multimedia content

### Transcript Format
Transcripts should include:
- All spoken content
- Identification of speakers
- Description of relevant sounds
- Description of relevant visual information (for video transcripts)

## Common Failures
- Auto-generated captions without human review (accuracy issues)
- Captions that don't include relevant sound effects
- Missing speaker identification in multi-speaker content
- No audio description for information-dense visual content
- Video player that doesn't support caption toggling (keyboard accessible)
