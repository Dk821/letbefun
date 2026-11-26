import TextPage from '../components/TextPage.jsx'
import { CONTACT } from '../data/content.js'
import { PAGES } from '../data/seo.js'
import { useSeo } from '../hooks/index.js'

export default function Contact() {
  useSeo(PAGES.contact)
  return <TextPage id="contact-title" title="Contact Us" blocks={CONTACT} />
}
