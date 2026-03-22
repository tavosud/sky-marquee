# @tavosud/sky-marquee

Ultra-lightweight infinite marquee component for React with native CSS animations. Works with images, logos, text, or any React element.

[![npm version](https://img.shields.io/npm/v/@tavosud/sky-marquee)](https://www.npmjs.com/package/@tavosud/sky-marquee)
[![license](https://img.shields.io/npm/l/@tavosud/sky-marquee)](https://github.com/tavosud/sky-marquee/blob/main/LICENSE)

## Features

- **Zero runtime dependencies** — no external libraries
- **Dual ESM + CJS** — works in Vite, Next.js, CRA, Node.js, and Jest
- **Native CSS animations** — GPU-accelerated with `will-change: transform`
- **4 directions** — left, right, up, down
- **Responsive props** — per-breakpoint values for speed, gap, direction, and more
- **Accessible** — ARIA roles, keyboard pause/resume, `prefers-reduced-motion` support
- **Fully typed** — complete TypeScript definitions included
- **Touch support** — pauses on touch, resumes on release
- **Memoized variant** — `MemoizedMarquee` to prevent unnecessary re-renders

## Installation

```bash
npm install @tavosud/sky-marquee
```

**Peer dependencies:** React >= 18.0.0 · React DOM >= 18.0.0

> **CSS import required.** The stylesheet is bundled in `dist/`. If your bundler does not import CSS automatically, add:
> ```js
> import '@tavosud/sky-marquee/dist/marquee.css';
> ```

## Quick Start

```tsx
import { Marquee } from '@tavosud/sky-marquee';

function App() {
  return (
    <Marquee speed={20} gap="40px">
      <img src="/logo1.svg" alt="Logo 1" width={120} />
      <img src="/logo2.svg" alt="Logo 2" width={120} />
      <img src="/logo3.svg" alt="Logo 3" width={120} />
    </Marquee>
  );
}
```

## Props

| Prop | Type | Responsive | Default | Description |
|------|------|:----------:|---------|-------------|
| `children` | `ReactNode` | — | required | Elements to display |
| `speed` | `number` | Yes | `20` | Animation duration in seconds (lower = faster) |
| `direction` | `MarqueeDirection` | Yes | `'left'` | Scroll direction |
| `gap` | `string` | Yes | `'40px'` | Spacing between elements (any CSS unit) |
| `fadeEdges` | `boolean` | Yes | `false` | Fade gradient on leading/trailing edges |
| `verticalHeight` | `string` | Yes | `'200px'` | Container height for vertical directions |
| `pauseOnHover` | `boolean` | — | `true` | Pause animation on mouse hover |
| `paused` | `boolean` | — | `false` | Programmatic pause control |
| `easing` | `MarqueeEasing` | — | `'linear'` | CSS animation timing function |
| `autoFill` | `boolean` | — | `false` | Auto-repeat children until they fill the container |
| `className` | `string` | — | `undefined` | Extra CSS class on the container element |
| `style` | `CSSProperties` | — | `undefined` | Inline styles merged onto the container element |
| `onCycle` | `() => void` | — | `undefined` | Callback fired on each full animation cycle |

### Types

```ts
type MarqueeDirection = 'left' | 'right' | 'up' | 'down';
type MarqueeEasing    = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
```

## Responsive Props

Props marked **Responsive** accept either a plain value or a breakpoint object:

```tsx
<Marquee
  speed={{ base: 10, sm: 15, md: 20, lg: 30 }}
  gap={{ base: '20px', md: '40px', lg: '60px' }}
  direction={{ base: 'left', md: 'right' }}
  fadeEdges={{ base: false, lg: true }}
  verticalHeight={{ base: '150px', md: '200px', lg: '250px' }}
>
  <span>Responsive item</span>
</Marquee>
```

| Breakpoint | Min width | Targets |
|------------|-----------|---------|
| `base` | 0 px | All screens (default) |
| `sm` | 640 px | Large phones / small tablets |
| `md` | 768 px | Tablets |
| `lg` | 1024 px | Desktops |

Values cascade upward — a `sm` value applies on `md` and `lg` unless overridden.

## Examples

### Logo / image strip

```tsx
<Marquee speed={15} gap={{ base: '30px', lg: '60px' }} fadeEdges>
  <img src="/brand-a.svg" alt="Brand A" width={100} />
  <img src="/brand-b.svg" alt="Brand B" width={100} />
  <img src="/brand-c.svg" alt="Brand C" width={100} />
</Marquee>
```

### Auto-fill container

When you have few items that don't fill the viewport, enable `autoFill` to repeat them automatically:

```tsx
<Marquee autoFill speed={20} gap="40px">
  <img src="/logo.svg" alt="Logo" width={100} />
  <img src="/logo2.svg" alt="Logo 2" width={100} />
</Marquee>
```

### Custom className and style

```tsx
<Marquee className="my-strip" style={{ background: '#0f0f0f', padding: '16px 0' }}>
  <img src="/logo.svg" alt="Logo" width={100} />
</Marquee>
```

### Reverse direction

```tsx
<Marquee direction="right" speed={25}>
  <img src="/logo.png" alt="Logo" width={80} />
</Marquee>
```

### Vertical ticker

```tsx
<Marquee direction="up" verticalHeight="300px" gap="16px">
  <div className="card">News item 1</div>
  <div className="card">News item 2</div>
  <div className="card">News item 3</div>
</Marquee>
```

### Programmatic pause

```tsx
import { useState } from 'react';

function App() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <>
      <button onClick={() => setIsPaused(p => !p)}>
        {isPaused ? 'Play' : 'Pause'}
      </button>
      <Marquee paused={isPaused}>
        <img src="/logo.svg" alt="Logo" width={100} />
      </Marquee>
    </>
  );
}
```

### Cycle callback

```tsx
<Marquee onCycle={() => console.log('loop!')}>
  <span>Item</span>
</Marquee>
```

### Memoized version

Use `MemoizedMarquee` when the parent re-renders frequently:

```tsx
import { MemoizedMarquee } from '@tavosud/sky-marquee';

const LogoStrip = () => (
  <MemoizedMarquee speed={20} gap="40px">
    <img src="/logo.svg" alt="Logo" width={100} />
  </MemoizedMarquee>
);
```

## CSS Customization

Override CSS custom properties on the container element:

```css
.my-marquee {
  --marquee-fade-size: 80px;   /* width/height of edge fade */
  --marquee-fade-color: #fff;  /* color used in the gradient */
  --marquee-height: 200px;     /* vertical mode container height */
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `--marquee-fade-size` | `50px` | Width (horizontal) or height (vertical) of the fade gradient |
| `--marquee-fade-color` | `white` | Fade gradient color — match your background |
| `--marquee-height` | `200px` | Container height when `direction` is `up` or `down` |

## Accessibility

| Feature | Behavior |
|---------|----------|
| `role="marquee"` | Semantic landmark on the container |
| `aria-live="off"` | Screen readers won't announce the scrolling content |
| `aria-hidden="true"` | Applied to cloned (duplicate) children |
| Keyboard | `Tab` to focus container, `Space` / `Enter` to toggle pause |
| Touch | Pauses on `touchstart`, resumes on `touchend` |
| `prefers-reduced-motion` | Animation is disabled entirely |

## How It Works

1. Children are rendered once as the visible track.
2. The same children are cloned with `aria-hidden="true"` to form a seamless repeat.
3. A CSS animation translates the inner container from `0%` to `-50%` (or equivalent for vertical).
4. When the animation reaches the end, it loops back — creating an infinite scroll effect.

Breakpoint detection relies on `window.innerWidth` and a `resize` listener — no ResizeObserver or third-party libraries needed.

## Module Formats

| File | Format | Use case |
|------|--------|----------|
| `dist/index.js` | ESM | Vite, Next.js, modern bundlers |
| `dist/index.cjs` | CJS | Node.js, Jest, older toolchains |
| `dist/index.d.ts` | Types | TypeScript projects |

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 36+ |
| Firefox | 16+ |
| Safari | 9+ |
| Edge | 12+ |

## License

MIT © [tavosud](https://github.com/tavosud)
