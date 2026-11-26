import TextPage from '../components/TextPage.jsx'
import { DISCLAIMER } from '../data/content.js'
import { PAGES } from '../data/seo.js'
import { useSeo } from '../hooks/index.js'

export default function Disclaimer() {
  useSeo(PAGES.disclaimer)
  return <TextPage id="disclaimer-title" title="Disclaimer" blocks={DISCLAIMER} />
}
