/* Wobblevator — original Rublox elevator hop. Ride Bingle's wobbly lift
   between quirky floors. Original names and floors only. Save key rubloxElevator.
   Caught on a floor = everyone is okay, back in the lift, streak resets. No fighting, no gore. */
(function (root) {
  const ELEV_KEY = 'rubloxElevator';
  const ELEV_VER = 2;
  const ELEV_SHOP_EVERY = 8;
  const ELEV_RIDE = 4.6;
  const ELEV_INTER = 2.2;
  const ELEV_BAG_KEEP = 0.3;

  function F(o){ return o; }

  const ELEV_FLOORS = [
    F({id:'pillowpath', name:'Pillow Path', emoji:'🛏️', kind:'obby', seconds:28, coins:6, hint:'Bounce across the pillows to the glowing door.', clear:'door', sky:'#f7d6ea', floor:'#f3d6ea', wall:'#f8eaf2', accent:'#ffd0e8'}),
    F({id:'sockhunt', name:'Sock Hunt', emoji:'🧦', kind:'find', seconds:24, coins:6, hint:'Find Captain Sock’s missing sock and bring it back.', clear:'find', sky:'#cfe0ff', floor:'#dce8ff', wall:'#e8f0ff', accent:'#3a86ff', item:'sock'}),
    F({id:'soapsurge', name:'Soap Surge', emoji:'🫧', kind:'survive', seconds:16, coins:7, hint:'The soap bars zoom around — don’t get slipped!', clear:'timer', sky:'#c8f0ff', floor:'#c8f0ff', wall:'#e4f8ff', accent:'#9fe7ff', haz:'soap'}),
    F({id:'pieparade', name:'Pie Parade', emoji:'🥧', kind:'dodge', seconds:16, coins:7, hint:'Dodge the flying pies until the ding!', clear:'timer', sky:'#ffe6d6', floor:'#ffe6d6', wall:'#fff0e6', accent:'#e07a3f', haz:'pie'}),
    F({id:'chimeorder', name:'Chime Order', emoji:'🔔', kind:'puzzle', seconds:22, coins:8, hint:'Ring the bells in the order Bingle hummed.', clear:'seq', sky:'#efe7ff', floor:'#efe7ff', wall:'#f6f1ff', accent:'#7c5cff', seq:3}),
    F({id:'lanternhall', name:'Lantern Hall', emoji:'🕯️', kind:'creepy', seconds:20, coins:8, hint:'Stay in the moving lantern light and reach the lamp.', clear:'lit', sky:'#141028', floor:'#1a1630', wall:'#2a2448', accent:'#ffe566'}),
    F({id:'tickletiles', name:'Tickle Tiles', emoji:'😆', kind:'funny', seconds:18, coins:6, hint:'Step on the giggle tiles. Avoid the grumpy ones!', clear:'timer', sky:'#e8ffe9', floor:'#e8ffe9', wall:'#f3fff4', accent:'#ffd23f', tiles:true}),
    F({id:'balloonbounce', name:'Balloon Bounce', emoji:'🎈', kind:'dodge', seconds:16, coins:7, hint:'Dodge the bouncy balloons and make it to the door.', clear:'timer', sky:'#fff0f6', floor:'#fff0f6', wall:'#fff7fb', accent:'#ff6fb5', haz:'balloon'}),
    F({id:'lostlunch', name:'Lost Lunch', emoji:'🍱', kind:'find', seconds:22, coins:6, hint:'Niblet lost a lunchbox. Find it before the timer!', clear:'find', sky:'#ffe9c8', floor:'#ffe9c8', wall:'#fff4e0', accent:'#c45c1a', item:'lunch'}),
    F({id:'jellyhills', name:'Jelly Hills', emoji:'🟣', kind:'obby', seconds:28, coins:8, hint:'Boing over the jelly mounds to the door.', clear:'door', sky:'#e5d4ff', floor:'#e5d4ff', wall:'#f0e6ff', accent:'#b57cff'}),
    F({id:'shadowpeek', name:'Shadow Peek', emoji:'👀', kind:'creepy', seconds:20, coins:8, hint:'Walk to the night-light. Don’t linger in the peeks.', clear:'door', sky:'#121018', floor:'#16141f', wall:'#221e2c', accent:'#7c5cff', haz:'peek'}),
    F({id:'partypaint', name:'Party Paint', emoji:'🎨', kind:'funny', seconds:20, coins:7, hint:'Tap the blank faces to give them big silly smiles.', clear:'paint', sky:'#fff4e0', floor:'#fff4e0', wall:'#fffaf0', accent:'#ffd23f', paints:3}),
    F({id:'snackstop', name:'Snack Stop', emoji:'🍪', kind:'shop', seconds:14, coins:4, hint:'A cozy rest. Buy a lucky cookie, or just ride on.', clear:'shop', sky:'#ffe8cc', floor:'#ffe8cc', wall:'#fff3e0', accent:'#c45c1a'}),
    F({id:'confetticannon', name:'Confetti Cannon', emoji:'🎉', kind:'dodge', seconds:15, coins:7, hint:'Confetti bursts out — hop around it until the ding!', clear:'timer', sky:'#fff7d6', floor:'#fff7d6', wall:'#fffbe8', accent:'#ff4d5e', haz:'confetti'}),

    F({id:'cloudsteps', name:'Cloud Steps', emoji:'☁️', kind:'obby', seconds:26, coins:7, hint:'Hop the puffy clouds up to the glowing door.', clear:'door', sky:'#c8e8ff', floor:'#d9f0ff', wall:'#f2fbff', accent:'#ffffff'}),
    F({id:'cheeseramps', name:'Cheese Ramps', emoji:'🧀', kind:'obby', seconds:26, coins:7, hint:'Climb the holey cheese ramps and reach the door.', clear:'door', sky:'#ffe9a8', floor:'#ffe08a', wall:'#fff3c8', accent:'#f0c44c'}),
    F({id:'booknooks', name:'Book Nooks', emoji:'📚', kind:'obby', seconds:26, coins:7, hint:'Climb the stacked storybooks to the door.', clear:'door', sky:'#eadcc8', floor:'#e2d0b4', wall:'#f4eadc', accent:'#c45c1a'}),
    F({id:'buttonbox', name:'Button Box', emoji:'🔘', kind:'find', seconds:22, coins:6, hint:'Find the missing coat button and drop it in the tin.', clear:'find', sky:'#f0e4d8', floor:'#efe0d0', wall:'#f7efe6', accent:'#8b5a2b', item:'button'}),
    F({id:'starmap', name:'Star Map', emoji:'⭐', kind:'find', seconds:22, coins:7, hint:'A star fell out of the map. Bring it back to the desk.', clear:'find', sky:'#1a2048', floor:'#24305c', wall:'#2c3a6e', accent:'#ffd23f', item:'star'}),
    F({id:'teacuptrail', name:'Teacup Trail', emoji:'🍵', kind:'find', seconds:22, coins:6, hint:'Marm’s teacup rolled away. Find it and bring it back.', clear:'find', sky:'#e7f6e8', floor:'#def0df', wall:'#f3faf3', accent:'#2ec27e', item:'cup'}),
    F({id:'leafstorm', name:'Leaf Storm', emoji:'🍃', kind:'survive', seconds:16, coins:7, hint:'Swirling leaves zip by — stay clear until the ding!', clear:'timer', sky:'#f3e0b8', floor:'#e8d59a', wall:'#f8ebd0', accent:'#d08a2f', haz:'leaf'}),
    F({id:'foamflood', name:'Foam Flood', emoji:'🧴', kind:'survive', seconds:16, coins:7, hint:'Foam puddles slide around. Don’t get soaped!', clear:'timer', sky:'#e8f6ff', floor:'#d8eefc', wall:'#f4fbff', accent:'#7ec8ea', haz:'foam'}),
    F({id:'sparklerush', name:'Sparkle Rush', emoji:'✨', kind:'survive', seconds:15, coins:7, hint:'Keep off the zooming sparkles until the ding!', clear:'timer', sky:'#2a1848', floor:'#3a2460', wall:'#4a3078', accent:'#ffd23f', haz:'sparkle'}),
    F({id:'muffinmeteor', name:'Muffin Meteors', emoji:'🧁', kind:'dodge', seconds:16, coins:7, hint:'Fresh muffins are falling. Dodge them until the ding!', clear:'timer', sky:'#ffe4d2', floor:'#ffd8c0', wall:'#fff0e6', accent:'#c45c1a', haz:'muffin'}),
    F({id:'ribbonrain', name:'Ribbon Rain', emoji:'🎀', kind:'dodge', seconds:16, coins:7, hint:'Dodge the looping ribbons and wait for the ding.', clear:'timer', sky:'#ffe0ef', floor:'#ffd0e6', wall:'#fff0f6', accent:'#ff6fb5', haz:'ribbon'}),
    F({id:'colortaps', name:'Color Taps', emoji:'🔴', kind:'puzzle', seconds:22, coins:8, hint:'Tap the color pads in the order they blinked.', clear:'seq', sky:'#fff5d8', floor:'#fff0c4', wall:'#fffaf0', accent:'#3a86ff', seq:3}),
    F({id:'switchrow', name:'Switch Row', emoji:'🔀', kind:'puzzle', seconds:22, coins:8, hint:'Flip the switches in Bingle’s pattern.', clear:'seq', sky:'#dce8dc', floor:'#d0e0d0', wall:'#eaf2ea', accent:'#2ec27e', seq:3}),
    F({id:'hushhallway', name:'Hush Hallway', emoji:'🤫', kind:'creepy', seconds:20, coins:8, hint:'Stay in the soft night-light and reach the lamp.', clear:'lit', sky:'#1c1828', floor:'#241e32', wall:'#322844', accent:'#c9b6ff'}),
    F({id:'atticwink', name:'Attic Wink', emoji:'🖼️', kind:'creepy', seconds:20, coins:8, hint:'Walk to the door. Don’t stand in a winking portrait beam.', clear:'door', sky:'#2a2218', floor:'#3a2e20', wall:'#4a3c2c', accent:'#e8c48a', haz:'wink'}),
    F({id:'honkfloor', name:'Honk Floor', emoji:'📯', kind:'funny', seconds:20, coins:7, hint:'Honk every silly horn. They love the attention.', clear:'paint', sky:'#ffe9a0', floor:'#ffe080', wall:'#fff4c8', accent:'#ff9f1c', paints:3}),
    F({id:'mustachewall', name:'Mustache Wall', emoji:'🥸', kind:'funny', seconds:20, coins:7, hint:'Stick a curly mustache on each blank portrait.', clear:'paint', sky:'#f0e0c8', floor:'#e8d4b4', wall:'#f7ece0', accent:'#5a3a1e', paints:3}),
    F({id:'cocoanook', name:'Cocoa Nook', emoji:'☕', kind:'shop', seconds:14, coins:4, hint:'A warm rest. Buy a lucky cocoa, or just ride on.', clear:'shop', sky:'#f0d4c0', floor:'#e8c8b0', wall:'#f8e6d8', accent:'#8b4a28'}),
    F({id:'goldengong', name:'Golden Gong', emoji:'🥇', kind:'special', seconds:20, coins:12, hint:'A rare stop! Ring the golden gong for a lucky ding.', clear:'seq', sky:'#fff4c0', floor:'#ffe98a', wall:'#fff8d8', accent:'#f0c44c', rare:true, seq:1}),
    F({id:'skyterrace', name:'Sky Terrace', emoji:'🌅', kind:'special', seconds:22, coins:12, hint:'A rare view. Stroll to the sparkling door and take it in.', clear:'door', sky:'#ffc8a0', floor:'#ffd8b8', wall:'#ffe8d4', accent:'#ff7a3a', rare:true}),
    F({id:'twobells', name:'Two Bells', emoji:'🛎️', kind:'coop', seconds:24, coins:8, hint:'Wake both bells. In a group, friends can each take a bell!', clear:'coop', sky:'#e8e4ff', floor:'#ddd8ff', wall:'#f4f2ff', accent:'#7c5cff', coop:true, pads:2}),
    F({id:'sharedbridge', name:'Shared Bridge', emoji:'🌉', kind:'coop', seconds:24, coins:8, hint:'Light both star pads to lower the bridge door. Friends can help!', clear:'coop', sky:'#c8e8e0', floor:'#b8dcd4', wall:'#e0f4f0', accent:'#2ec27e', coop:true, pads:2}),
    F({id:'binglequiz', name:'Bingle’s Quiz', emoji:'❓', kind:'quiz', seconds:24, coins:8, hint:'Walk to the answer Bingle is thinking of and press E / Ⓧ.', clear:'quiz', sky:'#e8f0ff', floor:'#dce6ff', wall:'#f4f7ff', accent:'#3a86ff'}),
    F({id:'echoeggs', name:'Echo Eggs', emoji:'🥚', kind:'memory', seconds:24, coins:8, hint:'The eggs light up. Tap them back in the same order.', clear:'seq', sky:'#fff0d8', floor:'#ffe8c4', wall:'#fff8ec', accent:'#f0c44c', seq:3}),
    F({id:'scarfprint', name:'Scarf Sprint', emoji:'🧣', kind:'race', seconds:16, coins:8, hint:'Race down the scarf path and tag the finish door!', clear:'door', sky:'#ffd8d8', floor:'#ffc8c8', wall:'#ffe8e8', accent:'#e04a4a'}),
    F({id:'blockpicnic', name:'Block Picnic', emoji:'🧱', kind:'stack', seconds:22, coins:8, hint:'Stack picnic blocks until they reach the blanket height.', clear:'stack', sky:'#e8f8d8', floor:'#d8ecbe', wall:'#f4ffe8', accent:'#7cbf3a', need:5}),
    F({id:'cupstack', name:'Cup Stack', emoji:'🥤', kind:'stack', seconds:22, coins:8, hint:'Stack the cups into a tidy tower.', clear:'stack', sky:'#ffe8f0', floor:'#ffd8e6', wall:'#fff4f8', accent:'#ff6fb5', need:5}),
    F({id:'drumdink', name:'Drum Dink', emoji:'🥁', kind:'rhythm', seconds:22, coins:8, hint:'Tap E / Ⓧ when the drum glows. Hit the beat six times!', clear:'rhythm', sky:'#f8e0c8', floor:'#f0d4b4', wall:'#faeee0', accent:'#c45c1a', need:6}),
    F({id:'xylobop', name:'Xylo Bop', emoji:'🎶', kind:'rhythm', seconds:22, coins:8, hint:'Tap E / Ⓧ when a bar lights up. Six good hits wins!', clear:'rhythm', sky:'#e0f0ff', floor:'#d0e6ff', wall:'#f0f7ff', accent:'#3a86ff', need:6}),
    F({id:'whisperwell', name:'Whisper Well', emoji:'🕳️', kind:'secret', seconds:24, coins:14, hint:'A hush of a floor. Find the hidden well-charm and drop it in.', clear:'find', sky:'#1a2830', floor:'#223038', wall:'#2c3c44', accent:'#7ec8c0', secret:true, item:'charm'}),
    F({id:'cocoaflakes', name:'Cocoa Flakes', emoji:'❄️', kind:'holiday', seconds:18, coins:8, hint:'Dodge the cocoa-flakes and wait for the ding!', clear:'timer', sky:'#e8f4ff', floor:'#dcecff', wall:'#f4faff', accent:'#8ec8ff', holiday:true, haz:'flake'}),
    F({id:'mittenmaze', name:'Mitten Maze', emoji:'🧤', kind:'holiday', seconds:26, coins:8, hint:'Hop the mitten pads through the snow to the door.', clear:'door', sky:'#d8eeff', floor:'#f4f8ff', wall:'#e8f4ff', accent:'#e04a4a', holiday:true}),
    F({id:'jinglejog', name:'Jingle Jog', emoji:'🎄', kind:'holiday', seconds:16, coins:8, hint:'Sprint the jingle path and tag the finish door!', clear:'door', sky:'#1a3a28', floor:'#245038', wall:'#2c5c40', accent:'#ffd23f', holiday:true}),
    F({id:'wobblywarden', name:'Wobbly Warden', emoji:'🛡️', kind:'boss', seconds:26, coins:14, hint:'Dodge the pillow giant’s soft stomps, then tag the bell on its hat!', clear:'boss', sky:'#efe0ff', floor:'#e4d2ff', wall:'#f6eeff', accent:'#8b5cf6'}),
    F({id:'drowsydrake', name:'Drowsy Drake', emoji:'🐲', kind:'boss', seconds:26, coins:14, hint:'Stay out of the paper-dragon’s yawn puffs, then ring its bedtime bell!', clear:'boss', sky:'#2a3048', floor:'#323858', wall:'#3c4464', accent:'#9ad0ff'}),

    F({id:'softcloset', name:'The Soft Closet', emoji:'🧥', kind:'creepy', seconds:22, coins:9, hint:'Hold the night-light and tiptoe through the coat forest to the lamp.', clear:'lit', sky:'#1a1420', floor:'#22182a', wall:'#2c2034', accent:'#c9b8e8'}),
    F({id:'sparechair', name:'The Extra Chair', emoji:'🪑', kind:'creepy', seconds:20, coins:8, hint:'The spare chair scoots politely. Walk to the door and do not linger in its path.', clear:'door', sky:'#201c18', floor:'#2a241c', wall:'#3a3228', accent:'#d2b48c', haz:'wink'}),
    F({id:'politefog', name:'Polite Fog', emoji:'🌫️', kind:'creepy', seconds:22, coins:9, hint:'Stay in the lantern’s hello-circle and reach the lamp. The fog is just shy.', clear:'lit', sky:'#1c2230', floor:'#242a38', wall:'#303848', accent:'#d8e8ff'}),
    F({id:'almostdoors', name:'Almost-Doors', emoji:'🚪', kind:'creepy', seconds:22, coins:9, hint:'Most doors are just polite wallpaper. Find the real one and step through.', clear:'find', sky:'#181420', floor:'#201828', wall:'#2a2034', accent:'#f0d48a', item:'door'}),
    F({id:'moonmilk', name:'Moonmilk Kitchen', emoji:'🥛', kind:'creepy', seconds:22, coins:8, hint:'Find the midnight spoon and set it on the saucer. The cups hum softly.', clear:'find', sky:'#161a28', floor:'#1c2230', wall:'#262c3c', accent:'#e8f0ff', item:'spoon'}),
    F({id:'dustorchestra', name:'Dust Orchestra', emoji:'🎻', kind:'creepy', seconds:20, coins:9, hint:'The instruments hum by themselves. Reach the door and do not stand in a bow-beam.', clear:'door', sky:'#1a1218', floor:'#241820', wall:'#2e2028', accent:'#e8c878', haz:'wink'}),
    F({id:'smileinventory', name:'Smile Inventory', emoji:'🙂', kind:'creepy', seconds:20, coins:8, hint:'Give every watching smile a sleepy one, so they can rest.', clear:'paint', sky:'#1c1824', floor:'#262030', wall:'#32283c', accent:'#ffd6a0', paints:3}),
    F({id:'clockback', name:'Backward Clockroom', emoji:'🕰️', kind:'creepy', seconds:18, coins:8, hint:'Wait for the clock to ding backward. Stay off the hush-tiles until then.', clear:'timer', sky:'#141820', floor:'#1c222c', wall:'#283038', accent:'#9ad0c8', tiles:true})
  ];

  const ELEV_PALS = [
    {id:'sock', name:'Captain Sock', emoji:'🧦', col:'#3a86ff', line:'I packed two socks and only found one. Typical!', pal:'niblet', hop:'stay', lines:['I packed two socks and only found one. Typical!','A sock is a shoe that believes in you.','If I find the other one, I am naming it First Mate.'], react:{creepy:'I do not like how quiet this hallway is looking at my ankles.', shop:'Do they sell spare socks in pairs, or is that too optimistic?', funny:'This floor is sillier than my leftover sock.', ride:'The cab is wobbling. That is just how I walk, honestly.'}, jokes:['Niblet, if you packed my sock in that lunchbox I will be very polite about it.']},
    {id:'niblet', name:'Niblet', emoji:'🐥', col:'#ffd23f', line:'If anyone sees a lunchbox, it is probably mine.', pal:'sock', hop:'stay', lines:['If anyone sees a lunchbox, it is probably mine.','I packed a crumb for later. Then I packed a second crumb for the first crumb.','Peep! That means I am ready, or maybe hungry. Both.'], react:{creepy:'I will hide behind Captain Sock. Socks are brave.', shop:'Is the lucky cookie lunch? I can share a crumb.', funny:'Hee! My feathers are doing a little dance.', ride:'If the lift sneezes, I brought a napkin.'}, jokes:['Captain Sock, I did not pack your sock. I packed three sandwiches and a rumor.']},
    {id:'marm', name:'Marm', emoji:'🧶', col:'#ff6fb5', line:'I brought extra yarn in case the lift gets drafty.', pal:'polo', hop:'stay', lines:['I brought extra yarn in case the lift gets drafty.','Does anyone want a tiny scarf? I already made four.','Knit one, wobble two.'], react:{creepy:'I am knitting a very brave hat for the dark.', shop:'I could knit this shop a cozy. Would it like a cozy?', funny:'A giggle is just a stitch that got excited.', ride:'Hold this yarn, dear. It likes to watch the numbers tick.'}, jokes:['Polo, if you get off to check the coat rack, I will keep your seat warm with a scarf.']},
    {id:'taro', name:'Taro', emoji:'📷', col:'#8b5cf6', line:'Hold still — this wobble makes a great photo!', pal:'doodle', hop:'stay', lines:['Hold still — this wobble makes a great photo!','Say ding! No, ding-ding! Yes, that is the one.','I am taking a picture of the picture of the lift. It is very meta, and also cute.'], react:{creepy:'Low light! Everyone look mysterious, but friendly.', shop:'I would like a photo of the cookie before anyone eats it.', funny:'This is going in the silly album.', ride:'The floor numbers are ticking. I will catch the blur.'}, jokes:['Doodle, get in the frame! The wobble counts as motion art.']},
    {id:'sprocket', name:'Sprocket', emoji:'🔧', col:'#2ec27e', line:'I tightened every bolt. The wobble is a feature.', pal:'fizz', hop:'stay', lines:['I tightened every bolt. The wobble is a feature.','If it hums, it is working. If it hums sideways, it is working with style.','I brought a spare bell, just in case Bingle rings too proudly.'], react:{creepy:'The lamps are flickering on purpose. I respect the drama.', shop:'I do not need a hat. I need a tiny wrench pin. Close enough.', funny:'That honk was not in the manual, and I love it.', ride:'A stuck moment? I will count to three and pat the wall.'}, jokes:['Fizz, if you sneeze bubbles in the gearbox I will still like you.']},
    {id:'puddle', name:'Puddle', emoji:'☔', col:'#4aa3ff', line:'I only dripped a little. The cab can take it.', pal:'moony', hop:'stay', lines:['I only dripped a little. The cab can take it.','I am not a spill. I am a visiting weather.','If anyone has a towel, I will be very grateful and also slightly shinier.'], react:{creepy:'Dark puddles are still puddles. We are cousins.', shop:'Do they sell little umbrellas for people who are already the rain?', funny:'A giggle just made a ripple in me!', ride:'The cab shook and I made a tiny sea. Sorry! It is a cute sea.'}, jokes:['Moony, you can see yourself in me, but only the friendly stars.']},
    {id:'lumen', name:'Lumen', emoji:'💡', col:'#ffe566', line:'I am a night-light with feelings, and they are mostly brave.', pal:'pip', hop:'creepy', lines:['I am a night-light with feelings, and they are mostly brave.','If it gets dim, I can glow. If it gets dimmer, I can glow politely louder.','Please do not put a lampshade on my feelings.'], react:{creepy:'I can do this. I can do this. I am doing a glow.', shop:'A soft lamp! That is like meeting a cousin.', funny:'Even I am smiling, and I do not have a mouth, technically.', ride:'The lights flickered and I flickered back. Teamwork.'}, jokes:['Pip, I will light your ticket so you can read the number this time.']},
    {id:'pip', name:'Pip', emoji:'🎫', col:'#f4d35e', line:'I had a ticket. Then I had a maybe. Now I have a story.', pal:'lumen', hop:'stay', lines:['I had a ticket. Then I had a maybe. Now I have a story.','Is this our floor? It might be someone else’s floor wearing our number.','I wrote the number on my sleeve and then I wore a different sleeve.'], react:{creepy:'If the hallway whispers a number, I will not listen unless it is polite.', shop:'Can I buy a better memory? Or just a pencil.', funny:'This is not my floor and I am delighted.', ride:'The dial is ticking and I still cannot decide if I like even numbers.'}, jokes:['Lumen, shine on the dial, I am squinting with my whole heart.']},
    {id:'fizz', name:'Fizz', emoji:'🫧', col:'#7fe3ff', line:'I brought sparkles. They might be bubbles. Same family.', pal:'sprocket', hop:'stay', lines:['I brought sparkles. They might be bubbles. Same family.','If I sneeze, it is festive. I brought a tiny apology as well.','Carbonation is just a hug for water.'], react:{creepy:'I will sneeze very quietly. Like a polite bubble.', shop:'A lucky cookie and a fizzy sip would be a parade.', funny:'Honk! That almost made me giggle-fizz.', ride:'Ah—choo! Those were happy bubbles. The cab is fine.'}, jokes:['Sprocket, I promise the bubbles are off-duty during a stuck moment.']},
    {id:'doodle', name:'Doodle', emoji:'✏️', col:'#5c4a3a', line:'I am a walking sketch. Please do not erase my hat.', pal:'taro', hop:'stay', lines:['I am a walking sketch. Please do not erase my hat.','If the walls get too blank I might doodle a window.','My lines are wobbly on purpose. It is called style, and also the lift.'], react:{creepy:'I will draw a little night-light, just in case Lumen is shy.', shop:'Hats! I have been drawing hats all morning.', funny:'I sketched a mustache on the air. It floated away politely.', ride:'The cab shook and my eyebrows went on an adventure.'}, jokes:['Taro, if you photograph me, tell the camera I am a limited edition.']},
    {id:'polo', name:'Polo', emoji:'🧥', col:'#c45c1a', line:'I am only checking the coat rack. I will be right back.', pal:'marm', hop:'shopoff', lines:['I am only checking the coat rack. I will be right back.','A good coat should nod when you hang it up.','Did someone say closet? I have professional opinions.'], react:{creepy:'A soft closet! I will be brave, and also very tidy.', shop:'This is my stop. I just want to say hello to the hangers.', funny:'I once wore a joke coat. It still tells the joke.', ride:'If the doors close, my sleeves will make it. They are long on purpose.'}, jokes:['Marm, save me a seat. I am conducting a very short coat inspection.']},
    {id:'echo', name:'Echo', emoji:'📣', col:'#7c5cff', line:'Hello— …hello.', pal:'crisp', hop:'stay', lines:['Hello— …hello.','I was going to say something, and then I said it again, later.','If you tell a joke, I can be the encore.'], react:{creepy:'That whisper was not me. I only repeat the friendly parts.', shop:'Cookie… cookie. I would like one of the first ones.', funny:'Ha ha— …ha ha.', ride:'Ding. …ding. I liked the first ding better, but I support both.'}, jokes:['Crisp, if you unfold the map I will read the last line twice.']},
    {id:'moony', name:'Moony', emoji:'🌙', col:'#c9d4ff', line:'I only board when the lights get thoughtful.', pal:'puddle', hop:'creepy', lines:['I only board when the lights get thoughtful.','The stars sent a postcard. It said: wobble is allowed.','I glow, but only a little, like a shy night-light’s cousin.'], react:{creepy:'Ah. Yes. This is my kind of hush.', shop:'I will stay on the lift and watch the cookies like moons.', funny:'Even the moon can giggle. It just does it slowly.', ride:'The number dial looks like a tiny moon climbing stairs.'}, jokes:['Puddle, thank you for holding my reflection so carefully.']},
    {id:'crisp', name:'Crisp', emoji:'🗺️', col:'#e8c37a', line:'I have a map of every floor, except this one, and also the next one.', pal:'echo', hop:'stay', lines:['I have a map of every floor, except this one, and also the next one.','The legend says “you are slightly here.”','Folding is a lifestyle.'], react:{creepy:'The map has a blank patch. That means we should walk together.', shop:'I could use a snack and a bigger margin.', funny:'I accidentally mapped a giggle. It goes off the page.', ride:'According to this, we are going up, unless we are going sideways, which is also on the map.'}, jokes:['Echo, please do not repeat the part where I admitted I am lost.']},
    {id:'bramble', name:'Bramble', emoji:'🌿', col:'#2ec27e', line:'I brought a leaf. It wanted to see the lift.', pal:'puddle', hop:'stay', lines:['I brought a leaf. It wanted to see the lift.','If anyone needs a tiny forest, I can be one in a polite way.','Please mind the twigs. They are shy, not pokey.'], react:{creepy:'I will rustle very softly, like a library tree.', shop:'Do they sell watering cans the size of a thimble?', funny:'A leaf just laughed. I heard it.', ride:'The cab wiggled and my leaf did a little wave.'}, jokes:['Puddle, you may sit near me, but maybe not on the leaf. It is on a tour.']}
  ];

  const ELEV_HOST = {id:'bingle', name:'Bingle the Bellhop', emoji:'🛎️', lines:[
    'Going up... or maybe a little sideways!',
    'Hold the handrail. It likes to dance.',
    'Next stop, a surprise! I packed a smile.',
    'Ding-ding! Please keep arms, hats, and socks inside.',
    'If the floor gets too wobbly, we hop back in. Everyone is okay!',
    'This is your friendly intercom! The cab is big enough for a whole gaggle of friends.',
    'Doors closing! Last call for wobbly adventures.',
    'The floor numbers are practicing their counting. Very proud of them.',
    'I packed elevator music. It is original, slightly bossa, and a little shy.',
    'A flicker! That was just the lights doing a little jazz hands.'
  ]};

  const ELEV_QUIZ = [
    {q:'What does Bingle say at every stop?', a:['Ding-ding!', 'Pizza time', 'Go down'], i:0},
    {q:'What should you keep inside the lift?', a:['Arms, hats, and socks', 'The moon', 'A boat'], i:0},
    {q:'If a floor gets too wobbly, what happens?', a:['Everyone is okay', 'The lift vanishes', 'We take a nap in space'], i:0}
  ];

  function elevFloor(id){ return ELEV_FLOORS.find(f => f.id === id) || null; }
  function elevPal(id){ return ELEV_PALS.find(p => p.id === id) || null; }
  function elevClearMode(f){ return (f && f.clear) || 'door'; }

  const ELEV_CAB_W = 10;
  const ELEV_CAB_D = 10;
  const ELEV_CAB_Z = -5;
  const ELEV_HALL_W = 7.2;
  const ELEV_ROOM_Z = -30;
  const ELEV_FLOOR_TOP = 0.2;
  const ELEV_BODY_R = 0.45;
  const ELEV_BOARD = 5;

  function elevRoomOf(f){
    f = typeof f === 'string' ? elevFloor(f) : f;
    if (!f) return null;
    const clear = elevClearMode(f);
    let w = 16, d = 18;
    if (f.tiles){ w = 14; d = 14; }
    else if (clear === 'door'){ w = 16; d = (f.kind === 'race' || f.id === 'skyterrace') ? 22 : 28; }
    else if (clear === 'find'){ w = 18; d = 18; }
    else if (clear === 'timer'){ w = 16; d = 16; }
    else if (clear === 'seq' || clear === 'paint'){ w = 16; d = 14; }
    else if (clear === 'lit'){ w = 16; d = 20; }
    else if (clear === 'shop' || clear === 'stack' || clear === 'rhythm'){ w = 14; d = 14; }
    else if (clear === 'quiz' || clear === 'coop'){ w = 16; d = 16; }
    else if (clear === 'boss'){ w = 18; d = 20; }
    const z = ELEV_ROOM_Z, top = ELEV_FLOOR_TOP, x = 0;
    const front = z + d / 2;
    const hall = (front < ELEV_CAB_Z - 0.05)
      ? {x:0, z:(front + ELEV_CAB_Z) / 2, w:ELEV_HALL_W, d:(ELEV_CAB_Z - front) + 0.6, top}
      : null;
    return {w, d, x, z, top, hall, spawn:{x:0, y:top + 0.3, z}};
  }

  function elevSpawnOf(f){
    const room = elevRoomOf(f);
    return room ? {x:room.spawn.x, y:room.spawn.y, z:room.spawn.z, top:room.top} : {x:0, y:0.5, z:ELEV_ROOM_Z, top:ELEV_FLOOR_TOP};
  }

  function elevBoxHit(x, z, box, r){
    if (!box) return false;
    r = r == null ? ELEV_BODY_R : r;
    return Math.abs(x - (box.x || 0)) < (box.w / 2) + r && Math.abs(z - (box.z || 0)) < (box.d / 2) + r;
  }

  function elevOnSolid(x, z, room, r){
    return !!(room && (elevBoxHit(x, z, room, r) || elevBoxHit(x, z, room.hall, r)));
  }

  // Lightweight stand-in for the live physics step, used by tests to prove every
  // floor's spawn stays on the slab (and that a fall is scooped back).
  function elevSimStep(id, seconds, opts){
    opts = opts || {};
    const room = elevRoomOf(id);
    if (!room) return null;
    const spawn = (opts.x != null || opts.z != null)
      ? {x: opts.x != null ? opts.x : 0, y: opts.y != null ? opts.y : room.top + 0.3, z: opts.z != null ? opts.z : room.z}
      : room.spawn;
    const P = {x:spawn.x, y:spawn.y, z:spawn.z, vx:opts.vx || 0, vy:0, vz:opts.vz || 0, onGround:false};
    const GRAV = 45, dt = 1 / (opts.fps || 60), top = room.top;
    let minY = P.y, fell = false, grounded = 0, caught = 0;
    const useNet = opts.catchFall !== false;
    for (let t = 0; t < seconds; t += dt){
      P.vy = Math.max(-40, P.vy - GRAV * dt);
      P.x += P.vx * dt;
      P.z += P.vz * dt;
      P.y += P.vy * dt;
      if (elevOnSolid(P.x, P.z, room, ELEV_BODY_R) && P.vy <= 0 && P.y <= top + 0.35){
        P.y = top; P.vy = 0; P.onGround = true; grounded++;
      } else P.onGround = false;
      if (P.y < minY) minY = P.y;
      if (useNet && P.y < -1){
        P.x = room.spawn.x; P.y = room.spawn.y; P.z = room.spawn.z; P.vx = 0; P.vy = 0; P.vz = 0;
        caught++;
        fell = false;
      } else if (!useNet && P.y < top - 1){
        fell = true;
      }
    }
    return {x:P.x, y:P.y, z:P.z, onGround:P.onGround, minY, fell, caught, grounded, top, room};
  }

  function elevTimerWins(f){
    if (!f) return false;
    const c = elevClearMode(f);
    return c === 'timer' || c === 'shop' || !!f.tiles;
  }

  function elevFresh(){
    return {
      ver: ELEV_VER,
      rides: 0,
      cleared: 0,
      failed: 0,
      best: 0,
      coins: 0,
      seen: [],
      found: 0,
      creepy: 0,
      shopped: 0,
      bag: [],
      hats: [],
      hat: '',
      pack: {},
      lessScary: false
    };
  }

  function elevLoad(raw){
    const d = elevFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    d.rides = Math.max(0, o.rides | 0);
    d.cleared = Math.max(0, o.cleared | 0);
    d.failed = Math.max(0, o.failed | 0);
    d.best = Math.max(0, o.best | 0);
    d.coins = Math.max(0, o.coins | 0);
    d.found = Math.max(0, o.found | 0);
    d.creepy = Math.max(0, o.creepy | 0);
    d.shopped = Math.max(0, o.shopped | 0);
    if (Array.isArray(o.seen)) d.seen = o.seen.filter(id => elevFloor(id));
    if (Array.isArray(o.bag)) d.bag = o.bag.filter(id => elevFloor(id));
    if (Array.isArray(o.hats)) d.hats = o.hats.filter(id => { const it = elevShopItem(id); return it && it.kind === 'hat'; });
    if (o.hat && d.hats.indexOf(o.hat) >= 0) d.hat = o.hat;
    if (o.pack && typeof o.pack === 'object'){
      d.pack = {};
      Object.keys(o.pack).forEach(k => { if (elevShopItem(k) && (o.pack[k] | 0) > 0) d.pack[k] = o.pack[k] | 0; });
    }
    if (o.lessScary != null) d.lessScary = !!o.lessScary;
    else d.lessScary = elevInheritLessScary();
    d.ver = ELEV_VER;
    return d;
  }

  function elevBuddyAllowed(mp){ return true; } // Wobblevator exception: friendly cab riders, not opponents, in solo and MP
  function elevNoFight(){ return true; }
  function elevNoGore(){ return true; }
  function elevEveryoneOkay(){ return true; }


  const ELEV_SHOP = [
    {id:'dingcap', kind:'hat', name:'Ding Cap', emoji:'🛎️', cost:15, desc:'A tiny bellhop cap that dings when you nod.'},
    {id:'wobblybow', kind:'hat', name:'Wobbly Bow', emoji:'🎀', cost:20, desc:'A bow that wobbles in time with the cab.'},
    {id:'cloudberet', kind:'hat', name:'Cloud Beret', emoji:'☁️', cost:25, desc:'A soft beret that looks like a friendly cloud.'},
    {id:'nightcap', kind:'hat', name:'Starry Nightcap', emoji:'🌟', cost:30, desc:'A sleepy cap stitched with shy stars.'},
    {id:'softant', kind:'hat', name:'Soft Antenna', emoji:'📡', cost:25, desc:'A squishy antenna for picking up Bingle’s intercom.'},
    {id:'coinpin', kind:'hat', name:'Lucky Coin Pin', emoji:'🪙', cost:18, desc:'A shiny pin that believes in streaks.'},
    {id:'luckycookie', kind:'use', name:'Lucky Cookie', emoji:'🍪', cost:8, desc:'One-use: +4 bonus coins on your next cleared floor.'},
    {id:'timesip', kind:'use', name:'Extra Sip', emoji:'🧃', cost:10, desc:'One-use: +5 seconds on your next floor.'},
    {id:'softlamp', kind:'use', name:'Soft Lamp', emoji:'🔦', cost:12, desc:'One-use: a friendlier glow on the next dim floor.'},
    {id:'soapsocks', kind:'use', name:'Soap-proof Socks', emoji:'🧦', cost:10, desc:'One-use: ignore one slip or dodge hazard.'},
    {id:'streakcharm', kind:'use', name:'Streak Charm', emoji:'🍀', cost:20, desc:'One-use: if you fail, your coin streak is kept once.'}
  ];

  const ELEV_RIDE_EVENTS = [
    {id:'flicker', text:'The lights do a little jazz-hands flicker.', intercom:'Just a sparkle in the lamps. Everyone is okay!'},
    {id:'stuck', text:'A tiny stuck moment. Bingle hums patiently.', intercom:'Counting to three… and we are rolling again.'},
    {id:'sneeze', text:'Someone sneezes. Bubbles, probably.', intercom:'Bless you! The cab has been professionally giggled.'},
    {id:'wobble', text:'The cab wiggles like jelly.', intercom:'Wobble feature engaged. Hold your hats and socks!'},
    {id:'hum', text:'The cables hum a secret tune.', intercom:'That hum is the shaft singing along with our music.'}
  ];

  function elevShopItem(id){ return ELEV_SHOP.find(it => it.id === id) || null; }
  function elevShopList(){ return ELEV_SHOP.slice(); }

  function elevInheritLessScary(){
    try {
      if (typeof load === 'function'){
        const camp = load('rubloxCamp', null);
        if (camp && camp.lessScary != null) return !!camp.lessScary;
      }
    } catch (e){}
    return false;
  }

  function elevSetLessScary(state, on){
    state = elevLoad(state);
    state.lessScary = !!on;
    return state;
  }

  function elevStreakBonus(streak){
    const n = Math.max(0, streak | 0);
    if (n <= 0) return 0;
    return Math.min(15, n);
  }

  function elevBeginBoard(run){
    if (!run) return run;
    if (run.phase !== 'lobby' && run.phase !== 'inter' && run.phase !== 'board') return run;
    run.phase = 'board';
    run.t = ELEV_BOARD;
    run.quote = '🚪 Doors closing! Get back in!';
    return run;
  }

  function elevCloseDoors(run, inCab){
    if (!run) return run;
    run.watching = !inCab;
    if (run.watching) run.quote = '🛎️ Hang tight in the cab — we will catch the next stop together!';
    return run;
  }

  function elevPickRideEvent(rand){
    const r = typeof rand === 'function' ? rand : Math.random;
    if (r() > 0.62) return null;
    return ELEV_RIDE_EVENTS[Math.floor(r() * ELEV_RIDE_EVENTS.length)] || null;
  }

  function elevTalkLine(pal, ctx){
    if (!pal) return '';
    ctx = ctx || {};
    const kind = ctx.kind || ctx.phase || '';
    if (ctx.joke && pal.jokes && pal.jokes.length) return pal.jokes[Math.floor((ctx.i || 0) % pal.jokes.length)];
    if (pal.react && kind && pal.react[kind]) return pal.react[kind];
    const lines = (pal.lines && pal.lines.length) ? pal.lines : (pal.line ? [pal.line] : []);
    if (!lines.length) return '';
    const i = (ctx.i != null) ? (ctx.i | 0) : 0;
    return lines[((i % lines.length) + lines.length) % lines.length];
  }

  function elevIntercom(run, kind, rand){
    const ev = run && run.event;
    if (kind === 'event' && ev && ev.intercom) return '🛎️ ' + ev.intercom;
    if (kind === 'board') return '🛎️ Bingle: "Doors closing! Get back in!"';
    if (kind === 'ride') return '🛎️ ' + (run && run.hostLine ? run.hostLine : 'Going up... or maybe a little sideways!');
    if (kind === 'watch') return '🛎️ Bingle: "Wait in the cab, friend. Next stop is yours."';
    if (kind === 'floor' && run && run.floor){
      const f = elevFloor(run.floor);
      if (f) return '🛎️ Next floor: ' + f.emoji + ' ' + f.name + '!';
    }
    return '🛎️ ' + elevHostLine(-1, rand);
  }

  const ELEV_PAL_SPOTS = [[-3.6,-2.2],[3.6,1.8],[-3.6,2.4],[3.4,-3.0],[-1.8,3.4]];
  const ELEV_PAL_MAX = 4;

  function elevPalSpots(){ return ELEV_PAL_SPOTS.map(s => s.slice()); }

  function elevPalMayRide(run, pal){
    if (!pal) return false;
    const f = elevFloor(run && run.floor);
    const kind = f ? f.kind : '';
    const phase = (run && run.phase) || '';
    if (pal.hop === 'creepy') return kind === 'creepy' || phase === 'lobby' || phase === 'board' || phase === 'ride';
    if (pal.hop === 'shopoff' && kind === 'shop' && (phase === 'floor' || phase === 'inter')) return false;
    return true;
  }

  function elevSeatPals(run, list){
    const spots = elevPalSpots();
    const taken = {};
    const prev = {};
    (run && run.pals || []).forEach(s => {
      if (s && s.id) prev[s.id] = s;
    });
    const seats = [];
    (list || []).forEach(pal => {
      if (!pal || seats.length >= ELEV_PAL_MAX) return;
      const keep = prev[pal.id];
      let x, z;
      if (keep && keep.x != null && keep.z != null && !taken[keep.x + ',' + keep.z]){
        x = +keep.x; z = +keep.z;
      } else {
        const free = spots.find(s => !taken[s[0] + ',' + s[1]]) || spots[seats.length % spots.length];
        x = free[0]; z = free[1];
      }
      taken[x + ',' + z] = true;
      seats.push({id: pal.id, x: x, z: z});
    });
    if (run) run.pals = seats;
    return seats;
  }

  function elevCleanPals(list){
    const out = [];
    const used = {};
    (Array.isArray(list) ? list : []).forEach(s => {
      if (!s || out.length >= ELEV_PAL_MAX) return;
      const id = s.id || s;
      const pal = elevPal(id);
      if (!pal || used[pal.id]) return;
      used[pal.id] = true;
      let x = (s && s.x != null) ? +s.x : elevPalSpots()[out.length][0];
      let z = (s && s.z != null) ? +s.z : elevPalSpots()[out.length][1];
      if (!isFinite(x)) x = 0;
      if (!isFinite(z)) z = 0;
      x = Math.max(-4.4, Math.min(4.4, x));
      z = Math.max(-4.4, Math.min(4.4, z));
      out.push({id: pal.id, x: x, z: z});
    });
    return out;
  }

  function elevPalIds(run){
    return ((run && run.pals) || []).map(s => s && (s.id || s)).filter(Boolean);
  }

  function elevPalsAboard(run, rand){
    if (!run || !run.buddy) { if (run) run.pals = []; return []; }
    const r = typeof rand === 'function' ? rand : Math.random;
    const pool = ELEV_PALS.filter(p => elevPalMayRide(run, p));
    const n = 2 + Math.floor(r() * 2);
    const out = [];
    const used = {};
    for (let i = 0; i < pool.length && out.length < n && out.length < ELEV_PAL_MAX; i++){
      const p = pool[Math.floor(r() * pool.length)];
      if (!p || used[p.id]) continue;
      used[p.id] = true;
      out.push(p);
      if (p.pal){
        const buddy = elevPal(p.pal);
        if (buddy && !used[buddy.id] && out.length < n && pool.some(x => x.id === buddy.id)){
          used[buddy.id] = true;
          out.push(buddy);
        }
      }
    }
    elevSeatPals(run, out);
    return out;
  }

  function elevPalsHop(run, rand){
    if (!run || !run.buddy) { if (run) run.pals = []; return []; }
    const r = typeof rand === 'function' ? rand : Math.random;
    const stay = [];
    const used = {};
    elevCleanPals(run.pals).forEach(s => {
      const pal = elevPal(s.id);
      if (pal && elevPalMayRide(run, pal) && !used[pal.id]){ used[pal.id] = true; stay.push(pal); }
    });
    const pool = ELEV_PALS.filter(p => elevPalMayRide(run, p) && !used[p.id]);
    const f = elevFloor(run.floor);
    if (f && f.kind === 'creepy'){
      const extra = pool.filter(p => p.hop === 'creepy');
      if (extra.length && stay.length < ELEV_PAL_MAX && r() < 0.7){
        const p = extra[Math.floor(r() * extra.length)];
        if (p){ used[p.id] = true; stay.push(p); }
      }
    }
    return elevSeatPals(run, stay);
  }

  function elevHostTalk(run, rand){
    const r = typeof rand === 'function' ? rand : Math.random;
    const seats = elevCleanPals(run && run.pals);
    const kind = (run && run.phase === 'ride') ? 'ride' : (run && run.phase === 'floor' && elevFloor(run.floor) ? elevFloor(run.floor).kind : (run && run.phase) || '');
    const wantCom = !seats.length || r() < 0.34 || !!(run && run.event && r() < 0.25);
    const seq = ((run && run.talkSeq) || 0) + 1;
    if (run) run.talkSeq = seq;
    if (wantCom){
      const line = elevIntercom(run, (run && run.phase === 'floor') ? 'floor' : (run && run.event && run.phase === 'ride' ? 'event' : (run && run.phase) || 'ride'), r);
      const talk = {seq, kind:'intercom', who:'🛎️ Bingle', text: String(line).replace(/^🛎️\s*/, ''), x:3.2, y:2.4, z:-1.4, sec:3.4};
      if (run) run.talk = talk;
      return talk;
    }
    const slot = seats[Math.floor(r() * seats.length)];
    const pal = elevPal(slot.id);
    const joke = r() < 0.28;
    const line = elevTalkLine(pal, {kind, phase: run && run.phase, joke, i: Math.floor(r()*8)});
    const talk = {seq, kind:'pal', palId: pal.id, who: (pal.emoji || '') + ' ' + pal.name, text: line, x:slot.x, y:2.3, z:slot.z, sec:3.6};
    if (run) run.talk = talk;
    return talk;
  }

  function elevCleanTalk(talk){
    if (!talk || typeof talk !== 'object') return null;
    const text = String(talk.text || '').slice(0, 160);
    const who = String(talk.who || '').slice(0, 48);
    if (!text) return null;
    const x = Math.max(-5, Math.min(5, +talk.x || 0));
    const y = Math.max(0.4, Math.min(4, +talk.y || 2.3));
    const z = Math.max(-5, Math.min(5, +talk.z || 0));
    const palId = talk.palId && elevPal(talk.palId) ? talk.palId : '';
    return {seq: talk.seq | 0, kind: talk.kind === 'intercom' ? 'intercom' : 'pal', palId, who, text, x, y, z, sec: Math.max(1, Math.min(6, +talk.sec || 3.4))};
  }

  function elevBuyItem(state, wallet, itemId){
    state = elevLoad(state);
    const item = elevShopItem(itemId);
    const coins = Math.max(0, wallet | 0);
    if (!item) return {ok:false, why:'item', state, wallet:coins};
    if (coins < item.cost) return {ok:false, why:'coins', state, wallet:coins, need: item.cost - coins};
    if (item.kind === 'hat'){
      if (state.hats.indexOf(item.id) >= 0) return {ok:false, why:'have', state, wallet:coins};
      state.hats.push(item.id);
      state.hat = item.id;
    } else {
      state.pack[item.id] = (state.pack[item.id] | 0) + 1;
    }
    state.shopped += 1;
    return {ok:true, why:'ok', state, wallet: coins - item.cost, spent:item.cost, item:item};
  }

  function elevWearHat(state, id){
    state = elevLoad(state);
    if (id && state.hats.indexOf(id) < 0) return {ok:false, why:'own', state};
    state.hat = id || '';
    return {ok:true, why:'ok', state};
  }

  function elevApplyPack(state, run){
    state = elevLoad(state);
    if (!run) return {state, run};
    const take = id => { if ((state.pack[id] | 0) > 0){ state.pack[id] -= 1; if (!state.pack[id]) delete state.pack[id]; return true; } return false; };
    if (take('luckycookie')) run.lucky = (run.lucky | 0) + 4;
    if (take('timesip')) run.bonusTime = 5;
    if (take('softlamp')) run.softLamp = true;
    if (take('soapsocks')) run.guard = true;
    if (take('streakcharm')) run.charm = true;
    return {state, run};
  }


  function elevSnowOn(flag){
    if (flag != null) return !!flag;
    try { if (typeof evFestOn === 'function') return !!evFestOn(); } catch (e){}
    return false;
  }

  function elevHostLine(n, rand){
    const r = typeof rand === 'function' ? rand : Math.random;
    const i = ((n | 0) >= 0) ? ((n | 0) % ELEV_HOST.lines.length) : Math.floor(r() * ELEV_HOST.lines.length);
    return ELEV_HOST.lines[i];
  }

  function elevPickPal(run, rand){
    if (!run || !run.buddy) return null;
    const r = typeof rand === 'function' ? rand : Math.random;
    const used = run.palId;
    const pool = ELEV_PALS.filter(p => p.id !== used);
    const pick = pool[Math.floor(r() * pool.length)] || ELEV_PALS[0];
    return pick;
  }

  function elevFreshRun(state, now, mp){
    state = elevLoad(state);
    return {
      startedAt: +now || 0,
      phase: 'lobby',
      floor: null,
      last: null,
      t: 0,
      streak: 0,
      survived: 0,
      coins: 0,
      lucky: 0,
      holding: null,
      seq: [],
      seqAt: 0,
      painted: [],
      lit: 1,
      wantFail: false,
      wantClear: false,
      cleared: false,
      failed: false,
      shopDone: false,
      buddy: elevBuddyAllowed(mp),
      mp: !!mp,
      snow: elevSnowOn(),
      palId: null,
      hostLine: elevHostLine(0),
      quote: '',
      bag: (state.bag && state.bag.slice()) || [],
      quiz: null,
      stacked: 0,
      beats: 0,
      misses: 0,
      pads: [],
      bossTag: false,
      beatT: 0,
      watching: false,
      event: null,
      pals: [],
      guard: false,
      softLamp: false,
      bonusTime: 0,
      charm: false,
      lessScary: !!state.lessScary
    };
  }

  function elevStartRun(state, now, mp){
    state = elevLoad(state);
    state.rides += 1;
    return {ok:true, state, run: elevFreshRun(state, now, mp)};
  }

  function elevDueShop(run){
    if (!run) return false;
    const n = (run.survived | 0) + 1;
    return n > 0 && n % ELEV_SHOP_EVERY === 0;
  }

  function elevShuffle(ids, rand){
    const r = typeof rand === 'function' ? rand : Math.random;
    const a = ids.slice();
    for (let i = a.length - 1; i > 0; i--){
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function elevPool(run, opts){
    opts = opts || {};
    const snow = elevSnowOn(opts.snow != null ? opts.snow : run && run.snow);
    return ELEV_FLOORS.filter(f => {
      if (f.kind === 'shop') return false;
      if (f.secret) return false;
      if (f.holiday && !snow) return false;
      return true;
    });
  }

  function elevRebuildBag(run, rand, opts){
    const pool = elevPool(run, opts).map(f => f.id);
    const avoid = [run && run.last, run && run.floor].filter(Boolean);
    let ids = pool.filter(id => avoid.indexOf(id) < 0);
    if (ids.length < 3) ids = pool.slice();
    run.bag = elevShuffle(ids, rand);
    return run.bag;
  }

  function elevPickShop(run, rand){
    const shops = ELEV_FLOORS.filter(f => f.kind === 'shop');
    const r = typeof rand === 'function' ? rand : Math.random;
    const pool = shops.filter(f => f.id !== run.last);
    return (pool[Math.floor(r() * pool.length)] || shops[0] || elevFloor('snackstop'));
  }

  function elevPickFloor(run, rand, opts){
    opts = opts || {};
    const r = typeof rand === 'function' ? rand : Math.random;
    if (elevDueShop(run)) return elevPickShop(run, rand);
    if (opts.want === 'secret' || (r() < 0.03 && (run.survived | 0) >= 8)){
      const secret = ELEV_FLOORS.filter(f => f.secret && f.id !== run.last);
      if (secret.length) return secret[Math.floor(r() * secret.length)];
    }
    const snow = elevSnowOn(opts.snow != null ? opts.snow : run && run.snow);
    if (snow && (opts.want === 'holiday' || r() < 0.22)){
      const hol = ELEV_FLOORS.filter(f => f.holiday && f.id !== run.last);
      if (hol.length) return hol[Math.floor(r() * hol.length)];
    }
    if (opts.want === 'rare' || ((run.survived | 0) >= 4 && r() < 0.08)){
      const rare = ELEV_FLOORS.filter(f => f.rare && f.id !== run.last);
      if (rare.length) return rare[Math.floor(r() * rare.length)];
    }
    const pool = elevPool(run, opts);
    const keep = Math.max(1, Math.floor(pool.length * ELEV_BAG_KEEP));
    if (!run.bag || run.bag.length <= keep) elevRebuildBag(run, rand, opts);
    let id = run.bag.shift();
    if (id === run.last && run.bag.length){
      run.bag.push(id);
      id = run.bag.shift();
    }
    return elevFloor(id) || pool[0] || ELEV_FLOORS[0];
  }

  function elevBeginFloor(run, floorId, rand){
    if (!run) return run;
    const f = elevFloor(floorId) || elevPickFloor(run, rand);
    run.phase = 'floor';
    run.floor = f.id;
    run.last = f.id;
    run.t = f.seconds + (run.bonusTime | 0);
    run.bonusTime = 0;
    run.cleared = false;
    run.failed = false;
    run.wantClear = false;
    run.wantFail = false;
    run.holding = null;
    run.seqAt = 0;
    run.painted = [];
    run.shopDone = false;
    run.lit = 1;
    run.stacked = 0;
    run.beats = 0;
    run.misses = 0;
    run.pads = [];
    run.bossTag = false;
    run.beatT = 0;
    run.quiz = null;
    const r = typeof rand === 'function' ? rand : Math.random;
    const clear = elevClearMode(f);
    if (clear === 'seq'){
      const n = f.seq || 3;
      const bells = [];
      for (let i = 0; i < Math.max(n, 3); i++) bells.push(i);
      run.seq = [];
      const src = bells.slice(0, n);
      for (let i = 0; i < n; i++){
        const j = Math.floor(r() * src.length);
        run.seq.push(src.splice(j, 1)[0]);
      }
    } else run.seq = [];
    if (clear === 'quiz'){
      run.quiz = ELEV_QUIZ[Math.floor(r() * ELEV_QUIZ.length)] || ELEV_QUIZ[0];
    }
    if (clear === 'coop'){
      const n = f.pads || 2;
      run.pads = [];
      for (let i = 0; i < n; i++) run.pads.push(false);
    }
    run.quote = (f.emoji || '') + ' ' + f.name + ' — ' + f.hint;
    if (run.buddy) elevPalsHop(run, rand);
    return run;
  }

  function elevBeginRide(run, rand, opts){
    if (!run) return run;
    const f = elevPickFloor(run, rand, opts);
    const pal = elevPickPal(run, rand);
    if (pal) run.palId = pal.id;
    run.phase = 'ride';
    run.floor = f.id;
    run.t = ELEV_RIDE;
    run.cleared = false;
    run.failed = false;
    run.wantClear = false;
    run.wantFail = false;
    run.hostLine = elevHostLine((run.survived | 0) + 1, rand);
    run.event = elevPickRideEvent(rand);
    run.quote = '🛎️ ' + ELEV_HOST.name + ': "' + run.hostLine + '"';
    if (run.event) run.quote += '  ' + run.event.text;
    if (run.buddy) elevPalsAboard(run, rand);
    return run;
  }

  function elevReward(run, floor){
    const f = floor || elevFloor(run && run.floor);
    if (!f) return 0;
    const streak = (run && run.streak) || 0;
    const bonus = elevStreakBonus(streak);
    const lucky = (run && run.lucky) || 0;
    const rare = (f.rare || f.secret || f.kind === 'boss') ? 2 : 0;
    return f.coins + bonus + lucky + rare;
  }

  function elevMarkSeen(state, id){
    if (!id) return state;
    if (state.seen.indexOf(id) < 0) state.seen.push(id);
    return state;
  }

  function elevSyncBag(state, run){
    if (run && Array.isArray(run.bag)) state.bag = run.bag.slice();
    return state;
  }

  function elevClearFloor(state, run){
    state = elevLoad(state);
    if (!run || run.cleared) return {ok:false, why:'done', state, run};
    const f = elevFloor(run.floor);
    if (!f) return {ok:false, why:'floor', state, run};
    const pay = elevReward(run, f);
    run.cleared = true;
    run.failed = false;
    run.wantClear = false;
    run.lucky = 0;
    run.streak = (run.streak | 0) + 1;
    run.survived = (run.survived | 0) + 1;
    run.coins = (run.coins | 0) + pay;
    state.cleared += 1;
    state.coins += pay;
    if (run.streak > state.best) state.best = run.streak;
    elevMarkSeen(state, f.id);
    elevSyncBag(state, run);
    if (f.kind === 'find' || f.secret) state.found += 1;
    if (f.kind === 'creepy') state.creepy += 1;
    if (f.kind === 'shop') state.shopped += 1;
    run.phase = 'inter';
    run.t = ELEV_INTER;
    run.quote = '✨ Floor cleared! +' + pay + ' 🪙  ·  Streak ' + run.streak + '  ·  bonus +' + elevStreakBonus(Math.max(0, (run.streak | 0) - 1));
    return {ok:true, why:'ok', state, run, pay, floor:f};
  }

  function elevFailFloor(state, run){
    state = elevLoad(state);
    if (!run || run.cleared || run.failed) return {ok:false, why:'done', state, run};
    const f = elevFloor(run.floor);
    run.failed = true;
    run.cleared = false;
    run.wantFail = false;
    let kept = false;
    if (run.charm){ run.charm = false; kept = true; }
    else run.streak = 0;
    run.holding = null;
    run.lucky = 0;
    run.softLamp = false;
    run.bonusTime = 0;
    run.guard = false;
    state.failed += 1;
    if (f) elevMarkSeen(state, f.id);
    elevSyncBag(state, run);
    run.phase = 'inter';
    run.t = ELEV_INTER;
    run.quote = kept
      ? 'The floor got too wobbly… but everyone is okay! Your streak charm kept the coin streak this once.'
      : 'The floor got too wobbly… but everyone is okay! The coin streak resets, and we hop back in.';
    return {ok:true, why:'ok', state, run, everyoneOkay:true, floor:f};
  }

  function elevBuySnack(state, wallet, run){
    state = elevLoad(state);
    const f = run && elevFloor(run.floor);
    if (!run || !f || f.kind !== 'shop') return {ok:false, why:'shop', state, run, wallet};
    if (run.shopDone) return {ok:false, why:'have', state, run, wallet};
    const cost = 8;
    const coins = Math.max(0, wallet | 0);
    if (coins < cost) return {ok:false, why:'coins', state, run, wallet:coins, need: cost - coins};
    run.shopDone = true;
    run.lucky = 4;
    state.shopped += 1;
    return {ok:true, why:'ok', state, run, wallet: coins - cost, spent:cost};
  }

  function elevRing(run, bell){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    if ((run.seq || []).length === 0){
      run.wantClear = true;
      return {ok:true, why:'ok'};
    }
    const need = run.seq[run.seqAt | 0];
    if ((bell | 0) !== need){
      run.seqAt = 0;
      return {ok:false, why:'wrong'};
    }
    run.seqAt = (run.seqAt | 0) + 1;
    if (run.seqAt >= run.seq.length) run.wantClear = true;
    return {ok:true, why:'ok'};
  }

  function elevPaint(run, id){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    if (run.painted.indexOf(id) < 0) run.painted.push(id);
    const f = elevFloor(run.floor);
    const need = (f && f.paints) || 3;
    if (run.painted.length >= need) run.wantClear = true;
    return {ok:true, why:'ok'};
  }

  function elevPickItem(run, item){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    const f = elevFloor(run.floor);
    const want = (f && f.item) || (f && f.id === 'sockhunt' ? 'sock' : f && f.id === 'lostlunch' ? 'lunch' : 'item');
    if (item !== want) return {ok:false, why:'wrong'};
    run.holding = item;
    return {ok:true, why:'ok'};
  }

  function elevTurnIn(run){
    if (!run || !run.holding) return {ok:false, why:'empty'};
    run.wantClear = true;
    return {ok:true, why:'ok'};
  }

  function elevTouchHazard(run){
    if (!run || run.cleared || run.failed || run.phase !== 'floor') return {ok:false, why:'done'};
    if (run.guard){ run.guard = false; return {ok:true, why:'guard'}; }
    run.wantFail = true;
    return {ok:true, why:'ok'};
  }

  function elevReachDoor(run){
    if (!run || run.cleared || run.failed || run.phase !== 'floor') return {ok:false, why:'done'};
    const f = elevFloor(run.floor);
    if (elevClearMode(f) === 'lit' && !(run.lit > 0.2)) return {ok:false, why:'dark'};
    if (elevClearMode(f) === 'boss' && !run.bossTag) return {ok:false, why:'boss'};
    run.wantClear = true;
    return {ok:true, why:'ok'};
  }

  function elevStayLit(run, lit){
    if (!run) return run;
    const drain = run.softLamp || run.lessScary ? 0.08 : 0.15;
    run.lit = lit ? 1 : Math.max(0, (run.lit || 0) - drain);
    if (run.lit <= 0 && run.phase === 'floor') run.wantFail = true;
    return run;
  }

  function elevQuiz(run, choice){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    const q = run.quiz;
    if (!q) return {ok:false, why:'quiz'};
    if ((choice | 0) === (q.i | 0)){
      run.wantClear = true;
      return {ok:true, why:'ok'};
    }
    return {ok:false, why:'wrong'};
  }

  function elevStack(run){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    const f = elevFloor(run.floor);
    run.stacked = (run.stacked | 0) + 1;
    if (run.stacked >= ((f && f.need) || 5)) run.wantClear = true;
    return {ok:true, why:'ok', stacked: run.stacked};
  }

  function elevBeat(run, on){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    const f = elevFloor(run.floor);
    if (on){
      run.beats = (run.beats | 0) + 1;
      if (run.beats >= ((f && f.need) || 6)) run.wantClear = true;
      return {ok:true, why:'ok', beats: run.beats};
    }
    run.misses = (run.misses | 0) + 1;
    if (run.misses >= 3) run.wantFail = true;
    return {ok:false, why:'miss', misses: run.misses};
  }

  function elevPadStand(run, i, on){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    if (!run.pads) run.pads = [false, false];
    if (on) run.pads[i | 0] = true;
    if (run.pads.length && run.pads.every(Boolean)) run.wantClear = true;
    return {ok:true, why:'ok', pads: run.pads.slice()};
  }

  function elevBossReady(run){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    run.bossTag = true;
    return {ok:true, why:'ok'};
  }

  function elevTagBoss(run){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    if (!run.bossTag) return {ok:false, why:'early'};
    run.wantClear = true;
    return {ok:true, why:'ok'};
  }

  function elevTick(run, dt){
    if (!run) return run;
    let left = Math.max(0, +dt || 0);
    while (left > 0){
      const step = Math.min(0.2, left);
      left -= step;
      run.t = Math.max(0, (run.t || 0) - step);
      if (run.phase === 'board' && run.t <= 0){
        elevBeginRide(run);
      } else if (run.phase === 'ride' && run.t <= 0){
        elevBeginFloor(run, run.floor);
      } else if (run.phase === 'floor' && run.t <= 0 && !run.cleared && !run.failed){
        const f = elevFloor(run.floor);
        if (elevTimerWins(f)) run.wantClear = true;
        else run.wantFail = true;
        break;
      } else if (run.phase === 'floor' && elevClearMode(elevFloor(run.floor)) === 'boss' && !run.bossTag && run.t <= 10){
        run.bossTag = true;
      } else if (run.phase === 'inter' && run.t <= 0){
        elevBeginBoard(run);
      }
      if (run.phase === 'floor' && elevClearMode(elevFloor(run.floor)) === 'rhythm'){
        run.beatT = (run.beatT || 0) + step;
      }
    }
    return run;
  }


  function elevWire(run){
    if (!run) return null;
    return {
      phase: run.phase,
      floor: run.floor,
      t: run.t,
      streak: run.streak,
      survived: run.survived,
      quote: run.quote,
      hostLine: run.hostLine,
      event: run.event && run.event.id,
      snow: !!run.snow,
      watchingHint: !!run.watching,
      buddy: !!run.buddy,
      pals: elevCleanPals(run.pals),
      talk: elevCleanTalk(run.talk),
      talkSeq: run.talkSeq | 0
    };
  }

  function elevApplyWire(run, snap){
    if (!run || !snap || typeof snap !== 'object') return run;
    if (snap.phase) run.phase = snap.phase;
    if (snap.floor !== undefined) run.floor = snap.floor;
    if (snap.t != null) run.t = +snap.t;
    if (snap.streak != null) run.streak = snap.streak | 0;
    if (snap.survived != null) run.survived = snap.survived | 0;
    if (snap.quote != null) run.quote = String(snap.quote).slice(0, 240);
    if (snap.hostLine != null) run.hostLine = String(snap.hostLine).slice(0, 160);
    if (snap.event){
      const ev = ELEV_RIDE_EVENTS.find(e => e.id === snap.event);
      if (ev) run.event = ev;
    } else if (snap.event === null) run.event = null;
    if (snap.snow != null) run.snow = !!snap.snow;
    if (snap.buddy != null) run.buddy = !!snap.buddy;
    if (Array.isArray(snap.pals)) run.pals = elevCleanPals(snap.pals);
    if (snap.talk) run.talk = elevCleanTalk(snap.talk);
    if (snap.talkSeq != null) run.talkSeq = snap.talkSeq | 0;
    return run;
  }

  function elevFloorSpec(id){
    const f = elevFloor(id);
    return {
      id: id,
      floor: f,
      clear: elevClearMode(f),
      setup: function(run, rand){ return elevBeginFloor(run, id, rand); },
      update: function(run, ev){
        ev = ev || {};
        if (ev.dt) elevTick(run, ev.dt);
        if (ev.hazard) elevTouchHazard(run);
        if (ev.door) elevReachDoor(run);
        if (ev.item) elevPickItem(run, ev.item);
        if (ev.turnIn) elevTurnIn(run);
        if (ev.ring != null) elevRing(run, ev.ring);
        if (ev.paint != null) elevPaint(run, ev.paint);
        if (ev.quiz != null) elevQuiz(run, ev.quiz);
        if (ev.stack) elevStack(run);
        if (ev.beat != null) elevBeat(run, ev.beat);
        if (ev.pad != null) elevPadStand(run, ev.pad, ev.on !== false);
        if (ev.lit != null) elevStayLit(run, ev.lit);
        if (ev.bossReady) elevBossReady(run);
        if (ev.tag) elevTagBoss(run);
        return run;
      },
      win: function(run){ return !!(run && (run.wantClear || run.cleared)); },
      fail: function(run){ return !!(run && (run.wantFail || run.failed)); }
    };
  }

  function elevIndexRows(state, opts){
    state = elevLoad(state);
    const snow = elevSnowOn(opts && opts.snow);
    return ELEV_FLOORS.map(f => {
      const seen = state.seen.indexOf(f.id) >= 0;
      return {
        id: f.id,
        name: (f.secret && !seen) ? '???' : f.name,
        emoji: (f.secret && !seen) ? '❔' : f.emoji,
        kind: f.kind,
        seen: seen,
        secret: !!f.secret,
        holiday: !!f.holiday,
        rare: !!f.rare,
        locked: !!(!seen && f.holiday && !snow)
      };
    });
  }

  function elevBadges(state, run){
    state = elevLoad(state);
    const b = [];
    if ((state.rides | 0) >= 1) b.push('elev-ride');
    if ((run && (run.streak | 0) >= 5) || state.best >= 5) b.push('elev-five');
    if ((run && (run.streak | 0) >= 12) || state.best >= 12) b.push('elev-twelve');
    if ((state.creepy | 0) >= 1) b.push('elev-creepy');
    if ((state.found | 0) >= 1) b.push('elev-find');
    if ((state.seen || []).length >= 25) b.push('elev-seen25');
    if ((state.seen || []).length >= ELEV_FLOORS.length) b.push('elev-seenall');
    return b;
  }

  const api = {
    ELEV_KEY, ELEV_VER, ELEV_SHOP_EVERY, ELEV_RIDE, ELEV_INTER, ELEV_BOARD, ELEV_BAG_KEEP, ELEV_FLOORS, ELEV_PALS, ELEV_HOST, ELEV_QUIZ, ELEV_SHOP, ELEV_RIDE_EVENTS, ELEV_PAL_SPOTS, ELEV_PAL_MAX,
    ELEV_CAB_W, ELEV_CAB_D, ELEV_CAB_Z, ELEV_HALL_W, ELEV_ROOM_Z, ELEV_FLOOR_TOP, ELEV_BODY_R,
    elevFloor, elevPal, elevClearMode, elevRoomOf, elevSpawnOf, elevBoxHit, elevOnSolid, elevSimStep, elevTimerWins, elevFresh, elevLoad, elevBuddyAllowed, elevNoFight, elevNoGore, elevEveryoneOkay,
    elevShopItem, elevShopList, elevInheritLessScary, elevSetLessScary, elevStreakBonus, elevBeginBoard, elevCloseDoors, elevPickRideEvent, elevTalkLine, elevIntercom, elevPalSpots, elevPalMayRide, elevSeatPals, elevCleanPals, elevPalIds, elevPalsAboard, elevPalsHop, elevHostTalk, elevCleanTalk, elevBuyItem, elevWearHat, elevApplyPack, elevWire, elevApplyWire,
    elevSnowOn, elevHostLine, elevPickPal, elevStartRun, elevDueShop, elevPool, elevRebuildBag, elevPickFloor, elevBeginFloor, elevBeginRide,
    elevReward, elevClearFloor, elevFailFloor, elevBuySnack, elevRing, elevPaint, elevPickItem, elevTurnIn,
    elevTouchHazard, elevReachDoor, elevStayLit, elevQuiz, elevStack, elevBeat, elevPadStand, elevBossReady, elevTagBoss,
    elevTick, elevFloorSpec, elevIndexRows, elevBadges
  };
  root.ElevRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
