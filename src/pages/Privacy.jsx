import { PRIVACY } from '../data/content.js'
import { PAGES } from '../data/seo.js'
import { useSeo } from '../hooks/index.js'

function Rich({ lead, text }) {
  return (
    <>
      {lead && <><strong className="text-ink">{lead}</strong>{' '}</>}
      {text}
    </>
  )
}

export default function Privacy() {
  useSeo(PAGES.privacy)
  return (
    <article className="mx-auto max-w-2xl pt-10">
      <h1 id="privacy-title" className="text-4xl font-extrabold sm:text-5xl">Privacy</h1>
      <div className="mt-6 space-y-5 leading-relaxed text-muted">
        {PRIVACY.map((block, i) => {
          if (block.heading) return <h2 key={i} id={block.id} className="pt-2 text-xl font-bold text-ink">{block.heading}</h2>
          if (block.list)
            return (
              <ul key={i} className="list-disc space-y-1 pl-6">
                {block.list.map((item) => (
                  <li key={item.text}><Rich {...item} /></li>
                ))}
              </ul>
            )
          return <p key={i}><Rich {...block} /></p>
        })}
      </div>
    </article>
  )
}
