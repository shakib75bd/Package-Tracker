"use client"

import { useNotificationsStore } from '@/hooks/use-notifications-store'
import { Bell } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export function NotificationDropdown() {
  const notifications = useNotificationsStore((s) => s.notifications)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto p-0">
        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id + n.receivedAt} className="p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{n.status}</Badge>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(n.receivedAt).toLocaleTimeString()}</span>
                </div>
                <div className="text-sm font-medium">Package {n.id} updated</div>
                <div className="text-xs text-gray-500">Station: {n.station}</div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
