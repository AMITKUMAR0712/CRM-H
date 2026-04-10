import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = 'src/app/api/admin'
const GUARD_REGEX = /requirePermission|requireAnyPermission|requireRole/

function listRoutes(dir: string): string[] {
  const entries = readdirSync(dir)
  const results: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry)
    const stats = statSync(full)
    if (stats.isDirectory()) {
      results.push(...listRoutes(full))
    } else if (entry === 'route.ts') {
      results.push(full)
    }
  }
  return results
}

function auditGuards() {
  const routes = listRoutes(ROOT)
  const missing = routes.filter((file) => {
    const content = readFileSync(file, 'utf8')
    return !GUARD_REGEX.test(content)
  })

  if (!missing.length) {
    console.log('✅ All admin API routes include RBAC guards')
  } else {
    console.log('❌ Admin API routes missing RBAC guards:')
    missing.forEach((m) => console.log(`- ${m}`))
  }
}

function auditRolePermissions() {
  const rbacPath = 'src/lib/rbac.ts'
  const content = readFileSync(rbacPath, 'utf8')

  const roleBlocks: Record<string, string> = {}
  const roleNames = ['viewerPermissions', 'managerPermissions', 'adminPermissions', 'superAdminPermissions']

  for (const name of roleNames) {
    const match = content.match(new RegExp(`const ${name}: [^=]*= \\[(\\s|\\S)*?\\]`, 'm'))
    if (match) roleBlocks[name] = match[0]
  }

  const forbid: Record<string, string[]> = {
    viewerPermissions: ['PG_WRITE', 'PG_DELETE', 'ENQUIRY_WRITE', 'ENQUIRY_ASSIGN', 'ENQUIRY_CLOSE', 'BLOG_WRITE', 'BLOG_DELETE', 'MEDIA_WRITE', 'MEDIA_DELETE', 'SECTOR_WRITE', 'SECTOR_DELETE', 'SMART_CATEGORY_WRITE', 'SMART_CATEGORY_DELETE', 'USER_READ', 'USER_WRITE', 'USER_DELETE', 'USERS_BLOCK', 'LOGS_READ'],
    managerPermissions: ['PG_DELETE', 'BLOG_WRITE', 'BLOG_DELETE', 'MEDIA_DELETE', 'SECTOR_WRITE', 'SECTOR_DELETE', 'SMART_CATEGORY_WRITE', 'SMART_CATEGORY_DELETE', 'USER_READ', 'USER_WRITE', 'USER_DELETE', 'USERS_BLOCK', 'LOGS_READ'],
    adminPermissions: ['USER_READ', 'USER_WRITE', 'USER_DELETE', 'USERS_BLOCK', 'MENU_READ', 'MENU_WRITE', 'MENU_DELETE', 'PAGE_READ', 'PAGE_WRITE', 'PAGE_DELETE', 'SETTINGS_READ', 'SETTINGS_WRITE', 'LOGS_READ', 'SECTOR_WRITE', 'SECTOR_DELETE', 'SMART_CATEGORY_WRITE', 'SMART_CATEGORY_DELETE'],
  }

  let hasFailures = false
  for (const [role, forbidden] of Object.entries(forbid)) {
    const block = roleBlocks[role] ?? ''
    const violations = forbidden.filter((p) => block.includes(`PERMISSIONS.${p}`))
    if (violations.length) {
      hasFailures = true
      console.log(`❌ ${role} contains forbidden permissions: ${violations.join(', ')}`)
    } else {
      console.log(`✅ ${role} permission scope OK`)
    }
  }

  if (!hasFailures) {
    console.log('✅ Role permission audit passed')
  }
}

auditGuards()
auditRolePermissions()
