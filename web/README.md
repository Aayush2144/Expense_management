# 💎 ExpenseVault 3D — Next-Gen Spatial Expense Management System

A premium, 3D-feeling, production-quality financial tracking dashboard built with **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS + shadcn/ui**, **Framer Motion**, **React Three Fiber (R3F)**, **Recharts**, and **Zustand**.

This application is the modern, spatial web rebuild of the original Streamlit Expense Management app, maintaining **100% feature parity** while adding real-time 3D spatial charts, Aceternity-style cursor-tracking glowing effects, CSS 3D tilt cards, CSV import/export, and category budget guardrails.

Compatible with **v0, Lovable, Bolt, Cursor, and Vercel**.

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack & Design System

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS with standard shadcn/ui design tokens (`--background`, `--foreground`, `--card`, `--primary`, `--ring`, `--border`, `--radius`)
- **Icons**: Lucide React
- **3D Engine**: React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), and Three.js
- **Animation**: Framer Motion
- **Data Visualization**: Recharts (styled to shadcn tokens) + 3D Extruded Spatial Donut/Pillars with hover tooltips and interactive filtering
- **State & Storage**: Zustand with `localStorage` persistence
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner toasts with canvas-confetti celebration triggers

---

## 📦 shadcn/ui Components & Installation Commands

If generating in a fresh project or porting to Bolt / Lovable / v0, run:

```bash
# Core shadcn components
npx shadcn@latest add button card dialog input select table tabs badge progress sonner

# Custom Aceternity Glowing Effect component is located at:
# components/ui/glowing-effect.tsx
```

---

## ✨ Features (100% Streamlit Parity & Upgrades)

| Feature | Streamlit Equivalent | ExpenseVault 3D Implementation |
|---|---|---|
| **Add Expense** | `st.date_input`, `st.number_input`, `st.selectbox` | Single modal form with Zod validation + 5-Row Batch Entry grid |
| **Transaction Ledger** | `st.dataframe` | Searchable, sortable, paginated table with category badges, inline edit & delete |
| **Category Breakdown** | `st.altair_chart` | Interactive 3D Extruded Pillars + 2D Recharts fallback toggle |
| **Monthly Trajectory** | `analytics_months.py` | Year-selectable Area / Bar charts with percentage breakdown & statistics |
| **CSV Import & Export** | N/A (New upgrade) | Instant 1-click CSV download and bulk CSV parser |
| **Monthly Budgets** | N/A (New upgrade) | Visual progress meters with green/amber/red overspend guardrails |
| **Categories Management** | Hardcoded list | Dynamic Add, Rename, and Delete categories with live cascading updates |
| **3D & Glowing Effects** | N/A (New upgrade) | Interactive R3F hero scene, CSS 3D tilt cards, and cursor-tracking conic-glow |

---

## 🔌 Connecting to Your Real Backend

The app includes an abstracted adapter in `lib/api.ts`. By default, it operates with persistent `localStorage` data so it works seamlessly offline and across page refreshes.

To connect your live FastAPI backend (e.g., Render or local):

1. **Option A (Environment Variable)**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=https://expense-management-0ik6.onrender.com
   ```
2. **Option B (In-App Settings)**:
   Navigate to the **Settings** tab in the sidebar and enter your backend URL in the **Remote Backend Adapter** field. Click **Save & Test Connection**.

---

## 🚢 Deploying to Vercel (1-Click)

1. Push the `web` folder to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Set the **Root Directory** to `web`.
4. (Optional) Add the environment variable:
   `NEXT_PUBLIC_API_URL=https://expense-management-0ik6.onrender.com`
5. Click **Deploy**!
