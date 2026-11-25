import { cn } from '../utils/cn';

interface TronWireOverlayProps {
  variant?: 'cyan' | 'violet' | 'dual';
  withScan?: boolean;
  className?: string;
}

/**
 * Zero-layout-shift decorative laser perimeter & scanline overlay.
 * Initialized at opacity: 0 and animated by addWireDraw() on GPU transforms.
 */
export function TronWireOverlay({
  variant = 'cyan',
  withScan = false,
  className,
}: TronWireOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('tron-wire-overlay', `tron-wire-${variant}`, className)}
    >
      <span data-tron-wire="top" className="tron-wire-top opacity-0" />
      <span data-tron-wire="right" className="tron-wire-right opacity-0" />
      <span data-tron-wire="bottom" className="tron-wire-bottom opacity-0" />
      <span data-tron-wire="left" className="tron-wire-left opacity-0" />
      {withScan && <span data-tron-scan="" className="tron-scan-beam opacity-0" />}
    </div>
  );
}
