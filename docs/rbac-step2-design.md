# RBAC + User Permissions — Step 2 Design (Implementation Spec)

Status: **Implemented** (defaults applied)

## 0) Decisions Applied

### Admin API structure
Applied: **A + B (hybrid)**
- `/api/admin/*` remains the canonical admin panel surface (permission + scoping).
- Legacy non-admin endpoints that perform admin-ish mutations were retrofitted to `requirePermission(...)` so RBAC is consistent.

### Restricted user submission policy
Applied: **2a (strict)**
- If a user is logged in and restricted/inactive, public POST endpoints reject the request.
- Anonymous users are still allowed to submit public forms (no user identity exists to restrict).

### Role matrix
Applied safe defaults:
- **VIEWER:** read-only.
- **MANAGER:** ops modules only (leads/enquiries/tickets/chats), enforced server-side as assigned-only.
- **ADMIN/SUPER_ADMIN:** full access.

---

## 1) Current Enforcement Building Blocks

- Auth + restriction checks: `requireAuth()` in [src/middleware/auth.ts](../src/middleware/auth.ts)
- Permission checks: `requirePermission(permission)` in [src/middleware/permissions.ts](../src/middleware/permissions.ts)
- Permission catalog + role mapping: [src/lib/rbac.ts](../src/lib/rbac.ts)
- Coarse route-gating: [src/middleware.ts](../src/middleware.ts) (role-based; does not check restrictions)
 - Optional auth (restriction-aware without requiring login): `requireOptionalAuth()` in [src/middleware/auth.ts](../src/middleware/auth.ts)

---

## 2) Target Enforcement Pattern (API)

Every protected endpoint should follow this order:
1) Authenticate (session/JWT)
2) Enforce restrictions (blocked/suspended)
3) Enforce role/module permission
4) Enforce scoping rules (ownership/assigned-only)

Notes:
- `requirePermission(...)` already calls `requireAuth()` (restriction-aware).
- Scoping rules are *in addition* to permissions.

---

## 3) Module Rules (Desired)

### User panel (ownership)
- Tickets: only `Ticket.userId == session.user.id`
- Chats: only `ChatThread.userId == session.user.id`

### Admin panel (permission + scope)
Scope rules depend on role matrix; a safe default spec is:
- **VIEWER:** read-only, no mutations.
- **MANAGER:** read/update only records assigned to them.
- **ADMIN/SUPER_ADMIN:** full module scope.

> If the strict matrix differs, it overrides these defaults.

---

## 4) Concrete Endpoints to Retrofit (Known Gaps)

### A) Admin-ish endpoints using `requireAdmin()` instead of permissions
Status: **fixed** (permission-based enforcement)
- Leads (admin GET + export + stats):
  - [src/app/api/leads/route.ts](../src/app/api/leads/route.ts)
  - [src/app/api/leads/[id]/route.ts](../src/app/api/leads/%5Bid%5D/route.ts)
  - [src/app/api/leads/export/route.ts](../src/app/api/leads/export/route.ts)
  - [src/app/api/leads/stats/route.ts](../src/app/api/leads/stats/route.ts)
- Settings admin:
  - [src/app/api/settings/route.ts](../src/app/api/settings/route.ts)
- Sectors/Photos/Gallery/FAQs/Amenities admin mutations:
  - [src/app/api/sectors/route.ts](../src/app/api/sectors/route.ts)
  - [src/app/api/sectors/[slug]/route.ts](../src/app/api/sectors/%5Bslug%5D/route.ts)
  - [src/app/api/photos/route.ts](../src/app/api/photos/route.ts)
  - [src/app/api/gallery/route.ts](../src/app/api/gallery/route.ts)
  - [src/app/api/faqs/route.ts](../src/app/api/faqs/route.ts)
  - [src/app/api/amenities/route.ts](../src/app/api/amenities/route.ts)
- Blog categories/tags/posts admin mutations:
  - [src/app/api/blog/categories/route.ts](../src/app/api/blog/categories/route.ts)
  - [src/app/api/blog/tags/route.ts](../src/app/api/blog/tags/route.ts)
  - [src/app/api/blog/posts/route.ts](../src/app/api/blog/posts/route.ts)
  - [src/app/api/blog/posts/[slug]/route.ts](../src/app/api/blog/posts/%5Bslug%5D/route.ts)

### B) Restricted-user submission loopholes (public POST)
These do not call `requireAuth()`, so restrictions are not enforced:
- Enquiry submit: [src/app/api/enquiries/route.ts](../src/app/api/enquiries/route.ts)
- Lead submit/contact: [src/app/api/leads/route.ts](../src/app/api/leads/route.ts), [src/app/api/contact/route.ts](../src/app/api/contact/route.ts)
- Review submit: [src/app/api/reviews/route.ts](../src/app/api/reviews/route.ts)
- Banner event: [src/app/api/banners/events/route.ts](../src/app/api/banners/events/route.ts)

Status: **fixed** via `requireOptionalAuth()` on public POST endpoints.

### C) Manager assigned-only missing on admin read endpoints
Admin list endpoints support filtering by `assignedToId`, but do not scope results to the caller role/id:
- Leads list: [src/app/api/admin/leads/route.ts](../src/app/api/admin/leads/route.ts)
- Enquiries list: [src/app/api/admin/enquiries/route.ts](../src/app/api/admin/enquiries/route.ts)
- Tickets list: [src/app/api/admin/tickets/route.ts](../src/app/api/admin/tickets/route.ts)
- Chats list: [src/app/api/admin/chats/route.ts](../src/app/api/admin/chats/route.ts)
Status: **fixed** (MANAGER is scoped to assigned records; detail/message routes enforce the same).

---

## 5) Non-security correctness issue
- Public menu PAGE links currently resolve to `/${slug}`; site pages use `/p/[slug]`.
  - Menu API: [src/app/api/menus/route.ts](../src/app/api/menus/route.ts)

Status: **fixed** (PAGE links now resolve to `/p/${slug}`).

---

## 6) Next Step

- If you have an authoritative strict role matrix, we can replace the safe defaults in [src/lib/rbac.ts](../src/lib/rbac.ts) to match it exactly.
