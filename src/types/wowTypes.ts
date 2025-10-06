export type WowClass =
  | 'Death Knight'
  | 'Demon Hunter'
  | 'Druid'
  | 'Evoker'
  | 'Hunter'
  | 'Mage'
  | 'Monk'
  | 'Paladin'
  | 'Priest'
  | 'Rogue'
  | 'Shaman'
  | 'Warlock'
  | 'Warrior';

export const classColors: Record<WowClass, string> = {
  'Death Knight': '#C41E3A',
  'Demon Hunter': '#A330C9',
  'Druid': '#FF7C0A',
  'Evoker': '#33937F',
  'Hunter': '#AAD372',
  'Mage': '#3FC7EB',
  'Monk': '#00FF98',
  'Paladin': '#F48CBA',
  'Priest': '#FFFFFF',
  'Rogue': '#FFF468',
  'Shaman': '#0070DD',
  'Warlock': '#8788EE',
  'Warrior': '#C69B6D',
};

export interface Player {
  id: string;
  name: string;
  class: WowClass;
}

export interface RaidMember {
  id: string; // This is the Player's ID
  status: 'present' | 'absent' | 'missing';
  order: number;
}

// A combination of Player and RaidMember for display purposes
export interface EnrichedRaidMember extends Player, Omit<RaidMember, 'id'> {}

export interface RaidTable {
  id: string;
  name: string;
  members: RaidMember[];
}