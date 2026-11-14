import { ReactNode } from 'react'

interface GlassSurfaceProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  highlight?: boolean
}

/**
 * ReactBits GlassSurface — permukaan kaca premium: blur, border gradien
 * halus, dan highlight tepi atas.
 */
export default function GlassSurface({
  children,
  className = '',
  style,
  highlight = true
}: GlassSurfaceProps) {
  return (
    <div className={`relative ${className}`} style={style}>
      {/* border gradien */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          padding: '1px',
          background:
            'linear-gradient(160deg, rgba(139,92,246,0.35), rgba(248,250,252,0.08) 35%, rgba(248,250,252,0.04) 60%, rgba(139,92,246,0.22))',
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />
      {/* highlight tepi atas */}
      {highlight && (
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(248,250,252,0.35), transparent)'
          }}
        />
      )}
      {children}
    </div>
  )
}
