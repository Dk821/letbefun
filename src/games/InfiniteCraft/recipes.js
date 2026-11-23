// Local combination dataset. Format: [a, b, result, emoji]. Order does not matter.
// The dataset is finite on purpose — unknown combinations simply do nothing.
export const BASE = [
  { name: 'Water', emoji: '💧' },
  { name: 'Fire', emoji: '🔥' },
  { name: 'Earth', emoji: '🌍' },
  { name: 'Air', emoji: '💨' },
]

const R = [
  ['Water', 'Fire', 'Steam', '♨️'], ['Water', 'Earth', 'Mud', '🟫'], ['Fire', 'Earth', 'Lava', '🌋'], ['Air', 'Fire', 'Smoke', '🌫️'],
  ['Air', 'Water', 'Cloud', '☁️'], ['Air', 'Earth', 'Dust', '🌪️'], ['Water', 'Water', 'Lake', '🏞️'], ['Fire', 'Fire', 'Inferno', '🔥'],
  ['Earth', 'Earth', 'Mountain', '⛰️'], ['Air', 'Air', 'Wind', '🌬️'], ['Cloud', 'Water', 'Rain', '🌧️'], ['Rain', 'Earth', 'Plant', '🌱'],
  ['Lake', 'Lake', 'Ocean', '🌊'], ['Lava', 'Water', 'Stone', '🪨'], ['Stone', 'Fire', 'Metal', '🔩'], ['Cloud', 'Cloud', 'Storm', '⛈️'],
  ['Storm', 'Fire', 'Lightning', '⚡'], ['Steam', 'Steam', 'Cloud', '☁️'], ['Dust', 'Water', 'Mud', '🟫'], ['Mud', 'Fire', 'Brick', '🧱'],
  ['Brick', 'Brick', 'Wall', '🧱'], ['Wall', 'Wall', 'House', '🏠'], ['House', 'House', 'Village', '🏘️'], ['Village', 'Village', 'City', '🏙️'],
  ['Plant', 'Plant', 'Forest', '🌲'], ['Plant', 'Water', 'Algae', '🌿'], ['Plant', 'Fire', 'Ash', '🪵'], ['Plant', 'Earth', 'Tree', '🌳'],
  ['Tree', 'Tree', 'Forest', '🌲'], ['Tree', 'Metal', 'Axe', '🪓'], ['Axe', 'Tree', 'Wood', '🪵'], ['Wood', 'Fire', 'Campfire', '🏕️'],
  ['Wood', 'Wood', 'Boat', '⛵'], ['Boat', 'Ocean', 'Ship', '🚢'], ['Wood', 'Metal', 'Tool', '🔨'], ['Metal', 'Metal', 'Sword', '🗡️'],
  ['Sand', 'Fire', 'Glass', '🪟'], ['Stone', 'Stone', 'Sand', '🏖️'], ['Stone', 'Air', 'Sand', '🏖️'], ['Ocean', 'Sand', 'Beach', '🏖️'],
  ['Algae', 'Ocean', 'Fish', '🐟'], ['Fish', 'Fire', 'Sushi', '🍣'], ['Fish', 'Land', 'Frog', '🐸'], ['Water', 'Stone', 'Pebble', '⚪'],
  ['Earth', 'Plant', 'Seed', '🌰'], ['Seed', 'Water', 'Flower', '🌸'], ['Flower', 'Flower', 'Garden', '🌷'], ['Flower', 'Air', 'Pollen', '🌼'],
  ['Pollen', 'Fire', 'Honey', '🍯'], ['Flower', 'Pollen', 'Bee', '🐝'], ['Bee', 'Flower', 'Honey', '🍯'], ['Honey', 'Fire', 'Candy', '🍬'],
  ['Mountain', 'Mountain', 'Mountain Range', '🏔️'], ['Mountain', 'Cloud', 'Snow', '❄️'], ['Snow', 'Snow', 'Snowman', '☃️'], ['Water', 'Snow', 'Ice', '🧊'],
  ['Ice', 'Ice', 'Glacier', '🧊'], ['Ice', 'Fire', 'Water', '💧'], ['Ice', 'Air', 'Frost', '🥶'], ['Mountain', 'Lava', 'Volcano', '🌋'],
  ['Volcano', 'Water', 'Island', '🏝️'], ['Island', 'Island', 'Archipelago', '🏝️'], ['Island', 'Palm', 'Paradise', '🌴'], ['Tree', 'Sand', 'Palm', '🌴'],
  ['Lightning', 'Mud', 'Life', '🧬'], ['Life', 'Water', 'Bacteria', '🦠'], ['Life', 'Land', 'Animal', '🐾'], ['Life', 'Earth', 'Land', '🏞️'],
  ['Life', 'Ocean', 'Plankton', '🦐'], ['Bacteria', 'Time', 'Evolution', '🦎'], ['Animal', 'Fire', 'Dragon', '🐉'], ['Animal', 'Air', 'Bird', '🐦'],
  ['Bird', 'Fire', 'Phoenix', '🦅'], ['Bird', 'Stone', 'Egg', '🥚'], ['Egg', 'Fire', 'Omelette', '🍳'], ['Egg', 'Earth', 'Chicken', '🐔'],
  ['Animal', 'Plant', 'Cow', '🐄'], ['Cow', 'Plant', 'Milk', '🥛'], ['Milk', 'Ice', 'Ice Cream', '🍨'], ['Milk', 'Time', 'Cheese', '🧀'],
  ['Animal', 'Animal', 'Zoo', '🦁'], ['Animal', 'Human', 'Dog', '🐕'], ['Life', 'Animal', 'Human', '🧑'], ['Human', 'Human', 'Family', '👪'],
  ['Human', 'Fire', 'Cook', '🧑‍🍳'], ['Human', 'Tool', 'Farmer', '🧑‍🌾'], ['Human', 'Metal', 'Knight', '🛡️'], ['Human', 'Stone', 'Statue', '🗿'],
  ['Human', 'Plant', 'Farmer', '🧑‍🌾'], ['Farmer', 'Seed', 'Wheat', '🌾'], ['Wheat', 'Water', 'Dough', '🥣'], ['Dough', 'Fire', 'Bread', '🍞'],
  ['Bread', 'Cheese', 'Sandwich', '🥪'], ['Wheat', 'Wind', 'Flour', '🌾'], ['Flour', 'Water', 'Dough', '🥣'], ['Dough', 'Cheese', 'Pizza', '🍕'],
  ['Human', 'Glass', 'Telescope', '🔭'], ['Telescope', 'Air', 'Star', '⭐'], ['Star', 'Star', 'Galaxy', '🌌'], ['Star', 'Earth', 'Planet', '🪐'],
  ['Planet', 'Planet', 'Solar System', '☀️'], ['Planet', 'Fire', 'Sun', '☀️'], ['Planet', 'Stone', 'Moon', '🌙'], ['Sun', 'Moon', 'Eclipse', '🌑'],
  ['Sun', 'Rain', 'Rainbow', '🌈'], ['Sun', 'Plant', 'Oxygen', '🫧'], ['Moon', 'Ocean', 'Tide', '🌊'], ['Human', 'Moon', 'Werewolf', '🐺'],
  ['Human', 'Air', 'Pilot', '🧑‍✈️'], ['Metal', 'Air', 'Airplane', '✈️'], ['Airplane', 'Planet', 'Rocket', '🚀'], ['Metal', 'Fire', 'Engine', '⚙️'],
  ['Engine', 'Wheel', 'Car', '🚗'], ['Wood', 'Stone', 'Wheel', '🛞'], ['Engine', 'Ship', 'Steamship', '🛳️'], ['Metal', 'Lightning', 'Electricity', '🔌'],
  ['Electricity', 'Glass', 'Light Bulb', '💡'], ['Electricity', 'Metal', 'Robot', '🤖'], ['Robot', 'Human', 'Cyborg', '🦾'], ['Electricity', 'Human', 'Computer', '💻'],
  ['Computer', 'Computer', 'Internet', '🌐'], ['Computer', 'Robot', 'AI', '🧠'], ['Human', 'Time', 'Ghost', '👻'], ['Ghost', 'House', 'Haunted House', '🏚️'],
  ['Human', 'Magic', 'Wizard', '🧙'], ['Star', 'Life', 'Magic', '✨'], ['Wizard', 'Dragon', 'Legend', '📜'], ['Magic', 'Flower', 'Fairy', '🧚'],
  ['Magic', 'Egg', 'Unicorn', '🦄'], ['Magic', 'Water', 'Potion', '🧪'], ['Potion', 'Human', 'Vampire', '🧛'], ['Rainbow', 'Unicorn', 'Dream', '💭'],
  ['Wind', 'Water', 'Wave', '🌊'], ['Wave', 'Wind', 'Surf', '🏄'], ['Earth', 'Time', 'Fossil', '🦴'], ['Fossil', 'Life', 'Dinosaur', '🦖'],
  ['Dinosaur', 'Bird', 'Chicken', '🐔'], ['Dinosaur', 'Stone', 'Meteor', '☄️'], ['Meteor', 'Earth', 'Crater', '🕳️'], ['Metal', 'Stone', 'Statue', '🗿'],
  ['Sand', 'Glass', 'Time', '⏳'], ['Time', 'Time', 'Eternity', '♾️'], ['Fire', 'Time', 'Ash', '🪵'], ['Air', 'Time', 'Season', '🍂'], ['Sun', 'Time', 'Day', '🌞'],
  ['Moon', 'Time', 'Night', '🌃'], ['Day', 'Night', 'Week', '📅'], ['Human', 'Wheat', 'Baker', '🧑‍🍳'], ['Ocean', 'Fire', 'Salt', '🧂'],
  ['Salt', 'Egg', 'Seasoning', '🧂'], ['Snow', 'Human', 'Skier', '⛷️'], ['Human', 'Water', 'Swimmer', '🏊'], ['Human', 'Book', 'Scholar', '🎓'],
  ['Plant', 'Wood', 'Paper', '📄'], ['Paper', 'Paper', 'Book', '📖'], ['Book', 'Human', 'Scholar', '🎓'], ['Paper', 'Fire', 'Ash', '🪵'],
]

/** Order-independent key. */
export const keyOf = (a, b) => [a, b].map((s) => s.toLowerCase()).sort().join('|')

export const BUILTIN = new Map()
const emojiOf = new Map(BASE.map((b) => [b.name, b.emoji]))
for (const [a, b, res, em] of R) {
  BUILTIN.set(keyOf(a, b), { name: res, emoji: em })
  if (!emojiOf.has(res)) emojiOf.set(res, em)
}
export const BUILTIN_COUNT = BUILTIN.size
export const knownEmoji = (name) => emojiOf.get(name)
/** Names reachable in the dataset (for the progress counter). */
export const ALL_RESULTS = new Set([...BUILTIN.values()].map((v) => v.name))
