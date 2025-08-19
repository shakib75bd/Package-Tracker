export interface TrackingEvent {
  id: string
  status: string
  description: string
  location: string
  timestamp: string
  isCompleted: boolean
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
  events: TrackingEvent[]
  lastUpdated: string
}

// Mock package database
const mockPackages: Record<string, PackageData> = {
  "1Z999AA1234567890": {
    trackingNumber: "1Z999AA1234567890",
    carrier: "UPS",
    status: "in-transit",
    estimatedDelivery: "Dec 28, 2024 by 8:00 PM",
    origin: "Los Angeles, CA",
    destination: "New York, NY",
    weight: "2.5 lbs",
    dimensions: "12 x 8 x 4 inches",
    service: "UPS Ground",
    progress: 75,
    lastUpdated: "2 hours ago",
    events: [
      {
        id: "1",
        status: "Order Processed",
        description: "Package information received",
        location: "Los Angeles, CA",
        timestamp: "Dec 24, 2024 at 2:30 PM",
        isCompleted: true,
      },
      {
        id: "2",
        status: "Picked Up",
        description: "Package picked up by carrier",
        location: "Los Angeles, CA",
        timestamp: "Dec 25, 2024 at 9:15 AM",
        isCompleted: true,
      },
      {
        id: "3",
        status: "In Transit",
        description: "Package is on the way to destination facility",
        location: "Phoenix, AZ",
        timestamp: "Dec 26, 2024 at 11:45 AM",
        isCompleted: true,
      },
      {
        id: "4",
        status: "Out for Delivery",
        description: "Package is out for delivery",
        location: "New York, NY",
        timestamp: "Dec 28, 2024 at 8:00 AM",
        isCompleted: false,
      },
      {
        id: "5",
        status: "Delivered",
        description: "Package delivered successfully",
        location: "New York, NY",
        timestamp: "Expected by 8:00 PM",
        isCompleted: false,
      },
    ],
  },
  "1Z888BB9876543210": {
    trackingNumber: "1Z888BB9876543210",
    carrier: "FedEx",
    status: "delivered",
    estimatedDelivery: "Dec 25, 2024",
    origin: "Chicago, IL",
    destination: "New York, NY",
    weight: "1.2 lbs",
    dimensions: "10 x 6 x 3 inches",
    service: "FedEx Express",
    progress: 100,
    lastUpdated: "3 days ago",
    events: [
      {
        id: "1",
        status: "Order Processed",
        description: "Package information received",
        location: "Chicago, IL",
        timestamp: "Dec 22, 2024 at 1:00 PM",
        isCompleted: true,
      },
      {
        id: "2",
        status: "Picked Up",
        description: "Package picked up by carrier",
        location: "Chicago, IL",
        timestamp: "Dec 23, 2024 at 10:30 AM",
        isCompleted: true,
      },
      {
        id: "3",
        status: "In Transit",
        description: "Package in transit to destination",
        location: "Indianapolis, IN",
        timestamp: "Dec 24, 2024 at 2:15 PM",
        isCompleted: true,
      },
      {
        id: "4",
        status: "Out for Delivery",
        description: "Package out for delivery",
        location: "New York, NY",
        timestamp: "Dec 25, 2024 at 9:00 AM",
        isCompleted: true,
      },
      {
        id: "5",
        status: "Delivered",
        description: "Package delivered successfully to front door",
        location: "New York, NY",
        timestamp: "Dec 25, 2024 at 2:45 PM",
        isCompleted: true,
      },
    ],
  },
  "1Z777CC5555555555": {
    trackingNumber: "1Z777CC5555555555",
    carrier: "USPS",
    status: "pending",
    estimatedDelivery: "Dec 30, 2024",
    origin: "Miami, FL",
    destination: "New York, NY",
    weight: "0.8 lbs",
    dimensions: "8 x 5 x 2 inches",
    service: "USPS Priority Mail",
    progress: 25,
    lastUpdated: "1 day ago",
    events: [
      {
        id: "1",
        status: "Order Processed",
        description: "Package information received",
        location: "Miami, FL",
        timestamp: "Dec 26, 2024 at 3:00 PM",
        isCompleted: true,
      },
      {
        id: "2",
        status: "Awaiting Pickup",
        description: "Package ready for pickup",
        location: "Miami, FL",
        timestamp: "Dec 27, 2024 at 8:00 AM",
        isCompleted: false,
      },
      {
        id: "3",
        status: "In Transit",
        description: "Package in transit",
        location: "Miami, FL",
        timestamp: "Expected Dec 28, 2024",
        isCompleted: false,
      },
      {
        id: "4",
        status: "Out for Delivery",
        description: "Package out for delivery",
        location: "New York, NY",
        timestamp: "Expected Dec 30, 2024",
        isCompleted: false,
      },
      {
        id: "5",
        status: "Delivered",
        description: "Package delivered",
        location: "New York, NY",
        timestamp: "Expected Dec 30, 2024",
        isCompleted: false,
      },
    ],
  },
  "1Z666DD4444444444": {
    trackingNumber: "1Z666DD4444444444",
    carrier: "DHL",
    status: "exception",
    estimatedDelivery: "Delayed - TBD",
    origin: "Seattle, WA",
    destination: "New York, NY",
    weight: "3.1 lbs",
    dimensions: "14 x 10 x 6 inches",
    service: "DHL Express",
    progress: 60,
    lastUpdated: "5 hours ago",
    events: [
      {
        id: "1",
        status: "Order Processed",
        description: "Package information received",
        location: "Seattle, WA",
        timestamp: "Dec 23, 2024 at 11:00 AM",
        isCompleted: true,
      },
      {
        id: "2",
        status: "Picked Up",
        description: "Package picked up by carrier",
        location: "Seattle, WA",
        timestamp: "Dec 24, 2024 at 2:00 PM",
        isCompleted: true,
      },
      {
        id: "3",
        status: "In Transit",
        description: "Package in transit",
        location: "Denver, CO",
        timestamp: "Dec 25, 2024 at 6:30 PM",
        isCompleted: true,
      },
      {
        id: "4",
        status: "Exception",
        description: "Weather delay - package held at facility",
        location: "Denver, CO",
        timestamp: "Dec 27, 2024 at 10:00 AM",
        isCompleted: true,
      },
      {
        id: "5",
        status: "Delivered",
        description: "Package delivered",
        location: "New York, NY",
        timestamp: "TBD",
        isCompleted: false,
      },
    ],
  },
}

export class PackageTrackingService {
  // Simulate API delay
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Track a package by tracking number
  async trackPackage(trackingNumber: string): Promise<PackageData | null> {
    // Simulate API call delay
    await this.delay(800 + Math.random() * 1200)

    const cleanTrackingNumber = trackingNumber.trim().toUpperCase()

    // Check if package exists in our mock database
    const packageData = mockPackages[cleanTrackingNumber]

    if (!packageData) {
      // Return null for not found packages
      return null
    }

    // Simulate occasional API errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error("Tracking service temporarily unavailable. Please try again.")
    }

    return { ...packageData }
  }

  // Get all packages for a user (mock user packages)
  async getUserPackages(): Promise<PackageData[]> {
    await this.delay(500)
    return Object.values(mockPackages)
  }

  // Validate tracking number format
  validateTrackingNumber(trackingNumber: string): { isValid: boolean; carrier?: string; error?: string } {
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
