// Screenshot states: the same screens a player reaches, rendered from real
// run states built through the game's own constructors — never a mock-up.
// ?shot=start  title screen
// ?shot=play   mid-combat: full hand, enemy with intent, HP bars, gold, score
// ?shot=win    victory screen after the final boss
// ?shot=loss   defeat screen after a lost fight
import { newRun } from './state.js';
import { startCombat, playCard } from './combat.js';
import { CARDS } from './cards.js';

function richDeck(run) {
  // A mid-run deck: starters plus a spread of every suit, some upgraded.
  const ids = [
    'ember_strike', 'ember_strike', 'cinder_burst', 'flare', 'kindle',
    'frostbite', 'ice_shard', 'frost_wall', 'deep_freeze',
    'thorn_lash', 'rootbind', 'overgrowth', 'mend',
    'gale_slash', 'gust', 'tailwind', 'second_wind', 'focus',
    'strike', 'strike', 'guard', 'guard',
  ];
  run.deck = ids.map((id, i) => ({ id, upgraded: i % 5 === 0 }));
  run.relics = ['ember_charm', 'frost_sigil', 'golden_pact'];
  run.gold = 214;
  run.floors = 9;
  run.kills = 11;
  run.cardsPlayed = 47;
  run.damageDealt = 312;
  run.act = 2;
}

export function shotState(shot, seed) {
  const run = newRun(seed);
  if (shot === 'start') {
    run.screen = 'title';
    return run;
  }
  if (shot === 'play') {
    richDeck(run);
    run.hp = 54;
    startCombat(run, ['tidecaller'], 'elite', run.rng);
    // Play a couple of cards so the board shows a lived-in fight.
    const c = run.combat;
    const ember = c.hand.findIndex((card) => CARDS[card.id].suit === 'ember');
    if (ember >= 0) playCard(run, c, ember, 0, run.rng);
    c.selectedHand = 1;
    return run;
  }
  if (shot === 'win') {
    richDeck(run);
    run.hp = 31;
    run.floors = 15;
    run.kills = 19;
    run.cardsPlayed = 83;
    run.damageDealt = 640;
    run.act = 3;
    run.won = true;
    run.screen = 'victory';
    return run;
  }
  if (shot === 'loss') {
    richDeck(run);
    run.hp = 0;
    run.floors = 7;
    run.kills = 9;
    run.cardsPlayed = 38;
    run.damageDealt = 240;
    run.act = 2;
    run.lost = true;
    run.screen = 'defeat';
    return run;
  }
  run.screen = 'title';
  return run;
}
