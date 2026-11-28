// Each row is 11 characters:
//   .  empty        n  normal (1 hit)    s  strong (2 hits)   t  strong (3 hits)
//   g  golden       x  explosive         p  power-up          u  unbreakable
// Unbreakable bricks must never seal off a breakable one.
import { COLS } from './constants.js'

export const LEVELS = [
  {
    name: 'Classic Grid',
    rows: [
      'nnnnnnnnnnn',
      'nnpnnnnnpnn',
      'nnnnnnnnnnn',
      'nnnnngnnnnn',
      'nnnpnnnpnnn',
    ],
  },
  {
    name: 'Pyramid',
    rows: [
      '.....g.....',
      '....nnn....',
      '...npnpn...',
      '..nnnxnnn..',
      '.nnnnnnnnn.',
      'sspsssssPss',
    ],
  },
  {
    name: 'Diamond',
    rows: [
      '.....s.....',
      '....sns....',
      '...snpns...',
      '..snngnns..',
      '.snpnxnpns.',
      '..snngnns..',
      '...snpns...',
      '....sns....',
      '.....s.....',
    ],
  },
  {
    name: 'Checkerboard',
    rows: [
      's.n.s.n.s.n',
      '.n.p.n.p.n.',
      'n.s.n.s.n.s',
      '.x.n.g.n.x.',
      's.n.s.n.s.n',
      '.p.n.x.n.p.',
      'n.s.n.s.n.s',
      '.n.n.n.n.n.',
    ],
  },
  {
    name: 'Fortress',
    rows: [
      's.s.s.s.s.s',
      'sssssssssss',
      's.........s',
      's.nngggnn.s',
      's.npxnxpn.s',
      's.nnnnnnn.s',
      's.........s',
      'uuns.p.snuu',
    ],
  },
  {
    name: 'Tunnel',
    rows: [
      'nnu.....unn',
      'gnu.nnn.ung',
      'nnu.npn.unn',
      'ssu.nnn.uss',
      'npu.sxs.upn',
      'nnu.nnn.unn',
      'ssu.npn.uss',
      'nnu.....unn',
      'xnn.ttt.nnx',
    ],
  },
  {
    name: 'Cross Formation',
    rows: [
      'ss..npn..ss',
      'sg..nsn..gs',
      '....nsn....',
      'nnnnnxnnnnn',
      'psssxtxsssp',
      'nnnnnxnnnnn',
      '....nsn....',
      'sg..nsn..gs',
      'ss..npn..ss',
      'uu.......uu',
    ],
  },
  {
    name: 'Spiral',
    rows: [
      'sssssssssss',
      '..........s',
      'nnnnnnnnn.s',
      'n.......n.s',
      'n.tttpt.n.s',
      'n.t...g.n.s',
      'n.p.xgg.n.s',
      'n.t.....n.s',
      'n.tttttsn.s',
      'n.........s',
      'nnnnpsssxss',
    ],
  },
  {
    name: 'Double Wall',
    rows: [
      'gsgsgxgsgsg',
      'ttttttttttt',
      'sspsssssPss',
      '...........',
      'uu.uu.uu.uu',
      '...........',
      'sssxsssxsss',
      'nnpnnpnnpnn',
      'nnnnnnnnnnn',
    ],
  },
  {
    name: 'Final Challenge',
    rows: [
      'tgtgtgtgtgt',
      'ttxtttttxtt',
      'u.u.u.u.u.u',
      'sspssxsspss',
      'sgsssgsssgs',
      '.uu..u..uu.',
      'ttsxsssxstt',
      'npnnnnnnnpn',
      '...........',
      'uu.sssss.uu',
      'nnnnxpxnnnn',
    ],
  },
].map((level) => ({ ...level, rows: level.rows.map((row) => row.toLowerCase()) }))

/**
 * One generated row for Endless mode. `index` counts rows ever generated: unbreakable bricks only
 * go in even rows, so the open odd rows keep every brick reachable.
 */
export function generateRow(wave, index, random) {
  const half = []
  const mid = Math.floor(COLS / 2)
  const hard = Math.min(0.45, wave * 0.045)
  for (let c = 0; c <= mid; c++) {
    const roll = random()
    if (roll < 0.14) half.push('.')
    else if (roll < 0.2) half.push('p')
    else if (roll < 0.24) half.push('x')
    else if (roll < 0.27) half.push('g')
    else if (roll < 0.27 + hard) half.push(wave > 4 && random() < 0.35 ? 't' : 's')
    else half.push('n')
  }
  if (wave >= 3 && index % 2 === 0 && random() < 0.45) half[Math.floor(random() * mid)] = 'u'
  return [...half, ...half.slice(0, mid).reverse()].join('')
}

export const generateFormation = (wave, random) =>
  Array.from({ length: Math.min(8, 4 + Math.ceil(wave / 2)) }, (_, i) => generateRow(wave, i, random))
