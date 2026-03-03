import React, { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface RippleProps extends ComponentPropsWithoutRef<"div"> {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 400,
  mainCircleOpacity = 0.5,
  numCircles = 8,
  className,
  ...props
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none select-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,white,transparent)]",
        className
      )}
      {...props}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 150;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        const borderOpacity = 20 + i * 10;

        return (
          <div
            key={i}
            className={`absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] animate-ripple rounded-full bg-white/15 [--i:${i}]`}
            style={
              {
                width: `${size}px`,
                height: `${size}px`,
                opacity: `${opacity}`,
                animationDelay: animationDelay,
                borderStyle: borderStyle,
                borderWidth: "1.5px",
                borderColor: `rgba(255, 255, 255, ${borderOpacity / 100})`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
});

Ripple.displayName = "Ripple";
