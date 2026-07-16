Elparadisogonzalo

«A modern full-stack web platform and Android application built with React, Capacitor, Android, Java, and modern web technologies.»

"License" (https://img.shields.io/github/license/azehagowa-creator/elparadisogonzalo.com)
"Issues" (https://img.shields.io/github/issues/azehagowa-creator/elparadisogonzalo.com)
"Stars" (https://img.shields.io/github/stars/azehagowa-creator/elparadisogonzalo.com)
"Last Commit" (https://img.shields.io/github/last-commit/azehagowa-creator/elparadisogonzalo.com)

---

Overview

Elparadisogonzalo is an open-source project focused on delivering a modern web experience with Android support through Capacitor. The project combines modern frontend technologies with native Android capabilities to provide a fast, secure, and scalable application.

Features

- ⚡ Modern React application
- 📱 Android application powered by Capacitor
- 🌐 Progressive Web App support
- 🔒 Secure HTTPS-ready deployment
- 🚀 Optimized production builds
- 🛠 GitHub Actions CI/CD
- 🎨 Responsive UI
- 📦 Modular project architecture
- 🌙 Dark mode ready
- 🔑 Open source

---

Project Structure

.
├── frontend/
│   ├── android/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│
├── scripts/
│
├── docs/
│
├── LICENSE
└── README.md

---

Requirements

- Node.js 20+
- npm
- Java 21
- Android Studio
- Android SDK
- Gradle

---

Installation

Clone the repository

git clone https://github.com/azehagowa-creator/elparadisogonzalo.com.git

Enter the project

cd elparadisogonzalo.com

Install dependencies

npm install

---

Development

Start the development server

npm run dev

---

Production Build

npm run build

---

Android

Sync Capacitor

npx cap sync android

Open Android Studio

npx cap open android

Generate a Debug APK

cd frontend/android
./gradlew assembleDebug

Generate a Release APK

./gradlew assembleRelease

---

Web Deployment

After building

npm run build

Deploy the generated files to your preferred hosting provider.

---

GitHub Actions

Example workflow

- Install dependencies
- Build project
- Run tests
- Build Android APK
- Upload build artifacts

---

Security

Please report security vulnerabilities responsibly.

Never commit:

- API keys
- Private certificates
- Passwords
- Secrets
- Signing keys

---

Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

Roadmap

- [ ] Improve UI/UX
- [ ] Offline support
- [ ] Push notifications
- [ ] Better Android integration
- [ ] iOS support
- [ ] Performance improvements
- [ ] Automated testing
- [ ] Documentation expansion

---

Screenshots

Create a folder named:

docs/images/

Example:

![Home](docs/images/home.png)

---

License

This project is licensed under the MIT License unless otherwise specified.

---

Author

Elparadisogonzalo

Building modern applications with open technologies.

---

Support

If you encounter issues:

- Open a GitHub Issue
- Submit a Pull Request
- Improve the documentation

---

Made with ❤️ using React, Capacitor, Android, Java, Gradle, and the open-source ecosystem.
