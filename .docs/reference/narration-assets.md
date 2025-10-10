# Narration Asset Checklist

Last updated: 2025-04-05

This note explains how to drop narration audio and caption files so the lesson player can pick them up without code changes.

## File Structure

All narration assets live under `apps/frontend/public/curriculum/assets/audio/` with the pattern:

```
public/
  curriculum/
    assets/
      audio/
        <lessonId>/
          <segmentId>.mp3
          <segmentId>.vtt
```

- `lessonId` comes from `lesson.lesson.id` in the authored document (e.g. `skill.multiply-4-digit-by-1-digit`).
- `segmentId` is the `id` field on the segment inside the lesson document (`presentation-intro`, `guided-step-1`, etc.).
- The `.mp3` file is required for narration audio; the optional `.vtt` file provides captions.

## Author Workflow

1. Export the narration audio for the segment as an MP3 and drop it at the path above.
2. (Optional) Export matching captions/subtitles as a WebVTT file with the same segment id.
3. No code changes or imports are required—the player automatically checks for the files before rendering the segment.

## Runtime Behaviour

- If both assets exist, the player loads them and the transcript button stays available.
- If audio is missing or fails to load, the player shows an inline “Narration audio is unavailable” banner and continues with on-screen instructions.
- Captions are optional; missing captions simply hide the CC track.

## QA Tips

- Navigate to `/units/<slug>/lessons/<slug>` and watch the segment intro to confirm audio playback.
- Open DevTools → Network tab to verify the browser requests the MP3/VTT files from the expected path.
- Use browser “Disable cache” if you replace an asset and need to validate the new version immediately.
