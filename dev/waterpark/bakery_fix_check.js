// Checks the bakery fix carried in waterpark.py: the cake panel must not set `choosing` (which pauses the whole game loop for the host).
const fs = require('fs'), path = require('path'), D = process.env.SRC_DIR || path.join(__dirname, '..');
let s = fs.readFileSync(process.env.BK_SRC || path.join(__dirname, '../bakery/bakery.js'), 'utf8'); const py = fs.readFileSync(process.env.WP_PY || path.join(__dirname, 'waterpark.py'), 'utf8');
const reps = [...py.matchAll(/^rep\("(bk\.panel = -1[^"]*|bk\.panel = i;[^"]*|function bakeryStop[^"]*)", "([^"]*)"\)/gm)];
reps.forEach(m => { if (s.split(m[1]).length !== 2) throw new Error('anchor ' + m[1]); s = s.replace(m[1], m[2]); });
const f = s.slice(s.indexOf('function bkPanel('), s.indexOf('function bkPanelRender')), ok = reps.length === 3 && !/choosing/.test(f) && !/choosing/.test(s.slice(s.indexOf('function bakeryStop')));
console.log((ok ? 'PASS' : 'FAIL') + ' bakery panel no longer pauses the shared game'); console.log('RESULT', ok ? 1 : 0, '/ 1'); process.exit(ok ? 0 : 1);
