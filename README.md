# Yalamlam Travel & Tours

Website for Yalamlam Travel & Tours, a Halal-friendly safari and Zanzibar tour operator in Tanzania.
Live at https://www.yalamlamtravel.com

## What it does

- Browse tours and destinations, filter and sort, read approved customer reviews
- Multi-step booking request that is saved to the database and handed off to WhatsApp
- Customer accounts: password login, email-code login, password reset, personal dashboard
- Staff/admin dashboard: bookings, messages, tours, reviews, team management, analytics
- Available in four languages (translations live in `src/context/LanguageContext.jsx`)

## Tech stack

React 19, Vite, React Router 7, Tailwind CSS 3, Supabase (Postgres, Auth, Storage, Edge Functions),
Resend (transactional email), Vercel (hosting).

## Run it locally

Requires Node 22 or newer.

```
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

The Supabase connection is set up in `src/supabaseClient.js`; check that file for the environment
variables it expects and put them in a local `.env` file (never commit it).

## Backend (Supabase)

**Tables:** `tours`, `destinations`, `bookings`, `booking_notes`, `contacts`, `reviews`, `staff`.
Every table uses Row Level Security. Visitors can read tours and approved reviews, and can submit
bookings, messages and reviews, but only as pending or unapproved. Customers see only their own
bookings. Staff see all bookings and messages; only admins change tours, reviews and the team.

**Roles:** `staff` (bookings and messages) and `admin` (everything). Roles live in the `staff` table.

**Edge Functions** (deployed on Supabase):

| Function | Purpose |
|---|---|
| `auth-send-email` | Auth email hook: sends sign-in and signup emails through Resend |
| `request-password-reset` / `confirm-password-reset` | Emails a 6-digit reset code and sets the new password |
| `admin-create-staff` | Admin-only: creates a staff login with a temporary password |
| `send-booking-email` | Staff-only: booking confirmation and 48-hour reminder emails |

Emails are sent from `info@yalamlamtravel.com`. Secrets (such as `RESEND_API_KEY` and
`SEND_EMAIL_HOOK_SECRET`) are set in the Supabase dashboard under Edge Functions, not in this repo.

## Deploying

Pushing to the main branch deploys automatically on Vercel. `vercel.json` rewrites every route to
`index.html` so direct links like `/tours/3` work. Set the Node version to 22.x in the Vercel
project settings.

## Project layout

```
src/
  pages/        one file per page (Home, Tours, Booking, Admin, ...)
  components/   shared components (e.g. OtpInput)
  context/      language/translation provider
  supabaseClient.js
```
