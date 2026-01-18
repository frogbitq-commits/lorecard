# Claude Development Notes for Lorecard

## Target Device

**Primary optimization target**: iPhone 17 Pro Max on Chrome

Note: Chrome on iOS uses WebKit (Safari's rendering engine), not Chromium's Blink engine. This is mandated by Apple for all iOS browsers. Therefore, when optimizing for "Chrome on iPhone", we are effectively optimizing for Safari/WebKit behavior.

## Mobile Considerations

1. **User Agent Detection**: iOS Chrome reports as Safari WebKit in user agent. Detection should look for:
   - `iPhone` in user agent string
   - `iPad` in user agent string (for tablet)
   - `Mobile` combined with `AppleWebKit`

2. **useMediaQuery Behavior**: The `@mantine/hooks` `useMediaQuery` hook returns `undefined` initially during hydration, then settles to the actual value. For mobile-first safety, the `useIsMobile` hook includes user agent fallback to detect iOS devices immediately on initial render.

3. **Monaco Editor**: Monaco Editor has limited mobile support. It is lazy-loaded and only used in modals, not on main pages.

4. **Touch Events**: iOS Safari requires `touch-action: manipulation` on interactive elements to prevent 300ms click delay.

5. **Safe Areas**: Consider iOS safe areas (notch, home indicator) with `env(safe-area-inset-*)`.

## Breakpoints

The app uses Mantine's breakpoint system:
- Mobile: `< 768px` (below `sm` breakpoint)
- Desktop: `>= 768px` (`sm` breakpoint and above)

The `useIsMobile()` hook uses `(max-width: 767px)` to align with Mantine's `hiddenFrom="sm"` and `visibleFrom="sm"` props.
