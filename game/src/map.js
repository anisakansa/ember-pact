// The map: a branching path of nodes through each act. Every act is five
// rows of choices plus a boss at the end; a node is a battle, an elite, a
// shop, a rest site, or a treasure. The player picks one node per row.
import { CONFIG } from './config.js';

const ROW_TYPES = [
  ['battle', 'battle', 'battle'],
  ['battle', 'battle', 'elite'],
  ['shop', 'battle', 'rest'],
  ['battle', 'elite', 'treasure'],
  ['rest', 'shop', 'battle'],
];

export function buildMap(act, rng) {
  const rows = ROW_TYPES.map((types) => {
    const shuffled = types.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.map((type) => ({ type, done: false, available: false }));
  });
  rows[0].forEach((n) => { n.available = true; });
  return { act, rows, boss: { type: 'boss', done: false, available: false }, rowsTotal: CONFIG.mapRows };
}

export function nodeLabel(type) {
  return {
    battle: '⚔️ Battle',
    elite: '💀 Elite',
    shop: '🛒 Shop',
    rest: '🔥 Rest',
    treasure: '💎 Treasure',
    boss: '👑 Boss',
  }[type] || type;
}

export function nodeTip(type) {
  return {
    battle: 'Fight an enemy. Win gold and a new card.',
    elite: 'A tougher foe — but it guards a relic.',
    shop: 'Spend gold on cards, relics, or card removal.',
    rest: 'Heal, or upgrade a card in your deck.',
    treasure: 'A free relic, yours for the taking.',
    boss: 'Defeat the boss to open the next act.',
  }[type] || '';
}

// Mark the chosen node done and open the next row (or the boss).
export function advanceMap(map, row, index) {
  map.rows[row][index].done = true;
  map.rows[row].forEach((n) => { n.available = false; });
  if (row + 1 < map.rows.length) {
    map.rows[row + 1].forEach((n) => { n.available = true; });
  } else {
    map.boss.available = true;
  }
}
