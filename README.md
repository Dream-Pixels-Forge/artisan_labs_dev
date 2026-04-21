# Artisan Labs

<img width="1908" height="986" alt="Screenshot 2026-04-21 123848" src="https://github.com/user-attachments/assets/fb13e7c6-bf83-44e4-96bc-0aa9fdf0a53d" />

<p align="center">
  <img src="https://img.shields.io/badge/version-0.2.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-Apache%202.0-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Next.js-16-black.svg" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB.svg" alt="React">
</p>

> **Artisan Labs** is a powerful **Scrollytelling Sequence Optimizer** that transforms videos into immersive scroll-driven experiences. Upload any video, extract frames, and map them to scroll positions using intelligent algorithms.

---

## Overview

Artisan Labs bridges the gap between video content and modern web storytelling. It provides a visual interface for:

- **Video Frame Extraction** - Extract frames from any video with precise control
- **Scroll Trigger Mapping** - Intelligently map frames to scroll positions using 8 advanced algorithms
- **Export** - Generate developer-ready JSON or CSS configurations for your scrollytelling experience

  <img width="1906" height="989" alt="Screenshot 2026-04-21 123907" src="https://github.com/user-attachments/assets/e2402d1f-5b46-4f77-b864-8b2a2586464a" />


### Use Cases

| Use Case | Description |
|----------|-------------|
| **Marketing Campaigns** | Create scroll-driven product reveals and brand stories |
| **Editorial Content** | Build immersive scrollytelling articles and features |
| **Portfolios** | Showcase creative work with cinematic scroll experiences |
| **Education** | Develop interactive learning modules with scroll-synced content |
| **E-commerce** | Design scroll-driven product demonstrations |

---

## Features

### 8 Scroll Trigger Calculation Modes

| Mode | Description | Best For |
|------|-------------|----------|
| **Linear** | Even distribution across scroll | Uniform playback |
| **Ease In** | Slow start, fast end | Building anticipation |
| **Ease Out** | Fast start, slow end | Hero intros |
| **Ease In-Out** | S-curve acceleration | General purpose |
| **Velocity** | Concentrates at high-motion regions | Action videos |
| **Scene** | Scene-breakpoint distribution | Storyboarded content |
| **Golden Ratio** | Fibonacci-inspired spacing | Artistic storytelling |
| **Step & Hold** | Discrete frame holds | Presentations |

<img width="1889" height="989" alt="Screenshot 2026-04-21 123934" src="https://github.com/user-attachments/assets/356b9f97-7413-43cb-a00a-7122747a7d35" />


### Export Options

- **JSON** - Developer-ready configuration with frame mapping
- **CSS** - Scroll-timeline animation with fallbacks

<img width="1916" height="988" alt="Screenshot 2026-04-21 123949" src="https://github.com/user-attachments/assets/940f2017-bf9d-4c44-a7e4-dc28abd7f92c" />


---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Component Primitives** | Radix UI |
| **State Management** | Zustand (with localStorage persistence) |
| **Database** | Prisma |
| **Animation** | Framer Motion, Lenis (smooth scroll) |
| **Package Manager** | Bun |

---

## Getting Started

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/Dream-Pixels-Forge/artisan_labs_dev.git
cd artisan_labs_dev

# Install dependencies
bun install

# Set up the database
bun run db:push

# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Build the production application |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |

---

## Project Structure

```
artisan_labs_dev/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main SPA entry
│   │
│   ├── components/
│   │   ├── layout/            # TopBar, Sidebar, BootSplash
│   │   ├── screens/           # Main application screens
│   │   │   ├── Dashboard.tsx  # Landing with feature demos
│   │   │   ├── Sequencer.tsx  # Video upload & frame extraction
│   │   │   ├── ScrollTriggerScreen.tsx  # Trigger configuration
│   │   │   └── Archive.tsx     # Saved sequences management
│   │   ├── scroll-trigger/    # Scroll trigger components
│   │   └── ui/                # shadcn/ui components
│   │
│   ├── lib/
│   │   ├── scroll-trigger.ts  # Trigger calculation engine
│   │   ├── frame-extractor.ts # Video frame extraction
│   │   ├── db.ts              # Database client
│   │   └── utils.ts           # General utilities
│   │
│   ├── store/
│   │   └── app-store.ts       # Zustand state management
│   │
│   ├── types/
│   │   └── index.ts           # TypeScript definitions
│   │
│   └── hooks/                 # Custom React hooks
│
├── prisma/                    # Database schema
├── public/                    # Static assets
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json              # Dependencies
```

---

## Screens

| Key | Screen | Purpose |
|-----|--------|---------|
| `D` | **Dashboard** | Landing page with animated feature demos |
| `S` | **Sequencer** | Upload video & extract frames |
| `T` | **Scroll Trigger** | Configure trigger modes & preview |
| `A` | **Archive** | Manage saved sequences |

---

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/Dream-Pixels-Forge/artisan_labs_dev/pulls).

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

```
http://www.apache.org/licenses/LICENSE-2.0
```

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

## Acknowledgments

- [Next.js](https://nextjs.org) - The React Framework
- [shadcn/ui](https://ui.shadcn.com) - Beautiful, accessible components
- [Radix UI](https://www.radix-ui.com) - Unstyled, accessible components
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lenis](https://studio.fraile.agency/lenis) - Smooth scrolling

---

<p align="center">
  Built with ❤️ by <strong>Dream-Pixels-Forge</strong>
</p>
