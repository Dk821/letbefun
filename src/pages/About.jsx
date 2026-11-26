import { ABOUT } from '../data/content.js'
import { PAGES } from '../data/seo.js'
import { useSeo } from '../hooks/index.js'

export default function About() {
  useSeo(PAGES.about)
  return (
    <article className="mx-auto max-w-2xl pt-10">
      <h1 id="about-title" className="text-4xl font-extrabold sm:text-5xl">About letbe.fun</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
        {ABOUT.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </div>
    </article>
  )
}
