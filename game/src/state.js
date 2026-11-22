// The run: everything a playthrough of Ember Pact remembers — the deck, the
// gold, the relics, the map, and the score. Pure data; combat.js and map.js
// read and change it, render.js only shows it.
import { CONFIG } from './config.js';
import { starterDeck } from './cards.js';
import { makeRng } from './random.js';
import { buildMap } from './map.js';

export function newRun(seed) {
  const rng = makeRng(seed);
  const run = {
    seed,
    rng,
    screen: 'title',
    act: 1,
    hp: CONFIG.playerMaxHp,
    maxHp: CONFIG.playerMaxHp,
    gold: CONFIG.startGold,
    deck: starterDeck(),
    relics: [],
    score: 0,
    kills: 0,
    floors: 0,
    cardsPlayed: 0,
    damageDealt: 0,
    map: null,
    mapRow: 0,
    combat: null,
    reward: null,
    shop: null,
    restChoice: null,
    message: '',
    log: [],
    featherUsed: false,
    won: false,
    lost: false,
  };
  run.map = buildMap(run.act, rng);
  return run;
}

export function runScore(run) {
  return (
    run.floors * CONFIG.scorePerFloor +
    run.kills * CONFIG.scorePerKill +
    run.gold * CONFIG.scorePerGold +
    (run.act - 1) * 100 +
    (run.won ? 500 : 0)
  );
}

export function addLog(run, text) {
  run.log.unshift(text);
  if (run.log.length > 6) run.log.length = 6;
}

export function addGold(run, n) {
  run.gold += n;
  run.score = runScore(run);
}

export function heal(run, n) {
  run.hp = Math.min(run.maxHp, run.hp + n);
}

export function addCardToDeck(run, id) {
  run.deck.push({ id, upgraded: false });
}

export function removeCardFromDeck(run, index) {
  run.deck.splice(index, 1);
}

export function upgradeCardInDeck(run, index) {
  run.deck[index].upgraded = true;
}
