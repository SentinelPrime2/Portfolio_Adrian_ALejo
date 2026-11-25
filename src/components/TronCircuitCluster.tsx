import { cn } from '../utils/cn';

interface TronCircuitClusterProps {
  variant?: 'hex-bus-a' | 'hex-bus-b' | 'hex-bus-c';
  className?: string;
}

/**
 * Hex-aligned Tron circuit traces that fork directly along the 56x97 honeycomb lattice
 * (30-deg slants dx=±28, dy=±16.17 and vertical struts dy=±32.33) with no bounding box.
 */
export function TronCircuitCluster({
  variant = 'hex-bus-a',
  className,
}: TronCircuitClusterProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none select-none opacity-65', className)}
    >
      <svg
        viewBox="0 0 336 291"
        fill="none"
        className="h-full w-full overflow-visible"
      >
        {variant === 'hex-bus-a' && (
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Dark void break-out mask so traces fracture the underlying honeycomb */}
            <path
              d="M28 64.67 L56 48.5 L84 64.67 L112 48.5 L140 64.67 L140 97 L168 113.17 L196 97 L224 113.17 L252 97 L280 113.17"
              stroke="#020408"
              strokeOpacity="0.82"
              strokeWidth="4.5"
            />
            <path
              d="M140 97 L140 129.33 L168 145.5 L168 177.83 L196 194 L224 177.83 L252 194"
              stroke="#020408"
              strokeOpacity="0.82"
              strokeWidth="4.5"
            />
            <path
              d="M84 64.67 L84 97 L112 113.17 L112 145.5 L84 161.67"
              stroke="#020408"
              strokeOpacity="0.82"
              strokeWidth="4.5"
            />

            {/* Active cyan & ultraviolet bus lines */}
            <path
              d="M28 64.67 L56 48.5 L84 64.67 L112 48.5 L140 64.67 L140 97 L168 113.17 L196 97 L224 113.17 L252 97 L280 113.17"
              stroke="#00f3ff"
              strokeOpacity="0.32"
              strokeWidth="1.15"
            />
            <path
              d="M140 97 L140 129.33 L168 145.5 L168 177.83 L196 194 L224 177.83 L252 194"
              stroke="#bd00ff"
              strokeOpacity="0.38"
              strokeWidth="1.15"
            />
            <path
              d="M84 64.67 L84 97 L112 113.17 L112 145.5 L84 161.67"
              stroke="#00f3ff"
              strokeOpacity="0.26"
              strokeWidth="1"
            />

            {/* Terminal rings & gentle data nodes */}
            <circle cx="25" cy="66.4" r="2.8" stroke="#00f3ff" strokeOpacity="0.52" strokeWidth="1" />
            <circle cx="283" cy="114.9" r="2.8" stroke="#00f3ff" strokeOpacity="0.52" strokeWidth="1" />
            <circle cx="255" cy="195.7" r="2.8" stroke="#bd00ff" strokeOpacity="0.58" strokeWidth="1" />
            <circle cx="81" cy="163.4" r="2.5" stroke="#00f3ff" strokeOpacity="0.48" strokeWidth="1" />

            <circle cx="140" cy="97" r="2.4" fill="#00f3ff" className="tron-circuit-node" style={{ animationDelay: '0s' }} />
            <circle cx="168" cy="145.5" r="2.3" fill="#bd00ff" className="tron-circuit-node" style={{ animationDelay: '1.5s' }} />
            <circle cx="196" cy="97" r="2" fill="#00f3ff" className="tron-circuit-node" style={{ animationDelay: '2.8s' }} />
          </g>
        )}

        {variant === 'hex-bus-b' && (
          <g strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M56 145.5 L84 129.33 L84 97 L112 80.83 L140 97 L168 80.83 L196 97 L224 80.83 L252 97 L280 80.83"
              stroke="#020408"
              strokeOpacity="0.82"
              strokeWidth="4.5"
            />
            <path
              d="M168 80.83 L168 48.5 L196 32.33 L224 48.5"
              stroke="#020408"
              strokeOpacity="0.82"
              strokeWidth="4.5"
            />
            <path
              d="M196 97 L196 129.33 L224 145.5 L252 129.33 L280 145.5"
              stroke="#020408"
              strokeOpacity="0.82"
              strokeWidth="4.5"
            />

            <path
              d="M56 145.5 L84 129.33 L84 97 L112 80.83 L140 97 L168 80.83 L196 97 L224 80.83 L252 97 L280 80.83"
              stroke="#00f3ff"
              strokeOpacity="0.3"
              strokeWidth="1.15"
            />
            <path
              d="M168 80.83 L168 48.5 L196 32.33 L224 48.5"
              stroke="#bd00ff"
              strokeOpacity="0.36"
              strokeWidth="1.1"
            />
            <path
              d="M196 97 L196 129.33 L224 145.5 L252 129.33 L280 145.5"
              stroke="#bd00ff"
              strokeOpacity="0.32"
              strokeWidth="1"
            />

            <circle cx="53" cy="147.2" r="2.8" stroke="#00f3ff" strokeOpacity="0.5" strokeWidth="1" />
            <circle cx="283" cy="79.1" r="2.8" stroke="#00f3ff" strokeOpacity="0.5" strokeWidth="1" />
            <circle cx="227" cy="50.2" r="2.6" stroke="#bd00ff" strokeOpacity="0.55" strokeWidth="1" />
            <circle cx="283" cy="147.2" r="2.6" stroke="#bd00ff" strokeOpacity="0.52" strokeWidth="1" />

            <circle cx="168" cy="80.83" r="2.4" fill="#bd00ff" className="tron-circuit-node" style={{ animationDelay: '0.6s' }} />
            <circle cx="196" cy="97" r="2.2" fill="#00f3ff" className="tron-circuit-node" style={{ animationDelay: '2.1s' }} />
            <circle cx="224" cy="145.5" r="2" fill="#bd00ff" className="tron-circuit-node" style={{ animationDelay: '3.4s' }} />
          </g>
        )}

        {variant === 'hex-bus-c' && (
          <g strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M280 64.67 L252 80.83 L224 64.67 L196 80.83 L196 113.17 L168 129.33 L140 113.17 L112 129.33 L112 161.67 L84 177.83"
              stroke="#020408"
              strokeOpacity="0.82"
              strokeWidth="4.5"
            />
            <path
              d="M196 113.17 L224 129.33 L224 161.67 L252 177.83 L252 210.17"
              stroke="#020408"
              strokeOpacity="0.82"
              strokeWidth="4.5"
            />

            <path
              d="M280 64.67 L252 80.83 L224 64.67 L196 80.83 L196 113.17 L168 129.33 L140 113.17 L112 129.33 L112 161.67 L84 177.83"
              stroke="#00f3ff"
              strokeOpacity="0.32"
              strokeWidth="1.15"
            />
            <path
              d="M196 113.17 L224 129.33 L224 161.67 L252 177.83 L252 210.17"
              stroke="#bd00ff"
              strokeOpacity="0.36"
              strokeWidth="1.15"
            />

            <circle cx="283" cy="62.9" r="2.8" stroke="#00f3ff" strokeOpacity="0.52" strokeWidth="1" />
            <circle cx="81" cy="179.5" r="2.8" stroke="#00f3ff" strokeOpacity="0.5" strokeWidth="1" />
            <circle cx="252" cy="213.2" r="2.8" stroke="#bd00ff" strokeOpacity="0.56" strokeWidth="1" />

            <circle cx="196" cy="113.17" r="2.4" fill="#00f3ff" className="tron-circuit-node" style={{ animationDelay: '0.4s' }} />
            <circle cx="224" cy="161.67" r="2.2" fill="#bd00ff" className="tron-circuit-node" style={{ animationDelay: '2.0s' }} />
            <circle cx="140" cy="113.17" r="2" fill="#00f3ff" className="tron-circuit-node" style={{ animationDelay: '3.2s' }} />
          </g>
        )}
      </svg>
    </div>
  );
}
