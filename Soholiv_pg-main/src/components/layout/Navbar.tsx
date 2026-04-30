import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import NavbarClient, { MenuNode } from './NavbarClient'

const FALLBACK_HEADER_MENU: MenuNode[] = [
  { id: 'home', title: 'Home', href: '/', openInNewTab: false, children: [] },
  { id: 'about', title: 'About', href: '/about', openInNewTab: false, children: [] },
  { id: 'locations', title: 'Locations', href: '/pg-locations', openInNewTab: false, children: [] },
  { id: 'smart-finder', title: 'Smart Finder', href: '/smart-finder', openInNewTab: false, children: [] },
  { id: 'gallery', title: 'Gallery', href: '/gallery', openInNewTab: false, children: [] },
  { id: 'blog', title: 'Blog', href: '/blog', openInNewTab: false, children: [] },
  { id: 'contact', title: 'Contact', href: '/contact', openInNewTab: false, children: [] },
]

function buildTree(rows: Array<{ id: string; parentId: string | null }>, map: Map<string, MenuNode>) {
  const roots: MenuNode[] = []
  for (const r of rows) {
    const node = map.get(r.id)
    if (!node) continue
    if (r.parentId && map.has(r.parentId)) {
      map.get(r.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

export default async function Navbar() {
  let items: Prisma.MenuItemGetPayload<{ include: { page: { select: { slug: true } } } }>[] = []

  try {
    items = await prisma.menuItem.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        visibility: { in: ['HEADER', 'BOTH'] },
      },
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
      include: { page: { select: { slug: true } } },
    })
  } catch (err) {
    // Avoid taking down the whole page if the DB is temporarily unavailable.
    console.error('[Navbar] Failed to load menu items', err)
    return <NavbarClient headerMenu={FALLBACK_HEADER_MENU} />
  }

  if (!items.length) {
    return <NavbarClient headerMenu={FALLBACK_HEADER_MENU} />
  }

  const map = new Map<string, MenuNode>()
  for (const i of items) {
    const resolvedHref = i.type === 'PAGE' ? (i.page?.slug ? `/p/${i.page.slug}` : '') : (i.href ?? '')
    if (!resolvedHref) continue

    map.set(i.id, {
      id: i.id,
      title: i.title,
      href: resolvedHref,
      openInNewTab: i.openInNewTab,
      children: [],
    })
  }

  const headerMenu = buildTree(
    items.map((i) => ({ id: i.id, parentId: i.parentId })),
    map
  )

  return <NavbarClient headerMenu={headerMenu.length ? headerMenu : FALLBACK_HEADER_MENU} />
}
