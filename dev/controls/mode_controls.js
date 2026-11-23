/* t337u: every game's own keyboard, Xbox controller and touch controls, shown from the pause menu ("🎮 Controls for this game").
   Each entry lists that game's own buttons first; "walk" adds the shared moving-around lines underneath.
   tests/mode_controls.js checks every game in GAMES has an entry with all three lists. */
const CTRL_WALK = {
  kb: ['WASD / Arrows: move', 'Space: jump', 'Shift: run', 'Drag the mouse: look', 'V: first person', 'Scroll: zoom', '1–8: emotes', 'Esc: pause menu'],
  pad: ['Left stick: move', 'Ⓐ: jump', 'L3 (press the left stick): run', 'Right stick: look', 'R3 twice: first person', 'LT / RT: zoom', 'View button (two squares): emotes', '☰ Start: pause menu (Ⓨ in the menu: these controls)'],
  touch: ['Left thumb: move', '⬆️: jump', '🏃: run', 'Swipe the right side: look', '👁️: first person', '😀: emotes', '⏸️ / ⚙️ button: pause menu'],
};
const MODE_CONTROLS = {
  treehouse: {kb: ['E or G: place a piece / ride it', 'Q: next piece', 'R: rotate', 'F or C: open the pieces box', 'X: delete mode', 'U: undo', '[ and ]: floor down / up'],
    pad: ['Ⓧ or RT: place a piece / ride it', 'Ⓨ: open the pieces box', 'LB: delete mode', 'RB: undo'], touch: ['Tap the big buttons to place, pick pieces, delete or undo'], walk: true},
  school: {kb: ['E or F: look / use', 'L or Y: Less scary', 'Enter: try the locker code'], pad: ['Ⓧ or RT: look / use', 'Ⓨ: Less scary'], touch: ['Tap the big action button'], walk: true},
  fieldtrip: {kb: ['E or F: look / collect / talk / board the bus'], pad: ['Ⓧ or Ⓨ: look / collect / talk / board the bus'], touch: ['Tap the big action button to board, talk or pick things up'], walk: true},
  aquarium: {kb: ['E or F: look / talk / board the bus / gentle touch'], pad: ['Ⓧ or Ⓨ: look / talk / board the bus / gentle touch'], touch: ['Tap the big action button to board, look or touch gently'], walk: true},
  elevator: {kb: ['E or F: act / shop', 'I: floor list', 'H: help', 'Voting: ← → or 1–3 to pick, Enter or Space to vote'],
    pad: ['Ⓧ: act / shop', 'Ⓨ: floor list', 'Ⓑ: close pop-ups', 'Voting: ✚ d-pad to pick, Ⓐ to vote'], touch: ['Tap the big buttons to act and vote'], walk: true},
  mansion: {kb: ['E or F: read / flip / unlock', 'L: Less scary'], pad: ['Ⓧ: read / flip / unlock', 'Ⓨ: Less scary'], touch: ['Tap the big action button'], walk: true},
  shelter: {kb: ['E or F: rescue / care / desk', 'H: send a happy pal home', 'U: bigger kennels'], pad: ['Ⓧ: rescue / care / desk', 'Ⓨ: send a happy pal home'], touch: ['Tap the big buttons to act'], walk: true},
  winter: {kb: ['E: act', 'F: cocoa (Mugsy or Snugmug)', 'Q: throw a snowball, or cycle Snugmug toppings', 'On a sled: A / D steer, Space hop', 'On the rink: Space does a trick'],
    pad: ['Ⓧ: act / cocoa', 'RB: throw a snowball', 'LB: cycle Snugmug toppings', 'Ⓑ: hop off the sled, or cash in your skating laps', 'On a sled: left stick steers, Ⓐ hops'], touch: ['Tap the big buttons to act', '❄️: throw a snowball', '🍭: cycle Snugmug toppings', 'On a sled: left thumb steers, ⬆️ hops'], walk: true},
  vet: {kb: ['E or Space: help / use / get in the ambulance', 'Drag or click: look'], pad: ['Ⓧ: help / use', 'Ⓐ: use when a button shows', 'Ⓑ: get out of the ambulance'], touch: ['Swipe: look', 'Tap the big buttons to help'], walk: true},
  mermaid: {kb: ['E: act', 'Space or R: swim up', 'Shift or F: swim down'], pad: ['Ⓧ: act', 'Ⓐ, RT or RB: swim up', 'LT or LB: swim down'], touch: ['⬆️ ⬇️: swim up and down', 'Tap the big buttons to act'], walk: true},
  garden: {kb: ['E or F: plant / water / harvest / shop'], pad: ['Ⓧ: plant / water / harvest / shop'], touch: ['Tap the big action button'], walk: true},
  meadow: {kb: ['Hold E or F: charge a snack toss, let go to throw', 'E near a friend: say hi / act'], pad: ['Hold RT: charge a snack toss, let go to throw', 'Ⓧ: act'], touch: ['Hold the big button to charge, let go to throw'], walk: true},
  rides: {kb: ['E or F: place / ride', 'Q: next ride (Shift+Q: back)', 'R: rotate', 'C or Delete: pick up / delete mode', 'Ctrl+Z: undo', 'X: hop off', 'H: help'],
    pad: ['Ⓧ or RT: place / ride', 'LB / RB: pick a ride', 'Ⓨ: rotate', 'LB + Ⓧ: delete mode', 'Ⓑ: hop off', 'Tutorial: ✚▶ next, ⧉ View skip'], touch: ['Tap the big buttons to place, rotate and ride'], walk: true},
  hive: {kb: ['E or F: talk / gather / make honey'], pad: ['Ⓧ: talk / gather / make honey'], touch: ['Tap the big action button'], walk: true},
  camp: {kb: ['Hold E or F: pick up / add logs', 'L: shine your light', 'J: journal'], pad: ['Hold Ⓧ: pick up / add logs', 'Ⓨ or RT: act', 'RB: shine your light'], touch: ['Hold the big button to pick up / add logs', 'Tap the big buttons to act'], walk: true},
  cafe: {kb: ['E or F: make / serve', 'B: decorate'], pad: ['Ⓧ or Ⓨ: make / serve'], touch: ['Tap the big action button'], walk: true},
  fish: {kb: ['E or F: cast / reel', 'I: fish index'], pad: ['Ⓧ or Ⓨ: cast / reel'], touch: ['Tap the big button to cast and reel', 'Tap 📖 for the fish index'], walk: true},
  petshow: {kb: ['E or F: teach / perform'], pad: ['Ⓧ or Ⓨ: teach / perform'], touch: ['Tap the big action button'], walk: true},
  hunt: {kb: ['E or F: dig', 'M: map'], pad: ['Ⓧ or Ⓨ: dig'], touch: ['Tap the big button to dig'], walk: true},
  snowfest: {kb: ['E or F: play / use'], pad: ['Ⓧ or Ⓨ: play / use'], touch: ['Tap the big action button'], walk: true},
  party: {kb: ['E or F: dance / sit / use'], pad: ['Ⓧ or Ⓨ: dance / sit / use'], touch: ['Tap the big action button'], walk: true},
  lantern: {kb: ['E: use (doorbell, lights, door, bed, doodles)', 'G: write on a wall', 'T: decorate', 'M: map', 'Arcade / prize booth: arrows pick, Space or Enter go, Esc close'],
    pad: ['Ⓧ: use', 'Ⓨ: map', 'LB: write on a wall', 'RB: decorate', 'Ⓑ: back / close', 'Arcade / prize booth: ✚ d-pad pick, Ⓐ or Ⓧ go'], touch: ['The yellow button rings the doorbell, flips lights or uses a thing', '🎩 Call Maestro Gleam when a friend is fizzled'], walk: true},
  dreamhouse: {kb: ['E: buy / carry / build', 'Q: show spots (empty hands) / drop', 'Tab: show spots', 'R: rotate', '1–9: pick a job', 'Esc: menu'],
    pad: ['Ⓧ, Ⓐ or RT: buy / carry / build', 'Ⓑ: rotate', 'Ⓨ: invite friends', 'LB / RB: pick a job', '✚▼: show spots'], touch: ['Left thumb: move', 'Tap 🏡 to buy, carry, mix and lay bricks'], walk: false},
  pethotel: {kb: ['E: check in / care / check out'], pad: ['Ⓧ: check in / care / check out'], touch: ['Tap 🛎️ to check in, care or check out'], walk: true},
  dance: {kb: ['← ↓ ↑ → or A S W D: hit the notes', 'Esc: pause'], pad: ['✚ d-pad: hit the notes', '☰ Start: pause'], touch: ['Tap the ← ↓ ↑ → pads in time'], walk: false},
  haunt: {kb: ['E: use / solve a puzzle', 'Esc: home when you lose'], pad: ['Ⓧ: use / solve a puzzle'], touch: ['Tap 👻 actions'], walk: true},
  stable: {kb: ['E: care / mount / get off', 'Space: jump (on your pony)', 'Esc: close the pony picker'], pad: ['Ⓧ: care / mount / get off', 'Ⓐ: jump (on your pony)'], touch: ['Tap 🐴 actions'], walk: true},
  icecream: {kb: ['E: use a scoop station', 'Esc: close the station'], pad: ['Ⓧ: use a scoop station', 'Ⓑ: close'], touch: ['Tap 🍦 Station to scoop'], walk: true},
  tower: {kb: ['Climb! Gold pads are checkpoints'], pad: ['Climb! Gold pads are checkpoints'], touch: ['Climb! Gold pads are checkpoints'], walk: true},
  photostudio: {kb: ['E: take a photo', 'Space or Enter: snap', 'Q / E: pose', 'B: backdrop', 'F: framing', 'C: angle', 'T: shape', 'K: border', 'G: your photos', 'Esc: done'],
    pad: ['Ⓧ: take a photo', 'Ⓐ: snap', 'LB / RB: pose', '✚◀▶: backdrop', '✚▲: framing', '✚▼: angle', 'Ⓧ (camera on): border', 'LT / RT: shape', 'Ⓨ: your photos', 'Ⓑ: done'], touch: ['Tap 📸 Take Photo, then tap the bar to change pose and backdrop', '📸 Snap!'], walk: true},
  waterpark: {kb: ['E: ride', 'R: rides menu', 'On a float: A / D steer, Space paddle'], pad: ['Ⓧ: ride', 'Ⓨ: rides menu', 'On a float: left stick steers, Ⓐ paddles'], touch: ['Tap a ride button', 'On a float: left thumb steers, ⬆️ paddles'], walk: true},
  bakery: {kb: ['E: use a cake station', 'Esc: close'], pad: ['Ⓧ: use a cake station', 'Ⓑ: close'], touch: ['Tap 🎂 Station to bake'], walk: true},
  petisland: {kb: ['E: ask your pet', 'J: journal'], pad: ['Ⓧ: ask your pet', 'Ⓨ: journal'], touch: ['Tap 🐾 to ask your pet'], walk: true},
  autumn: {kb: ['Jump in the leaf piles and find 12 pumpkins'], pad: ['Jump in the leaf piles and find 12 pumpkins'], touch: ['Jump in the leaf piles and find 12 pumpkins'], walk: true},
  fashion: {kb: ['C: show menu (lobby)', 'E: wardrobe (dressing room)', 'On the runway: 1–7 pose; rating a friend: 1–5 stars'],
    pad: ['Ⓧ: show menu / wardrobe', 'On the runway: Ⓧ / Ⓨ change pose', 'Rating a friend: ✚◀▶ stars, LB / RB pick a tag, Ⓧ add it'], touch: ['Tap ✨ Show menu', 'Tap the poses and stars on screen'], walk: true},
  hide: {kb: ['Seeker: touch hiders to find them', 'Hiders: find a sneaky spot before the count ends'], pad: ['Seeker: touch hiders to find them', 'Hiders: find a sneaky spot before the count ends'], touch: ['Seeker: touch hiders to find them'], walk: true},
  splash: {kb: ['F: throw a pebble 🪨', 'Q: shove 👊', 'R: pull a friend 🤝'], pad: ['RB: throw a pebble 🪨', 'Ⓧ: shove 👊', 'LB: pull a friend 🤝'], touch: ['🪨: pebble', '👊: shove'], walk: true},
  race: {kb: ['W / ↑: go', 'S / ↓: brake', 'A / D: steer', 'Space: hop (hold + steer to drift)', 'Shift: use a power-up', 'V: first person', 'Esc: pause'],
    pad: ['RT or Ⓐ: go', 'LT or Ⓑ: brake', 'Left stick: steer', 'RB or Ⓧ: hop / drift', 'LB or Ⓨ: use a power-up', '☰ Start: pause'], touch: ['Your ride goes by itself: left thumb steers (pull back to brake)', '⬆️: hop (hold + steer to drift)', '🎁: use a power-up', '👁️: first person'], walk: false},
  pets: {kb: ['E: use / talk', 'M: my pets', 'I: Pet Index', 'In the car: W gas, S brake, A / D steer'],
    pad: ['Ⓧ: pet / use', 'RB: 🎾 throw', 'LB: 🍖 feed', 'Ⓨ: 🦮 walk', 'Ⓑ: my pets', 'RT: tricks', 'In the car: RT gas, LT brake, stick steers, Ⓨ camera'], touch: ['Tap the yellow button to use things', 'In the car: left thumb steers, ⛽ Go, 🛑 Brake'], walk: true},
  obby: {kb: ['Grab the coins, dodge the red lava, reach the 🏆'], pad: ['Grab the coins, dodge the red lava, reach the 🏆'], touch: ['Grab the coins, dodge the red lava, reach the 🏆'], walk: true},
  build: {kb: ['Click: place a block', 'Shift+click or right-click: delete', 'X: build / delete / paint', 'Q / E: pick a block', 'Z: undo', 'G: play-test', 'B: share code'],
    pad: ['RT: place', 'LT: delete', 'LB / RB: pick a block', 'Ⓧ: build / delete / paint', 'Ⓨ: undo', '✚▲: play-test', '✚▼: share code'], touch: ['Tap: place a block', '🔨: Build / Delete / 🎨 Paint', '▶️: play-test', '📤: share'], walk: true},
  tag: {kb: ["Don't be IT! Touch someone to pass it on"], pad: ["Don't be IT! Touch someone to pass it on"], touch: ["Don't be IT! Touch someone to pass it on"], walk: true},
  lava: {kb: ['Climb fast, the lava is rising!'], pad: ['Climb fast, the lava is rising!'], touch: ['Climb fast, the lava is rising!'], walk: true},
  nds: {kb: ['Survive the disasters: get to high ground and dodge!'], pad: ['Survive the disasters: get to high ground and dodge!'], touch: ['Survive the disasters: get to high ground and dodge!'], walk: true},
};
function modeControls(id){
  const c = MODE_CONTROLS[id]; if (!c) return null;
  const out = {};
  ['kb', 'pad', 'touch'].forEach(k => { out[k] = {own: c[k].slice(), walk: c.walk ? CTRL_WALK[k].slice() : []}; });
  return out;
}
if (typeof globalThis !== 'undefined'){ globalThis.MODE_CONTROLS = MODE_CONTROLS; globalThis.CTRL_WALK = CTRL_WALK; globalThis.modeControls = modeControls; }
