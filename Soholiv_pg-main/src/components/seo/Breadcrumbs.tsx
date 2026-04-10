/**
 * Breadcrumbs Component
 * SEO-friendly breadcrumb navigation with JSON-LD schema
 */

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import JsonLd from './JsonLd'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'

export interface BreadcrumbItem {
    name: string
    url: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
    className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    // Always include Home as the first item
    const allItems: BreadcrumbItem[] = [
        { name: 'Home', url: '/' },
        ...items,
    ]

    const schema = generateBreadcrumbSchema(allItems)

    return (
        <>
            <JsonLd data={schema} />
            <nav
                aria-label="Breadcrumb"
                className={`flex items-center gap-2 text-sm text-muted ${className}`}
            >
                {allItems.map((item, index) => {
                    const isLast = index === allItems.length - 1

                    return (
                        <div key={item.url} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
                            {index === 0 ? (
                                <Link
                                    href={item.url}
                                    className="flex items-center gap-1 hover:text-(--color-clay) transition-colors"
                                    aria-label="Home"
                                >
                                    <Home className="h-4 w-4" />
                                    <span className="sr-only">{item.name}</span>
                                </Link>
                            ) : isLast ? (
                                <span className="text-(--color-graphite) font-medium" aria-current="page">
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    href={item.url}
                                    className="hover:text-(--color-clay) transition-colors"
                                >
                                    {item.name}
                                </Link>
                            )}
                        </div>
                    )
                })}
            </nav>
        </>
    )
}
