export interface ZoneDefinition {
  id: string;
  name: string;
  floor: string;
  sensorCount: number;
  status: 'ok' | 'warn' | 'crit';
  statusLabel: string;
  description: string;
}

export const ALL_ZONES: ZoneDefinition[] = [
  { id: 'lobby_main',  name: 'Main Lobby',          floor: 'Lobby',    sensorCount: 5, status: 'ok',   statusLabel: 'Optimal',       description: 'Entry points and reception desk' },
  { id: 'cellar',      name: 'Wine Cellar Vault',    floor: 'Floor 1',  sensorCount: 2, status: 'ok',   statusLabel: 'Optimal',       description: 'Precision cooling and storage' },
  { id: 'ballroom',    name: 'Grand Ballroom',       floor: 'Floor 2',  sensorCount: 6, status: 'warn', statusLabel: 'High Humidity', description: 'Conference and banquet hall' },
  { id: 'suite_1801',  name: 'Executive Suite 1801', floor: 'Floor 18', sensorCount: 4, status: 'ok',   statusLabel: 'Optimal',       description: 'VIP penthouse environment' },
  { id: 'suite_2204',  name: 'Luxury Suite 2204',    floor: 'Floor 22', sensorCount: 3, status: 'crit', statusLabel: 'CO₂ Spike',     description: 'Premium suite — harbor view' },
  { id: 'suite_2201',  name: 'Luxury Suite 2201',    floor: 'Floor 22', sensorCount: 3, status: 'ok',   statusLabel: 'Optimal',       description: 'Premium suite — west wing' },
];

export const ZONE_SENSORS: Record<string, string[]> = {
  lobby_main:  ['temp', 'humidity', 'motion', 'aq', 'pressure'],
  cellar:      ['temp', 'humidity'],
  ballroom:    ['temp', 'humidity', 'co2', 'motion', 'aq', 'pressure'],
  suite_1801:  ['temp', 'humidity', 'motion', 'aq'],
  suite_2204:  ['temp', 'humidity', 'co2'],
  suite_2201:  ['temp', 'humidity', 'aq'],
};

export const FLOORS = ['Lobby', 'Floor 1', 'Floor 2', 'Floor 18', 'Floor 22'] as const;
