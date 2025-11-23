## AuraLedger — AI Personal Finance Companion

AuraLedger is an AI-native personal expense manager that automates transaction capture, offers proactive savings guidance, and keeps goals visible. This prototype showcases the core product narrative and interaction patterns for the mobile-first experience.

### Key Features
- Manual and receipt-based expense capture with simulated OCR/AI ingestion.
- Intelligent categorisation, weekly/monthly summaries, and goal-aware insights.
- Savings goal workspace with progress tracking and optimisation nudges.
- AI assistant feed synthesising cashflow health and personalised actions.
- Export-ready Excel and PDF reporting (client-side generation).
- Market-facing documentation located in `docs/aura-ledger-brief.md`.

### Getting Started
```bash
npm install
npm run dev
# open http://localhost:3000
```

### Quality Gates
```bash
npm run lint
npm run build
```

### Tech Stack Highlights
- Next.js 16 (App Router) + React + TypeScript
- Tailwind design tokens with glassmorphism UI styling
- Lucide icons, date-fns utilities, jsPDF/XLSX export helpers

### Project Structure
```
src/
  app/         # Next.js routes and layout
  components/  # Reusable UI building blocks
  lib/         # Business logic, analytics, and export utilities
  types/       # TypeScript domain models
docs/
  aura-ledger-brief.md # Product/technical specification
```

### Deployment
Optimised for Vercel. To ship the production build:
```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-3936ac65
```

### Roadmap Snapshot
The four-phase delivery plan (Explore → Build → Polish → Scale) lives both on the landing screen and in the product brief. Use it to align stakeholders on milestone sequencing.
