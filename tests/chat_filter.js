/* Chat filter tests (t285u). These may name blocked words; renders must not. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
function load(file){
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  const ctx = { module: {exports:{}}, exports: {}, console };
  ctx.globalThis = ctx;
  ctx.global = ctx;
  vm.createContext(ctx);
  vm.runInContext(code, ctx, {filename: file});
  return ctx;
}
const wordsCtx = load('dev/chat/chatwords.js');
const filterSrc = fs.readFileSync(path.join(root, 'dev/chat/chatfilter.js'), 'utf8');
const ctx = wordsCtx;
vm.runInContext(filterSrc, ctx, {filename: 'dev/chat/chatfilter.js'});
const {chatFilter} = ctx;

let pass = 0, fail = 0;
function chk(name, cond, extra){
  if (cond){ pass++; }
  else { fail++; console.log('FAIL', name, extra || ''); }
}
function F(t){ return chatFilter(t); }
function blocked(t){ const r = F(t); return r.blocked && /#/.test(r.text); }
function clean(t){ const r = F(t); return !r.blocked && r.text === String(t).replace(/\s+/g,' ').trim(); }

/* basics */
chk('empty ok', clean('') && F('').text === '');
chk('hello ok', clean('Hello!'));
chk('caps length 80', F('x'.repeat(90)).text.length === 80);
chk('trim spaces', F('  hi   there  ').text === 'hi there');

/* phrases / greetings stay clean */
['Hi!', 'GG!', "Let's go!", 'Follow me!', 'Nice outfit!', 'Over here!', 'Thanks!', 'Oops!',
 'hello class', 'good game', 'I died', 'nice jump', 'race you to the top'].forEach(p => {
  chk('safe phrase: ' + p, clean(p), F(p));
});

/* Scunthorpe / false positives */
const SAFE = (ctx.CHAT_WORDS && ctx.CHAT_WORDS.safe) || [];
SAFE.forEach(w => {
  chk('scunthorpe: ' + w, clean(w) || (F(w).text === w && !F(w).blocked), JSON.stringify(F(w)));
});
['class', 'classic', 'assassin', 'grass', 'Sussex', 'scunthorpe', 'cocktail', 'therapist',
 'scrap', 'attribute', 'button', 'butter', 'assessment', 'passion', 'password', 'hello',
 'skill', 'document', 'grape', 'necessary', 'assets', 'bass', 'compass', 'title'].forEach(w => {
  chk('false positive: ' + w, !F(w).blocked && F(w).text.toLowerCase() === w.toLowerCase(), JSON.stringify(F(w)));
});

/* Severe + evasion. The input words live only in this test file. */
const SHIT = ['s','h','i','t'].join('');
const FUCK = ['f','u','c','k'].join('');
const FUCKx = FUCK + 'ing';
chk('blocks ' + SHIT, blocked(SHIT));
chk('leet sh1t', blocked('sh1t'));
chk('spaced s h i t', blocked('s h i t'));
chk('repeated shiiit', blocked('shiiit'));
chk('mixed sh!t', blocked('sh!t'));
chk('blocks ' + FUCK, blocked(FUCK));
chk('leet f@ck / f* wait f u c k', blocked('f u c k'));
chk('leet f*u* no, f0 wait f@ck', blocked('f@ck'));
chk('blocks ' + FUCKx, blocked(FUCKx));
chk('replacement is hashes only', /^\s*#+\s*$/.test(F(SHIT).text));
chk('keeps neighbors', F('wow ' + SHIT + ' wow').text === 'wow #### wow', F('wow ' + SHIT + ' wow').text);

/* mean / mild-but-mean */
['stupid', 'dumb', 'loser', 'idiot', 'you are stupid', 'so dumb'].forEach(w => {
  chk('mean: ' + w, blocked(w), JSON.stringify(F(w)));
});
chk('hate you phrase', blocked('I hate you'));
chk('hate u phrase', blocked('hate u'));
chk('hate alone may stay or go — phrase required, "I hate losing" ok if no you', !blocked('I hate spinach') || F('I hate spinach').text.indexOf('hate') >= 0);
chk('shut up', blocked('shut up'));
chk('shut the door ok', !blocked('shut the door'), JSON.stringify(F('shut the door')));

/* PII */
chk('email', blocked('reach me at kid@gmail.com'));
chk('url http', blocked('visit https://example.com/x'));
chk('url www', blocked('www.bad-site.com'));
chk('bare domain', blocked('go to example.com now'));
chk('phone dashed', blocked('call 555-123-4567'));
chk('phone parens', blocked('call (555) 123 4567'));
chk('digits 6+', blocked('my pin is 123456'));
chk('short score ok', !blocked('I scored 12 points'), JSON.stringify(F('I scored 12 points')));
chk('address', blocked('I live at 12 Main Street'));
chk('how old', blocked('how old are you'));
chk('i am 9', blocked('i am 9'));
chk("i'm 12", blocked("i'm 12"));
chk('handle', blocked('add me @coolkid99'));
chk('discord', blocked('discord: coolkid'));
chk('snap', blocked('snap me at cool'));

/* filter is idempotent on already-hashed text */
chk('idempotent hashes', F('wow #### wow').text === 'wow #### wow' && !F('wow #### wow').blocked);

/* sender + receiver: applying twice stays hashed, never restores */
const once = F('sh1t');
const twice = F(once.text);
chk('double filter stays hashed', twice.text === once.text && /#/.test(twice.text));

console.log('chat_filter ' + pass + '/' + (pass+fail) + (fail ? ' FAILED' : ' ok'));
if (fail) process.exit(1);
