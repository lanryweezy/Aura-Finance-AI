# Aura Finance AI — Design System

## Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `brand-cyan` | `#00F5D4` | Primary accent, CTAs, links |
| `brand-purple` | `#9B5DE5` | Secondary accent, gradients |
| `brand-pink` | `#FF6B6B` | Tertiary accent, alerts |
| `dark-primary` | `#0A0E29` | Main background (dark mode) |
| `dark-secondary` | `#111631` | Card backgrounds (dark mode) |
| `light-primary` | `#FFFFFF` | Main background (light mode) |

## Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 | Inter | 900 (Black) | 48-72px |
| H2 | Inter | 900 (Black) | 32-40px |
| H3 | Inter | 800 (ExtraBold) | 20-24px |
| Body | Inter | 500 (Medium) | 14-16px |
| Caption | Inter | 400 (Regular) | 12-13px |
| Mono | JetBrains Mono | 400 | 12-14px |

## Spacing

| Token | Value |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `2xl` | 48px |

## Border Radius

| Element | Radius |
|---------|--------|
| Buttons | `rounded-xl` (12px) |
| Cards | `rounded-2xl` (16px) |
| Modals | `rounded-2xl` (16px) |
| Inputs | `rounded-xl` (12px) |
| Badges | `rounded-full` |

## Shadows

| Element | Shadow |
|---------|--------|
| Cards | `shadow-xl` + `border` |
| Buttons | `shadow-lg shadow-brand-cyan/20` |
| Modals | `shadow-2xl` |
| Floating | `shadow-2xl shadow-brand-cyan/20` |

## Gradients

| Name | Value | Usage |
|------|-------|-------|
| Primary | `from-brand-cyan to-brand-purple` | CTAs, hero, agent avatars |
| Secondary | `from-brand-cyan to-brand-purple` | Cards, badges |
| Accent | `from-brand-purple to-brand-pink` | Highlights, alerts |

## Animations

| Animation | Class | Usage |
|-----------|-------|-------|
| Fade in | `animate-fade-in` | Page loads |
| Pulse | `animate-pulse` | Loading states, live indicators |
| Scale | `active:scale-95` | Button presses |
| Hover scale | `hover:scale-[1.01]` | Card hover |
| Transition | `transition-all` | All interactive elements |

## Component Patterns

### Buttons
```tsx
// Primary
<button className="px-6 py-3 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20">

// Secondary
<button className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">

// Danger
<button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/30">
```

### Cards
```tsx
<div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5 hover:border-brand-cyan/30 transition-all">
```

### Inputs
```tsx
<input className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan" />
```

### Status Badges
```tsx
<span className="text-xs px-2 py-1 rounded-full font-bold bg-green-500/20 text-green-400">Active</span>
<span className="text-xs px-2 py-1 rounded-full font-bold bg-yellow-500/20 text-yellow-400">Pending</span>
<span className="text-xs px-2 py-1 rounded-full font-bold bg-red-500/20 text-red-400">Overdue</span>
```

### Tables
```tsx
<table className="w-full min-w-[800px]">
  <thead><tr className="border-b border-gray-100 dark:border-white/10">
    <th className="text-left p-4 text-xs font-bold text-gray-500">Header</th>
  </tr></thead>
  <tbody>
    <tr className="border-b border-gray-50 dark:border-white/5 hover:bg-white/5">
      <td className="p-4 text-sm">Data</td>
    </tr>
  </tbody>
</table>
```

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |

## Dark/Light Mode

- Dark mode: `bg-dark-primary` (#0A0E29), `text-white`
- Light mode: `bg-light-primary` (#FFFFFF), `text-aura-gray-900`
- Toggle via `theme` state in Zustand store
- Persists to localStorage
