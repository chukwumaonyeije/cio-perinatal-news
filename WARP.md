# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 16 application built with TypeScript, React 19, and Tailwind CSS v4. The project uses the Next.js App Router architecture and follows modern Next.js conventions.

## Development Commands

### Running the Application
- **Development server**: `npm run dev` (runs on http://localhost:3000)
- **Production build**: `npm run build`
- **Production server**: `npm run start`

### Code Quality
- **Linting**: `npm run lint`

## Tech Stack

- **Framework**: Next.js 16.0.4 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **Language**: TypeScript 5
- **Fonts**: Geist Sans and Geist Mono (via next/font)
- **Linting**: ESLint 9 with eslint-config-next

## Architecture

### Directory Structure
- **`app/`**: Next.js App Router directory containing all routes and layouts
  - `layout.tsx`: Root layout defining the HTML structure, fonts, and metadata
  - `page.tsx`: Home page component
  - `globals.css`: Global styles with Tailwind CSS imports and CSS variables

### Path Aliases
- `@/*` resolves to the project root (configured in tsconfig.json)

### Styling System
- Uses Tailwind CSS v4 with inline theme configuration in `globals.css`
- CSS variables defined for `--background` and `--foreground` colors
- Dark mode support via `prefers-color-scheme` media query
- Custom theme tokens: `--color-background`, `--color-foreground`, `--font-sans`, `--font-mono`

### TypeScript Configuration
- Target: ES2017
- Strict mode enabled
- Path alias `@/*` for root-level imports
- Next.js plugin enabled for enhanced type checking

### ESLint Configuration
- Uses Next.js recommended configs: `core-web-vitals` and `typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Development Notes

### File Editing Patterns
- Pages are React Server Components by default (no "use client" directive needed unless using hooks/interactivity)
- Use `next/image` for optimized images
- Use `next/font` for optimized font loading

### Next.js App Router Conventions
- File-based routing in the `app/` directory
- `layout.tsx` for shared UI across routes
- `page.tsx` for route pages
- Special files: `loading.tsx`, `error.tsx`, `not-found.tsx` can be added as needed
