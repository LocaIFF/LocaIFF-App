import React, { useCallback, useRef } from "react";
import clsx from "clsx";

function RippleButton({ children, className, onClick, ...props }) {
  const containerRef = useRef(null);

  const handleClick = useCallback(
    (event) => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const circle = document.createElement("span");
        circle.className = "ripple-circle";
        circle.style.width = circle.style.height = `${size}px`;
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;

        container.appendChild(circle);
        setTimeout(() => circle.remove(), 700);
      }
      onClick?.(event);
    },
    [onClick]
  );

  return (
    <button
      ref={containerRef}
      className={clsx("ripple-container", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default React.memo(RippleButton);
