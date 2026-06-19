import { useLoading } from "@/context/loading";

export function ChefHatLoader() {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="chef-hat-loader-overlay" aria-live="assertive" aria-busy="true" role="status">
      <div className="chef-hat-loader-card">

        {/* Swirling whirlpool */}
        <div className="whirlpool-wrapper">
          <svg
            className="whirlpool-svg"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Outer ring — slowest */}
            <circle
              cx="60" cy="60" r="50"
              className="wave-ring ring-outer"
              fill="none"
              strokeLinecap="round"
            />

            {/* Mid ring */}
            <circle
              cx="60" cy="60" r="36"
              className="wave-ring ring-mid"
              fill="none"
              strokeLinecap="round"
            />

            {/* Inner ring — fastest */}
            <circle
              cx="60" cy="60" r="22"
              className="wave-ring ring-inner"
              fill="none"
              strokeLinecap="round"
            />

            {/* Tiny ring */}
            <circle
              cx="60" cy="60" r="10"
              className="wave-ring ring-tiny"
              fill="none"
              strokeLinecap="round"
            />

            {/* Center vortex */}
            <circle cx="60" cy="60" r="4" className="vortex-center" />

            {/* Water droplet sparks orbiting outward */}
            <g className="droplet-orbit orbit-1">
              <circle cx="60" cy="10" r="3.5" className="droplet" />
            </g>
            <g className="droplet-orbit orbit-2">
              <circle cx="60" cy="24" r="2.5" className="droplet droplet-2" />
            </g>
            <g className="droplet-orbit orbit-3">
              <circle cx="60" cy="38" r="2" className="droplet droplet-3" />
            </g>
          </svg>
        </div>

        <p className="chef-hat-message">{loadingMessage}</p>

        <div className="chef-dots" aria-hidden="true">
          <span className="chef-dot dot-1" />
          <span className="chef-dot dot-2" />
          <span className="chef-dot dot-3" />
        </div>
      </div>
    </div>
  );
}

