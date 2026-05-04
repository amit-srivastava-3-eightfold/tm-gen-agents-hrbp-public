/**
 * Local wave-variant background for the Career Hub hero.
 *
 * The design system used to expose `wavesVariant` on `ProductBackground`,
 * but a recent talent-forge sync removed it. We keep the original wave SVGs
 * here so Sarah Culhane's persona pages still render the wave hero on
 * Vercel without re-pinning the DS.
 */
import type { ReactNode } from 'react'

export type WaveVariant = 'profile' | 'default'

const defaultSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="292" viewBox="0 0 1440 292" fill="none"><g clip-path="url(#ef_wave_def)"><rect width="1440" height="292" fill="white"/><path d="M 650,12 C 800,-5 980,40 1140,25 C 1280,12 1380,42 1440,48 L 1440,90 C 1380,84 1280,54 1140,67 C 980,82 800,37 650,54 Z" fill="#2DB3C7" opacity="0.9"/><path d="M 720,80 C 870,58 1050,102 1190,88 C 1330,74 1400,108 1440,115 L 1440,158 C 1400,151 1330,121 1190,135 C 1050,149 870,105 720,126 Z" fill="#F29D31" opacity="0.85"/><path d="M 580,144 C 730,120 920,164 1070,150 C 1220,136 1360,168 1440,175 L 1440,218 C 1360,211 1220,179 1070,193 C 920,207 730,163 580,187 Z" fill="#C15151" opacity="0.85"/><path d="M 760,207 C 900,186 1060,222 1200,210 C 1320,200 1400,228 1440,234 L 1440,272 C 1400,266 1320,242 1200,252 C 1060,264 900,228 760,247 Z" fill="#A9B0F5" opacity="0.80"/><path d="M 860,258 C 1000,242 1140,268 1280,258 C 1360,252 1420,270 1440,274 L 1440,292 L 860,292 Z" fill="#FFCD78" opacity="0.75"/></g><defs><clipPath id="ef_wave_def"><rect width="1440" height="292" fill="white"/></clipPath></defs></svg>'

const profileSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="540" viewBox="0 0 1440 540" fill="none"><g clip-path="url(#ef_wave_prof)"><rect width="1440" height="540" fill="white"/><path d="M 600,22 C 780,2 1000,55 1180,38 C 1320,24 1400,56 1440,65 L 1440,130 C 1400,121 1320,89 1180,103 C 1000,119 780,66 600,85 Z" fill="#2DB3C7" opacity="0.9"/><path d="M 680,142 C 860,114 1080,168 1250,150 C 1360,136 1418,172 1440,180 L 1440,242 C 1418,234 1360,198 1250,216 C 1080,234 860,180 680,207 Z" fill="#F29D31" opacity="0.85"/><path d="M 550,260 C 730,232 960,290 1140,270 C 1300,252 1400,286 1440,295 L 1440,368 C 1400,359 1300,325 1140,343 C 960,363 730,305 550,332 Z" fill="#C15151" opacity="0.85"/><path d="M 640,380 C 820,354 1060,406 1240,388 C 1360,374 1418,405 1440,413 L 1440,480 C 1418,472 1360,441 1240,455 C 1060,473 820,421 640,446 Z" fill="#A9B0F5" opacity="0.80"/><path d="M 780,478 C 960,456 1140,492 1300,479 C 1380,472 1428,488 1440,492 L 1440,540 L 780,540 Z" fill="#FFCD78" opacity="0.75"/></g><defs><clipPath id="ef_wave_prof"><rect width="1440" height="540" fill="white"/></clipPath></defs></svg>'

export function waveArtDataUrl(variant: WaveVariant): string {
  const svg = variant === 'profile' ? profileSvg : defaultSvg
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

interface WaveBackgroundProps {
  /** profile = 540px hero (Home, Profile). default = 292px page header. */
  variant?: WaveVariant
  className?: string
  children?: ReactNode
}

export function WaveBackground({ variant = 'profile', className, children }: WaveBackgroundProps) {
  return (
    <div className={`relative isolate w-full overflow-hidden${className ? ` ${className}` : ''}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 min-h-full min-w-full"
        style={{
          backgroundImage: waveArtDataUrl(variant),
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
          backgroundSize: '100% auto',
        }}
      />
      {children}
    </div>
  )
}
