# RBAC Implementation Summary

## Prisma Schema
- Roles: [prisma/schema.prisma](../prisma/schema.prisma#L909-L918)
- PG assignments: [prisma/schema.prisma](../prisma/schema.prisma#L33-L110)

## Centralized RBAC
- Permission map + role matrix: [src/lib/rbac.ts](../src/lib/rbac.ts)
- API auth + permission enforcement: [src/middleware/auth.ts](../src/middleware/auth.ts) and [src/middleware/permissions.ts](../src/middleware/permissions.ts)
- Admin UI guards: [src/lib/admin/guard.ts](../src/lib/admin/guard.ts)

## CRUD APIs (examples)
- PG list/create with manager scoping + admin delete constraints: [src/app/api/admin/pgs/route.ts](../src/app/api/admin/pgs/route.ts)
- PG detail/update/delete with assignment checks: [src/app/api/admin/pgs/[id]/route.ts](../src/app/api/admin/pgs/%5Bid%5D/route.ts)
- Enquiries (role filtered): [src/app/api/admin/enquiries/route.ts](../src/app/api/admin/enquiries/route.ts)
- Blogs (publish guarded): [src/app/api/admin/blog/posts/route.ts](../src/app/api/admin/blog/posts/route.ts)
- Gallery (manager scoping on assigned PGs): [src/app/api/gallery/route.ts](../src/app/api/gallery/route.ts) and [src/app/api/gallery/[id]/route.ts](../src/app/api/gallery/%5Bid%5D/route.ts)

## Frontend Role-Based UI
- Sidebar gating: [src/components/admin/AdminShell.tsx](../src/components/admin/AdminShell.tsx)
- PG create/edit gating: [src/app/admin/(app)/pgs/new/page.tsx](../src/app/admin/(app)/pgs/new/page.tsx) and [src/app/admin/(app)/pgs/[id]/page.tsx](../src/app/admin/(app)/pgs/%5Bid%5D/page.tsx)
- Blog create/edit gating: [src/app/admin/(app)/blog/posts/new/page.tsx](../src/app/admin/(app)/blog/posts/new/page.tsx) and [src/app/admin/(app)/blog/posts/[id]/page.tsx](../src/app/admin/(app)/blog/posts/%5Bid%5D/page.tsx)
- Locations read/write gating: [src/app/admin/(app)/locations/page.tsx](../src/app/admin/(app)/locations/page.tsx) and [src/app/admin/(app)/locations/[id]/page.tsx](../src/app/admin/(app)/locations/%5Bid%5D/page.tsx)

## Enforcement Notes
- All protected APIs call `requirePermission()` or `requireAnyPermission()` and return 401/403 on failure.
- Manager access to PG data is limited by assignments (PG ↔ manager).
- Admin PG delete is restricted to PGs they created.
- Viewer role is read-only: UI hides mutation actions and APIs reject writes.

## Verification
Use the role checklist in [docs/rbac-verification.md](rbac-verification.md).
