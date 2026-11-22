// The combat engine: turns, energy, drawing, damage math, statuses, and the
// enemy's telegraphed moves. It knows nothing about the DOM — render.js
// shows what happens here, and input.js calls into it.
import { CONFIG } from './config.js';
import { CARDS, cardStats } from './cards.js';
import { spawnEnemy, enemyIntent, ENEMIES } from './enemies.js';
import { addLog, addGold, heal, runScore } from './state.js';

export function startCombat(run, enemyIds, kind, rng) {
  const enemies = enemyIds.map((id) => spawnEnemy(id, rng));
  const deck = rng.shuffle(run.deck.map((c, i) => ({ ...c, uid: i })));
  const combat = {
    kind, enemies, turn: 0, energy: CONFIG.startEnergy, energyMax: CONFIG.startEnergy,
    drawPile: deck, hand: [], discardPile: [], exhaustPile: [],
    player: { block: 0, status: {}, },
    powers: new Set(),
    over: false, victory: false, log: [],
    freeCardUsed: false,
  };
  run.combat = combat;
  run.screen = 'combat';
  // Relic hooks at combat start.
  if (run.relics.includes('frost_sigil')) combat.player.block += 6;
  if (run.relics.includes('thorn_vest')) combat.player.status.thorns = (combat.player.status.thorns || 0) + 2;
  for (const card of run.deck) {
    const def = CARDS[card.id];
    if (def.power === 'thornmail') combat.player.status.thorns = (combat.player.status.thorns || 0) + (card.upgraded ? 6 : 4);
    if (def.power) combat.powers.add(def.power);
  }
  beginTurn(run, combat, rng);
  return combat;
}

export function drawCards(combat, n, rng) {
  for (let i = 0; i < n; i++) {
    if (combat.hand.length >= CONFIG.handMax) return;
    if (!combat.drawPile.length) {
      if (!combat.discardPile.length) return;
      combat.drawPile = rng.shuffle(combat.discardPile);
      combat.discardPile = [];
    }
    combat.hand.push(combat.drawPile.pop());
  }
}

function beginTurn(run, combat, rng) {
  combat.turn += 1;
  combat.energy = combat.energyMax + (combat.turn === 1 && run.relics.includes('ember_charm') ? 1 : 0);
  combat.player.block = 0;
  combat.freeCardUsed = false;
  let draw = CONFIG.handSize + (combat.powers.has('galeforce') && combat.turn > 1 ? 1 : 0);
  if (combat.turn === 1 && run.relics.includes('gale_boots')) draw += 1;
  drawCards(combat, draw, rng);
  combat.enemies.forEach((e) => { e.intent = enemyIntent(e); });
  // Burn ticks at the start of the enemy's turn is handled in enemy phase;
  // player burn ticks here.
  tickBurn(run, combat, 'player');
}

export function tickBurn(run, combat, who) {
  if (who === 'player') {
    const burn = combat.player.status.burn || 0;
    if (burn > 0) {
      hurtPlayer(run, combat, burn, true);
      combat.player.status.burn = burn - 1;
      if (combat.player.status.burn <= 0) delete combat.player.status.burn;
    }
  }
}

function dealDamageToEnemy(run, combat, enemy, raw, source) {
  let dmg = raw + (combat.player.status.strength || 0);
  if (combat.player.status.weak) dmg = Math.max(0, Math.floor(dmg * 0.75));
  if (run.relics.includes('crown_of_embers') && source && CARDS[source].suit === 'ember') dmg += 3;
  if (enemy.status.vulnerable) dmg = Math.floor(dmg * 1.5);
  const blocked = Math.min(enemy.block, dmg);
  enemy.block -= blocked;
  enemy.hp -= (dmg - blocked);
  run.damageDealt += (dmg - blocked);
  return dmg - blocked;
}

export function hurtPlayer(run, combat, raw, ignoreBlock) {
  let dmg = raw;
  // Vulnerable: the player takes 50% more attack damage. Burn ticks pass
  // ignoreBlock, and HP loss is not an attack, so they stay unamplified.
  if (!ignoreBlock && combat.player.status.vulnerable) dmg = Math.floor(dmg * 1.5);
  if (!ignoreBlock) {
    const blocked = Math.min(combat.player.block, dmg);
    combat.player.block -= blocked;
    dmg -= blocked;
  }
  if (dmg > 0) {
    run.hp -= dmg;
    // Phoenix Feather: survive one fatal blow.
    if (run.hp <= 0 && run.relics.includes('phoenix_feather') && !run.featherUsed) {
      run.featherUsed = true;
      run.hp = 1;
      addLog(run, '🪶 Phoenix Feather saves you!');
    }
  }
  if (run.hp <= 0) {
    run.hp = 0;
    combat.over = true;
    combat.victory = false;
    run.lost = true;
    run.screen = 'defeat';
    run.score = runScore(run);
  }
}

function applyStatus(target, key, n) {
  if (!n) return;
  target.status[key] = (target.status[key] || 0) + n;
}

// Play one card from the hand against an enemy (or no target for skills).
export function playCard(run, combat, handIndex, targetIndex, rng) {
  if (combat.over) return { ok: false, why: 'Combat is over.' };
  const card = combat.hand[handIndex];
  if (!card) return { ok: false, why: 'No card there.' };
  const s = cardStats(card);
  let cost = s.cost;
  if (run.relics.includes('storm_core') && !combat.freeCardUsed) cost = 0;
  if (combat.energy < cost) return { ok: false, why: 'Not enough energy.' };
  combat.energy -= cost;
  if (run.relics.includes('storm_core')) combat.freeCardUsed = true;
  run.cardsPlayed += 1;

  const target = combat.enemies[targetIndex ?? 0] || combat.enemies[0];
  const targets = s.aoe ? combat.enemies.filter((e) => e.hp > 0) : [target];

  if (s.dmg) {
    for (const e of targets) {
      dealDamageToEnemy(run, combat, e, s.dmg, card.id);
      if (s.burn) applyStatus(e, 'burn', s.burn + (combat.powers.has('burning_soul') && s.suit === 'ember' ? 2 : 0));
      if (s.chill) {
        applyStatus(e, 'chill', s.chill);
        if (combat.powers.has('frozen_core')) combat.player.block += 3;
      }
      if (s.thorns) applyStatus(combat.player, 'thorns', s.thorns);
    }
  }
  if (s.block) combat.player.block += s.block;
  if (s.heal) heal(run, s.heal);
  if (s.draw) drawCards(combat, s.draw, rng);
  if (s.energy) combat.energy += s.energy;
  if (s.weak) targets.forEach((e) => applyStatus(e, 'weak', s.weak));
  if (s.vulnerable) targets.forEach((e) => applyStatus(e, 'vulnerable', s.vulnerable));
  if (!s.dmg) {
    if (s.burn) targets.forEach((e) => applyStatus(e, 'burn', s.burn));
    if (s.chill) {
      targets.forEach((e) => applyStatus(e, 'chill', s.chill));
      if (combat.powers.has('frozen_core')) combat.player.block += 3;
    }
  }
  if (s.strength) applyStatus(combat.player, 'strength', s.strength);
  if (s.power === 'thornmail') applyStatus(combat.player, 'thorns', s.thorns || 4);
  if (s.power) combat.powers.add(s.power);

  // Move the card out of the hand.
  combat.hand.splice(handIndex, 1);
  if (s.type === 'power') combat.exhaustPile.push(card);
  else combat.discardPile.push(card);

  checkCombatEnd(run, combat);
  return { ok: true };
}

function checkCombatEnd(run, combat) {
  const alive = combat.enemies.filter((e) => e.hp > 0);
  if (!alive.length) {
    combat.over = true;
    combat.victory = true;
    run.kills += combat.enemies.length;
    run.floors += 1;
    run.score = runScore(run);
  }
}

// End the player's turn: every living enemy acts on its telegraphed intent.
export function endTurn(run, combat, rng) {
  if (combat.over) return;
  // Weak on the player lasts exactly one player turn: it expires at this
  // boundary, after the player has played with it. Vulnerable lasts until
  // the end of the enemy phase instead — damage only arrives while the
  // enemies act, so stacks from an earlier phase expire at the end of this
  // function, never stacks applied during this phase. Snapshot them first.
  // (The old code deleted both at the end of this function, wiping debuffs
  // the enemies had just applied, so Weak/Vulnerable on the player never
  // did anything.)
  if (combat.player.status.weak) delete combat.player.status.weak;
  const vulnAtStart = combat.player.status.vulnerable || 0;
  // Discard the hand.
  combat.discardPile.push(...combat.hand);
  combat.hand = [];
  for (const enemy of combat.enemies) {
    if (enemy.hp <= 0) continue;
    // Burn ticks on the enemy.
    const burn = enemy.status.burn || 0;
    if (burn > 0) {
      enemy.hp -= burn;
      enemy.status.burn = burn - 1;
      if (enemy.status.burn <= 0) delete enemy.status.burn;
      if (enemy.hp <= 0) { checkCombatEnd(run, combat); if (combat.over) return; continue; }
    }
    const move = enemyIntent(enemy);
    enemy.block = 0;
    let dmg = move.dmg || 0;
    dmg += enemy.status.strength || 0;
    dmg = Math.max(0, dmg - (enemy.status.chill || 0));
    // Weak: a weakened enemy deals 25% less attack damage.
    if (enemy.status.weak) dmg = Math.max(0, Math.floor(dmg * 0.75));
    if (move.kind === 'attack') {
      hurtPlayer(run, combat, dmg);
      if (move.weak) applyStatus(combat.player, 'weak', move.weak);
      if (move.vulnerable) applyStatus(combat.player, 'vulnerable', move.vulnerable);
      // Thorns bite back.
      const th = combat.player.status.thorns || 0;
      if (th > 0 && dmg > 0) {
        enemy.hp -= th;
        if (enemy.hp <= 0) { checkCombatEnd(run, combat); if (combat.over) return; }
      }
      if (combat.over) return;
    } else if (move.kind === 'block') {
      enemy.block += move.block || 0;
    } else if (move.kind === 'buff') {
      applyStatus(enemy, 'strength', move.strength || 0);
    } else if (move.kind === 'debuff') {
      if (move.weak) applyStatus(combat.player, 'weak', move.weak);
      if (move.vulnerable) applyStatus(combat.player, 'vulnerable', move.vulnerable);
    }
    enemy.moveIndex += 1;
    enemy.intent = enemyIntent(enemy);
  }
  // Enemy weak/vulnerable last one round: they expire after the enemies acted.
  for (const enemy of combat.enemies) {
    if (enemy.status.weak) delete enemy.status.weak;
    if (enemy.status.vulnerable) delete enemy.status.vulnerable;
  }
  // Player vulnerable from an earlier phase expires now; stacks applied
  // during this phase stay for the next round.
  if (vulnAtStart > 0) {
    const left = (combat.player.status.vulnerable || 0) - vulnAtStart;
    if (left > 0) combat.player.status.vulnerable = left;
    else delete combat.player.status.vulnerable;
  }
  if (!combat.over) beginTurn(run, combat, rng);
}

export function combatGold(run, combat, rng) {
  const [lo, hi] = combat.kind === 'elite' ? CONFIG.eliteGold : CONFIG.battleGold;
  let g = lo + Math.floor(rng.next() * (hi - lo + 1));
  if (run.relics.includes('golden_pact')) g += 12;
  return g;
}

export function rewardCards(rng, count) {
  const pool = Object.keys(CARDS).filter((id) => !CARDS[id].starter);
  const picks = [];
  const shuffled = rng.shuffle(pool);
  for (let i = 0; i < count && i < shuffled.length; i++) picks.push(shuffled[i]);
  return picks;
}

export { ENEMIES };
