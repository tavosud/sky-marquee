import React, {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import './Marquee.css';

export type MarqueeDirection = 'left' | 'right' | 'up' | 'down';
export type MarqueeEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg';
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

const BREAKPOINTS = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
};

const getValueForBreakpoint = <T,>(value: ResponsiveValue<T>, breakpoint: Breakpoint): T => {
  if (typeof value === 'object' && value !== null) {
    const obj = value as Partial<Record<Breakpoint, T>>;
    if (breakpoint === 'lg' && obj.lg !== undefined) return obj.lg;
    if ((breakpoint === 'lg' || breakpoint === 'md') && obj.md !== undefined) return obj.md;
    if ((breakpoint === 'lg' || breakpoint === 'md' || breakpoint === 'sm') && obj.sm !== undefined) return obj.sm;
    if (obj.base !== undefined) return obj.base;
    // Fallback: return the first defined value
    const first = Object.values(obj).find((v) => v !== undefined);
    return first as T;
  }
  return value;
};

const getAnimationName = (direction: MarqueeDirection): string => {
  switch (direction) {
    case 'left':
      return 'sky-marquee-left';
    case 'right':
      return 'sky-marquee-right';
    case 'up':
      return 'sky-marquee-up';
    case 'down':
      return 'sky-marquee-down';
  }
};

const isVertical = (direction: MarqueeDirection): boolean => {
  return direction === 'up' || direction === 'down';
};

export interface MarqueeProps {
  children: React.ReactNode;
  speed?: ResponsiveValue<number>;
  direction?: ResponsiveValue<MarqueeDirection>;
  pauseOnHover?: boolean;
  gap?: ResponsiveValue<string>;
  paused?: boolean;
  onCycle?: () => void;
  easing?: MarqueeEasing;
  fadeEdges?: ResponsiveValue<boolean>;
  verticalHeight?: ResponsiveValue<string>;
  autoFill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  speed = 20,
  direction = 'left',
  pauseOnHover = true,
  gap = '40px',
  paused = false,
  onCycle,
  easing = 'linear',
  fadeEdges = false,
  verticalHeight = '200px',
  autoFill = false,
  className,
  style,
}) => {
  const containerRef      = useRef<HTMLDivElement>(null);
  const innerRef          = useRef<HTMLDivElement>(null);
  const keyboardPausedRef = useRef(false);
  const halfCopiesRef     = useRef(1);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('base');
  const [halfCopies, setHalfCopies] = useState(1);
  halfCopiesRef.current = halfCopies;

  // Breakpoint detection with 100ms debounce
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const w = window.innerWidth;
        if (w >= BREAKPOINTS.lg)      setBreakpoint('lg');
        else if (w >= BREAKPOINTS.md) setBreakpoint('md');
        else if (w >= BREAKPOINTS.sm) setBreakpoint('sm');
        else                          setBreakpoint('base');
      }, 100);
    };
    update();
    window.addEventListener('resize', update);
    return () => { clearTimeout(timer); window.removeEventListener('resize', update); };
  }, []);

  const currentDirection = getValueForBreakpoint(direction, breakpoint);
  const currentSpeed = getValueForBreakpoint(speed, breakpoint);
  const currentGap = getValueForBreakpoint(gap, breakpoint);
  const currentFadeEdges = getValueForBreakpoint(fadeEdges, breakpoint);
  const currentVerticalHeight = getValueForBreakpoint(verticalHeight, breakpoint);

  const isVert   = isVertical(currentDirection);
  const gapProp  = isVert ? 'marginBottom' : 'marginRight';

  // Auto-fill: compute how many copies of children are needed to fill the container
  useLayoutEffect(() => {
    if (!autoFill) { setHalfCopies(1); return; }
    const calc = () => {
      const container = containerRef.current;
      const inner     = innerRef.current;
      if (!container || !inner) return;
      const containerSize  = isVert ? container.offsetHeight : container.offsetWidth;
      const totalInnerSize = isVert ? inner.scrollHeight    : inner.scrollWidth;
      const singleSize     = totalInnerSize / (2 * halfCopiesRef.current);
      if (!singleSize) return;
      const needed = Math.max(Math.ceil(containerSize / singleSize), 1);
      if (needed !== halfCopiesRef.current) setHalfCopies(needed);
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [autoFill, isVert, children, currentGap, breakpoint]);

  // Sync paused prop → also resets keyboard toggle state
  useEffect(() => {
    keyboardPausedRef.current = paused;
    if (innerRef.current) {
      innerRef.current.style.animationPlayState = paused ? 'paused' : 'running';
    }
  }, [paused]);

  // Cycle callback
  useEffect(() => {
    if (!onCycle || !innerRef.current) return;
    const el = innerRef.current;
    el.addEventListener('animationiteration', onCycle);
    return () => el.removeEventListener('animationiteration', onCycle);
  }, [onCycle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      keyboardPausedRef.current = !keyboardPausedRef.current;
      if (innerRef.current) {
        innerRef.current.style.animationPlayState =
          keyboardPausedRef.current ? 'paused' : 'running';
      }
    }
  }, []);

  const handleTouchStart = useCallback(() => {
    if (innerRef.current) innerRef.current.style.animationPlayState = 'paused';
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (innerRef.current && !keyboardPausedRef.current) {
      innerRef.current.style.animationPlayState = 'running';
    }
  }, []);

  const validChildren = Children.toArray(children).filter(isValidElement);

  const renderSet = (ariaHidden?: true) =>
    validChildren.map((child, i) => (
      <div
        key={i}
        className="sky-marquee-item"
        style={{ flexShrink: 0, [gapProp]: currentGap }}
        aria-hidden={ariaHidden}
      >
        {child}
      </div>
    ));

  const shouldPauseOnHover = pauseOnHover && !paused;

  return (
    <div
      ref={containerRef}
      className={[
        'sky-marquee',
        currentFadeEdges ? 'sky-marquee-fade' : '',
        className,
      ].filter(Boolean).join(' ')}
      data-pause={shouldPauseOnHover}
      data-vertical={isVert}
      data-breakpoint={breakpoint}
      style={{ '--marquee-height': currentVerticalHeight, ...style } as React.CSSProperties}
      role="marquee"
      aria-live="off"
      aria-atomic="false"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={innerRef}
        className={`sky-marquee-inner ${getAnimationName(currentDirection)}`}
        style={{
          animationDuration: `${currentSpeed}s`,
          animationTimingFunction: easing,
        }}
      >
        {Array.from({ length: halfCopies }, (_, i) => (
          <React.Fragment key={`a-${i}`}>{renderSet()}</React.Fragment>
        ))}
        {Array.from({ length: halfCopies }, (_, i) => (
          <React.Fragment key={`b-${i}`}>{renderSet(true)}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const MemoizedMarquee = React.memo(Marquee);

export default Marquee;
