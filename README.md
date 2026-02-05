# 🐛 Bug Bounty Tracker

A powerful desktop application for tracking your bug bounty hunting progress, managing vulnerability reports, and analyzing your hunting time.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![Electron](https://img.shields.io/badge/electron-28.0.0-47848F?logo=electron)

---

## ✨ Features

### 📊 Dashboard
- **Progress Tracker** - Animated bars showing yearly progress percentage
- **Days Counter** - Current day and days remaining to hit your goal
- **Earnings Progress** - Visual bar with current earnings vs. goal
- **Quick Stats** - Total bugs, critical bugs, today's hours, weekly hours

### 🐞 Bug Reports
- Grid view with color-coded severity badges
- Click any card to view full details
- Add new bugs with title, platform, amount, severity, and description
- Persistent storage - your data is saved automatically

| Severity | Color |
|----------|-------|
| Critical | 🔴 Red |
| High | 🟠 Orange |
| Medium | 🟡 Yellow |
| Low | 🟢 Green |

### ⏱️ Time Tracker
- **Start/Stop/Pause Timer** - Track your hunting sessions
- **Session Notes** - Add context to each session
- **Today's Sessions** - View all sessions for the day
- **Analytics** - Weekly and monthly charts with:
  - Total hours hunted
  - Daily average
  - Session count

---

## 🖼️ Screenshots

<img width="1400" height="819" alt="image" src="https://github.com/user-attachments/assets/c609b2ea-492a-4b87-b420-ffd5c16d9398" />
<img width="1347" height="514" alt="image" src="https://github.com/user-attachments/assets/67013ae9-6edc-474f-bd8b-46d3aaa00f0d" />
<img width="1392" height="904" alt="image" src="https://github.com/user-attachments/assets/898352bc-f87c-4b5d-a402-21303f3bb614" />


---
## 🏗️ Build

This project uses **GitHub Actions** to automatically build for Windows, macOS, and Linux.
1.  Push to `main`.
2.  Go to the **Actions** tab in GitHub.
3.  Download artifacts from the latest run.

### Local Build (Development)
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux (AppImage)
# Note: Building for Linux on Windows requires WSL or Docker due to symlinks
npm run build:linux
```
---


## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Desktop Framework**: [Electron](https://www.electronjs.org/)
- **Styling**: Custom dark theme with CSS variables
- **Data Storage**: localStorage (persistent across sessions)

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---



<p align="center">Made with ❤️ for bug hunters</p>


