# Iconoma

[![github](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/theryston/iconoma)
[![Version](https://img.shields.io/npm/v/@iconoma/cli.svg)](https://npmjs.org/package/@iconoma/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@iconoma/cli.svg)](https://npmjs.org/package/@iconoma/cli)

**Iconoma** is a complete **icon management system** (CLI + Studio) that helps teams and products **organize, standardize, version, and distribute icons** with a reliable workflow.

Instead of keeping random SVG files scattered across the repo, Iconoma turns your icon library into a **structured, reproducible pipeline**: clean SVGs with SVGO, enforce consistency (colors, metadata, conventions), and generate the targets your apps need (SVG files, React components, React Native components).

Start using it now by running this in your project:

```bash
npx @iconoma/cli studio
```

---

## Why Iconoma

Icon libraries tend to become messy as projects grow:

- inconsistent sizes and alignment (icons "look bigger" even with the same size)
- hardcoded colors that break themes/dark mode
- duplicated icons with different names
- manual export steps (time-consuming and error-prone)
- multiple platforms needing different formats (Web + React + React Native)

Iconoma solves that by providing a **single source of truth (the studio)** for your icon catalog and an automated build system.

---

## What you get

### ✅ Icon catalog with metadata

Each icon can have:

- a canonical **name**
- **tags** for search and organization
- optimized SVG content
- generated outputs (targets)

This makes it easy to keep icons discoverable and consistent across the team.

### ✅ Zero dependencies in your project

Iconoma adds **no dependencies** to your project. It handles and adds the icon outputs directly in your project, already ready for use, without any dependencies. You don't even need to install Iconoma in your project—just use `npx @iconoma/cli` when needed.

### ✅ SVGO optimization + custom configuration

Iconoma uses **SVGO** to optimize and normalize your SVGs (removing unnecessary data, minimizing output, and improving consistency).

You can **fully customize the SVGO config** to match your rules and design system (plugins, params, presets, etc.).

### ✅ Color mapping and theming-friendly icons

SVGs frequently arrive with hardcoded colors like `#000`, `#111`, `white`, etc.

Iconoma supports a **color map** approach so you can convert colors into:

- `currentColor`
- CSS variables/tokens (e.g. `var(--icons-secondary)`)

This makes icons theme-friendly and prevents "random SVG colors" from leaking into your UI.

### ✅ Automatic target generation (React, React Native, SVG)

Iconoma can automatically generate the targets you need, including:

- **`.svg` files** (optimized/normalized)
- **React components**
- **React Native components**

Targets are treated as build outputs, so you can keep a clean pipeline for multiple platforms.

### ✅ Lockfile-based reproducible builds

Iconoma keeps a lockfile called `iconoma.lock.json` that stores:

- SVG hashes
- config hashes
- target outputs and what they were built from

This makes builds **deterministic**, helps you to understand the changes using Git.

### ✅ Studio (UI) integrated with the workflow

Iconoma includes a "Studio" interface to make icon curation easier:

- browse and search icons
- preview icons in different sizes/themes
- manage names/tags
- validate consistency visually
- run builds/transforms from a friendly UI
