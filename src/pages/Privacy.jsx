import { useSeo } from '../hooks/index.js'

export default function Privacy() {
  useSeo({ title: 'Privacy', description: 'letbe.fun stores data only in your browser. Here is exactly what and why.', path: '/privacy' })
  return (
    <article className="mx-auto max-w-2xl pt-10">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Privacy</h1>
      <div className="mt-6 space-y-5 leading-relaxed text-muted">
        <p><strong className="text-ink">Short version:</strong> letbe.fun does not collect, send or sell any data. There is no backend.</p>
        <h2 className="pt-2 text-xl font-bold text-ink">What is stored on your device</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong className="text-ink">LocalStorage:</strong> theme, sound preference, favorites, recently played games, best scores and small game progress.</li>
          <li><strong className="text-ink">IndexedDB:</strong> larger items such as discovered elements, custom recipes and your saved decision lists.</li>
          <li>Passwords typed into the Password Gauntlet are never stored or transmitted. Do not reuse real passwords anywhere in games.</li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-ink">Third-party services</h2>
        <p>The only external request the site makes is loading fonts from Google Fonts, which may log your IP address as any web request does. No other third-party scripts, cookies or trackers are used. If you host a copy yourself you can self-host the fonts.</p>
        <h2 className="pt-2 text-xl font-bold text-ink">Your control</h2>
        <p>Open Settings to export or permanently delete everything stored by this site. Clearing your browser data does the same.</p>
      </div>
    </article>
  )
}
