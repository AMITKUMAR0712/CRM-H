import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { apiRateLimiter } from '@/middleware/rateLimit'

type MenuNode = {
  id: string
  title: string
  type: 'PAGE' | 'URL'
  href: string
  openInNewTab: boolean
  visibility: 'HEADER' | 'FOOTER' | 'BOTH'
  order: number
  children: MenuNode[]
}

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

export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = apiRateLimiter(req)
    if (rateLimitResult) return rateLimitResult

    const { searchParams } = new URL(req.url)
    const visibility = (searchParams.get('visibility') || 'HEADER') as 'HEADER' | 'FOOTER' | 'BOTH'

    const allowedVisibilities =
      visibility === 'BOTH' ? (['HEADER', 'FOOTER', 'BOTH'] as const) : ([visibility, 'BOTH'] as const)

    const items = await prisma.menuItem.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        visibility: { in: allowedVisibilities as unknown as ('HEADER' | 'FOOTER' | 'BOTH')[] },
      },
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
      include: { page: { select: { slug: true } } },
    })

    const map = new Map<string, MenuNode>()
    for (const i of items) {
      const resolvedHref = i.type === 'PAGE' ? `/p/${i.page?.slug ?? ''}` : (i.href ?? '')

      map.set(i.id, {
        id: i.id,
        title: i.title,
        type: i.type,
        href: resolvedHref || '#',
        openInNewTab: i.openInNewTab,
        visibility: i.visibility,
        order: i.order,
        children: [],
      })
    }

    const roots = buildTree(
      items.map((i) => ({ id: i.id, parentId: i.parentId })),
      map
    )

    return NextResponse.json(success(roots))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}
