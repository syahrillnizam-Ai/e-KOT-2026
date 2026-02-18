
export enum House {
  BIRU = 'Biru',
  HIJAU = 'Hijau',
  KUNING = 'Kuning',
  MERAH = 'Merah'
}

export enum EventType {
  INDIVIDUAL = 'Individu',
  TEAM = 'Kumpulan'
}

export enum EventGroup {
  TRACK = 'Balapan',
  FIELD = 'Padang',
  SUKANEKA = 'Sukaneka'
}

export interface SportEvent {
  id: string;
  name: string;
  type: EventType;
  category: string;
  group: EventGroup;
}

export interface EventResult {
  eventId: string;
  firstId: string;  // Participant ID
  secondId: string;
  thirdId: string;
  fourthId: string;
}

export interface HouseRankResult {
  first: House | '';
  second: House | '';
  third: House | '';
  fourth: House | '';
}

export type SukanekaResults = Record<string, HouseRankResult>;

export interface Participant {
  id: string;
  name: string;
  house: House;
  participantNumber: string;
  category: string;
  events: string[]; // array of event IDs
}

export interface HouseStandings {
  house: House;
  emasInd: number;
  perakInd: number;
  gangsaInd: number;
  keempatInd: number;
  emasTeam: number;
  perakTeam: number;
  gangsaTeam: number;
  keempatTeam: number;
  sukantara: number;
}

export interface DashboardStats {
  totalParticipants: number;
  houseCounts: Record<House, number>;
}
