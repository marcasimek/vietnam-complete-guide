import type { Region } from '@/model/types'

export const regions: Region[] = [
  {
    id: 'hanoi',
    name: 'Hanoj',
    localName: 'Hà Nội',
    blurb: 'Startovní a cílová základna. Staré město, kafe, street food a poslední nákupy.',
    accent: 'var(--region-hanoi)',
    center: { lat: 21.0333, lng: 105.85, precision: 'area-centroid', searchQuery: 'Hoàn Kiếm, Hà Nội' },
  },
  {
    id: 'ha-giang',
    name: 'Hà Giang',
    localName: 'Hà Giang',
    blurb: 'Město pod horami. Základna před loopem i po něm, úschova velkých batohů.',
    accent: 'var(--region-ha-giang)',
    center: { lat: 22.8233, lng: 104.9836, precision: 'area-centroid', searchQuery: 'Hà Giang city, Vietnam' },
  },
  {
    id: 'ha-giang-loop',
    name: 'Hà Giang Loop',
    blurb: 'Čtyři dny mezi vápencovými věžemi: Quản Bạ, Đồng Văn, Mã Pí Lèng, Du Già.',
    accent: 'var(--region-ha-giang-loop)',
    center: { lat: 23.2, lng: 105.25, precision: 'area-centroid', searchQuery: 'Đồng Văn Karst Plateau Geopark' },
  },
  {
    id: 'sapa',
    name: 'Sa Pa',
    localName: 'Sa Pa',
    blurb: 'Údolí Mường Hoa, rýžové terasy, treky mezi vesnicemi a mlha nad Fansipanem.',
    accent: 'var(--region-sapa)',
    center: { lat: 22.3364, lng: 103.8438, precision: 'area-centroid', searchQuery: 'Sa Pa, Lào Cai, Vietnam' },
  },
  {
    id: 'train',
    name: 'Noční vlak',
    blurb: 'Lào Cai → Hanoj. Jedna noc na kolejích místo hotelu.',
    accent: 'var(--region-train)',
    center: { lat: 22.4, lng: 103.97, precision: 'area-centroid', searchQuery: 'Lào Cai railway station' },
  },
  {
    id: 'ninh-binh',
    name: 'Ninh Bình',
    localName: 'Tam Cốc',
    blurb: 'Suchá zátoka: vápencové věže, loďky na řece, kola mezi poli a bazén.',
    accent: 'var(--region-ninh-binh)',
    center: { lat: 20.2192, lng: 105.9375, precision: 'area-centroid', searchQuery: 'Tam Cốc, Ninh Bình' },
  },
  {
    id: 'cat-ba',
    name: 'Cát Bà',
    blurb: 'Ostrov, zátoka Lan Hạ, kajaky, laguny a mořské jídlo.',
    accent: 'var(--region-cat-ba)',
    center: { lat: 20.7281, lng: 107.0483, precision: 'area-centroid', searchQuery: 'Cát Bà town, Hải Phòng' },
  },
  {
    id: 'transit',
    name: 'Přesun',
    blurb: 'Den strávený převážně na cestě mezi oblastmi.',
    accent: 'var(--region-transit)',
    center: { lat: 21.5, lng: 105.5, precision: 'area-centroid' },
  },
]

export const regionById = new Map(regions.map((r) => [r.id, r]))
