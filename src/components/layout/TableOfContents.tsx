import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

/** TOC otomatis: memindai h2/h3 di dalam <article>, seperti docs premium. */
export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const article = document.querySelector('article')
    if (!article) return

    const scan = () => {
      const els = Array.from(article.querySelectorAll('h2, h3'))
      const list: Heading[] = els
        .filter((el) => el.id)
        .map((el) => ({
          id: el.id,
          text: el.textContent ?? '',
          level: el.tagName === 'H2' ? 2 : 3
        }))
      setHeadings(list)
    }
    scan()

    // re-scan saat konten berubah (navigasi antar topik)
    const observer = new MutationObserver(scan)
    observer.observe(article, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <aside className="sticky top-24 hidden h-fit w-52 shrink-0 border-l border-frost/8 py-8 pl-6 xl:block">
      <div className="pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-frost-faint">
        On this page
      </div>
      <nav className="flex flex-col gap-1">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`text-[12.5px] leading-snug transition-colors ${
              h.level === 3 ? 'pl-3' : ''
            } ${
              activeId === h.id
                ? 'text-electric-bright'
                : 'text-frost-faint hover:text-frost-dim'
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </aside>
  )
}
