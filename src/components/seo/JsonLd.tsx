/**
 * JsonLd Component
 * Reusable component for rendering JSON-LD structured data
 */

interface JsonLdProps {
    data: Record<string, any> | Record<string, any>[]
}

export default function JsonLd({ data }: JsonLdProps) {
    const jsonData = Array.isArray(data) ? data : [data]

    return (
        <>
            {jsonData.map((schema, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schema, null, 0),
                    }}
                />
            ))}
        </>
    )
}
