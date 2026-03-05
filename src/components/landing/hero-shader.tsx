"use client"

import { ReactShaderToy } from "@/components/agents-ui/react-shader-toy"

const HERO_SHADER = `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float t = iTime * 0.15;

    // Subtle animated mesh gradient
    vec3 col1 = vec3(0.06, 0.02, 0.15); // deep purple-black
    vec3 col2 = vec3(0.12, 0.04, 0.25); // dark violet
    vec3 col3 = vec3(0.02, 0.06, 0.18); // dark blue
    vec3 col4 = vec3(0.08, 0.01, 0.12); // near black

    // Organic flowing noise via sine combinations
    float n1 = sin(uv.x * 3.0 + t) * cos(uv.y * 2.5 - t * 0.7) * 0.5 + 0.5;
    float n2 = sin(uv.y * 4.0 - t * 0.8) * cos(uv.x * 3.5 + t * 0.5) * 0.5 + 0.5;
    float n3 = sin((uv.x + uv.y) * 2.0 + t * 0.6) * 0.5 + 0.5;

    // Blend gradients
    vec3 color = mix(col1, col2, n1);
    color = mix(color, col3, n2 * 0.6);
    color = mix(color, col4, n3 * 0.3);

    // Add subtle glow orbs
    float d1 = length(uv - vec2(0.3 + sin(t) * 0.15, 0.6 + cos(t * 0.7) * 0.1));
    float d2 = length(uv - vec2(0.7 + cos(t * 0.8) * 0.12, 0.4 + sin(t * 0.6) * 0.15));

    color += vec3(0.15, 0.05, 0.25) * smoothstep(0.4, 0.0, d1);
    color += vec3(0.05, 0.08, 0.2) * smoothstep(0.35, 0.0, d2);

    // Slight vignette
    float vig = 1.0 - length((uv - 0.5) * 1.2) * 0.5;
    color *= vig;

    fragColor = vec4(color, 1.0);
}
`

export function HeroShader() {
  return (
    <div className="absolute inset-0 opacity-70 dark:opacity-100">
      <ReactShaderToy
        fs={HERO_SHADER}
        devicePixelRatio={typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1}
        style={{ width: "100%", height: "100%" }}
      />
      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
    </div>
  )
}
