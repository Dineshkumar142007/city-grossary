CityGrocer — Grocery Price Comparison & Store Finder

CityGrocer is a web app that compares grocery product prices across multiple stores in a city, helping shoppers find the cheapest place to buy each item and plan the most cost-effective shopping trip.
<img width="1897" height="1011" alt="Screenshot 2026-09-02 103417" src="https://github.com/user-attachments/assets/53a01244-29df-4113-950d-072086cdbd2d" />

Features
Price comparison — see how a product's price varies across every store in the catalog and instantly spot the cheapest option
Cheapest-store lookup — find the single lowest price for any product via a dedicated API endpoint
Basket optimizer — compares a single-store trip against splitting your basket across multiple stores, and shows the potential savings
City map view — visualizes store locations across city zones
Deals radar — surfaces price gaps and markdowns across stores
Item hunter — browse the full catalog store by store
Price reporting — lets users submit updated in-store prices
REST API explorer — an in-app workbench for testing the API with live cURL examples
PDF export — generates a project roadmap / summary PDF
<img width="1270" height="922" alt="Screenshot 2026-09-02 103451" src="https://github.com/user-attachments/assets/2bdebc69-688d-4064-91f4-1a9f52b6d9ca" />
this is the final preview of the project
Tech Stack
Frontend: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide icons
Backend: Express (served via server.ts, with Vite as middleware in dev)
PDF/ZIP generation: jsPDF, JSZip, Archiver
AI: Google Gemini API (@google/genai) for AI-assisted features
├── server.ts                    # Express server + REST API endpoints
├── index.html                   # HTML entry point
├── metadata.json                # App metadata
├── src/
│   ├── main.tsx                 # React DOM bootstrap
│   ├── App.tsx                  # Main layout, navigation & state
│   ├── data/                    # Product, store & city zone datasets
│   ├── types/                   # TypeScript interfaces (Product, Store, Basket)
│   ├── utils/priceCalculator.ts # Basket optimization & savings logic
│   └── components/              # UI components (comparison view, map, basket
│                                 # optimizer, deals radar, API explorer, etc.)
├── scripts/                     # PDF generation scripts
└── public/                      # Static assets (roadmap PDF, project zip)


**About

This is an academic prototype built to demonstrate a grocery price comparison concept, scoped to 6 stores for demo purposes.**
