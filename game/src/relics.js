// Relics: passive treasures that bend the rules of a run. One per elite or
// treasure node, plus the shop's stock. Each relic is a hook the combat and
// run code reads by id.
export const RELICS = {
  ember_charm: { name: 'Ember Charm', glyph: '🧿', text: 'Start each combat with +1 Energy on turn 1.', rarity: 'common' },
  frost_sigil: { name: 'Frost Sigil', glyph: '❄️', text: 'Start each combat with 6 Block.', rarity: 'common' },
  thorn_vest: { name: 'Thorn Vest', glyph: '🦺', text: 'Gain 2 Thorns at the start of combat.', rarity: 'common' },
  gale_boots: { name: 'Gale Boots', glyph: '🥾', text: 'Draw +1 card on turn 1.', rarity: 'common' },
  golden_pact: { name: 'Golden Pact', glyph: '🪙', text: 'Gain +12 Gold after every battle.', rarity: 'common' },
  bloodstone: { name: 'Bloodstone', glyph: '🩸', text: 'Heal 4 HP after every battle.', rarity: 'uncommon' },
  storm_core: { name: 'Storm Core', glyph: '⚡', text: 'Your first card each turn costs 0.', rarity: 'uncommon' },
  iron_pact: { name: 'Iron Pact', glyph: '🛡️', text: 'Gain +8 Max HP when picked up.', rarity: 'uncommon' },
  phoenix_feather: { name: 'Phoenix Feather', glyph: '🪶', text: 'Once per run, survive a fatal blow with 1 HP.', rarity: 'rare' },
  crown_of_embers: { name: 'Crown of Embers', glyph: '👑', text: 'Ember cards deal +3 damage.', rarity: 'rare' },
};

export function randomRelic(rng, owned) {
  const pool = Object.keys(RELICS).filter((id) => !owned.includes(id));
  if (!pool.length) return null;
  return rng.pick(pool);
}
