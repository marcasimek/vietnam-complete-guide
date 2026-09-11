import type { Day } from '@/model/types'
import { day20260919, day20260920 } from './hanoi-start'
import { day20260921, day20260922, day20260923, day20260924, day20260925 } from './ha-giang'
import { day20260926 } from './2026-09-26'
import { day20260927, day20260928 } from './sapa-train'
import { day20260929, day20260930, day20261001 } from './ninh-binh'
import { day20261002, day20261003, day20261004, day20261005, day20261006 } from './cat-ba'

/** Všech 18 pobytových dnů v chronologickém pořadí. */
export const days: Day[] = [
  day20260919,
  day20260920,
  day20260921,
  day20260922,
  day20260923,
  day20260924,
  day20260925,
  day20260926,
  day20260927,
  day20260928,
  day20260929,
  day20260930,
  day20261001,
  day20261002,
  day20261003,
  day20261004,
  day20261005,
  day20261006,
]

export const dayByDate = new Map(days.map((d) => [d.date, d]))
