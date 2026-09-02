export interface CityZone {
  id: string;
  name: string;
  description: string;
  coords: { x: number; y: number };
}

export const CITY_ZONES: CityZone[] = [
  {
    id: 'downtown',
    name: 'Downtown Central',
    description: 'Bustling urban center with quick bodegas & hypermarkets',
    coords: { x: 50, y: 50 },
  },
  {
    id: 'west_end',
    name: 'West End & Riverside',
    description: 'Quiet residential district with organic & specialty grocers',
    coords: { x: 22, y: 38 },
  },
  {
    id: 'north_hills',
    name: 'North Hills',
    description: 'Suburban zone with large discount supercenters & wholesale hubs',
    coords: { x: 45, y: 18 },
  },
  {
    id: 'south_district',
    name: 'South Commercial District',
    description: 'Major retail plazas and international supermarkets',
    coords: { x: 75, y: 72 },
  },
  {
    id: 'east_market',
    name: 'East Market Quarter',
    description: 'Historic cultural quarter with farmers markets & spice houses',
    coords: { x: 80, y: 35 },
  },
];
