import { FooterSection } from './landing/FooterSection'
import { LatestJobsSection } from './landing/LatestJobsSection'
import { NewCtaSection } from './landing/NewCtaSection'
import { NewHeroSection } from './landing/NewHeroSection'
import { StatisticsBarSection } from './landing/StatisticsBarSection'

export function LandingPage() {
  return (
    <div className="landing-page">
      <NewHeroSection />
      <StatisticsBarSection />
      <LatestJobsSection />
      <NewCtaSection />
      <FooterSection />
    </div>
  )
}
