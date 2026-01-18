import { useMediaQuery } from '@mantine/hooks';

/**
 * Hook to detect if the current viewport is mobile-sized.
 * Uses the 'sm' breakpoint (768px) as the threshold.
 * Returns true for viewports smaller than 768px.
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)') ?? false;
}
