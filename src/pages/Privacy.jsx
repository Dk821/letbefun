import TextPage from '../components/TextPage.jsx'
import { PRIVACY } from '../data/content.js'
import { PAGES } from '../data/seo.js'
import { useSeo } from '../hooks/index.js'

export default function Privacy() {
  useSeo(PAGES.privacy)
  return <TextPage id="privacy-title" title="Privacy Policy" blocks={PRIVACY} />
}
