# ResolveAI

AI-assisted customer support ticket management for small and medium sellers, with a reward workflow that cannot be gamed.

> **Demo build.** This is a frontend MVP. All "AI" behaviour (priority, team routing, fault check, resolution steps, reply drafts, Tanglish detection) is **simulated in the browser** with keyword rules and mock data. No server, no real AI API, no real customer data.

## Problem

Small sellers often struggle to manually classify, route and resolve customer support tickets. Handing out goodwill rewards makes it worse: if every complaint earns a coupon, customers learn to complain.

## Solution

ResolveAI combines ticket triage, fault detection, resolution guidance, multilingual / Tanglish support and a controlled reward workflow.

## Core Innovation: Fault Check → Reward Gate

A reward is **never** given just because a customer complains. It can be released only when **all** of these are true:

1. The fault check identifies the **seller** as responsible.
2. The ticket is actually **resolved**.
3. The **customer confirms** the resolution.
4. The customer is within the **abuse and reward limits** (per-ticket cap, per-customer monthly limit, repeat-complaint threshold, monthly budget).
5. The **business owner approves** the reward.

Rewards can never be issued automatically. Owner approval is mandatory and locked on in Settings.

## Features

- AI ticket prioritization (Critical / High / Medium / Low)
- Automatic team routing
- AI resolution suggestions
- AI reply drafting in English, Tamil and Tanglish
- Tanglish detection and interpretation
- Ticket lifecycle tracking (New → Assigned → In Progress → Resolved → Customer Confirmed → Closed)
- Seller / customer / needs-review fault detection with confidence
- Capped, abuse-safe rewards with owner approval
- Plain-English AI rules (saved in the browser)
- Analytics dashboard with charts (no chart library)
- **Light and dark mode** (remembers your choice, follows your system setting on first visit)
- Responsive layout for desktop, tablet and mobile, with a slide-in menu on small screens
- Toasts, confirmation modals, empty states, loading states, tooltips, search, filters and pagination

## Tech Stack

- HTML5
- CSS3 (custom properties for theming)
- Vanilla JavaScript (no frameworks, no build step, no dependencies)

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell, loads the stylesheet and script |
| `style.css` | All styling, light and dark themes, responsive rules |
| `script.js` | Mock data, simulated AI, router, pages, modals, charts |
| `README.md` | This file |

## Running Locally

No installation needed. Keep the three files in the same folder.

**Option 1:** double-click `index.html` to open it in your browser.

**Option 2:** serve the folder (recommended):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

or

```bash
npx serve .
```

Click **Log in** (any valid email and password) or **Use demo login**.

## Try the Full Flow

Customer ticket → AI analysis → fault detection → team assignment → suggested resolution → customer confirmation → reward eligibility → owner approval → reward issued → ticket closed.

1. Go to **Tickets** and open **TKT-1049** (a Tanglish ticket, status New).
2. Click **Analyze Ticket** and watch the simulated analysis run.
3. Review the priority, team, **Seller Fault** result with confidence, suggested steps and the Tanglish reply draft. Switch the reply language between English, Tamil and Tanglish.
4. Click **Assign to Returns & Refunds**, then **Start work**, **Mark resolved**, and **Simulate customer confirmation**.
5. In the **Reward Eligibility** card, click **Review Reward**. Check the safety checks, then **Approve Reward**.
6. Click **Close ticket**.

Other things to try:

- **TKT-1042** is already customer-confirmed, so you can review its reward straight away.
- **TKT-1044** has 4 repeat complaints. Move it to Customer Confirmed and watch the gate **block** the reward for abuse review.
- **New ticket** lets you type your own message. Try `Bro product wrong ah vandhurukku. Replace pannunga.`
- Change limits in **Settings → Reward settings** and see the gate react.
- Use the sun/moon button in the top bar to switch between light and dark mode.

## What is simulated

- The analysis engine matches keywords in the customer message (English and Tanglish) to a case type. It is a stand-in for a real model.
- Dashboard and analytics numbers are mock data that update as you act within a session.
- Tickets, rewards and counters live in memory and **reset on reload**. Settings, AI rules and theme are saved in `localStorage`.
- AI rules are stored but not yet applied by the simulated engine.

## Future Scope

- Real LLM integration
- Backend API
- Database
- Authentication
- WhatsApp integration
- Email integration
- Real-time notifications
- Seller platform integrations

## License

MIT. Free to use for learning, portfolios and hackathons.
