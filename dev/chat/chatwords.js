  /* ===================== Chat word lists (t285u) ===================== */
  /* Kept in its own module so the filter logic and the lists can be tested apart.
     These words are used only for matching. Renders must never show them. */
  (function (root) {
    const CHAT_WORDS = {
      /* Severe or clearly not-for-kids: match as whole words or spaced/leet evasions, never as a bit of a longer safe word. */
      severe: [
        'fuck', 'fuck', 'fuk', 'fck', 'fcker', 'fucking', 'fucked', 'motherfucker',
        'shit', 'shite', 'bullshit',
        'bitch', 'bitchy',
        'cunt',
        'ass',
        'pussy',
        'slut', 'whore', 'hooker',
        'dick', 'dildo', 'cock', 'penis', 'vagina', 'boob', 'boobs', 'tit', 'tits', 'nude', 'nudes', 'porn', 'porno', 'sex', 'sexy', 'sexual', 'horny', 'orgasm', 'blowjob',
        'nigger', 'nigga', 'nigg', 'nigr',
        'fag', 'faggot', 'fgt',
        'retard', 'retarded',
        'rape', 'rapist', 'raping',
        'nazi', 'hitler', 'kkk',
        'kill', 'killing', 'murder', 'murderer', 'suicide', 'stab', 'stabbing',
        'gun', 'guns', 'shoot', 'shooting', 'bomb', 'bombs'
      ],
      mean: [
        'stupid', 'dumb', 'loser', 'idiot', 'ugly'
      ],
      phrases: [
        'hate you', 'hate u', 'i hate you', 'i hate u',
        'shut up', 'shut it', 'shut your',
        'kill you', 'kill u', 'kys',
        'how old', 'how old are you', 'whats your age', "what's your age", 'what is your age',
        'add me on', 'follow me on', 'my address', 'my number', 'call me at', 'text me at', 'dm me'
      ],
      /* Whole-word only extras that would be noisy as stems. */
      mild: [
        'damn', 'crap', 'hell', 'poop', 'butt', 'fart', 'piss', 'bastard', 'jerk'
      ]
    };
    /* Safe words testers should confirm are not filtered (Scunthorpe). Not used as a matcher; documented for tests. */
    CHAT_WORDS.safe = [
      'class', 'classic', 'classes', 'classroom', 'classification',
      'assassin', 'assassins',
      'grass', 'grasses', 'grasshopper',
      'sussex', 'scunthorpe',
      'pass', 'password', 'compass', 'passage', 'passenger',
      'assume', 'assumption', 'assistant', 'assessment', 'assets', 'associate',
      'bass', 'cassette', 'cocktail',
      'therapist', 'therapy',
      'scrap', 'scraps',
      'attribute', 'attributes', 'button', 'butter', 'grape',
      'document', 'hello', 'skill', 'skills',
      'passion', 'necessary', 'analyses', 'manhattan', 'japanese',
      'i died', 'good game', 'hello class'
    ];
    root.CHAT_WORDS = CHAT_WORDS;
    if (typeof module !== 'undefined' && module.exports) module.exports = CHAT_WORDS;
  })(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
  /* ===================== end Chat word lists ===================== */
