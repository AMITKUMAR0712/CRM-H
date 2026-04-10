import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const pages = [
  'src/app/admin/(app)/pgs/page.tsx',
  'src/app/admin/(app)/pgs/new/page.tsx',
  'src/app/admin/(app)/pgs/[id]/page.tsx',
  'src/app/admin/(app)/enquiries/page.tsx',
  'src/app/admin/(app)/blog/posts/page.tsx',
  'src/app/admin/(app)/blog/posts/new/page.tsx',
  'src/app/admin/(app)/blog/posts/[id]/page.tsx',
  'src/app/admin/(app)/gallery/page.tsx',
  'src/app/admin/(app)/locations/page.tsx',
  'src/app/admin/(app)/locations/new/page.tsx',
  'src/app/admin/(app)/locations/[id]/page.tsx',
  'src/app/admin/(app)/smart-finder/categories/page.tsx',
  'src/app/admin/(app)/users/page.tsx',
]

const checks = [
  { label: 'hasPermission()', regex: /hasPermission\(/ },
  { label: 'canWrite', regex: /canWrite/ },
  { label: 'canDelete', regex: /canDelete/ },
  { label: 'read-only text', regex: /Read only|read only/i },
]

function audit() {
  let failed = false
  for (const file of pages) {
    const full = join(process.cwd(), file)
    const content = readFileSync(full, 'utf8')
    const results = checks.map((c) => `${c.label}:${c.regex.test(content) ? '✓' : '✗'}`).join('  ')
    console.log(`${file}  ${results}`)
    if (!checks.some((c) => c.regex.test(content))) failed = true
  }

  if (failed) {
    console.log('❌ Some pages may lack explicit RBAC UI gating')
  } else {
    console.log('✅ All audited pages contain RBAC gating hints')
  }
}

audit()
