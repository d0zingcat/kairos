# src/components/ui — shadcn/ui Components

**Location**: `src/components/ui/`  
**Style**: shadcn/ui "new-york" variant  
**Base Color**: Zinc (not default slate)

## STRUCTURE

```
ui/
├── avatar.tsx        # User avatar with fallback
├── badge.tsx         # Status/label badges
├── button.tsx        # Button variants (default, destructive, outline, etc.)
├── calendar.tsx      # Date picker (react-day-picker)
├── card.tsx          # Card container with header/content/footer
├── command.tsx       # Cmd+K command palette (cmdk)
├── dialog.tsx        # Modal dialogs (Radix)
├── dropdown-menu.tsx # Context menus (Radix)
├── input.tsx         # Text inputs
├── popover.tsx       # Popover containers
├── scroll-area.tsx   # Custom scrollbars (Radix)
├── select.tsx        # Dropdown selects (Radix)
├── separator.tsx     # Visual dividers (Radix)
├── skeleton.tsx      # Loading placeholders
├── tabs.tsx          # Tab containers (Radix)
├── tag-input.tsx     # Multi-tag input with autocomplete
├── textarea.tsx      # Multi-line text inputs
└── tooltip.tsx       # Hover tooltips (Radix)
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Add button variant | `button.tsx` | cva variants: default, destructive, outline, secondary, ghost, link |
| Add dialog | `dialog.tsx` | Radix Dialog primitive, RSC-compatible |
| Cmd+K feature | `command.tsx` | cmdk library, integrates with command-palette provider |
| Date picker | `calendar.tsx` | react-day-picker, used in entry dialogs |
| Multi-tag input | `tag-input.tsx` | Custom component, supports authors/categories |

## CONVENTIONS

**Component Pattern**:
```typescript
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", secondary: "..." },
    size: { default: "...", sm: "...", lg: "..." },
  },
  defaultVariants: { variant: "default" },
})

export function Component({ variant, size, className, ...props }) {
  return <div className={cn(componentVariants({ variant, size, className }))} {...props} />
}
```

**Key Rules**:
- Always use `cn()` for class merging (clsx + tailwind-merge)
- Use `cva` for variant components (button, badge, etc.)
- Radix UI primitives for accessible interactive components
- File naming: `PascalName.tsx`
- Export both component and variants: `export { Button, buttonVariants }`
- RSC by default, `"use client"` only when needed (hooks, events)

**Data Attributes**:
```typescript
// For variant styling in CSS
<div
  data-slot="button"
  data-variant={variant}
  data-size={size}
  className={cn(...)}
/>
```

## ANTI-PATTERNS

- ❌ Inline `clsx()` — Use `cn()` instead
- ❌ Hard-coded classes — Use cva variants
- ❌ Direct Radix imports — Import from component wrapper
- ❌ Client components by default — RSC first, opt-in to client
- ❌ Custom styling — Follow shadcn/ui token system (CSS variables)

## UNIQUE STYLES

- **Dark mode variant**: `@custom-variant dark (&:is(.dark *))` in globals.css
- **CSS variables**: All colors via `--color-*` tokens (OKLCH space)
- **Focus ring**: `focus-visible:ring-[3px]` with `ring-ring/50`
- **Size variants**: xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg
- **Slot-based**: `data-slot` attribute for CSS targeting

## TESTING

- Unit tests: None in this directory (components tested via E2E)
- E2E tests: `e2e/*.spec.ts` test UI interactions
- Use `@testing-library/react` patterns for future unit tests

## NOTES

- **18 components total** — All follow same pattern
- **No custom CSS** — Tailwind v4 utility classes only
- **Radix primitives** — Accessible by default (keyboard nav, ARIA)
- **cmdk integration** — Command palette uses `cmdk` library
- **Tag input** — Custom component for multi-value inputs (authors, categories)
- **New York style** — Slightly larger radius (10px / 0.625rem)
