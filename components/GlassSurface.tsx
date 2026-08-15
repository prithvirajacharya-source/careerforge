import type { ElementType, HTMLAttributes, ReactNode } from "react";

type GlassSurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  tone?: "primary" | "subtle" | "elevated";
  interactive?: boolean;
};

export default function GlassSurface({
  as: Component = "div",
  children,
  className = "",
  tone = "primary",
  interactive = false,
  ...props
}: GlassSurfaceProps) {
  const toneClass = tone === "elevated" ? "glass-elevated" : tone === "subtle" ? "glass-subtle" : "glass-surface";
  return (
    <Component
      className={`${toneClass}${interactive ? " glass-hover" : ""} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
