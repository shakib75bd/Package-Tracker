export interface TrackingEvent {
  id: string
  status: string
  description: string
  location: string
  timestamp: string
  isCompleted: boolean
}
type HistoryRecord = {
  status: string
  date: string
}

export interface PackageData {
  trackingNumber: string
  carrier: string
  status: "in-transit" | "delivered" | "pending" | "exception" | "not-found"
  estimatedDelivery: string
  origin: string
  destination: string
  weight: string
  dimensions: string
  service: string
  progress: number
  history: HistoryRecord[]
  events: TrackingEvent[]
  lastUpdated: string
  sender?: string
  receiver?: string
  station?: string
  ownerId?: string
  createdAt?: string
  updatedAt?: string
  coordinates?: { lat: number; lng: number }
}


export class PackageTrackingService {
  // Simulate API delay
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Fetch package by tracking number from GraphQL API
  async fetchPackageByTrackingNumber(
    trackingNumber: string
  ): Promise<PackageData | null> {
    const cleanTrackingNumber = trackingNumber.trim()
    const query = `
      query GetPackage($trackingNumber: String!) {
        package(trackingNumber: $trackingNumber) {
          trackingNumber
          carrier
          status
          estimatedDelivery
          origin
          destination
          weight
          dimensions
          service
          progress
          lastUpdated
          sender
          receiver
          station
          ownerId
          createdAt
          updatedAt
          coordinates { lat lng }
          events {
            id
            status
            description
            location
            timestamp
            isCompleted
          }
        }
      }
    `
    console.log(
      "Fetching package data for tracking number:",
      cleanTrackingNumber
    )
    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { trackingNumber: cleanTrackingNumber },
      }),
    })
    const result = await response.json()
    console.log("GraphQL response:", result)
    if (result.data && result.data.package) {
      return result.data.package
    }
    return null
  }

  // Validate tracking number format
  validateTrackingNumber(trackingNumber: string): {
    isValid: boolean
    carrier?: string
    error?: string
  } {
    const cleanNumber = trackingNumber.trim()

    if (!cleanNumber) {
      return { isValid: false, error: "Tracking number is required" }
    }

    if (cleanNumber.length < 8) {
      return { isValid: false, error: "Tracking number is too short" }
    }

    if (cleanNumber.length > 35) {
      return { isValid: false, error: "Tracking number is too long" }
    }

    // Basic format validation for different carriers
    if (/^1Z[0-9A-Z]{16}$/.test(cleanNumber)) {
      return { isValid: true, carrier: "UPS" }
    }

    if (/^[0-9]{12,14}$/.test(cleanNumber)) {
      return { isValid: true, carrier: "FedEx" }
    }

    if (/^[0-9]{20,22}$/.test(cleanNumber)) {
      return { isValid: true, carrier: "USPS" }
    }

    if (/^[0-9]{10,11}$/.test(cleanNumber)) {
      return { isValid: true, carrier: "DHL" }
    }

    // If no specific format matches, still allow it (generic format)
    return { isValid: true, carrier: "Unknown" }
  }

  // Get status color for UI
  getStatusColor(status: string): string {
    switch (status) {
      case "delivered":
        return "bg-primary text-primary-foreground"
      case "in-transit":
        return "bg-secondary text-secondary-foreground"
      case "pending":
        return "bg-muted text-muted-foreground"
      case "exception":
        return "bg-destructive text-destructive-foreground"
      case "not-found":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Get status display text
  getStatusText(status: string): string {
    switch (status) {
      case "in-transit":
        return "IN TRANSIT"
      case "not-found":
        return "NOT FOUND"
      default:
        return status.replace("-", " ").toUpperCase()
    }
  }
}

// Export singleton instance
export const packageService = new PackageTrackingService()
