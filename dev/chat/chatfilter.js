  /* ===================== Chat filter (t285u) ===================== */
  /* Filter on the sender and again on every receiver. Kid-safe: profanity, slurs,
     insults, sexual/violent words, and personal info become ####. Word-boundary
     matching avoids the Scunthorpe problem (class, assassin, grass, Sussex…). */
  (function (root) {
    const LEET = { '4': 'a', '@': 'a', '3': 'e', '1': 'i', '!': 'i', '|': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't', '8': 'b', '9': 'g', '2': 'z' };
    const MAX = 80;
    const STREET = 'street|st|road|rd|avenue|ave|boulevard|blvd|lane|ln|drive|dr|court|ct|way|place|pl|circle|cir|terrace|ter|parkway|pkwy';
    const SOCIAL = 'discord|snap|snapchat|instagram|insta|tiktok|tik tok|facebook|fb|twitter|x\\.com|youtube|yt|kik|telegram|whatsapp|twitch';

    function words(){
      return root.CHAT_WORDS || (typeof CHAT_WORDS !== 'undefined' ? CHAT_WORDS : {severe:[], mean:[], phrases:[], mild:[]});
    }
    function hashes(n){ n = Math.max(4, Math.min(16, n | 0)); return '####'.slice(0, 4); } /* always #### so renders never hint at the word */
    function leetChar(ch){ const c = ch.toLowerCase(); return LEET[c] || c; }

    /* Lowercased copy with an index map back to the original. Leet and punctuation stand-ins are handled in the pattern so "f@ck" is caught without turning @ into "a". */
    function normMap(src){
      const out = [], map = [];
      for (let i = 0; i < src.length; i++){
        out.push(src.charAt(i).toLowerCase());
        map.push(i);
      }
      return {s: out.join(''), map};
    }
    function letterClass(ch){
      const subs = {a:'a4@', e:'e3', i:'i1!|', o:'o0', s:'s5$', t:'t7+', b:'b8', g:'g9', z:'z2'};
      const set = subs[ch] || ch;
      const esc = set.split('').map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
      return '(?:[' + esc + ']+|[@*$&+=!%^._\\-]{1,3})';
    }

    function pushSpan(spans, a, b, reason){
      if (a < 0 || b <= a) return;
      spans.push({a, b, reason});
    }

    /* Merge overlapping spans. */
    function merge(spans){
      if (!spans.length) return [];
      spans.sort((x, y) => x.a - y.a || y.b - x.b);
      const out = [spans[0]];
      for (let i = 1; i < spans.length; i++){
        const p = out[out.length - 1], c = spans[i];
        if (c.a <= p.b){ p.b = Math.max(p.b, c.b); if (c.reason && p.reason.indexOf(c.reason) < 0) p.reason += ',' + c.reason; }
        else out.push(c);
      }
      return out;
    }

    function applySpans(src, spans){
      let out = '', i = 0;
      const m = merge(spans);
      for (const sp of m){
        if (sp.a > i) out += src.slice(i, sp.a);
        out += hashes(sp.b - sp.a);
        i = sp.b;
      }
      if (i < src.length) out += src.slice(i);
      return out;
    }

    function findRegex(src, re, reason, spans){
      re.lastIndex = 0;
      const flags = re.flags.indexOf('g') >= 0 ? re.flags : re.flags + 'g';
      const r = new RegExp(re.source, flags);
      let m;
      while ((m = r.exec(src))){
        pushSpan(spans, m.index, m.index + m[0].length, reason);
        if (!m[0].length) r.lastIndex++;
      }
    }

    function piiSpans(src){
      const spans = [];
      const s = src;
      findRegex(s, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, 'email', spans);
      findRegex(s, /(?:https?:\/\/|www\.)[^\s<>]+/gi, 'url', spans);
      findRegex(s, /\b[a-z0-9-]+\.(?:com|net|org|io|co|gg|tv|me|uk|us|info|biz|xyz|online|site|app)(?:\/[^\s]*)?/gi, 'url', spans);
      findRegex(s, /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g, 'phone', spans);
      findRegex(s, /\b\d{6,}\b/g, 'digits', spans);
      findRegex(s, new RegExp('\\b\\d{1,6}\\s+[a-z0-9.#\\s]{1,40}\\s+(?:' + STREET + ')\\b', 'gi'), 'address', spans);
      findRegex(s, /(?:^|[\s])@[a-z0-9_.]{2,}/gi, 'handle', spans);
      findRegex(s, new RegExp('\\b(?:' + SOCIAL + ')\\b(?:\\s*[:./@]|\\s+(?:me|at|is|user|handle|name))', 'gi'), 'social', spans);
      findRegex(s, /\b(?:how\s+old(?:\s+are\s+you)?|what(?:'s|s| is)\s+your\s+age)\b/gi, 'age', spans);
      findRegex(s, /\b(?:i(?:'?m| am)\s+\d{1,3})\b/gi, 'age', spans);
      findRegex(s, /\b(?:add me on|follow me on|my address|my number|call me at|text me at)\b/gi, 'contact', spans);
      return spans;
    }

    function unique(list){
      const seen = new Set(), out = [];
      (list || []).forEach(w => {
        const s = String(w || '').toLowerCase().replace(/[^a-z]+/g, '');
        if (s.length >= 2 && !seen.has(s)){ seen.add(s); out.push(s); }
      });
      return out;
    }

    /* A bad word spelled with optional separators, leet, punctuation stand-ins, and repeated letters, not touching a longer letter run. */
    function evasionRe(word){
      const parts = word.split('').map(letterClass);
      return new RegExp('(^|[^a-z])(' + parts.join('[^a-z]*') + ')(?![a-z])', 'gi');
    }


    function wordSpans(src){
      const W = words();
      const spans = [];
      const nm = normMap(src);
      const ns = nm.s;
      const bag = unique([].concat(W.severe || [], W.mean || [], W.mild || []));
      bag.forEach(w => {
        const re = evasionRe(w);
        let m;
        while ((m = re.exec(ns))){
          const inner = m[2] ? m.index + m[1].length : m.index;
          const end = m.index + m[0].length - (m[0].match(/[^a-z]$/i) && !m[2] ? 1 : 0);
          /* m[2] is the word body; map back through normMap */
          const aOff = m[2] ? inner : m.index;
          const bOff = m[2] ? inner + m[2].length : m.index + m[0].length;
          const a = nm.map[aOff];
          const last = Math.min(bOff, nm.map.length) - 1;
          const b = (nm.map[last] != null ? nm.map[last] : src.length - 1) + 1;
          if (a != null && b > a) pushSpan(spans, a, b, 'word');
          if (!m[0].length) re.lastIndex++;
        }
      });
      (W.phrases || []).forEach(p => {
        const letters = String(p).toLowerCase().replace(/[^a-z]+/g, ' ').trim().split(/\s+/);
        if (!letters.length) return;
        const body = letters.map(w => w.split('').map(letterClass).join('[^a-z]*')).join('[^a-z]+');
        const re = new RegExp('(^|[^a-z])(' + body + ')(?![a-z])', 'gi');
        let m;
        while ((m = re.exec(ns))){
          const aOff = m[2] ? m.index + m[1].length : m.index;
          const bOff = m[2] ? aOff + m[2].length : m.index + m[0].length;
          const a = nm.map[aOff];
          const last = Math.min(bOff, nm.map.length) - 1;
          const b = (nm.map[last] != null ? nm.map[last] : src.length - 1) + 1;
          if (a != null && b > a) pushSpan(spans, a, b, 'phrase');
          if (!m[0].length) re.lastIndex++;
        }
      });
      return spans;
    }

    function chatFilter(text, opts){
      opts = opts || {};
      const max = opts.max || MAX;
      let src = String(text == null ? '' : text).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
      src = src.replace(/\s+/g, ' ').trim();
      if (src.length > max) src = src.slice(0, max);
      if (!src) return {ok: true, text: '', blocked: false, reasons: []};
      const spans = piiSpans(src).concat(wordSpans(src));
      const merged = merge(spans);
      const out = merged.length ? applySpans(src, merged) : src;
      const reasons = [];
      merged.forEach(sp => String(sp.reason || '').split(',').forEach(r => { if (r && reasons.indexOf(r) < 0) reasons.push(r); }));
      return {ok: true, text: out, blocked: merged.length > 0, reasons, length: out.length};
    }

    function chatIsQuickSafe(text, list){
      const t = String(text || '').trim();
      return (list || []).some(p => p === t);
    }

    root.chatFilter = chatFilter;
    root.chatIsQuickSafe = chatIsQuickSafe;
    root.CHAT_FILTER_MAX = MAX;
    if (typeof module !== 'undefined' && module.exports) module.exports = {chatFilter, chatIsQuickSafe, CHAT_FILTER_MAX: MAX};
  })(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
  /* ===================== end Chat filter ===================== */
