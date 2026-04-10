import { Card } from '@/components/ui/card'
import PageHero from '@/components/layout/PageHero'

type HeroSection = {
  type: 'hero'
  heading: string
  subheading?: string
  ctaLabel?: string
  ctaHref?: string
}

type RichTextSection = {
  type: 'richText'
  heading?: string
  body: string
}

type StatsSection = {
  type: 'stats'
  items: Array<{ label: string; value: string }>
}

type ImageGridSection = {
  type: 'imageGrid'
  images: Array<{ url: string; alt?: string; caption?: string }>
}

type PageContent = {
  sections: Array<HeroSection | RichTextSection | StatsSection | ImageGridSection>
}

export default function PageRenderer({ title, content }: { title: string; content: unknown }) {
  const safe = (content ?? {}) as Partial<PageContent>
  const sections = Array.isArray(safe.sections) ? safe.sections : []

  return (
    <div>
      <PageHero
        kicker="SOHO PG"
        title={title}
        subtitle="Learn more about our spaces, standards, and community-first approach."
      />

      <div className="container-custom pb-14">
        <div className="grid gap-6">
          {sections.length ? (
            sections.map((section, idx) => {
              if (!section || typeof section !== 'object' || !('type' in section)) return null

              if (section.type === 'hero') {
                const s = section as HeroSection
                return (
                  <Card key={idx} className="p-6 bg-(--color-alabaster)/75 border-(--color-border)/70 backdrop-blur-md">
                    <div className="space-y-2">
                      <div className="text-2xl font-semibold">{s.heading}</div>
                      {s.subheading ? <div className="text-(--color-muted)">{s.subheading}</div> : null}
                      {s.ctaLabel && s.ctaHref ? (
                        <a className="inline-block mt-3 text-(--color-clay) hover:underline" href={s.ctaHref}>
                          {s.ctaLabel}
                        </a>
                      ) : null}
                    </div>
                  </Card>
                )
              }

              if (section.type === 'richText') {
                const s = section as RichTextSection
                return (
                  <Card key={idx} className="p-6 bg-(--color-alabaster)/75 border-(--color-border)/70 backdrop-blur-md">
                    {s.heading ? <div className="text-xl font-semibold mb-3">{s.heading}</div> : null}
                    <div className="space-y-3 text-(--color-foreground)">
                      {String(s.body || '')
                        .split('\n')
                        .filter(Boolean)
                        .map((p, i) => (
                          <p key={i} className="leading-relaxed">
                            {p}
                          </p>
                        ))}
                    </div>
                  </Card>
                )
              }

              if (section.type === 'stats') {
                const s = section as StatsSection
                return (
                  <Card key={idx} className="p-6 bg-(--color-alabaster)/75 border-(--color-border)/70 backdrop-blur-md">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {(s.items || []).map((it, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 p-4 backdrop-blur-md"
                        >
                          <div className="text-2xl font-semibold">{it.value}</div>
                          <div className="text-sm text-(--color-muted)">{it.label}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )
              }

              if (section.type === 'imageGrid') {
                const s = section as ImageGridSection
                return (
                  <Card key={idx} className="p-6 bg-(--color-alabaster)/75 border-(--color-border)/70 backdrop-blur-md">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {(s.images || []).map((img, i) => (
                        <figure key={i} className="overflow-hidden rounded-xl border border-(--color-border)/70">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt={img.alt || ''} className="h-44 w-full object-cover" />
                          {img.caption ? (
                            <figcaption className="p-2 text-xs text-(--color-muted)">{img.caption}</figcaption>
                          ) : null}
                        </figure>
                      ))}
                    </div>
                  </Card>
                )
              }

              return null
            })
          ) : (
            <Card className="p-6 bg-(--color-alabaster)/75 border-(--color-border)/70 backdrop-blur-md">
              <div className="text-(--color-muted)">No content yet.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
