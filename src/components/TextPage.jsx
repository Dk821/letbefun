// Layout for text pages built from the blocks in data/content.js.
function Rich({ lead, text, link }) {
  return (
    <>
      {lead && <><strong className="text-ink">{lead}</strong>{' '}</>}
      {text}
      {link && <>{' '}<a href={link.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline">{link.label}</a></>}
    </>
  )
}

export default function TextPage({ id, title, blocks }) {
  return (
    <article className="mx-auto max-w-2xl pt-10">
      <h1 id={id} className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
      <div className="mt-6 space-y-5 leading-relaxed text-muted">
        {blocks.map((block, i) => {
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
