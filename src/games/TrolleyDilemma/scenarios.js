// All scenarios are fictional thought experiments.
// Each option: act = actively intervenes, more = the outcome that saves more lives (or equal/unclear = false).
const o = (label, act, more) => ({ label, act, more })
const S = (id, title, text, a, b, note, art = 'many') => ({ id, title, text, a, b, note, art })

export const SCENARIOS = [
  S('classic', 'The classic', 'A runaway trolley will hit five workers. You can pull a lever to divert it onto a side track where it will hit one worker.',
    o('Pull the lever', true, true), o('Do nothing', false, false), 'Most people say they would pull the lever.'),
  S('bridge', 'The footbridge', 'A trolley will hit five people. You are on a bridge next to a very large stranger. Pushing them off would stop the trolley and kill them, saving the five.',
    o('Push the stranger', true, true), o('Do nothing', false, false), 'Same numbers as the classic, yet far fewer people say yes.', 'bridge'),
  S('loop', 'The loop', 'The side track loops back to the main track. A single heavy person on it would stop the trolley before it returns. You can divert it.',
    o('Divert it', true, true), o('Do nothing', false, false), 'Here the one person is a means to the end, not a side effect.'),
  S('self', 'Your own sacrifice', 'You can stop the trolley by jumping in front of it. You would die; the five on the track would live.',
    o('Jump', true, true), o('Stay put', false, false), 'Self-sacrifice is rarely demanded by morality, but often admired.'),
  S('loved', 'Someone you love', 'The one person on the side track is your closest friend. The five on the main track are strangers.',
    o('Pull the lever', true, true), o('Do nothing', false, false), 'Do we owe the same to everyone?'),
  S('doctor', 'The surgeon', 'Five patients each need a different organ to live. A healthy visitor is a perfect match for all. Harvesting would save five and cost one life.',
    o('Harvest the organs', true, true), o('Treat them normally', false, false), 'Almost everyone refuses — why does this differ from the lever?'),
  S('child', 'Five elders, one child', 'The five on the main track are elderly. The one on the side track is a child with their whole life ahead.',
    o('Pull the lever', true, false), o('Do nothing', false, true), 'Should life-years count? Many disagree.'),
  S('robot', 'Five robots', 'The five on the track are advanced robots that seem to have feelings. The side track has one human.',
    o('Save the human', true, false), o('Save the robots', false, true), 'What makes a being matter morally?'),
  S('lottery', 'The lottery', 'A trolley is heading for five. You can divert it, but the person on the side track would be chosen by a fair random draw among everyone present.',
    o('Run the lottery', true, true), o('Do nothing', false, false), 'Does fairness of the process change the act?'),
  S('promise', 'The promise', 'You promised someone you would never touch the lever. Five people are about to be hit; the lever would hit just one.',
    o('Break the promise', true, true), o('Keep it', false, false), 'Duties can collide.'),
  S('many', 'A million to one', 'Diverting the trolley would kill one person. Doing nothing kills a million (it is a very long, very fictional trolley).',
    o('Pull the lever', true, true), o('Do nothing', false, false), 'At some number, the answer gets easier for most people.'),
  S('delay', 'Too late to know', 'You only have time to pull the lever once, and there is a 50% chance the switch works.',
    o('Pull anyway', true, true), o('Do nothing', false, false), 'Uncertainty complicates every moral rule.'),
]
