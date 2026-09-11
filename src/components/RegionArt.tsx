import type { ReactElement } from 'react'
import type { RegionId } from '@/model/types'

/**
 * Dekorativní ilustrace oblasti — vlastní SVG, žádná fotografie.
 * Záměrně stylizované, aby nikdy nevypadalo jako dokumentační snímek
 * konkrétního hotelu nebo vyhlídky. Fotky by znamenaly licenční evidenci
 * a offline balíček navíc; tohle je vektor, váží nic a funguje bez sítě.
 */
export function RegionArt({ region, className }: { region: RegionId; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`sky-${region}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      <rect width="400" height="120" fill={`url(#sky-${region})`} />
      {ART[region]}
    </svg>
  )
}

const L1 = { fill: 'currentColor', opacity: 0.16 }
const L2 = { fill: 'currentColor', opacity: 0.26 }
const L3 = { fill: 'currentColor', opacity: 0.42 }
const LINE = { stroke: 'currentColor', fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const ART: Record<RegionId, ReactElement> = {
  // Hanoj — jezero, silueta města, strom
  hanoi: (
    <g>
      <circle cx="330" cy="30" r="15" {...L2} />
      <path d="M0 92h400v28H0z" {...L2} />
      <path d="M0 92c30-2 42-14 70-14s38 12 66 12 44-16 74-16 46 18 76 18 66-8 114-6v6H0z" {...L1} />
      <g {...L3}>
        <path d="M20 92V64h16v28zM44 92V52h12v40zM64 92V72h20v20zM300 92V58h14v34zM320 92V70h10v22z" />
        <path d="M120 92V60l14-12 14 12v32z" />
        <path d="M170 92V72h26v20zM204 92V66h10v26z" />
      </g>
      <g {...LINE} strokeWidth="2.4" opacity="0.5">
        <path d="M250 92V70" />
        <path d="M250 74c-9 0-14-6-14-12s7-9 14-3c7-6 14-3 14 3s-5 12-14 12z" />
      </g>
    </g>
  ),
  // Hà Giang — ostré vápencové kopce a silnice
  'ha-giang': (
    <g>
      <path d="M0 120V70l40-34 34 30 30-26 38 34 34-30 46 42 40-34 50 44 88-32v66z" {...L1} />
      <path d="M0 120V88l46-30 38 32 36-24 42 34 44-28 52 38 44-26 98 18v18z" {...L2} />
      <path d="M0 120v-14l60-16 50 18 46-12 56 20 52-14 64 16 72-8v10z" {...L3} />
      <path d="M-4 118c60-10 70-28 130-26s86 22 150 12 92-18 128-22" {...LINE} strokeWidth="2.6" strokeDasharray="7 8" opacity="0.55" />
    </g>
  ),
  'ha-giang-loop': (
    <g>
      <path d="M0 120V62l36-30 30 34 34-38 40 44 30-34 44 40 38-30 56 48 92-34v58z" {...L1} />
      <path d="M0 120V86l44-32 34 34 40-26 38 32 48-30 46 38 52-26 98 24v20z" {...L2} />
      <path d="M0 120v-18l66-14 44 18 52-10 48 18 58-12 62 14 70-6v10z" {...L3} />
      <path d="M-6 114c54-4 62-24 118-24s76 24 136 16 94-20 158-24" {...LINE} strokeWidth="2.8" strokeDasharray="6 9" opacity="0.6" />
    </g>
  ),
  // Sa Pa — rýžové terasy a vrchol v mlze
  sapa: (
    <g>
      <path d="M0 120V58l58-38 62 48 44-28 66 46 52-32 118 42v24z" {...L1} />
      <g {...LINE} strokeWidth="2.2" opacity="0.34">
        <path d="M0 62h130M20 54h120M46 46h102M72 38h84" />
      </g>
      <path d="M0 120V84c52-14 74 10 126 2s76-20 128-10 92 18 146 10v34z" {...L2} />
      <g {...LINE} strokeWidth="2.3" opacity="0.5">
        <path d="M0 92c52-12 74 10 126 2s76-18 128-8 92 16 146 8" />
        <path d="M0 102c52-10 74 10 126 2s76-16 128-6 92 14 146 6" />
        <path d="M0 112c52-8 74 10 126 2s76-14 128-4 92 12 146 4" />
      </g>
      <path d="M0 120v-6c60-8 74 8 130 2s78-14 132-6 86 12 138 6v4z" {...L3} />
    </g>
  ),
  // Vlak — koleje a kopce
  train: (
    <g>
      <path d="M0 120V76l54-26 52 30 50-24 58 30 54-26 62 30 70-20v30z" {...L1} />
      <path d="M0 120V96l70-14 62 12 60-10 66 14 62-10 80 8v24z" {...L2} />
      <g {...LINE} strokeWidth="2.6" opacity="0.55">
        <path d="M0 108h400M0 116h400" />
      </g>
      <g {...L3}>
        {Array.from({ length: 17 }, (_, i) => (
          <rect key={i} x={i * 24 + 4} y="104" width="5" height="16" rx="1.5" />
        ))}
      </g>
    </g>
  ),
  // Ninh Bình — krasové věže nad vodou a loďka
  'ninh-binh': (
    <g>
      <path d="M40 96V52c0-14 8-24 18-24s18 10 18 24v44zM120 96V40c0-16 10-26 22-26s22 10 22 26v56zM210 96V58c0-13 8-22 17-22s17 9 17 22v38zM290 96V46c0-15 9-25 20-25s20 10 20 25v50z" {...L1} />
      <path d="M76 96V62c0-11 7-19 15-19s15 8 15 19v34zM176 96V54c0-12 7-20 16-20s16 8 16 20v42zM252 96V66c0-10 6-17 13-17s13 7 13 17v30zM336 96V60c0-12 7-20 16-20s16 8 16 20v36z" {...L2} />
      <path d="M0 96h400v24H0z" {...L2} />
      <g {...LINE} strokeWidth="2.2" opacity="0.42">
        <path d="M20 106c14 0 14 5 28 5s14-5 28-5M120 112c14 0 14 5 28 5s14-5 28-5M250 104c14 0 14 5 28 5s14-5 28-5" />
      </g>
      <g {...L3}>
        <path d="M180 104h44l-6 10h-32z" />
      </g>
      <g {...LINE} strokeWidth="2.4" opacity="0.6">
        <path d="M196 104V92M196 92l14 6-14 4" />
      </g>
    </g>
  ),
  // Cát Bà — zátoka s ostrůvky a lodí
  'cat-ba': (
    <g>
      <path d="M24 88V56c0-12 7-20 15-20s15 8 15 20v32zM96 88V46c0-14 8-23 18-23s18 9 18 23v42zM300 88V50c0-13 8-21 17-21s17 8 17 21v38zM358 88V62c0-10 6-16 13-16s13 6 13 16v26z" {...L1} />
      <path d="M60 88V62c0-10 6-17 13-17s13 7 13 17v26zM146 88V56c0-12 7-19 15-19s15 7 15 19v32zM258 88V60c0-11 6-18 14-18s14 7 14 18v28z" {...L2} />
      <path d="M0 88h400v32H0z" {...L2} />
      <g {...LINE} strokeWidth="2.3" opacity="0.45">
        <path d="M0 100c18 0 18 5 36 5s18-5 36-5 18 5 36 5 18-5 36-5M220 96c18 0 18 5 36 5s18-5 36-5 18 5 36 5 18-5 36-5M0 112c18 0 18 5 36 5s18-5 36-5 18 5 36 5 18-5 36-5" />
      </g>
      <g {...L3}>
        <path d="M176 98h56l-8 12h-40z" />
        <path d="M196 98V78h22l-22-4z" />
      </g>
    </g>
  ),
  transit: (
    <g>
      <path d="M0 120V82l60-24 58 26 56-22 62 26 58-22 106 20v34z" {...L1} />
      <path d="M0 120V98l74-12 60 10 62-8 66 12 66-8 72 6v22z" {...L2} />
      <path d="M-4 118c60-6 70-18 130-18s86 16 150 10 92-12 128-14" {...LINE} strokeWidth="2.8" strokeDasharray="8 9" opacity="0.55" />
    </g>
  ),
}
