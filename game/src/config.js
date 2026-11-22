// Tuning for Ember Pact: one place holds every number the combat, map and
// shop screens read, so balance changes never scatter across files.
export const CONFIG = {
  playerMaxHp: 68,
  startGold: 70,
  startEnergy: 3,
  handSize: 5,
  handMax: 10,
  acts: 3,
  mapRows: 5,
  bossHp: [46, 62, 84],
  battleGold: [14, 26],
  eliteGold: [30, 48],
  shopCardPrice: [42, 68],
  shopRelicPrice: [120, 160],
  removeCardPrice: 75,
  restHeal: 0.3,
  cardRewardChoices: 3,
  scorePerFloor: 10,
  scorePerKill: 15,
  scorePerGold: 1,
};

// The four suits of Ember Pact. Each suit is told apart by colour AND shape,
// never by text alone, so a card stays legible at thumbnail size.
export const SUITS = {
  ember: { name: 'Ember', glyph: '▲', color: '#e5484d', dark: '#7f1d1d', text: '#ffd9d0' },
  frost: { name: 'Frost', glyph: '◆', color: '#38bdf8', dark: '#0c4a6e', text: '#dff3ff' },
  thorn: { name: 'Thorn', glyph: '✿', color: '#4ade80', dark: '#14532d', text: '#dcfce7' },
  gale: { name: 'Gale', glyph: '●', color: '#c084fc', dark: '#581c87', text: '#f3e8ff' },
};

export const STATUS = {
  burn: { name: 'Burn', glyph: '🔥', color: '#f97316', tip: 'Takes damage at the start of its turn.' },
  chill: { name: 'Chill', glyph: '❄', color: '#7dd3fc', tip: 'Attack power reduced while chilled.' },
  weak: { name: 'Weak', glyph: '↓', color: '#a78bfa', tip: 'Deals 25% less damage.' },
  vulnerable: { name: 'Vulnerable', glyph: '◎', color: '#f472b6', tip: 'Takes 50% more damage.' },
  strength: { name: 'Strength', glyph: '💪', color: '#fbbf24', tip: 'Adds damage to every attack.' },
  thorns: { name: 'Thorns', glyph: '🌵', color: '#34d399', tip: 'Returns damage when attacked.' },
  block: { name: 'Block', glyph: '🛡', color: '#94a3b8', tip: 'Absorbs damage until the turn ends.' },
};
