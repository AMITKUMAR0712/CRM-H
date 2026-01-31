# RBAC Verification Checklist

Use this checklist to validate role behavior in the production-like environment.

## Test Accounts
- SUPER_ADMIN
- ADMIN
- MANAGER (must be assigned to at least one PG)
- VIEWER

## PG Management
- SUPER_ADMIN: list, create, edit, approve/block, delete any PG.
- ADMIN: list, create, edit, approve/block (if allowed by permission), delete only own PGs.
- MANAGER: list only assigned PGs, create PG, edit assigned PGs, no delete.
- VIEWER: list only (no create/edit/delete buttons).

## Enquiry Management
- SUPER_ADMIN/ADMIN: list all enquiries, assign, update status, close.
- MANAGER: list only assigned enquiries, update status, close; no assign.
- VIEWER: read-only list.

## Blog Management
- SUPER_ADMIN/ADMIN: CRUD (publish allowed by permission).
- MANAGER/VIEWER: read-only or no access.

## Gallery Upload
- SUPER_ADMIN/ADMIN: upload/update/delete any gallery image.
- MANAGER: upload/update only for assigned PGs; no delete.
- VIEWER: read-only.

## Smart Finder (Categories/Locations)
- SUPER_ADMIN: full CRUD.
- ADMIN: read-only or limited based on permissions.
- MANAGER/VIEWER: read-only.

## User Management
- SUPER_ADMIN only.
- ADMIN/MANAGER/VIEWER: no user management access.

## Data Security
- MANAGER must never access PGs or gallery items outside assignments.
- ADMIN delete should fail for PGs not created by them.
- VIEWER must never mutate data (API returns 403).
