# ⛳ Golf Charity Platform (Pro Edition)

A full-stack MERN application built for the **Digital Heroes** technical assessment. This platform integrates golf performance tracking with a charitable subscription model and a monthly rewards engine.

## 🚀 Key Features (PRD Compliance)

- **Robust Subscription System (Section 04):** Integrated with Stripe Checkout (Test Mode) supporting Monthly and Yearly recurring tiers.
- **Rolling 5 Logic (Section 05):** Backend algorithm that automatically maintains only the latest 5 Stableford scores per user.
- **Winner Verification System (Section 09):** Custom "Proof Upload" workflow using Supabase Storage for admin-led payout approval.
- **Admin Control Terminal (Section 13):** Protected dashboard for executing the Monthly Draw Engine and managing the Charity Directory.
- **Real-time Analytics (Section 10):** Dynamic performance charting using Recharts to visualize Stableford trends.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Framer Motion (Animations), Lucide React (Icons).
- **Backend:** Node.js, Express.js.
- **Database & Auth:** Supabase (PostgreSQL), JWT Authentication.
- **Payments:** Stripe API (Test Environment).
- **Charts:** Recharts.

---

## 📋 Database Schema

The system relies on a relational PostgreSQL structure to ensure data integrity:

| Table | Purpose |
| :--- | :--- |
| `profiles` | Stores user roles, metadata, and subscription status. |
| `golf_scores` | Manages the "Rolling 5" Stableford entries. |
| `draw_results` | Records monthly winning numbers and prize pool history. |
| `winners` | Tracks eligibility, proof-of-score uploads, and payout states. |
| `charities` | Directory of verified charitable organizations. |

---

## ⚙️ Local Setup Instructions

### 1. Prerequisites
- Node.js installed.
- A Supabase project with a `proof-screenshots` storage bucket (Public).
- A Stripe account in **Test Mode**.

### 2. Environment Variables (`.env`)
Create a `.env` file in the `/server` directory:
```env
STRIPE_SECRET_KEY=your_sk_test_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=5000