import Navbar from '../components/landing/navbar.jsx'
import Hero from '../components/landing/Hero.jsx'
import UploadPanel from '../components/landing/UploadPanel.jsx'
import WhyChoose from '../components/landing/WhyChoose.jsx'
import TrustedBy from '../components/landing/Trustedby.jsx'
import Industries from '../components/landing/Industries.jsx'
import CTA from '../components/landing/CTA.jsx'
import Footer from '../components/landing/Footer.jsx'
import { features, industries, trustedByLogos } from '../data/mockData.js'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />
      <Hero />
      <UploadPanel />
      <WhyChoose features={features} />
      <TrustedBy logos={trustedByLogos} />
      <Industries industries={industries} />
      <CTA />
      <Footer />
    </div>
  )
}