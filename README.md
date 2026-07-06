# 🐾 Walk Report — Dog Walking Schedule & Report App

A mobile-first PWA that helps an independent dog walker plan the week, run the
day, complete walks, and send **beautiful owner-facing walk reports** — designed
to be faster and more pleasant than jotting notes in Notepad.

> Plan week → See today's walks → Complete walk → Write quick report → Generate a
> beautiful report card → Share with the owner.

## Highlights

- **Today screen** — the daily work view: next-up banner, date selector, search,
  status filters, and one-tap **Start / Complete** on each walk card.
- **Weekly schedule** — days grouped Monday→Sunday with a one-tap **Copy previous
  week**, plus repeat-weekly and custom-day repeats.
- **Clients & Dogs** — full profiles with care notes, access instructions,
  emergency contacts, upcoming walks, and past reports.
- **Fast completion flow** — a quick report form built for speed: mood/energy
  chips, big Yes/No buttons for pee·poop·water·food, tappable **note templates**,
  and photo attach — a report in well under a minute.
- **Premium report card** — a warm, polished owner-facing card rendered to a
  shareable **PNG (~1140×1360)** and sent via the phone's **native share sheet**
  (with Save / Email / Copy-text fallbacks).
- **Report history** — searchable, filterable by dog, and by sent / not-sent.
- **Private vs public notes** — private notes live only inside the app and are
  **never** included in any generated image, email, or copied text.
- **Installable PWA** — add to home screen, works offline (app shell + local
  data), warm cream theme, safe-area aware.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + React 18 + TypeScript |
| Styling | Tailwind CSS with the spec's warm pet-care palette |
| Fonts | Manrope (display) + Inter (body) via `next/font` |
| Report image | `html-to-image` → PNG, shared via the Web Share API |
| Persistence | Local-first data layer (see below) |
| PWA | `manifest.webmanifest` + offline service worker |

### Data layer & Supabase note

The spec recommends Supabase (Postgres / Auth / Storage). Because a hosted
backend can't be provisioned in this environment, persistence is implemented as a
**local-first store** (`src/lib/store.tsx`) that keeps everything in
`localStorage`, so the app is **fully functional out of the box** with no setup.

The domain types (`src/lib/types.ts`) mirror the spec's database structure
(`users`/`settings`, `clients`, `dogs`, `walks`, `walk_reports`, `report_photos`
folded into reports, `note_templates`) and all reads/writes go through a single
repository-style context. Swapping the store's internals for Supabase queries
later is a contained change — the UI never touches storage directly.

Single-walker MVP: there are no owner accounts and no auth wall (there is nothing
multi-tenant to protect locally); a business profile is set in **Settings**.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

On first load the app seeds a small demo dataset (a business, two clients, three
dogs, today's walks, and a sample report) so every screen is explorable
immediately. Use **Settings → Clear all data** to start fresh, or **Load demo
data** to restore it.

```bash
npm run build && npm run start   # production build
```

## Project structure

```
src/
  app/                 # App Router screens
    today/             # daily work view
    schedule/          # weekly planner + copy-previous-week
    clients/           # list · [id] · new · edit
    dogs/              # list · [id] · new · edit
    walks/             # new · [id]/edit · [id]/complete (quick report)
    reports/           # history · [id] preview + share
    settings/          # business, report defaults, templates, data
  components/          # BottomNav, WalkCard, ReportCard, forms, PhotoInput, ui
  lib/                 # types, store, date, repeat, report text, image export
public/                # manifest, service worker, icons
```

## Acceptance criteria — status

All twelve criteria from the spec are met: add client → add dog → schedule walk →
see it on Today → complete it → fill a report in under a minute → generate a
beautiful image → share it → history saved → private notes never leak → weekly
schedule can be copied/repeated → works on iPhone screen sizes.

## Roadmap (deliberately deferred, per spec)

GPS tracking · owner portal · payments/invoices · automated SMS/WhatsApp · PDF
export · multi-walker teams · Supabase sync + Resend email.
