import { useSeo } from '../hooks/index.js'

export default function About() {
  useSeo({ title: 'About', description: 'What letbe.fun is, and why it exists.', path: '/about' })
  return (
    <article className="mx-auto max-w-2xl pt-10">
      <h1 className="text-4xl font-extrabold sm:text-5xl">About letbe.fun</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
        <p>letbe.fun is a small, hand-built collection of interactive toys, puzzles and thought experiments. Each one is meant to be played in a few minutes and to leave you slightly more curious than before.</p>
        <p>It is a static website. There is no server, no database, no account system, and only anonymous, cookie-free page-view analytics (Vercel Web Analytics). Your scores, favorites and saved games live in your browser's own storage, and you can wipe them from Settings at any time.</p>
        <p>Every game, illustration and dataset here was created for this project. Science-flavored games (like the asteroid lab and the scale of the universe) are simplified for education, so please treat their numbers as approximations.</p>
        <p>Built with React, Vite, Tailwind CSS, Framer Motion and Three.js.</p>
      </div>
    </article>
  )
}
