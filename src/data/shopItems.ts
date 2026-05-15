export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type: 'background' | 'avatar';
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'bg_night',
    name: 'Nocna mapa',
    description: 'Ciemny motyw mapy',
    icon: '🌙',
    cost: 50,
    type: 'background',
  },
  {
    id: 'bg_ocean',
    name: 'Ocean',
    description: 'Błękitny motyw morski',
    icon: '🌊',
    cost: 80,
    type: 'background',
  },
  {
    id: 'bg_jungle',
    name: 'Dżungla',
    description: 'Zielony motyw tropikalny',
    icon: '🌿',
    cost: 80,
    type: 'background',
  },
  {
    id: 'avatar_astronaut',
    name: 'Astronauta',
    description: 'Skóra postaci: kosmonauta',
    icon: '👨‍🚀',
    cost: 100,
    type: 'avatar',
  },
  {
    id: 'avatar_pirate',
    name: 'Pirat',
    description: 'Skóra postaci: pirat',
    icon: '🏴‍☠️',
    cost: 100,
    type: 'avatar',
  },
  {
    id: 'avatar_ninja',
    name: 'Ninja',
    description: 'Skóra postaci: ninja',
    icon: '🥷',
    cost: 150,
    type: 'avatar',
  },
];
