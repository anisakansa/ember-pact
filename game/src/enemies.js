// The enemies of Ember Pact. Each one telegraphs its next move (its intent),
// so the player can read the fight and counter it — never a blind hit.
// An enemy is a small move table the combat engine steps through.
export const ENEMIES = {
  cinder_imp: {
    name: 'Cinder Imp', glyph: '👺', color: '#f97316', hp: [24, 30],
    moves: [
      { kind: 'attack', dmg: 6, text: 'Scratch' },
      { kind: 'attack', dmg: 8, text: 'Ember Spit' },
      { kind: 'buff', strength: 2, text: 'Fan the Flames' },
    ],
  },
  frost_mite: {
    name: 'Frost Mite', glyph: '🦠', color: '#38bdf8', hp: [22, 28],
    moves: [
      { kind: 'attack', dmg: 5, text: 'Nip' },
      { kind: 'debuff', weak: 1, text: 'Chilling Touch' },
      { kind: 'attack', dmg: 7, text: 'Shard Burst' },
    ],
  },
  thorn_sprout: {
    name: 'Thorn Sprout', glyph: '🌱', color: '#4ade80', hp: [28, 34],
    moves: [
      { kind: 'attack', dmg: 6, text: 'Whip' },
      { kind: 'block', block: 9, text: 'Curl Up' },
      { kind: 'attack', dmg: 9, text: 'Thorn Volley' },
    ],
  },
  gale_wisp: {
    name: 'Gale Wisp', glyph: '🌪️', color: '#c084fc', hp: [20, 26],
    moves: [
      { kind: 'attack', dmg: 4, text: 'Buffet' },
      { kind: 'debuff', vulnerable: 2, text: 'Expose' },
      { kind: 'attack', dmg: 10, text: 'Cyclone' },
    ],
  },
  ash_knight: {
    name: 'Ash Knight', glyph: '⚔️', color: '#ef4444', hp: [44, 50], elite: true,
    moves: [
      { kind: 'attack', dmg: 9, text: 'Cinder Slash' },
      { kind: 'block', block: 12, text: 'Ashen Guard' },
      { kind: 'attack', dmg: 12, text: 'Immolation' },
      { kind: 'buff', strength: 3, text: 'Battle Cry' },
    ],
  },
  tidecaller: {
    name: 'Tidecaller', glyph: '🌊', color: '#0ea5e9', hp: [48, 54], elite: true,
    moves: [
      { kind: 'attack', dmg: 8, text: 'Tidal Lash' },
      { kind: 'debuff', weak: 2, text: 'Drench' },
      { kind: 'attack', dmg: 13, text: 'Crushing Wave' },
      { kind: 'block', block: 10, text: 'Water Veil' },
    ],
  },
  thornmother: {
    name: 'Thornmother', glyph: '🌹', color: '#22c55e', hp: [52, 58], elite: true,
    moves: [
      { kind: 'attack', dmg: 10, text: 'Bramble Grasp' },
      { kind: 'block', block: 14, text: 'Thicket' },
      { kind: 'attack', dmg: 7, text: 'Spore Cloud', weak: 1 },
      { kind: 'buff', strength: 2, text: 'Bloom' },
    ],
  },
  magma_warden: {
    name: 'Magma Warden', glyph: '🗿', color: '#dc2626', hp: [46, 46], boss: true,
    moves: [
      { kind: 'attack', dmg: 10, text: 'Magma Fist' },
      { kind: 'block', block: 14, text: 'Stone Skin' },
      { kind: 'attack', dmg: 15, text: 'Eruption' },
      { kind: 'debuff', vulnerable: 2, text: 'Molten Gaze' },
    ],
  },
  storm_herald: {
    name: 'Storm Herald', glyph: '⛈️', color: '#8b5cf6', hp: [62, 62], boss: true,
    moves: [
      { kind: 'attack', dmg: 11, text: 'Lightning Rod' },
      { kind: 'attack', dmg: 8, text: 'Thunderclap', weak: 1 },
      { kind: 'block', block: 16, text: 'Storm Shield' },
      { kind: 'attack', dmg: 18, text: 'Tempest' },
    ],
  },
  ember_queen: {
    name: 'The Ember Queen', glyph: '👑', color: '#f59e0b', hp: [84, 84], boss: true,
    moves: [
      { kind: 'attack', dmg: 12, text: 'Royal Decree' },
      { kind: 'debuff', vulnerable: 2, text: 'Crown of Embers' },
      { kind: 'attack', dmg: 20, text: 'Crownfire' },
      { kind: 'block', block: 18, text: 'Ember Aegis' },
      { kind: 'buff', strength: 3, text: 'Queen\'s Fury' },
    ],
  },
};

export const ACT_ENEMIES = {
  1: ['cinder_imp', 'frost_mite', 'thorn_sprout', 'gale_wisp'],
  2: ['cinder_imp', 'frost_mite', 'thorn_sprout', 'gale_wisp', 'ash_knight'],
  3: ['ash_knight', 'tidecaller', 'thornmother', 'gale_wisp'],
};
export const ACT_ELITES = { 1: ['ash_knight'], 2: ['tidecaller', 'ash_knight'], 3: ['thornmother', 'tidecaller'] };
export const ACT_BOSSES = { 1: 'magma_warden', 2: 'storm_herald', 3: 'ember_queen' };

// One live enemy, rolled from its definition with the run's seed.
export function spawnEnemy(id, rng) {
  const def = ENEMIES[id];
  const hp = def.hp[0] + Math.floor(rng.next() * (def.hp[1] - def.hp[0] + 1));
  return {
    id, name: def.name, glyph: def.glyph, color: def.color,
    hp, maxHp: hp, block: 0, moveIndex: Math.floor(rng.next() * def.moves.length),
    status: {}, intent: null, elite: !!def.elite, boss: !!def.boss,
  };
}

export function enemyIntent(enemy) {
  const def = ENEMIES[enemy.id];
  return def.moves[enemy.moveIndex % def.moves.length];
}
