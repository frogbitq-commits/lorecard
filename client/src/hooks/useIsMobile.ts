import { useMediaQuery } from '@mantine/hooks';

/**
 * Detects if the current device is iOS (iPhone/iPad) using user agent.
 * This is used as a fallback for initial render before useMediaQuery settles.
 * Note: Chrome on iOS uses WebKit, so it's detected the same as Safari.
 */
function getIsIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
}

/**
 * Detects if the current device appears to be mobile based on user agent.
 * Checks for common mobile identifiers including iOS devices, Android, etc.
 */
function getIsMobileUserAgent(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (ua.includes('Mac') && 'ontouchend' in document);
}

/**
 * Hook to detect if the current viewport is mobile-sized.
 * Uses the 'sm' breakpoint (768px) as the threshold.
 * Returns true for viewports smaller than 768px.
 *
 * For iOS devices (iPhone 17 Pro Max on Chrome is the primary target),
 * this uses user agent detection as a fallback during initial render
 * when useMediaQuery hasn't settled yet. This prevents flash of desktop
 * content on mobile devices.
 */
export function useIsMobile(): boolean {
  const mediaQueryResult = useMediaQuery('(max-width: 767px)');

  // If useMediaQuery has a definite result, use it
  if (mediaQueryResult !== undefined) {
    return mediaQueryResult;
  }

  // Fallback: On initial render (when mediaQueryResult is undefined),
  // use user agent detection to provide a better initial guess.
  // This is especially important for iOS devices where we want to
  // show mobile view immediately without flash.
  return getIsMobileUserAgent();
}

/**
 * Hook to detect if the current device is iOS (iPhone/iPad).
 * Useful for iOS-specific workarounds.
 */
export function useIsIOS(): boolean {
  return getIsIOSDevice();
}
