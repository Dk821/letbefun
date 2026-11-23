const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const isPrime = (n) => {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
  return true
}
const digitSum = (s) => [...s].reduce((a, c) => a + (/\d/.test(c) ? Number(c) : 0), 0)

export const RULES = [
  { id: 1, text: () => 'At least 8 characters.', test: (p) => p.length >= 8 },
  { id: 2, text: () => 'Include a number.', test: (p) => /\d/.test(p) },
  { id: 3, text: () => 'Include an uppercase letter.', test: (p) => /[A-Z]/.test(p) },
  { id: 4, text: () => 'Include a special character (!@#$%…).', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
  { id: 5, text: () => 'The digits must add up to exactly 25.', test: (p) => digitSum(p) === 25 },
  { id: 6, text: () => 'Include a month of the year.', test: (p) => MONTHS.some((m) => p.toLowerCase().includes(m)) },
  { id: 7, text: () => 'Include a Roman numeral (I, V, X, L, C, D or M) in uppercase.', test: (p) => /[IVXLCDM]/.test(p) },
  { id: 8, text: () => 'Include the first part of this website’s name (letbe).', test: (p) => p.toLowerCase().includes('letbe') },
  { id: 9, text: (y) => `Include the current year (${y}).`, test: (p, c) => p.includes(String(c.year)) },
  { id: 10, text: () => 'Include one of these emoji: 🥚 🌙 🔥.', test: (p) => /[🥚🌙🔥]/u.test(p) },
  { id: 11, text: () => 'No letter may appear more than three times.', test: (p) => {
    const counts = {}
    for (const ch of p.toLowerCase()) if (/[a-z]/.test(ch)) counts[ch] = (counts[ch] || 0) + 1
    return Object.values(counts).every((n) => n <= 3)
  } },
  { id: 12, text: () => 'The password length must be a prime number.', test: (p) => isPrime([...p].length) },
  { id: 13, text: () => 'It must end with an exclamation mark.', test: (p) => p.endsWith('!') },
  { id: 14, text: () => 'It must contain the word “please”. Manners matter.', test: (p) => p.toLowerCase().includes('please') },
]
