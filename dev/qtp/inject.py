#!/usr/bin/env python3
"""Inject Daily Quests, Trading, and Party Pad into index.html. Idempotent."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / 'index.html'
DEV = ROOT / 'dev'

def must_find(hay, needle, label):
    if needle not in hay:
        raise SystemExit(f'missing hook ({label}): {needle[:120]!r}')
    return hay

def insert_after(hay, needle, extra, label, once_token=None):
    tok = once_token or extra.strip()[:48]
    if tok and tok in hay:
        return hay
    must_find(hay, needle, label)
    return hay.replace(needle, needle + extra, 1)

def insert_before(hay, needle, extra, label, once_token=None):
    tok = once_token or extra.strip()[:48]
    if tok and tok in hay:
        return hay
    must_find(hay, needle, label)
    return hay.replace(needle, extra + needle, 1)

def replace_once(hay, old, new, label):
    if new in hay and old not in hay:
        return hay
    if old not in hay:
        raise SystemExit(f'missing hook ({label}): {old[:140]!r}')
    return hay.replace(old, new, 1)

CSS = r'''
<style id="qtpCss">
#quests{padding:8px 16px 28px}
.qhead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.qsub,.qwait,.qdone,.qbonuswait,.qbonusdone{color:var(--ink-soft,#445);font-size:15px}
.qcard{background:#fff;border:3px solid #1d2340;border-radius:16px;padding:12px 14px;margin:10px 0;box-shadow:3px 3px 0 #1d2340}
.qcard.ready{border-color:#2ec27e;box-shadow:3px 3px 0 #2ec27e}
.qcard.claimed{opacity:.82;background:#f3fff6}
.qtop{display:flex;gap:10px;align-items:flex-start}
.qem{font-size:28px;line-height:1}
.qtop b{display:block;font-size:18px}
.qtop small{display:block;opacity:.8}
.qbar{height:10px;background:#eee;border-radius:99px;overflow:hidden;margin:8px 0 6px;border:2px solid #1d2340}
.qbar u{display:block;height:100%;background:#3a86ff;width:0}
.qcard.ready .qbar u{background:#2ec27e}
.qcard.claimed .qbar u{background:#8b5cf6}
.qrow{display:flex;justify-content:flex-end}
.qoverlay,.troverlay{position:fixed;inset:0;background:rgba(29,35,64,.45);z-index:80;display:none;align-items:center;justify-content:center;padding:16px}
.qoverlay.show,.troverlay.show{display:flex}
.qbox,.trbox{position:relative;max-width:560px;width:100%;max-height:90vh;overflow:auto;background:#fff6e8;border:4px solid #1d2340;border-radius:20px;padding:16px 16px 18px;box-shadow:6px 6px 0 #1d2340}
.qclose,#trClose{position:absolute;top:8px;right:10px;border:0;background:transparent;font-size:22px;cursor:pointer}
#oQuestBtn,#oTradeBtn{font-size:22px;margin-left:4px}
.trcols{display:flex;gap:12px;flex-wrap:wrap}
.trcols>div{flex:1;min-width:200px}
.trit{display:flex;align-items:center;gap:8px;width:100%;margin:4px 0;padding:8px 10px;border:2px solid #1d2340;border-radius:12px;background:#fff;cursor:pointer;text-align:left}
.trit.on{background:#e8fff0;border-color:#2ec27e}
.tre{font-size:22px}
.trn{flex:1;font-weight:700}
.trrare{font-size:11px;border-radius:99px;padding:2px 6px;background:#eee}
.trrare.r0{background:#d9d9d9} .trrare.r1{background:#b8f0c8} .trrare.r2{background:#a8d0ff} .trrare.r3{background:#e0c4ff} .trrare.r4{background:#ffe08a}
.trempty{opacity:.7;padding:8px}
.trbtns{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
#trStatus{margin-top:8px;font-weight:700}
.trask{position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:85;display:none;max-width:360px;width:calc(100% - 24px)}
.trask.show{display:block}
.trask .mbox{background:#fff;border:4px solid #1d2340;border-radius:18px;padding:16px;box-shadow:6px 6px 0 #1d2340;text-align:center}
.pybox{position:absolute;left:12px;right:12px;top:64px;z-index:6;pointer-events:none;text-align:center}
.pybox #pyHint{display:inline-block;background:rgba(29,35,64,.82);color:#fff;border-radius:999px;padding:6px 14px;font-weight:700;font-size:14px}
#pyAct{position:absolute;right:16px;bottom:96px;z-index:8;display:none;padding:12px 16px;font-size:18px;border:3px solid #1d2340;border-radius:16px;background:#ffd23f;font-weight:800;box-shadow:3px 3px 0 #1d2340}
#pyAct.show{display:block}
#pyFlash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:20;transition:opacity .05s linear}
@media (max-width:700px){ .trcols{flex-direction:column} .qbox,.trbox{padding:12px} #pyAct{bottom:120px} }
</style>
'''

QUEST_SECTION = '''
  <section id="quests">
    <div class="qhead">
      <h2>📜 Daily Quests</h2>
      <div class="qstreak" id="qStreak">🔥 0 day streak</div>
    </div>
    <p class="qsub">Three new quests every day. Finish them for coins! They reset at midnight on your device.</p>
    <div id="qList"></div>
    <div id="qBonusRow"></div>
  </section>

'''

PANELS = '''
  <div class="qoverlay" id="qPanel"><div class="mbox qbox">
    <button type="button" class="qclose" id="qClose" aria-label="Close quests">✕</button>
    <h2>📜 Daily Quests</h2>
    <div class="qstreak" id="qStreakG">🔥 0 day streak</div>
    <p class="qsub">Three new quests every day. They reset at midnight on your device.</p>
    <div id="qListG"></div>
    <div id="qBonusRowG"></div>
  </div></div>
  <div class="troverlay" id="trPanel"><div class="mbox trbox">
    <button type="button" id="trClose" aria-label="Close trade">✕</button>
    <h2 id="trTitle">Trade</h2>
    <div class="trcols">
      <div><h3>Your bag</h3><div id="trBag"></div></div>
      <div>
        <h3>Your offer</h3><div id="trMine"></div>
        <h3>Their offer</h3><div id="trTheirs"></div>
      </div>
    </div>
    <div id="trStatus"></div>
    <div class="trbtns">
      <button type="button" class="big" id="trReady">Ready</button>
      <button type="button" class="big gray" id="trConfirm">Confirm</button>
      <button type="button" class="big red" id="trCancel">Cancel</button>
    </div>
  </div></div>
  <div class="trask" id="trAsk"><div class="mbox">
    <div id="trAskMsg">A friend wants to trade!</div>
    <button type="button" class="big green" id="trAskYes">Accept</button>
    <button type="button" class="big gray" id="trAskNo">No thanks</button>
  </div></div>
  <div id="pyBox" class="pybox" style="display:none"><div id="pyHint">Party Pad</div></div>
  <button type="button" class="oact" id="pyAct">Sit</button>
'''

ACH_CAT = "    {id: 'quests', name: 'Daily Quests', emoji: '📜'},\n"

ACH_ITEMS = r'''    {id:'quest-first', cat:'quests', emoji:'📜', name:'Quest Starter', desc:'Claim your first daily quest.', coins:10, prove:s => !!(s.notes && s.notes['quest-first']) || !!(s.quests && (s.quests.totalClaimed|0) >= 1)},
    {id:'quest-bonus', cat:'quests', emoji:'🎁', name:'Triple Treat', desc:'Finish all 3 daily quests in one day.', coins:15, prove:s => !!(s.notes && s.notes['quest-bonus']) || !!(s.quests && s.quests.bonusClaimed)},
    {id:'quest-streak7', cat:'quests', emoji:'🔥', name:'Week of Quests', desc:'Finish all 3 daily quests 7 days in a row.', coins:30, prove:s => !!(s.notes && s.notes['quest-streak7']) || !!(s.quests && (s.quests.streak|0) >= 7)},
    {id:'quest-ten', cat:'quests', emoji:'⭐', name:'Quest Fan', desc:'Claim 10 daily quests.', coins:20, prove:s => !!(s.quests && (s.quests.totalClaimed|0) >= 10)},
    {id:'trade-first', cat:'friends', emoji:'🤝', name:'Fair Trade', desc:'Finish a trade with a friend in the same room.', coins:15, prove:s => !!(s.notes && s.notes['trade-done'])},
    {id:'party-first', cat:'friends', emoji:'🎉', name:'Party Starter', desc:'Visit the Party Pad.', coins:8, prove:s => !!(s.notes && (s.notes['play:party'] || s.notes['party-first']))},
'''

DEBUG = '''    qState: () => (typeof qEnsure === 'function' ? qEnsure() : null),
    qOpen: (on) => { if (typeof qOpen === 'function') qOpen(on !== false); },
    qDemo(claimed){
      if (typeof qEnsure !== 'function') return null;
      const s = qEnsure();
      (s.quests || []).forEach((q, i) => { q.progress = q.goal; q.claimed = !!claimed && i === 0; });
      if (claimed && s.quests[1]) s.quests[1].progress = s.quests[1].goal;
      qPersist(s); qOpen(true); qPaint(); return s;
    },
    trDemo: (done) => { if (typeof trOpenDemo === 'function') trOpenDemo(!!done); },
    partySit: () => { if (typeof partySitToggle === 'function') return partySitToggle(); },
    partyPhoto: () => { if (typeof partyPhoto === 'function') return partyPhoto(); },
    partyKick: () => { if (typeof partyKick === 'function') return partyKick(); },
    party: () => py && {sit: py.sit, dance: py.dance, ball: Object.assign({}, py.ball), hint: py.hint},
'''

def main():
    html = INDEX.read_text()
    if "function buildParty(" in html and "rubloxQuests" in html and "id=\"qPanel\"" in html:
        print('already injected — skipping body, will still check hooks')
        # still allow re-running hook patches that are missing
    else:
        pass

    # CSS
    html = insert_before(html, '<nav>', CSS, 'css', once_token='id="qtpCss"')

    # Nav + hero
    html = insert_after(
        html,
        '    <button data-go="achievements"><i>🏆</i><span>Achievements</span></button>\n  </nav>',
        '\n    <button data-go="quests"><i>📜</i><span>Quests</span></button>',
        'nav',
        once_token='data-go="quests"',
    )
    # The nav button should be before </nav>, not after the achievements line + </nav>. Fix if we inserted after the closing nav.
    if '<span>Quests</span></button>\n' in html and 'data-go="quests"' in html:
        # If we accidentally placed it after </nav>, move it.
        bad = '    <button data-go="achievements"><i>🏆</i><span>Achievements</span></button>\n  </nav>\n    <button data-go="quests"><i>📜</i><span>Quests</span></button>'
        good = '    <button data-go="achievements"><i>🏆</i><span>Achievements</span></button>\n    <button data-go="quests"><i>📜</i><span>Quests</span></button>\n  </nav>'
        if bad in html:
            html = html.replace(bad, good, 1)

    html = insert_after(
        html,
        '      <button class="big" data-go="achievements" style="margin-left:8px">🏆 Achievements</button>',
        '\n      <button class="big" data-go="quests" style="margin-left:8px">📜 Daily Quests</button>',
        'hero',
        once_token='Daily Quests</button>',
    )

    html = insert_before(html, '  <section id="achievements">', QUEST_SECTION, 'quests-section', once_token='<section id="quests">')

    html = insert_after(
        html,
        '  <button class="oemo" id="oEmoBtn" title="Emotes (keys 1-8)" aria-label="Emotes">😀</button>',
        '\n  <button class="oemo" id="oQuestBtn" title="Daily Quests" aria-label="Daily Quests">📜</button>\n  <button class="oemo" id="oTradeBtn" title="Trade with a friend" aria-label="Trade" style="display:none">🤝</button>',
        'hud-btns',
        once_token='id="oQuestBtn"',
    )

    html = insert_after(
        html,
        '    <button class="big green" id="oResume">▶ Keep playing</button>',
        '\n    <button class="big" id="qPauseBtn" style="margin-top:8px">📜 Daily Quests</button>\n    <button class="big" id="trPauseBtn" style="margin-top:8px">🤝 Trade with a friend</button>',
        'pause-btns',
        once_token='id="qPauseBtn"',
    )

    html = insert_before(html, '  <div class="opanel" id="oPausePanel">', PANELS, 'panels', once_token='id="qPanel"')

    # Top-level drawParty + GAMES card
    html = insert_after(html, "guy(ctx, 160, 160, 12, '#ff6fb5'); ctx.font = '22px sans-serif'; ctx.fillText('💃', 40, 60); ctx.fillText('🎵', 260, 60);\n}", '\n' + (DEV/'party'/'draw_party.js').read_text(), 'drawParty', once_token='function drawParty(')
    html = insert_after(
        html,
        'const GAMES = [\n',
        "  {id:'party', name:'Party Pad', emoji:'🎉', tag:'A cozy hangout for friends: dance, sit, snap a photo, kick the ball!', draw: drawParty, playable: true, isNew: true},\n",
        'GAMES',
        once_token="{id:'party', name:'Party Pad'",
    )

    # Rules modules before Obby IIFE
    rules = '\n' + (DEV/'quests'/'quests_logic.js').read_text() + '\n' + (DEV/'trade'/'trade_logic.js').read_text() + '\n' + (DEV/'party'/'party_logic.js').read_text() + '\n'
    html = insert_before(html, 'const Obby = (() => {', rules, 'rules', once_token='const Q_KEY = \'rubloxQuests\'')

    # Runtime inside IIFE, just before function stop()
    runtime = '\n' + (DEV/'quests'/'quests.js').read_text() + '\n' + (DEV/'trade'/'trade.js').read_text() + '\n' + (DEV/'party'/'party.js').read_text() + '\n  try { setTimeout(() => { try { qBind(); trBind(); qEnsure(); qPaint(); } catch (e){} }, 0); } catch (e){}\n\n'
    html = insert_before(html, '  function stop(){', runtime, 'runtime', once_token='function buildParty()')

    # Mode lists
    html = html.replace("'dreamhouse', 'lantern'].includes(m)", "'dreamhouse', 'lantern', 'party'].includes(m)")
    html = html.replace("mode === 'lantern' ? null : d", "mode === 'lantern' || mode === 'party' ? null : d")
    html = html.replace("mode === 'lantern') && (B.onGround", "mode === 'lantern' || mode === 'party') && (B.onGround")
    html = html.replace("mode === 'lantern'){ // pull the camera", "mode === 'lantern' || mode === 'party'){ // pull the camera")
    html = html.replace("mode !== 'lantern' && mode !== 'dreamhouse')", "mode !== 'lantern' && mode !== 'dreamhouse' && mode !== 'party')")

    html = replace_once(
        html,
        "if (mode === 'lantern') buildLantern();",
        "if (mode === 'party') buildParty(); else if (mode === 'lantern') buildLantern();",
        'build-chain',
    )

    # reset py on build
    html = html.replace('dh = null; lh = null;', 'dh = null; py = null; lh = null;')

    html = insert_after(
        html,
        "    if (mode === 'lantern'){ if (!window.__lhBound){ /* bound in lanternEnter */ } lanternEnter(); }",
        "\n    { const _pyb = $('#pyBox'); if (_pyb) _pyb.style.display = mode === 'party' ? '' : 'none'; const _pya = $('#pyAct'); if (_pya && mode !== 'party') _pya.classList.remove('show'); }\n    $('#obby').classList.toggle('pymode', mode === 'party');\n    if (mode === 'party') partyEnter();\n    try { if (typeof qBind === 'function') qBind(); if (typeof trBind === 'function') trBind(); if (typeof trTickHud === 'function') trTickHud(); } catch (e){}",
        'start-enter',
        once_token="if (mode === 'party') partyEnter();",
    )

    html = html.replace('if (lh) lanternStop();', 'if (py) partyStop(); if (lh) lanternStop();')
    html = html.replace('if (lh) lanternUpdate(dt);', 'if (py) partyUpdate(dt); if (lh) lanternUpdate(dt);')

    html = insert_before(
        html,
        "    if (mode === 'lantern' && lh && lhPad(jp)) return;",
        "    if (mode === 'party' && py && partyPad(jp)) return;\n",
        'pad',
        once_token='partyPad(jp)',
    )
    html = insert_before(
        html,
        "      if (mode === 'lantern' && lh && lhKey(e)) return;",
        "      if (mode === 'party' && py && partyKey(e)) return;\n",
        'key',
        once_token='partyKey(e)',
    )

    html = insert_after(
        html,
        "    else if (d.t === 'lh'){ try { if (typeof lhFromGuest === 'function') lhFromGuest(g, d); } catch (e){} }",
        "\n    else if (d.t === 'tr'){ try { if (typeof trFromGuest === 'function') trFromGuest(g, d); } catch (e){} }\n    else if (d.t === 'py'){ try { if (typeof partyFromGuest === 'function') partyFromGuest(g, d); } catch (e){} }",
        'mp-guest',
        once_token="d.t === 'tr'",
    )
    html = insert_after(
        html,
        "      case 'lh': try { if (typeof lhFromHost === 'function') lhFromHost(d); } catch (e){} break;",
        "\n      case 'tr': try { if (typeof trFromHost === 'function') trFromHost(d); } catch (e){} break;\n      case 'py': try { if (typeof partyFromHost === 'function') partyFromHost(d); } catch (e){} break;",
        'mp-host',
        once_token="case 'tr':",
    )

    # Event hooks
    html = insert_after(
        html,
        "  function achNote(ev, data){\n    if (!ev) return [];",
        "\n    try { if (typeof qNoteEv === 'function') qNoteEv(ev, data); } catch (e){}",
        'achNote',
        once_token='qNoteEv(ev, data)',
    )
    html = insert_after(
        html,
        "    setCoins(coins + bonus); td.earned = bonus; runCoins = (runCoins || 0) + bonus; confetti(); SND.win();",
        "\n    try { if (typeof qNoteHook === 'function') qNoteHook('tower-win', 1); } catch (e){}",
        'towerWin',
        once_token="qNoteHook('tower-win'",
    )
    html = insert_after(
        html,
        "  function fillBowl(){ if (!pt.pet) return; pt.food.visible = true; pt.pet.act = 'toBowl'; pt.pet.t = 0; banner('🍖 Dinner time, ' + pt.pet.d.n + '!'); SND.coin(); }",
        " try { if (typeof qNoteHook === 'function') qNoteHook('pet-feed', 1); } catch (e){}",
        'fillBowl',
        once_token="qNoteHook('pet-feed'",
    )
    html = insert_after(
        html,
        "    earn(20); SND.win(); confetti(); setTimeout(confetti, 600);",
        "\n    try { if (typeof qNoteHook === 'function') qNoteHook('pet-adopt', 1); } catch (e){}",
        'adoptOk',
        once_token="qNoteHook('pet-adopt'",
    )
    html = insert_after(
        html,
        "    dh.pieces[plot].push(rec); dh.meshes[plot].push(mesh);",
        "\n    try { if (!quiet && dh && plot === dh.mine && typeof qNoteHook === 'function') qNoteHook('dh-furn', 1); } catch (e){}",
        'dhPut',
        once_token="qNoteHook('dh-furn'",
    )
    html = insert_after(
        html,
        "    lh.riding = {kind: ride.kind, seat: ok.seat, name: ride.name || ride.kind};",
        "\n    try { if (typeof qNoteHook === 'function') qNoteHook('lh-ride', 1); } catch (e){}",
        'lhBoard',
        once_token="qNoteHook('lh-ride'",
    )
    html = insert_after(
        html,
        "  function win(){\n    won = true; SND.win();",
        "\n    try { if (mode === 'obby' && typeof qNoteHook === 'function') qNoteHook('obby-win', 1); } catch (e){}",
        'obby-win',
        once_token="qNoteHook('obby-win'",
    )

    html = insert_after(
        html,
        "      splash: L('rubloxSplash2', null),",
        "\n      quests: L('rubloxQuests', null),",
        'achSnapshot',
        once_token="quests: L('rubloxQuests'",
    )

    html = insert_after(
        html,
        "    {id: 'collection', name: 'Collection', emoji: '🪙'}\n  ];",
        '',  # placeholder, do category separately
        'skip-cat-empty',
        once_token='NEVER',
    ) if False else html

    html = replace_once(
        html,
        "    {id: 'collection', name: 'Collection', emoji: '🪙'}\n  ];",
        "    {id: 'collection', name: 'Collection', emoji: '🪙'},\n" + ACH_CAT + "  ];",
        'ACH_CATS',
    )
    html = insert_before(
        html,
        "                // Collection",
        ACH_ITEMS,
        'ACHIEVEMENTS',
        once_token="{id:'quest-first'",
    )

    html = insert_after(
        html,
        "  window.obbyDebug = {\n",
        DEBUG,
        'debug',
        once_token="qDemo(claimed)",
    )

    # trade cancel on drop / stop
    if "trOnDrop(" not in html[html.find('function mpOnStop') if 'function mpOnStop' in html else 0:]:
        if 'function mpOnStop(' in html:
            html = insert_after(
                html,
                # we'll search a unique start; may fail — optional
                'function mpOnStop(',
                '',
                'skip',
                once_token='NEVER',
            ) if False else html

    # Try to hook mpDrop
    for needle in ("function mpDrop(g, why){", "function mpDrop(g, why){"):
        if needle in html and "trOnDrop(" not in html.split(needle, 1)[1][:400]:
            html = insert_after(html, needle, " try { if (typeof trOnDrop === 'function') trOnDrop(g && g.uid); } catch (e){}", 'mpDrop', once_token="trOnDrop(g && g.uid)")
            break

    html = insert_after(
        html,
        "    mpOnStop();",
        "\n    try { if (typeof trOnDrop === 'function') trOnDrop('host'); } catch (e){} try { qClose(); const _tr = document.getElementById('trPanel'); if (_tr) _tr.classList.remove('show'); } catch (e){}",
        'stop-trade',
        once_token="trOnDrop('host')",
    )

    INDEX.write_text(html)
    print('injected into', INDEX, 'bytes', INDEX.stat().st_size)

if __name__ == '__main__':
    main()
