import React from "react";
import clsx from "clsx";

const GlassSurface = React.forwardRef(function GlassSurface(
  { as: Tag = "div", className, children, rounded = "3xl", ...props },
  ref
) {
  return (
    <Tag
      ref={ref}
      className={clsx("glass-surface", `rounded-${rounded}`, className)}
      {...props}
    >
      {children}
    </Tag>
  );
});

export default React.memo(GlassSurface);
