# OJT Track

A full-stack **On-the-Job Training (OJT) tracking system** for trainees and supervisors. Trainees log attendance by scanning a QR code, submit reports, and track their required hours. Supervisors manage trainees, review reports, and fill out evaluations. The system includes a web dashboard, a mobile app, and a REST API.

<!-- Replace with your own screenshots, e.g. docs/screenshots/dashboard.png -->
<p align="center">
  <img src="docs/screenshots/web-dashboard.png" width="70%" alt="Web dashboard" />
  <img src="docs/screenshots/mobile-home.png" width="22%" alt="Mobile app" />
</p>

<!-- **Live demo:** https://your-demo-link -->

## Features

- **QR attendance**: trainees show a QR code, and supervisors scan it to log time in and time out
- **Hours tracking**: running totals toward each trainee's required OJT hours, with completion status
- **Reports**: trainees submit reports, supervisors review them, and weekly reports are generated automatically
- **AI assistant**: an in-app assistant powered by OpenAI
- **Evaluations**: supervisors fill out structured evaluations for their trainees
- **Supervisor–trainee requests**: trainees and supervisors send and accept requests to link up
- **Notifications**: Expo push notifications and email notifications (PHPMailer)
- **Exports**: PDF and Excel reports (TCPDF, PhpSpreadsheet)
- **Auth**: role-based login for trainees, supervisors and admins, with email verification, password reset, OTP and reCAPTCHA
- **Dashboard**: attendance charts and trainee overviews (Chart.js)

## Tech stack

| Part | Stack |
|---|---|
| **Web** (`/web`) | Vue 3, Vite, Pinia, Vue Router, Chart.js, Axios |
| **Mobile** (`/mobile`) | React Native, Expo, React Navigation, Zustand, Expo Camera and Notifications |
| **API** (`/api`) | PHP, MySQL/MariaDB (PDO), PHPMailer, TCPDF, PhpSpreadsheet, OpenAI API |

## Project structure

```
ojt-track/
├── api/        # PHP REST API (controllers, helpers, email templates)
├── mobile/     # React Native / Expo app for trainees and supervisors
├── web/        # Vue 3 web dashboard
└── database/   # schema.sql: table structure only, no data
```

## Getting started

### 1. Database
Create a MySQL/MariaDB database called `ojt` and import `database/schema.sql`.

### 2. API
```bash
cd api
composer install
cp api/config.example.php api/config.php   # then fill in your DB, SMTP, reCAPTCHA and OpenAI keys
```
Serve the `api/` folder with PHP/Apache (for example XAMPP).

### 3. Web
```bash
cd web
npm install
npm run dev
```

### 4. Mobile
```bash
cd mobile
npm install
npx expo start
```
To use push notifications, add your own Firebase `google-services.json` to `mobile/`.

## My role

<!-- Describe what you built, e.g. "Built the Vue web dashboard and designed the database schema." Credit teammates here if it was a team project. -->

## License

This project is for portfolio and educational purposes.
