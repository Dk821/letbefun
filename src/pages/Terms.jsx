import TextPage from '../components/TextPage.jsx'
import { TERMS } from '../data/content.js'
import { PAGES } from '../data/seo.js'
import { useSeo } from '../hooks/index.js'

export default function Terms() {
  useSeo(PAGES.terms)
  return <TextPage id="terms-title" title="Terms and Conditions" blocks={TERMS} />
}
