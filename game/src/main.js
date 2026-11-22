// Bootstrap: build a fresh run from the URL seed (?seed=N, default 7) and
// render it. ?shot=start|play|win|loss renders a deterministic screenshot
// state instead of the title. ?debug=1 exposes the live run for play-tests.
import { newRun } from './state.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { shotState } from './shots.js';

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') || 7);
const shot = params.get('shot');
const debug = params.get('debug') === '1';

const run = shot ? shotState(shot, seed) : newRun(seed);
if (debug) window.__ember = run;
window.__emberRun = run;

render(run);
bindInput(run);
