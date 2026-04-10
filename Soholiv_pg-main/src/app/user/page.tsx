import Link from 'next/link'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function UserDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Manage your enquiries, tickets, and chats.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium">Support Tickets</div>
              <div className="text-sm text-muted mt-1">Create and track support requests.</div>
            </div>
            <Button asChild>
              <Link href="/user/tickets">Open</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium">My Enquiries</div>
              <div className="text-sm text-muted mt-1">Track your enquiry status and responses.</div>
            </div>
            <Button asChild>
              <Link href="/user/enquiries">Open</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium">Chat</div>
              <div className="text-sm text-muted mt-1">Message support directly.</div>
            </div>
            <Button asChild>
              <Link href="/user/chats">Open</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
