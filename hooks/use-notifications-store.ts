import { create } from 'zustand'

export type PackageNotification = {
  id: string
  status: string
  station: string
  coordinates: { lat: number; lng: number }
  history: Array<{ status: string; date: string }>
  receivedAt: number
}

type NotificationStore = {
  notifications: PackageNotification[]
  addNotification: (n: PackageNotification) => void
  clearNotifications: () => void
}

export const useNotificationsStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (n: PackageNotification) => set((state) => ({ notifications: [n, ...state.notifications].slice(0, 20) })),
  clearNotifications: () => set({ notifications: [] }),
}))
