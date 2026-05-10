# Product Vision: ICF Cyprus Coach Registry

**Live**: https://coaches.icf-cyprus.com/

## Mission

We create a central entry point where clients in Cyprus find the right certified coach in minutes, not hours.

## Product Direction

The registry started as a tool for ICF Cyprus Chapter. A coaching school has requested their own instance, which validates the product as a **reusable white-label platform** for coaching organizations. The next evolution is making the registry configurable: any org can deploy their own branded coach directory with their own data, logo, and domain.

## Problem

Potential coaching clients in Cyprus have no convenient place to find, compare, and contact a certified coach. The current directory on the ICF Cyprus website is a static alphabetical list with no filtering, no search, and no way to understand which coach fits their needs. This leads to clients searching chaotically, while ICF member coaches miss traffic from their chapter.

## Unique Value Proposition

The only coach directory in Cyprus that combines:
- ICF certification verification (ACC / PCC / MCC)
- Smart filtering by specialization, language, format, and price
- AI-powered matching assistant (Phase 2)
- Direct contact via WhatsApp, Telegram, Email with pre-filled messages

## Target Audience

### Persona 1: Private Client
- **Who**: Cyprus residents, expats, Russian-speaking community
- **Goal**: Find a coach for a personal challenge (career, relationships, life goals)
- **Pain**: Doesn't know where to look, overwhelmed by unverified options online
- **How we help**: Filtered catalog with verified ICF coaches, clear specializations

### Persona 2: HR Manager / Executive
- **Who**: HR professionals and company leaders in Cyprus
- **Goal**: Find a coach for employees or top management (executive coaching, team coaching)
- **Pain**: Needs verified credentials, specific expertise, often bilingual
- **How we help**: Filter by ICF level, specialization, language; company-friendly profiles

### Persona 3: Cold Audience
- **Who**: People who heard about coaching but don't know what kind they need
- **Goal**: Understand if coaching is for them and find the right match
- **Pain**: Confused by coaching types, afraid to commit without understanding
- **How we help**: AI assistant (Phase 2) that asks simple questions and recommends top-3 coaches with explanations

### Persona 4: ICF Coach (Supply Side)
- **Who**: Active ICF Cyprus members (~20-50 people at launch)
- **Goal**: Get visibility, attract clients through the chapter
- **Pain**: Chapter website doesn't drive leads
- **How we help**: Professional profile card, direct contact buttons, free listing as part of membership

## Design Principles

1. **Embeddable first** — the registry is a standalone widget that lives inside the existing WordPress site. It can have its own design language but must feel like a natural part of the ICF Cyprus website.
2. **Zero admin dependency** — coach data in Google Sheets, no WordPress admin access required for content updates. Anyone with sheet access can manage coaches.
3. **Mobile-first** — majority of traffic is mobile. Touch-friendly filters, readable cards, fast loading.
4. **Multilingual by default** — EN / RU / EL from day one. UI strings are translatable, coach profiles are in the language the coach writes.
5. **Contact friction = zero** — one tap to WhatsApp/Telegram/Email with a pre-filled message including the coaching topic.
