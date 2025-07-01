# Corteo - Color Palette Documentation

## Overview
This document provides a comprehensive guide to all colors used in the Corteo protest organization platform, including light and dark theme variants, category colors, and UI element colors.

---

## Theme System

### Light Theme
```css
:root {
  /* Backgrounds */
  --background: hsl(60, 9%, 97%);             /* #F8F8F6 - Main background */
  --card: hsl(0, 0%, 100%);                   /* #FFFFFF - Card backgrounds */
  --popover: hsl(0, 0%, 100%);                /* #FFFFFF - Popup backgrounds */
  
  /* Text Colors */
  --foreground: hsl(215, 25%, 27%);           /* #1E293B - Primary text */
  --muted-foreground: hsl(215, 16%, 47%);     /* #64748B - Secondary text */
  
  /* Borders & Inputs */
  --border: hsl(214, 32%, 91%);               /* #E2E8F0 - Border color */
  --input: hsl(214, 32%, 91%);                /* #E2E8F0 - Input borders */
  
  /* UI Elements */
  --muted: hsl(60, 9%, 97%);                  /* #F8F8F6 - Muted backgrounds */
  --accent: hsl(347, 77%, 50%);               /* #E11D48 - Accent color */
  --secondary: hsl(60, 9%, 97%);              /* #F8F8F6 - Secondary backgrounds */
  
  /* Interactive Elements */
  --primary: hsl(347, 77%, 50%);              /* #E11D48 - Active icons, buttons */
  --destructive: hsl(0, 74%, 42%);            /* #DC2626 - Destructive actions */
  --ring: hsl(347, 77%, 50%);                 /* #E11D48 - Focus rings */
  
  /* New specific colors */
  --inactive-icon: hsl(218, 11%, 65%);        /* #94A3B8 - Inactive nav icons */
  --category-label-bg: hsl(347, 77%, 92%);    /* #FECDD3 - Category label background */
  --category-label-text: hsl(347, 77%, 50%);  /* #E11D48 - Category label text */
}
```

### Dark Theme
```css
.dark {
  /* Backgrounds */
  --background: hsl(0, 0%, 7.1%);             /* #121212 - Main background */
  --card: hsl(0, 0%, 12.2%);                  /* #1F1F1F - Card backgrounds */
  --popover: hsl(0, 0%, 7.1%);                /* #121212 - Popup backgrounds */
  
  /* Text Colors */
  --foreground: hsl(0, 0%, 100%);             /* #FFFFFF - Primary text */
  --muted-foreground: hsl(0, 0%, 88.2%);      /* #E1E1E1 - Secondary text */
  
  /* Borders & Inputs */
  --border: hsl(0, 0%, 12.2%);                /* #1F1F1F - Border color */
  --input: hsl(0, 0%, 12.2%);                 /* #1F1F1F - Input borders */
  
  /* UI Elements */
  --muted: hsl(0, 0%, 12.2%);                 /* #1F1F1F - Muted backgrounds */
  --accent: hsl(0, 0%, 12.2%);                /* #1F1F1F - Accent backgrounds */
  --secondary: hsl(0, 0%, 12.2%);             /* #1F1F1F - Secondary backgrounds */
  
  /* Interactive Elements */
  --primary: hsl(217, 91%, 60%);              /* #2563EB - Primary buttons */
  --destructive: hsl(0, 62.8%, 30.6%);        /* #991B1B - Destructive actions */
  --ring: hsl(0, 0%, 88.2%);                  /* #E1E1E1 - Focus rings */
}
```

---

## Brand Colors

### Primary Brand Colors
```css
/* Activist Blue - Main brand color */
--activist-blue: hsl(217, 91%, 60%);          /* #2563EB */

/* Rally Red - Secondary brand color */
--rally-red: hsl(0, 74%, 50%);                /* #DC2626 */

/* Movement Green - Tertiary brand color */
--movement-green: hsl(158, 89%, 40%);         /* #059669 */

/* Clean White - Light neutral */
--clean-white: hsl(210, 40%, 98%);            /* #F8FAFC */

/* Dark Slate - Dark neutral */
--dark-slate: hsl(215, 25%, 27%);             /* #1E293B */
```

---

## Category Colors

### Protest Categories
Each category has a specific color for visual distinction:

```css
/* Environment */
.bg-green-600                                 /* #059669 */

/* LGBTQ+ */
.bg-rose-500                                  /* #F43F5E */

/* Women's Rights */
.bg-pink-700                                  /* #BE185D */

/* Labor */
.bg-amber-600                                 /* #D97706 */

/* Racial & Social Justice */
.bg-violet-700                                /* #7C3AED */

/* Civil & Human Rights */
.bg-blue-600                                  /* #2563EB */

/* Healthcare & Education */
.bg-cyan-600                                  /* #0891B2 */

/* Peace & Anti-War */
.bg-sky-400                                   /* #0EA5E9 */

/* Transparency & Anti-Corruption */
.bg-gray-600                                  /* #4B5563 */

/* Other */
.bg-indigo-600                                /* #4F46E5 */
```

---

## Background Theme Options

### Solid Colors
```css
/* Light theme backgrounds */
body.bg-white                                 /* #FFFFFF */
body.bg-pink                                  /* #FDF2F8 */
body.bg-green                                 /* #F0FDF4 */
body.bg-blue                                  /* #EFF6FF */
body.bg-purple                                /* #FAF5FF */
body.bg-orange                                /* #FFF7ED */

/* Dark theme override */
.dark body.*                                  /* #121212 - All backgrounds become dark */
```

### Gradient Backgrounds
```css
/* Sunset Gradient */
body.bg-gradient-sunset
background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);

/* Ocean Gradient */
body.bg-gradient-ocean
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Forest Gradient */
body.bg-gradient-forest
background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);

/* Dark theme override */
.dark body.bg-gradient-*                      /* #121212 - Gradients become solid dark */
```

---

## UI Component Colors

### Navigation
```css
/* Light Theme Navigation */
nav                                           /* #FFFFFF background */
.border-gray-200                              /* #E5E7EB border */

/* Dark Theme Navigation */
.dark nav                                     /* #121212 background */
.dark nav                                     /* #121212 border */
```

### Cards & Containers
```css
/* Light Theme Cards */
.card                                         /* #FFFFFF background */
.border                                       /* #E2E8F0 border */

/* Dark Theme Cards */
.dark .card                                   /* #1F1F1F background */
.dark .card                                   /* #121212 border */
```

### Buttons
```css
/* Primary Button */
.bg-activist-blue                             /* #2563EB background */
.hover:bg-activist-blue/90                    /* #1D4ED8 hover state */

/* Secondary Button */
.bg-gray-100                                  /* #F3F4F6 background */
.text-gray-700                                /* #374151 text */

/* Dark Theme Buttons */
.dark .bg-gray-100                            /* #1F1F1F background */
.dark .text-gray-700                          /* #E1E1E1 text */
```

### Form Elements
```css
/* Light Theme Inputs */
input, textarea, select                       /* #FFFFFF background */
.border-gray-200                              /* #E5E7EB border */

/* Dark Theme Inputs */
.dark input                                   /* #1F1F1F background */
.dark input                                   /* #121212 border */
.dark input                                   /* #FFFFFF text */
.dark input::placeholder                      /* #E1E1E1 placeholder */
```

---

## Text Colors

### Light Theme Text
```css
/* Primary Text */
.text-gray-900                                /* #111827 */
.text-dark-slate                              /* #1E293B */

/* Secondary Text */
.text-gray-600                                /* #4B5563 */
.text-gray-700                                /* #374151 */

/* Muted Text */
.text-gray-500                                /* #6B7280 */
```

### Dark Theme Text
```css
/* Primary Text */
.dark .text-gray-900                          /* #FFFFFF */
.dark .text-dark-slate                        /* #FFFFFF */

/* Secondary Text */
.dark .text-gray-600                          /* #E1E1E1 */
.dark .text-gray-700                          /* #E1E1E1 */

/* Muted Text */
.dark .text-gray-500                          /* #A3A3A3 */
```

---

## Interactive States

### Hover States
```css
/* Light Theme Hovers */
.hover:bg-gray-50                             /* #F9FAFB */
.hover:bg-gray-100                            /* #F3F4F6 */

/* Dark Theme Hovers */
.dark .hover:bg-gray-50:hover                 /* #2A2A2A */
.dark .hover:bg-gray-100:hover                /* #2A2A2A */
```

### Focus States
```css
/* Focus Ring */
.ring-activist-blue                           /* #2563EB ring color */
.ring-2                                       /* 2px ring width */
.ring-offset-2                                /* 2px ring offset */
```

---

## Map Interface Colors

### Map Markers
```css
/* Category-specific marker colors (same as category colors) */
Environment                                   /* #059669 */
LGBTQ+                                        /* #F43F5E */
Women's Rights                                /* #BE185D */
Labor                                         /* #D97706 */
/* ... etc */

/* User Location Marker */
.user-location                                /* #3B82F6 (blue) */

/* Search Location Marker */
.search-location                              /* #F59E0B (amber) */
```

### Map Controls
```css
/* Light Theme Map Controls */
.map-search-overlay                           /* #FFFFFF background */
.map-filter-overlay                           /* #FFFFFF background */

/* Dark Theme Map Controls */
.dark .map-search-overlay                     /* #1F1F1F background */
.dark .map-filter-overlay                     /* #1F1F1F background */
```

---

## Accessibility Notes

### Contrast Ratios
- All text combinations meet WCAG AA standards (4.5:1 minimum)
- Interactive elements have sufficient contrast for visibility
- Focus indicators are clearly visible in both themes

### Color Blind Considerations
- Category colors are distinguishable for common color blindness types
- Information is not conveyed through color alone
- Text labels accompany all color-coded elements

---

## Usage Guidelines

### When to Use Each Color
1. **Activist Blue**: Primary actions, links, active states
2. **Rally Red**: Destructive actions, urgent notifications, activism calls-to-action
3. **Movement Green**: Success states, environmental content, positive actions
4. **Category Colors**: Only for protest category identification
5. **Gray Scale**: Text hierarchy, borders, neutral UI elements

### Dark Theme Implementation
- All white backgrounds (`#FFFFFF`) become `#1F1F1F`
- All light borders become `#121212`
- Text colors automatically adjust for contrast
- Brand colors remain consistent across themes

---

## Implementation Reference

### CSS Custom Properties Usage
```css
/* Use CSS variables for consistent theming */
background-color: var(--background);
color: var(--foreground);
border-color: var(--border);

/* Use Tailwind classes for predefined colors */
<div className="bg-activist-blue text-white">
<div className="bg-green-600 text-white"> /* Environment category */
```

### Dark Mode Class Structure
```css
/* Apply dark theme with .dark class on root element */
<html className="dark">
  <!-- All children inherit dark theme styles -->
</html>
```