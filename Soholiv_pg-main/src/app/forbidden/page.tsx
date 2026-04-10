export default function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full border border-[var(--color-border)] rounded-lg bg-white p-6">
        <h1 className="text-lg font-semibold">Access forbidden</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          You don&apos;t have permission to access this page.
        </p>
      </div>
    </div>
  )
}
