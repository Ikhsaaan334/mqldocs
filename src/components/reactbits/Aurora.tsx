import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl'

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorDeep;
uniform vec3 uColorMain;
uniform vec3 uColorSoft;
uniform float uAmplitude;
varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.045;

  float n1 = snoise(vec2(uv.x * 1.6 + t, uv.y * 1.1 - t * 0.6));
  float n2 = snoise(vec2(uv.x * 3.1 - t * 1.4, uv.y * 2.2 + t * 0.4));
  float n3 = snoise(vec2(uv.x * 0.7 + t * 0.3, uv.y * 0.5 + t * 0.2));

  float curtain =
      uv.y * 1.15
    + n1 * 0.20 * uAmplitude
    + n2 * 0.12 * uAmplitude
    + n3 * 0.09 * uAmplitude;

  float bandMain = smoothstep(0.18, 0.85, curtain) * smoothstep(1.65, 0.85, curtain);
  float bandSoft = smoothstep(0.02, 0.72, curtain) * smoothstep(1.42, 0.6, curtain);
  float bandDeep = smoothstep(1.3, 0.15, curtain) * smoothstep(-0.1, 0.5, curtain);

  float rays = snoise(vec2(uv.x * 8.5 + t * 2.2, uv.y * 0.4)) * 0.5 + 0.5;
  rays = 0.62 + rays * 0.55;

  vec3 col = vec3(0.0);
  col += uColorMain * bandMain * 0.60;
  col += uColorSoft * bandSoft * 0.32;
  col += uColorDeep * bandDeep * 0.26;
  col *= rays;

  float fadeBottom = smoothstep(0.0, 0.24, uv.y);
  float fadeTop = smoothstep(1.0, 0.86, uv.y);
  float energy = (bandMain * 0.9 + bandSoft * 0.45) * fadeBottom * fadeTop;

  col *= fadeBottom * fadeTop;
  fragColor = vec4(col, clamp(energy * 1.15, 0.0, 1.0));
}
`

interface AuroraProps {
  amplitude?: number
  className?: string
}

export default function Aurora({ amplitude = 1.1, className = '' }: AuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: Renderer | null = null
    let rafId = 0
    let disposed = false

    const init = () => {
      try {
        renderer = new Renderer({ alpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio, 1.75) })
      } catch {
        return // WebGL unavailable — static CSS fallback stays visible
      }
      const gl = renderer.gl
      gl.clearColor(0, 0, 0, 0)

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Vec2(1, 1) },
          uColorDeep: { value: [0.161, 0.11, 0.404] },   // #292C67-ish deep violet
          uColorMain: { value: [0.545, 0.361, 0.965] },  // #8B5CF6 electric violet
          uColorSoft: { value: [0.769, 0.71, 0.992] },   // #C4B5FD soft lavender
          uAmplitude: { value: amplitude }
        }
      })

      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = container
        renderer?.setSize(w, h)
        ;(program.uniforms.uResolution.value as Vec2).set(w, h)
      }
      window.addEventListener('resize', resize)
      resize()

      container.appendChild(gl.canvas)

      const start = performance.now()
      const loop = (now: number) => {
        if (disposed) return
        program.uniforms.uTime.value = (now - start) * 0.001
        renderer?.render({ scene: mesh })
        rafId = requestAnimationFrame(loop)
      }
      rafId = requestAnimationFrame(loop)

      return () => window.removeEventListener('resize', resize)
    }

    const removeResize = init() ?? (() => {})

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      removeResize()
      if (renderer) {
        const canvas = renderer.gl.canvas
        canvas.parentNode?.removeChild(canvas)
        renderer.gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    }
  }, [amplitude])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(139,92,246,0.16), transparent 65%)'
      }}
    />
  )
}
