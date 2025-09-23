import { useEffect, useRef } from "react"
import { createClient, Client } from "graphql-ws"
import { useNotificationsStore } from "./use-notifications-store"

type PackageUpdatePayload = {
  id: string
  status: string
  station: string
  coordinates: { lat: number; lng: number }
  history: Array<{ status: string; date: string }>
}

export function usePackageSubscription() {
  const addNotification = useNotificationsStore((s) => s.addNotification)
  const wsRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!wsRef.current) {
      wsRef.current = createClient({ url: "ws://localhost:8000/graphql" })
    }
    const ws = wsRef.current
    let active = true
    const dispose = ws.subscribe(
      {
        query: `subscription { packageUpdated { id status station coordinates { lat lng } history { status date } } }`,
      },
      {
        next: (data) => {
          if (!active) return
          console.log("[Subscription] Data received (global):", data)
          const payload = data.data?.packageUpdated as PackageUpdatePayload | undefined
          if (payload) {
            addNotification({
              ...payload,
              receivedAt: Date.now(),
            })
            console.log("[Notification] Added (global):", payload)
          }
        },
        error: (err) => {
          console.error("[Subscription] Error (global):", err)
        },
        complete: () => {
          console.log("[Subscription] Complete (global)")
        },
      }
    )
    return () => {
      active = false
      dispose()
    }
  }, [addNotification])
}
