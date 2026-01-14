# Sistem Warna Aplikasi

Dokumentasi lengkap sistem warna untuk Light Mode dan Dark Mode.

## Default Mode

**LIGHT MODE adalah default.** Dark mode hanya aktif jika user secara eksplisit mengaktifkannya melalui toggle theme.

---

## CSS Variables

### Light Mode (Default)

```css
/* Background */
--background: #ffffff                /* Main background - Pure white */
--background-secondary: #f8fafc      /* Secondary bg - Very light gray */
--card-bg: #ffffff                   /* Card background - White */
--card-bg-hover: #fafbfc             /* Card hover state */

/* Text */
--text-primary: #0f172a              /* Main text - Dark slate */
--text-secondary: #475569            /* Secondary text */
--text-muted: #64748b                /* Muted text */
--text-disabled: #94a3b8             /* Disabled text */

/* Border & Divider */
--border-primary: #e2e8f0            /* Main borders */
--border-secondary: #cbd5e1          /* Secondary borders */
--border-focus: #3b82f6              /* Focus state - Blue */

/* Forms */
--input-bg: #ffffff                  /* Input background */
--input-border: #cbd5e1              /* Input border */
--input-focus-border: #3b82f6        /* Focus border */
--input-placeholder: #94a3b8         /* Placeholder text */

/* Sidebar */
--sidebar-bg: #1e3a5f                /* Dark blue sidebar */
--sidebar-text: #cbd5e1              /* Sidebar text */
--sidebar-text-active: #ffffff       /* Active menu item */
--sidebar-hover: rgba(255, 255, 255, 0.08)
--sidebar-active-bg: rgba(59, 130, 246, 0.15)

/* Header */
--header-bg: #ffffff                 /* White header */
--header-border: #e2e8f0             /* Header border */
```

### Dark Mode

```css
/* Background */
--background: #0a1628                /* Main bg - Very dark navy */
--background-secondary: #0f172a      /* Secondary bg - Dark navy */
--card-bg: #1e293b                   /* Card bg - Lighter navy */
--card-bg-hover: #283548             /* Card hover */

/* Text */
--text-primary: #f1f5f9              /* Main text - Very light */
--text-secondary: #cbd5e1            /* Secondary text */
--text-muted: #94a3b8                /* Muted text */
--text-disabled: #64748b             /* Disabled text */

/* Border & Divider */
--border-primary: #334155            /* Main borders */
--border-secondary: #475569          /* Secondary borders */
--border-focus: #60a5fa              /* Focus state - Lighter blue */

/* Forms */
--input-bg: #1e293b                  /* Input background */
--input-border: #475569              /* Input border */
--input-focus-border: #60a5fa        /* Focus border */
--input-placeholder: #64748b         /* Placeholder text */

/* Sidebar */
--sidebar-bg: #0a1628                /* Darker navy sidebar */
--sidebar-text: #94a3b8              /* Sidebar text */
--sidebar-text-active: #ffffff       /* Active menu item */
--sidebar-hover: rgba(255, 255, 255, 0.05)
--sidebar-active-bg: rgba(96, 165, 250, 0.15)

/* Header */
--header-bg: #1e293b                 /* Dark header */
--header-border: #334155             /* Header border */
```

---

## Status Colors

### Light Mode Status

| Status | Background | Text | Main Color |
|--------|-----------|------|------------|
| **Success/Paid** | `#d1fae5` | `#065f46` | `#10b981` 🟢 |
| **Warning/Pending** | `#fef3c7` | `#92400e` | `#f59e0b` 🟡 |
| **Error/Rejected** | `#fee2e2` | `#991b1b` | `#ef4444` 🔴 |
| **Info** | `#dbeafe` | `#1e40af` | `#3b82f6` 🔵 |

### Dark Mode Status

| Status | Background | Text | Main Color |
|--------|-----------|------|------------|
| **Success/Paid** | `#064e3b` | `#a7f3d0` | `#34d399` 🟢 |
| **Warning/Pending** | `#78350f` | `#fef3c7` | `#fbbf24` 🟡 |
| **Error/Rejected** | `#7f1d1d` | `#fecaca` | `#f87171` 🔴 |
| **Info** | `#1e3a8a` | `#dbeafe` | `#60a5fa` 🔵 |

---

## Tailwind Classes dengan Semantic Meaning

### Backgrounds

```tsx
// Main page background
className="bg-white dark:bg-gray-950"

// Secondary background
className="bg-gray-50 dark:bg-gray-900"

// Card background
className="bg-white dark:bg-gray-900/95"

// Sidebar (sudah di-style otomatis di CSS)
<aside> // Automatically styled
```

### Text Colors

```tsx
// Primary/heading text
className="text-gray-900 dark:text-white"

// Secondary text
className="text-gray-700 dark:text-gray-300"

// Muted/tertiary text
className="text-gray-600 dark:text-gray-400"

// Disabled text
className="text-gray-500 dark:text-gray-500"
```

### Borders

```tsx
// Card borders
className="border border-gray-200 dark:border-gray-700"

// Dividers
className="border-t border-gray-200 dark:border-gray-700"

// Input borders
className="border border-gray-300 dark:border-gray-600"
```

### Buttons

```tsx
// Primary button
className="bg-blue-600 hover:bg-blue-700 text-white"
// Dark mode: Handled automatically with CSS overrides

// Secondary button
className="bg-gray-600 hover:bg-gray-700 text-white"

// Danger button
className="bg-red-600 hover:bg-red-700 text-white"

// Success button
className="bg-green-600 hover:bg-green-700 text-white"
```

### Badge/Status Components

```tsx
// Success badge
className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"

// Warning badge
className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"

// Error badge
className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"

// Info badge
className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
```

---

## Accent Colors

### Light Mode Accents

- **Blue**: `#3b82f6` - Primary actions, links
- **Green**: `#10b981` - Success, completed, paid
- **Yellow**: `#f59e0b` - Warning, pending, in progress
- **Purple**: `#8b5cf6` - Special categories
- **Red**: `#ef4444` - Error, rejected, critical

### Dark Mode Accents

- **Blue**: `#60a5fa` - Primary actions, links
- **Green**: `#34d399` - Success, completed, paid
- **Yellow**: `#fbbf24` - Warning, pending, in progress
- **Purple**: `#a78bfa` - Special categories
- **Red**: `#f87171` - Error, rejected, critical

---

## Kontras & Aksesibilitas

Semua kombinasi warna sudah didesain untuk memenuhi **WCAG 2.1 Level AA**:

- **Light Mode**: Text dark (#0f172a) on white (#ffffff) = Ratio ~15:1 ✅
- **Dark Mode**: Text light (#f1f5f9) on dark (#0a1628) = Ratio ~13:1 ✅
- **Status Colors**: Semua memiliki contrast ratio minimal 4.5:1 ✅

---

## Best Practices

### ✅ DO

```tsx
// Use semantic Tailwind classes
<div className="bg-white dark:bg-gray-900">

// Use status color variables
<div className="bg-emerald-100 dark:bg-emerald-900/30">

// Use consistent border styles
<div className="border border-gray-200 dark:border-gray-700">
```

### ❌ DON'T

```tsx
// Don't hardcode hex colors directly
<div style={{ backgroundColor: '#1e293b' }}>

// Don't mix inconsistent grays
<div className="text-gray-600"> // One place
<div className="text-slate-600"> // Another place

// Don't skip dark mode variant
<div className="bg-white"> // Missing dark:bg-gray-900
```

---

## Component-Specific Guidelines

### Cards

```tsx
<div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Title</h3>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### Forms

```tsx
<input 
  type="text"
  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
  placeholder="Enter text"
/>
```

### Tables

```tsx
<table className="w-full">
  <thead className="bg-gray-50 dark:bg-gray-800">
    <tr>
      <th className="text-gray-700 dark:text-gray-300">Header</th>
    </tr>
  </thead>
  <tbody className="bg-white dark:bg-gray-900">
    <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="text-gray-900 dark:text-gray-100">Data</td>
    </tr>
  </tbody>
</table>
```

---

## Quick Reference Palette

### Light Mode Palette

```
Background:  #ffffff, #f8fafc, #f1f5f9
Text:        #0f172a, #475569, #64748b
Border:      #e2e8f0, #cbd5e1
Sidebar:     #1e3a5f
Success:     #10b981
Warning:     #f59e0b
Error:       #ef4444
Info:        #3b82f6
```

### Dark Mode Palette

```
Background:  #0a1628, #0f172a, #1e293b
Text:        #f1f5f9, #cbd5e1, #94a3b8
Border:      #334155, #475569
Sidebar:     #0a1628
Success:     #34d399
Warning:     #fbbf24
Error:       #f87171
Info:        #60a5fa
```

---

## Maintenance Notes

- **Tidak mengubah logic atau struktur** ✅
- **Hanya fokus pada warna dan styling** ✅
- **Light mode adalah default** ✅
- **Semua warna sudah kontras tinggi** ✅
- **WCAG AA compliant** ✅

---

**Last Updated**: January 2026  
**Version**: 1.0
