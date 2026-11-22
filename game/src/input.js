// Input and flow: mouse clicks and keyboard drive every screen. Clicking a
// card selects it; clicking an enemy (or pressing its number) plays it. The
// map, shop, rest and reward screens are all plain buttons.
import { CONFIG } from './config.js';
import { CARDS } from './cards.js';
import { ACT_ENEMIES, ACT_ELITES, ACT_BOSSES } from './enemies.js';
import { RELICS, randomRelic } from './relics.js';
import { startCombat, playCard, endTurn, combatGold, rewardCards } from './combat.js';
import { advanceMap, buildMap } from './map.js';
import { addGold, addCardToDeck, removeCardFromDeck, upgradeCardInDeck, heal, addLog } from './state.js';
import { newRun } from './state.js';
import { render } from './render.js';

function pickEnemies(run, kind) {
  const rng = run.rng;
  if (kind === 'boss') return [ACT_BOSSES[run.act]];
  if (kind === 'elite') return [rng.pick(ACT_ELITES[run.act])];
  const pool = ACT_ENEMIES[run.act];
  const n = run.act === 1 ? 1 : rng.chance(0.45) ? 2 : 1;
  const ids = [];
  for (let i = 0; i < n; i++) ids.push(rng.pick(pool));
  return ids;
}

function openReward(run, kind) {
  const combat = run.combat;
  const gold = combatGold(run, combat, run.rng);
  addGold(run, gold);
  if (run.relics.includes('bloodstone')) heal(run, 4);
  let relic = null;
  if (kind === 'elite' || kind === 'boss') {
    relic = randomRelic(run.rng, run.relics);
    if (relic) {
      run.relics.push(relic);
      if (relic === 'iron_pact') run.maxHp += 8;
    }
  }
  run.reward = {
    title: kind === 'boss' ? `Act ${run.act} boss defeated!` : kind === 'elite' ? 'Elite defeated!' : 'Battle won!',
    gold, relic,
    choices: rewardCards(run.rng, CONFIG.cardRewardChoices),
  };
  run.combat = null;
  run.screen = 'reward';
}

function openShop(run) {
  const rng = run.rng;
  const pool = Object.keys(CARDS).filter((id) => !CARDS[id].starter);
  const shuffled = rng.shuffle(pool);
  run.shop = {
    cards: shuffled.slice(0, 3).map((id) => ({
      id,
      price: CONFIG.shopCardPrice[0] + Math.floor(rng.next() * (CONFIG.shopCardPrice[1] - CONFIG.shopCardPrice[0] + 1)),
    })),
    relic: randomRelic(rng, run.relics),
    relicPrice: CONFIG.shopRelicPrice[0] + Math.floor(rng.next() * (CONFIG.shopRelicPrice[1] - CONFIG.shopRelicPrice[0] + 1)),
    removePrice: CONFIG.removeCardPrice,
    removing: false,
  };
  run.screen = 'shop';
}

function afterNode(run, row, index, type) {
  advanceMap(run.map, row, index);
  run.mapRow = row + 1;
  if (type === 'battle' || type === 'elite') {
    startCombat(run, pickEnemies(run, type), type, run.rng);
  } else if (type === 'shop') {
    openShop(run);
  } else if (type === 'rest') {
    run.restChoice = null;
    run.screen = 'rest';
  } else if (type === 'treasure') {
    const relic = randomRelic(run.rng, run.relics);
    if (relic) {
      run.relics.push(relic);
      if (relic === 'iron_pact') run.maxHp += 8;
      addLog(run, `Found relic: ${RELICS[relic].name}`);
    }
    run.floors += 1;
    run.screen = 'map';
  }
}

function afterBoss(run) {
  if (run.act >= CONFIG.acts) {
    run.won = true;
    run.screen = 'victory';
    return;
  }
  run.act += 1;
  run.map = buildMap(run.act, run.rng);
  run.mapRow = 0;
  run.screen = 'map';
}

export function handleAction(run, action, el) {
  const rng = run.rng;
  switch (action) {
    case 'new-run': {
      const fresh = newRun(run.seed === undefined ? Date.now() % 100000 : run.seed);
      Object.keys(run).forEach((k) => delete run[k]);
      Object.assign(run, fresh);
      break;
    }
    case 'how':
      run.showHow = !run.showHow;
      break;
    case 'node': {
      const row = Number(el.dataset.row);
      const node = Number(el.dataset.node);
      const type = run.map.rows[row][node].type;
      afterNode(run, row, node, type);
      break;
    }
    case 'boss':
      run.map.boss.done = true;
      startCombat(run, [ACT_BOSSES[run.act]], 'boss', rng);
      break;
    case 'end-turn': {
      const c = run.combat;
      if (c && !c.over) {
        endTurn(run, c, rng);
        if (c.over && c.victory) {
          if (c.kind === 'boss') afterBoss(run);
          else openReward(run, c.kind);
        }
      }
      break;
    }
    case 'skip-reward':
      run.reward = null;
      run.screen = 'map';
      break;
    case 'buy-card': {
      const item = run.shop.cards[Number(el.dataset.i)];
      if (item && run.gold >= item.price) {
        run.gold -= item.price;
        addCardToDeck(run, item.id);
        run.shop.cards.splice(Number(el.dataset.i), 1);
      }
      break;
    }
    case 'buy-relic': {
      const s = run.shop;
      if (s.relic && run.gold >= s.relicPrice) {
        run.gold -= s.relicPrice;
        run.relics.push(s.relic);
        if (s.relic === 'iron_pact') run.maxHp += 8;
        s.relic = null;
      }
      break;
    }
    case 'remove-card':
      run.shop.removing = true;
      break;
    case 'leave-shop':
      run.shop = null;
      run.screen = 'map';
      break;
    case 'rest-heal':
      heal(run, Math.round(run.maxHp * CONFIG.restHeal));
      run.restChoice = 'heal';
      break;
    case 'rest-upgrade':
      run.restChoice = 'upgrade';
      break;
    case 'leave-rest':
      run.restChoice = null;
      run.screen = 'map';
      break;
    default:
      break;
  }
  render(run);
}

export function bindInput(run) {
  document.getElementById('app').addEventListener('click', (ev) => {
    const cardEl = ev.target.closest('[data-card]');
    const enemyEl = ev.target.closest('[data-enemy]');
    const btn = ev.target.closest('[data-action]');

    // Combat card selection / targeting.
    if (run.screen === 'combat' && run.combat && !run.combat.over) {
      const c = run.combat;
      if (cardEl && cardEl.dataset.card !== '') {
        c.selectedHand = Number(cardEl.dataset.card);
        c.selectedTarget = 0;
        render(run);
        return;
      }
      if (enemyEl) {
        const t = Number(enemyEl.dataset.enemy);
        if (c.selectedHand !== undefined && c.selectedHand !== null) {
          const res = playCard(run, c, c.selectedHand, t, run.rng);
          c.selectedHand = null;
          if (!res.ok) c.message = res.why;
          else c.message = '';
          if (c.over && c.victory) {
            if (c.kind === 'boss') afterBoss(run);
            else openReward(run, c.kind);
          }
          render(run);
          return;
        }
        c.selectedTarget = t;
        render(run);
        return;
      }
    }
    // Reward card pick.
    if (run.screen === 'reward' && cardEl) {
      const id = run.reward.choices[Number(cardEl.dataset.card)];
      addCardToDeck(run, id);
      run.reward = null;
      run.screen = 'map';
      render(run);
      return;
    }
    // Shop card removal pick.
    if (run.screen === 'shop' && run.shop?.removing && cardEl) {
      const i = Number(cardEl.dataset.card);
      if (run.gold >= run.shop.removePrice) {
        run.gold -= run.shop.removePrice;
        removeCardFromDeck(run, i);
      }
      run.shop.removing = false;
      render(run);
      return;
    }
    // Rest upgrade pick.
    if (run.screen === 'rest' && run.restChoice === 'upgrade' && cardEl) {
      upgradeCardInDeck(run, Number(cardEl.dataset.card));
      render(run);
      return;
    }
    if (btn) handleAction(run, btn.dataset.action, btn);
  });

  document.addEventListener('keydown', (ev) => {
    if (run.screen === 'combat' && run.combat && !run.combat.over) {
      const c = run.combat;
      if (ev.key >= '1' && ev.key <= '9') {
        const i = Number(ev.key) - 1;
        if (c.hand[i] !== undefined) {
          const res = playCard(run, c, i, c.selectedTarget ?? 0, run.rng);
          if (!res.ok) c.message = res.why;
          if (c.over && c.victory) {
            if (c.kind === 'boss') afterBoss(run);
            else openReward(run, c.kind);
          }
          render(run);
        }
      } else if (ev.key === 'e' || ev.key === 'E') {
        handleAction(run, 'end-turn', null);
      }
    }
    if (ev.key === 'm' || ev.key === 'M') {
      if (run.screen === 'combat') { /* combat locks the map */ }
    }
  });
}
