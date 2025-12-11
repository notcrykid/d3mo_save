# ==========================================

# D3MO — CINEMATIC COMMERCE FRAMEWORK

# ==========================================

A modular, high-performance e-commerce platform designed for premium fragrance & beauty experiences.
Built with Nuxt 4, Vue 3, TypeScript, and a headless multi-service architecture, D3MO delivers cinematic UX and full commercial functionality.

---

# BADGES

<p align="left">
  <img src="https://img.shields.io/badge/Nuxt-4.2.1-00DC82?style=for-the-badge&logo=nuxt.js" />
  <img src="https://img.shields.io/badge/Vue-3-42B883?style=for-the-badge&logo=vuedotjs" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Node-18%2F20-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/pnpm-latest-F69220?style=for-the-badge&logo=pnpm" />
</p>

---

# TABLE OF CONTENTS

* [Introduction](#introduction)
* [Key Features](#key-features)
* [Tech Stack Overview](#tech-stack-overview)
* [Quick Start](#quick-start)
* [Project Structure (ASCII Diagram)](#project-structure-ascii-diagram)
* [Environment Variables](#environment-variables)
* [Development Workflow](#development-workflow)
* [Build & Deployment](#build--deployment)
* [Code Quality](#code-quality)
* [Additional Resources](#additional-resources)

---

# INTRODUCTION

D3MO is a next-generation e-commerce engine designed for high-impact digital retail.
It combines cinematic motion design, strong engineering foundations, and a modular headless architecture.

The platform prioritizes:

* High performance (SSR/SSG)
* Scalability across services
* Clean and maintainable code
* Immersive, story-centric UX

---

# KEY FEATURES

* Cinematic UX layer (Three.js + GSAP)
* SSR/SSG architecture for SEO and performance
* Modular headless stack (Nuxt + Medusa + Strapi)
* Complete e-commerce feature set
* TypeScript-first codebase
* Automated CI/CD pipeline (Vercel)
* Strong documentation across PRD / Epics / Architecture
     

---

# TECH STACK OVERVIEW

## Frontend

* Nuxt 4.2.1 (SSR/SSG)
* Vue 3 (Composition API)
* TypeScript
* Three.js r150
* GSAP (timeline animations)
* Pinia (state management)

## Backend (Headless)

* Medusa.js v2
* PostgreSQL + Prisma
* Redis + BullMQ for queues

## CMS

* Strapi v5

## External Services

* Stripe
* PayPal
* Cloudinary
* Resend
* Vercel

---

# QUICK START

> All commands must be executed from the `d3mo/` directory.

## 1. Install prerequisites

```bash
node --version
npm install -g pnpm
```

## 2. Install dependencies

```bash
pnpm install
```

## 3. Create your environment file

```bash
cp .env.example .env
```

Minimal example:

```
NUXT_PUBLIC_APP_URL=http://localhost:3000
NUXT_PUBLIC_APP_NAME=d3mo
```

## 4. Start development server

```bash
pnpm run dev
```

Application available at:

```
http://localhost:3000
```

---

# PROJECT STRUCTURE (ASCII DIAGRAM)

```
d3mo/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── motion/         # Three.js + GSAP cinematic components
│   └── commerce/
├── pages/
├── layouts/
├── composables/
├── stores/
├── public/
├── assets/
├── server/
│   ├── api/
│   ├── middleware/
│   └── utils/
├── utils/
├── .env.example
├── nuxt.config.ts
└── package.json
```

---

# ENVIRONMENT VARIABLES

```
NUXT_PUBLIC_APP_URL      Application public URL
NUXT_PUBLIC_APP_NAME     App name

# Future integrations
MEDUSA_BACKEND_URL       Medusa backend URL
STRAPI_URL               Strapi CMS URL
STRIPE_PUBLIC_KEY        Stripe public key
```

* `.env` must never be committed
* Only `.env.example` belongs in version control

---

# DEVELOPMENT WORKFLOW

This workflow is aligned with the PRD, Epic Breakdown, Tech Specs, and Architecture documents.

---

1. Product Requirements (PRD)

---

Defines the entire scope: UX, e-commerce, cinematic behavior, performance, business logic.


---

2. Epics

---

Each macro area is organized into epics (Foundation, Cinematic UX, Product Discovery, Checkout, etc.).


---

3. Stories

---

Each epic contains implementable development stories
(e.g., Story 1.1: Project Setup, Story 2.1: Loading Sequence, Story 3.3: Product Detail Overlay).


---

4. Implementation Flow

---

* Identify the next story in `status: backlog`
* Add technical context
* Implement following architecture patterns
* Update docs and planning

---

5. Architecture Alignment

---

Backend, CMS, frontend, queues, API patterns — all defined in:


---

6. CI/CD

---

Push to `main` → build → deploy via Vercel pipeline.

---

# BUILD & DEPLOYMENT

## Build

```bash
pnpm run build
```

## Preview production build

```bash
pnpm run preview
```

## Deployment

* Automated through GitHub Actions
* Deployed to Vercel
* Includes logs, rollbacks, environment separation

---

# CODE QUALITY

* TypeScript (strict mode)
* ESLint (Flat Config)
* Prettier
* Build fails on:

  * ESLint errors
  * Type errors
  * Missing dependencies

Manual checks:

```bash
pnpm exec eslint .
pnpm exec prettier --write .
```

---

# ADDITIONAL RESOURCES

* Nuxt Documentation
* Vue 3 Documentation
* Medusa.js Documentation
* Strapi Documentation
* Stripe API Reference
* Cloudinary Documentation
* Vercel Docs

---

