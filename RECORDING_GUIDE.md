# CyberShield AI — Demo Recording Guide

## Quick Record (2 minutes)

### 1. Start the App
```bash
docker compose up -d
# Wait 30 seconds
curl http://localhost:8080/api/health
```

### 2. Open Browser
Go to **http://localhost**

### 3. Record Screen

**Windows (Xbox Game Bar):**
- Press `Win + Alt + R` to start recording
- Press `Win + Alt + R` to stop
- Video saved to `Videos/Captures/`

**Mac (QuickTime):**
- Open QuickTime Player
- File → New Screen Recording
- Click Record, select screen area
- Click Stop in menu bar

**Linux (OBS):**
- Open OBS Studio
- Add Screen Capture source
- Start Recording → Stop Recording

### 4. What to Record

**Full Demo (3 min):**
1. **Login page** (0:00-0:10) — Show split-screen layout
2. **Register** (0:10-0:30) — Create new account
3. **Dashboard** (0:30-0:50) — Show KPIs and chart
4. **URL Scanner** (0:50-1:20) — Paste phishing URL, scan, show result
5. **Email Scanner** (1:20-1:50) — Paste email, scan, show threats
6. **SMS Scanner** (1:50-2:15) — Switch to WhatsApp mode, scan message
7. **History** (2:15-2:40) — Show scan history table
8. **Settings** (2:40-3:00) — Toggle dark mode, show options

### 5. Save Video

Save as `videos/full-demo.mp4` in the project folder.

---

## Feature-Specific Clips

Record these separately for README embedding:

| Clip | Duration | File |
|------|----------|------|
| Dashboard | 15s | `videos/dashboard.mp4` |
| Email Scanner | 20s | `videos/email-scanner.mp4` |
| SMS Scanner | 20s | `videos/sms-scanner.mp4` |
| URL Scanner | 20s | `videos/url-scanner.mp4` |
| Screenshot OCR | 20s | `videos/screenshot-ocr.mp4` |

---

## Upload to YouTube (Optional)

1. Go to [youtube.com/upload](https://youtube.com/upload)
2. Select `videos/full-demo.mp4`
3. Title: "CyberShield AI - Phishing Detection Demo"
4. Set thumbnail to `videos/video-thumbnail.png`
5. Publish as Unlisted
6. Copy video URL to README

---

## Replace Placeholders in README

After recording, update `README.md`:

```markdown
### Full Demo
[![Watch Full Demo](videos/video-thumbnail.png)](videos/full-demo.mp4)
```

Or if uploaded to YouTube:
```markdown
[![Watch Full Demo](videos/video-thumbnail.png)](https://youtube.com/watch?v=YOUR_ID)
```
