# Deploying OJT Track (free hosting)

This guide puts the real app online using free plans. None of them need a credit card.

| Part | Service | Free plan |
|---|---|---|
| Database | [TiDB Cloud](https://tidbcloud.com) | MySQL-compatible, about 5 GB |
| PHP API | [Render](https://render.com) | 750 hours/month, sleeps after 15 min idle |
| Web dashboard | [Vercel](https://vercel.com) | Hobby plan (non-commercial) |
| Uploaded photos and PDFs | [Cloudinary](https://cloudinary.com) | 25 credits/month |
| Email | [Brevo](https://www.brevo.com) | 300 emails/day |
| Keep-awake + scheduled jobs | [cron-job.org](https://cron-job.org) | Unlimited jobs |
| Android app | [Expo EAS](https://expo.dev) | Free builds (queued) |

> **Why Brevo and not Gmail?** Render's free plan blocks outgoing SMTP, the protocol Gmail uses. Brevo sends over HTTPS instead.

Collect the values marked **📋** as you go. You'll paste them into Render in step 5.

---

## 1. Database: TiDB Cloud

1. Sign up at tidbcloud.com (you can use GitHub).
2. Create a **Starter** (free) cluster. Choose a region close to the Philippines, such as Singapore.
3. Open the cluster, go to **SQL Editor**, and run `CREATE DATABASE ojt;`.
4. Import the tables: open `database/schema.sql` from this repo, copy everything, paste it into the SQL Editor with the `ojt` database selected, and run it.
5. Click **Connect** and choose **General**. Generate a password, then note:
   - 📋 `DB_HOST`, the host (something like `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
   - 📋 `DB_USER`, the user (something like `xxxxxxxx.root`)
   - 📋 `DB_PASS`, the password

## 2. File storage: Cloudinary

1. Sign up at cloudinary.com.
2. Go to **Settings → API Keys** and copy the **API environment variable**. It looks like `cloudinary://123456:abcDEF@your-cloud`.
   - 📋 `CLOUDINARY_URL` = that value

## 3. Email: Brevo

1. Sign up at brevo.com.
2. Go to **Senders, domains & dedicated IPs → Senders** and add the email address that emails should come from, then verify it.
   - 📋 `MAIL_FROM_EMAIL` = that address
3. Go to **SMTP & API → API keys** and create a key.
   - 📋 `BREVO_API_KEY` = the key

## 4. reCAPTCHA (staff login on the web)

1. Go to google.com/recaptcha/admin and create a **reCAPTCHA v2 → "I'm not a robot" checkbox** site.
2. Add your Vercel domain, for example `ojt-track.vercel.app`. You can add it after step 6.
3. Note the keys:
   - 📋 `RECAPTCHA_SECRET_KEY` = the secret key
   - 📋 **site key**: goes into Vercel as `VITE_RECAPTCHA_SITE_KEY` in step 6

## 5. API: Render

1. Sign up at render.com with GitHub.
2. Click **New → Blueprint** and pick the `ojt-track` repository. Render reads `render.yaml`.
3. Fill in the values from steps 1 to 4. For the addresses:
   - `BASE_URL`: `https://ojt-track-api.onrender.com` (use the name Render shows, with no trailing slash)
   - `APP_URL` and `ALLOWED_ORIGINS`: your Vercel address from step 6, for example `https://ojt-track.vercel.app`. Put a placeholder for now and update it after step 6.
   - `AI_API_KEY`: leave empty to turn AI features off. For a free key, sign in at [aistudio.google.com](https://aistudio.google.com) → **Get API key** → **Create API key**. `AI_BASE_URL` and `AI_MODEL` already point to Gemini. To use OpenAI instead, set `AI_BASE_URL` to `https://api.openai.com/v1`, `AI_MODEL` to `gpt-4o-mini`, and a monthly spending limit in your OpenAI account.
4. Deploy. When it's done, open `https://<your-api>.onrender.com/api/health`. It should show `{"ok":true,...}`.
5. In the service's **Environment** tab, copy the generated **CRON_SECRET**. 📋 You'll need it in step 7.

## 6. Web dashboard: Vercel

1. Sign up at vercel.com with GitHub. Click **Add New → Project** and import `ojt-track`.
2. Set **Root Directory** to `web`. The framework is detected as Vite.
3. Add the environment variables:
   - `VITE_API_URL` = `https://<your-api>.onrender.com/api`
   - `VITE_RECAPTCHA_SITE_KEY` = the reCAPTCHA site key from step 4
   - `VITE_APK_URL` is optional. The **Download App** button already points to the APK in your latest GitHub release (step 9).
4. Deploy, then go back to Render and set `APP_URL` and `ALLOWED_ORIGINS` to the Vercel address.

## 7. Keep-awake and scheduled jobs: cron-job.org

Render's free plan sleeps after 15 minutes without traffic. One ping every 10 minutes keeps the API awake. The other jobs send the app's reminders and reports.

For every job except the first, open **Advanced → Headers** and add the header `X-Cron-Secret` with your 📋 CRON_SECRET value. Set the time zone to **Asia/Manila**.

| Job | URL (`https://<your-api>.onrender.com/api/...`) | Schedule |
|---|---|---|
| Keep awake (no header needed) | `health` | Every 10 minutes |
| Morning quote | `cron/runDailyQuote` | Daily 07:00 |
| Time-in reminder | `cron/runCheckInDailyReminder` | Mon–Fri 07:30 |
| Time-out reminder | `cron/runCheckOutDailyReminder` | Mon–Fri 18:00 |
| Daily report reminder | `cron/runDailyReportReminder` | Mon–Fri 20:00 |
| Weekly report reminder | `cron/runWeeklyReportReminder` | Fri 20:00 |
| Monthly hours report (runs only on the last day of the month) | `cron/runAutoGenerateMonthlyHoursReport` | Daily 22:00 |
| Auto time-out for anyone still clocked in | `cron/runAutoTimeOut` | Daily 23:00 |
| Weekly reports + hours email | `cron/runWeeklyReportsAndHours` | Fri 23:40 |
| Mark absences | `cron/runDailyAttendanceChecker` | Mon–Fri 23:50 |

These times are suggestions based on what each job checks. Some jobs only act at certain hours; for example, the weekly report runs only on Fridays between 23:30 and 23:50.

## 8. First admin account

1. Register an account normally, through the mobile app or the web **Register** page.
2. In TiDB's **SQL Editor**, run the following. Use the email you registered with.
   ```sql
   USE ojt;
   UPDATE users SET role = 4, status = 1 WHERE email = 'you@example.com';
   ```
3. Sign in on the web dashboard. As admin, you can add coordinator (teacher) accounts from **Teachers**.

## 9. Android app: Expo EAS

1. In `mobile/eas.json`, replace the two placeholder addresses in `preview` and `production` with your Render and Vercel addresses.
2. Run these commands:
   ```bash
   cd mobile
   npm install
   npx eas-cli login
   npx eas-cli init          # creates your Expo project and prints its ID
   ```
   If `eas init` asks you to add the project ID yourself, add it to `app.json` under `expo.extra.eas.projectId`.
3. Build an APK:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```
4. When the build finishes, download the APK and rename it to **`ojt-track.apk`**.
5. On GitHub, open the `ojt-track` repo, then go to **Releases → Draft a new release**. Create a tag (for example `v1.0.0`), attach `ojt-track.apk`, and publish.
   The **Download App** button on the website, as shown in Figure 4.8 of the study, links to
   `https://github.com/migs-tech/ojt-track/releases/latest/download/ojt-track.apk`, so it starts working as soon as the release is published. For every new app version, publish a new release with the same file name.

**Push notifications** need your own Firebase project. Download its `google-services.json` into `mobile/`; it isn't committed to git. Without it, the app works but push notifications are off.

---

## Before real students use it

- [ ] Sign in with each role and try the main flows: QR time-in and time-out, reports, requests, evaluations.
- [ ] Password reset emails arrive (check spam).
- [ ] The school knows where the data is stored (TiDB, Cloudinary, Render). Add a short privacy notice at sign-up to comply with the Philippines' Data Privacy Act.
- [ ] Back up the database regularly. In TiDB Cloud, check the cluster's backup settings, or export tables from the SQL Editor.
- [ ] Check usage on each dashboard (Render hours, Cloudinary credits, Brevo emails) during the first weeks.
