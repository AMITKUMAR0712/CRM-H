export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg text-center space-y-2">
        <h1 className="text-2xl font-semibold">Access forbidden</h1>
        <p className="text-[var(--color-muted)]">
          Your account does not have permission to access the admin panel.
        </p>
      </div>
    </div>
  )
}
