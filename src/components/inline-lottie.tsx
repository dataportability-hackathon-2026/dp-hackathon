"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type InlineLottieProps = {
  src: string;
  size?: number;
  className?: string;
};

export function InlineLottie({
  src,
  size = 32,
  className = "",
}: InlineLottieProps) {
  return (
    <span
      className={`inline-flex items-center justify-center align-middle ${className}`}
      style={{ width: size, height: size }}
    >
      <DotLottieReact
        src={src}
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </span>
  );
}
