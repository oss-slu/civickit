import { createFileRoute } from '@tanstack/react-router'
import Nav from '@/components/pageSections/Nav'
import { palette } from '@/lib/colors'
import Hero from '@/components/pageSections/Hero'
import Problem from '@/components/pageSections/Problem'
import ScatteredReporting from '@/components/pageSections/ScatteredReporting'
import Solution from '@/components/pageSections/Solution'
import SharedMap from '@/components/pageSections/SharedMap'
import WhoWeServe from '@/components/pageSections/WhoWeServe'
import Footer from '@/components/pageSections/Footer'

export const Route = createFileRoute('/')({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: 'CivicKit - Making public works public facing' },
      {
        name: 'description',
        content:
          'Report civic issues in under 10 seconds. One shared map. Full transparency. Built for St. Louis, scalable to every city.',
      },
      {
        property: 'og:title',
        content: 'CivicKit - Making public works public facing',
      },
      {
        property: 'og:description',
        content:
          'Report civic issues in under 10 seconds. One shared map. Full transparency.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://civickit.org' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&display=swap',
      },
    ],
  }),
})


function LandingPage() {
  return (
    <div
      className="min-h-svh antialiased"
      style={{
        fontFamily: "'Outfit', sans-serif",
        backgroundColor: palette.bg,
        color: palette.dark,
      }}
    >
      <Nav />
      <Hero />
      <Problem />
      <ScatteredReporting />
      <Solution />
      <SharedMap />
      <WhoWeServe />
      <Footer />
    </div>
  )
}
