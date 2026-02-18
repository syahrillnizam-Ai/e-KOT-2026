
import { SportEvent, EventType, EventGroup } from './types';

export const SPORT_EVENTS: SportEvent[] = [
  // INDIVIDU L1 & P1 - PADANG
  { id: 'lp-l1', name: 'Lontar Peluru L1', type: EventType.INDIVIDUAL, category: 'L1', group: EventGroup.FIELD },
  { id: 'lp-p1', name: 'Lontar Peluru P1', type: EventType.INDIVIDUAL, category: 'P1', group: EventGroup.FIELD },
  { id: 'lj-l1', name: 'Lompat Jauh L1', type: EventType.INDIVIDUAL, category: 'L1', group: EventGroup.FIELD },
  { id: 'lj-p1', name: 'Lompat Jauh P1', type: EventType.INDIVIDUAL, category: 'P1', group: EventGroup.FIELD },
  
  // BALAPAN L1 & P1
  { id: '100m-l1', name: '100M L1', type: EventType.INDIVIDUAL, category: 'L1', group: EventGroup.TRACK },
  { id: '100m-p1', name: '100M P1', type: EventType.INDIVIDUAL, category: 'P1', group: EventGroup.TRACK },
  { id: '200m-l1', name: '200M L1', type: EventType.INDIVIDUAL, category: 'L1', group: EventGroup.TRACK },
  { id: '200m-p1', name: '200M P1', type: EventType.INDIVIDUAL, category: 'P1', group: EventGroup.TRACK },

  // INDIVIDU L2 & P2 - PADANG
  { id: 'lp-l2', name: 'Lontar Peluru L2', type: EventType.INDIVIDUAL, category: 'L2', group: EventGroup.FIELD },
  { id: 'lp-p2', name: 'Lontar Peluru P2', type: EventType.INDIVIDUAL, category: 'P2', group: EventGroup.FIELD },
  { id: 'lj-l2', name: 'Lompat Jauh L2', type: EventType.INDIVIDUAL, category: 'L2', group: EventGroup.FIELD },
  { id: 'lj-p2', name: 'Lompat Jauh P2', type: EventType.INDIVIDUAL, category: 'P2', group: EventGroup.FIELD },
  
  // BALAPAN L2 & P2
  { id: '100m-t3-l2', name: '100M Tahun 3 L2', type: EventType.INDIVIDUAL, category: 'L2', group: EventGroup.TRACK },
  { id: '100m-t3-p2', name: '100M Tahun 3 P2', type: EventType.INDIVIDUAL, category: 'P2', group: EventGroup.TRACK },
  { id: '100m-t4-l2', name: '100M Tahun 4 L2', type: EventType.INDIVIDUAL, category: 'L2', group: EventGroup.TRACK },
  { id: '100m-t4-p2', name: '100M Tahun 4 P2', type: EventType.INDIVIDUAL, category: 'P2', group: EventGroup.TRACK },

  // INDIVIDU L3 & P3 - BALAPAN SAHAJA
  { id: '50m-t1-l3', name: '50M Tahun 1 L3', type: EventType.INDIVIDUAL, category: 'L3', group: EventGroup.TRACK },
  { id: '50m-t1-p3', name: '50M Tahun 1 P3', type: EventType.INDIVIDUAL, category: 'P3', group: EventGroup.TRACK },
  { id: '50m-t2-l3', name: '50M Tahun 2 L3', type: EventType.INDIVIDUAL, category: 'L3', group: EventGroup.TRACK },
  { id: '50m-t2-p3', name: '50M Tahun 2 P3', type: EventType.INDIVIDUAL, category: 'P3', group: EventGroup.TRACK },

  // PPKI - PADANG
  { id: 'lp-ppki-l', name: 'Lontar Peluru PPKI L', type: EventType.INDIVIDUAL, category: 'PPKI L', group: EventGroup.FIELD },
  { id: 'lp-ppki-p', name: 'Lontar Peluru PPKI P', type: EventType.INDIVIDUAL, category: 'PPKI P', group: EventGroup.FIELD },
  { id: 'lj-ppki-l', name: 'Lompat Jauh PPKI L', type: EventType.INDIVIDUAL, category: 'PPKI L', group: EventGroup.FIELD },
  { id: 'lj-ppki-p', name: 'Lompat Jauh PPKI P', type: EventType.INDIVIDUAL, category: 'PPKI P', group: EventGroup.FIELD },
  
  // PPKI - BALAPAN
  { id: '50m-ppki-t1-l', name: '50M PPKI Tahap 1 L', type: EventType.INDIVIDUAL, category: 'PPKI L', group: EventGroup.TRACK },
  { id: '50m-ppki-t1-p', name: '50M PPKI Tahap 1 P', type: EventType.INDIVIDUAL, category: 'PPKI P', group: EventGroup.TRACK },
  { id: '100m-ppki-t2-l', name: '100M PPKI Tahap 2 (L)', type: EventType.INDIVIDUAL, category: 'PPKI L', group: EventGroup.TRACK },
  { id: '100m-ppki-t2-p', name: '100M PPKI Tahap 2 (P)', type: EventType.INDIVIDUAL, category: 'PPKI P', group: EventGroup.TRACK },
  { id: '200m-ppki-mix', name: '200M PPKI Mix', type: EventType.INDIVIDUAL, category: 'PPKI Mix', group: EventGroup.TRACK },

  // KUMPULAN - BALAPAN
  { id: '4x50m-l3', name: '4x50M L3', type: EventType.TEAM, category: 'L3', group: EventGroup.TRACK },
  { id: '4x50m-p3', name: '4x50M P3', type: EventType.TEAM, category: 'P3', group: EventGroup.TRACK },
  { id: '4x100m-l2', name: '4x100M L2', type: EventType.TEAM, category: 'L2', group: EventGroup.TRACK },
  { id: '4x100m-p2', name: '4x100M P2', type: EventType.TEAM, category: 'P2', group: EventGroup.TRACK },
  { id: '4x100m-l1', name: '4x100M L1', type: EventType.TEAM, category: 'L1', group: EventGroup.TRACK },
  { id: '4x100m-p1', name: '4x100M P1', type: EventType.TEAM, category: 'P1', group: EventGroup.TRACK },
  { id: '4x100m-ppki-mix', name: '4x100M PPKI Mix', type: EventType.TEAM, category: 'PPKI Mix', group: EventGroup.TRACK },
  
  // TERBUKA - BALAPAN
  { id: '4x200m-terbuka-l', name: '4x200M Terbuka L', type: EventType.TEAM, category: 'Terbuka L', group: EventGroup.TRACK },
  { id: '4x200m-terbuka-p', name: '4x200M Terbuka P', type: EventType.TEAM, category: 'Terbuka P', group: EventGroup.TRACK },
];
