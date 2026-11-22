// The card pool of Ember Pact. Every card is data: its suit, cost, type and
// effect numbers live here, and combat.js resolves them. Upgrades raise the
// numbers (or cut the cost) without changing what the card does.
export const CARDS = {
  // ---- Ember: damage now, burn over time ----
  ember_strike: { name: 'Ember Strike', suit: 'ember', cost: 1, type: 'attack', text: 'Deal 6. Apply 2 Burn.', dmg: 6, burn: 2, up: { dmg: 3, burn: 1 } },
  cinder_burst: { name: 'Cinder Burst', suit: 'ember', cost: 2, type: 'attack', text: 'Deal 9. Apply 3 Burn.', dmg: 9, burn: 3, up: { dmg: 4, burn: 1 } },
  wildfire: { name: 'Wildfire', suit: 'ember', cost: 3, type: 'attack', text: 'Deal 13. Apply 5 Burn.', dmg: 13, burn: 5, up: { dmg: 5, burn: 2 } },
  flare: { name: 'Flare', suit: 'ember', cost: 0, type: 'attack', text: 'Deal 3. Apply 1 Burn.', dmg: 3, burn: 1, up: { dmg: 2, burn: 1 } },
  kindle: { name: 'Kindle', suit: 'ember', cost: 1, type: 'skill', text: 'Gain 2 Energy. Draw 1 card.', energy: 2, draw: 1, up: { energy: 1 } },
  burning_soul: { name: 'Burning Soul', suit: 'ember', cost: 1, type: 'power', text: 'Ember cards apply +2 Burn.', power: 'burning_soul', up: { power: 'burning_soul' } },
  // ---- Frost: chill the enemy, hold the line ----
  frostbite: { name: 'Frostbite', suit: 'frost', cost: 1, type: 'attack', text: 'Deal 5. Apply 2 Chill.', dmg: 5, chill: 2, up: { dmg: 3, chill: 1 } },
  ice_shard: { name: 'Ice Shard', suit: 'frost', cost: 0, type: 'attack', text: 'Deal 3. Apply 1 Chill.', dmg: 3, chill: 1, up: { dmg: 2, chill: 1 } },
  glacier: { name: 'Glacier', suit: 'frost', cost: 2, type: 'attack', text: 'Deal 8. Apply 4 Chill.', dmg: 8, chill: 4, up: { dmg: 4, chill: 1 } },
  frost_wall: { name: 'Frost Wall', suit: 'frost', cost: 1, type: 'skill', text: 'Gain 6 Block. Apply 2 Chill.', block: 6, chill: 2, up: { block: 3, chill: 1 } },
  deep_freeze: { name: 'Deep Freeze', suit: 'frost', cost: 2, type: 'skill', text: 'Apply 3 Weak and 3 Chill.', weak: 3, chill: 3, up: { weak: 1, chill: 1 } },
  frozen_core: { name: 'Frozen Core', suit: 'frost', cost: 1, type: 'power', text: 'Chill also gives you 3 Block.', power: 'frozen_core', up: { power: 'frozen_core' } },
  // ---- Thorn: block, heal, and bite back ----
  thorn_lash: { name: 'Thorn Lash', suit: 'thorn', cost: 1, type: 'attack', text: 'Deal 5. Gain 4 Block.', dmg: 5, block: 4, up: { dmg: 3, block: 2 } },
  bramble_jab: { name: 'Bramble Jab', suit: 'thorn', cost: 1, type: 'attack', text: 'Deal 4. Gain 3 Thorns.', dmg: 4, thorns: 3, up: { dmg: 2, thorns: 1 } },
  rootbind: { name: 'Rootbind', suit: 'thorn', cost: 1, type: 'skill', text: 'Gain 8 Block. Heal 3 HP.', block: 8, heal: 3, up: { block: 3, heal: 2 } },
  overgrowth: { name: 'Overgrowth', suit: 'thorn', cost: 2, type: 'skill', text: 'Gain 12 Block. Draw 1 card.', block: 12, draw: 1, up: { block: 4 } },
  mend: { name: 'Mend', suit: 'thorn', cost: 1, type: 'skill', text: 'Heal 7 HP. Draw 1 card.', heal: 7, draw: 1, up: { heal: 3 } },
  thornmail: { name: 'Thornmail', suit: 'thorn', cost: 1, type: 'power', text: 'Gain 4 Thorns.', power: 'thornmail', thorns: 4, up: { power: 'thornmail', thorns: 2 } },
  // ---- Gale: fast, cheap, draws the deck ----
  gale_slash: { name: 'Gale Slash', suit: 'gale', cost: 2, type: 'attack', text: 'Deal 9. Draw 1 card.', dmg: 9, draw: 1, up: { dmg: 4 } },
  gust: { name: 'Gust', suit: 'gale', cost: 0, type: 'attack', text: 'Deal 4. Draw 1 card.', dmg: 4, draw: 1, up: { dmg: 2 } },
  storm_edge: { name: 'Storm Edge', suit: 'gale', cost: 2, type: 'attack', text: 'Deal 7 to ALL enemies.', dmg: 7, aoe: true, up: { dmg: 3 } },
  tailwind: { name: 'Tailwind', suit: 'gale', cost: 0, type: 'skill', text: 'Draw 2 cards.', draw: 2, up: { draw: 1 } },
  second_wind: { name: 'Second Wind', suit: 'gale', cost: 1, type: 'skill', text: 'Draw 3 cards. Gain 1 Energy.', draw: 3, energy: 1, up: { draw: 1 } },
  focus: { name: 'Focus', suit: 'gale', cost: 1, type: 'skill', text: 'Gain 3 Strength.', strength: 3, up: { strength: 1 } },
  galeforce: { name: 'Galeforce', suit: 'gale', cost: 2, type: 'power', text: 'Draw +1 card each turn.', power: 'galeforce', up: { power: 'galeforce' } },
  // ---- Neutral: the basics every deck starts with ----
  strike: { name: 'Strike', suit: 'ember', cost: 1, type: 'attack', text: 'Deal 6 damage.', dmg: 6, starter: true, up: { dmg: 3 } },
  guard: { name: 'Guard', suit: 'frost', cost: 1, type: 'skill', text: 'Gain 5 Block.', block: 5, starter: true, up: { block: 3 } },
};

// A fresh starter deck: 5 Strikes, 4 Guards, 1 Ember Strike, 1 Frostbite.
export function starterDeck() {
  const deck = [];
  for (let i = 0; i < 5; i++) deck.push({ id: 'strike', upgraded: false });
  for (let i = 0; i < 4; i++) deck.push({ id: 'guard', upgraded: false });
  deck.push({ id: 'ember_strike', upgraded: false });
  deck.push({ id: 'frostbite', upgraded: false });
  return deck;
}

// One card instance with its live numbers (upgrades applied).
export function cardStats(card) {
  const def = CARDS[card.id];
  const s = { ...def };
  if (card.upgraded && def.up) {
    for (const [k, v] of Object.entries(def.up)) {
      if (k === 'power') continue;
      if (k === 'cost') s.cost = Math.max(0, s.cost - v);
      else s[k] = (s[k] || 0) + v;
    }
    if (def.up.cost) s.cost = Math.max(0, def.cost - def.up.cost);
  }
  s.name = def.name + (card.upgraded ? '+' : '');
  return s;
}

export function describeCard(card) {
  const s = cardStats(card);
  return `${s.name} (${s.cost} energy) — ${s.text}`;
}
