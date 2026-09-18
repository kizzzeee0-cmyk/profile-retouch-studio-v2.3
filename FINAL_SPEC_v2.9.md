# Profile Retouch Studio v2.9 Final Spec

## 버전명
**v2.9 — Export Timing Sync Hotfix**

## 핵심 변경
### Real-time synchronized export
- MediaRecorder duration follows actual project duration
- animation time uses actual recording elapsed time
- rendering cost is subtracted from the next-frame wait budget

### Expected behavior
A 5.0 second project should export to approximately 5.0 seconds rather than approximately 10 seconds.
Animation speed should match the editor preview rather than playing at roughly half speed.

### Performance fallback
If the device cannot render 2000×2000 at a true 60 frames per second in real time:
- duration remains correct
- motion speed remains correct
- some frames may be skipped instead of stretching the video duration

## Existing features retained
- 10 / 12 / 15 / 24 / 30 / 60 FPS
- up to 2000×2000 square output
- high-bitrate MP4-first recording
- WebM fallback
- Undo system
