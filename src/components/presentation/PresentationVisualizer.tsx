import type { CSSProperties } from "react";

const barHeights = [9, 15, 24, 34, 42, 34, 24, 15, 9];

export default function PresentationVisualizer({ active }: { active: boolean }) {
  return (
    <div className={`ptp-visualizer ${active ? "is-active" : ""}`} aria-hidden="true">
      <div className="ptp-orb" />
      <div className="ptp-wave">
        {barHeights.map((height, index) => (
          <span
            key={index}
            style={{
              height,
              "--ptp-wave-delay": `${Math.abs(index - 4) * -0.12}s`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
