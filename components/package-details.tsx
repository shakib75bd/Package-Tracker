"use client"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, ArrowLeft, Copy, Share2, RefreshCw, Check } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { type PackageData } from "@/lib/package-service"
import { Timeline, TimelineItem } from "./ui/timeline"

// Define the timeline statuses in order using your enum
const timelineStatuses = [
  { key: "PENDING", label: "Order Placed", description: "Package has been created and is awaiting processing" },
  { key: "CONFIRMED", label: "Confirmed", description: "Package has been confirmed and is ready for processing" },
  { key: "PROCESSING", label: "Processing", description: "Package is being processed and prepared for shipment" },
  { key: "SHIPPED", label: "Shipped", description: "Package has been shipped and is in transit" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", description: "Package is out for final delivery" },
  { key: "DELIVERED", label: "Delivered", description: "Package has been successfully delivered" }
]

interface PackageDetailsProps {
  trackingNumber: string
  onBack?: () => void
}

export default function PackageDetails({
  trackingNumber,
  onBack,
}: PackageDetailsProps) {
  const { getToken } = useAuth()
  const [currentPackageData, setCurrentPackageData] =
    useState<PackageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    async function fetchPackage(trackingNumber: string) {
      setIsLoading(true)
      setError(null)
      try {
        const endpoint = "http://localhost:8000/graphql"
        const token = await getToken()
        const query = `
          query GetPackageByTrackingNumber($trackingNumber: String!) {
            getPackageByTrackingNumber(trackingNumber: $trackingNumber) {
              id
              trackingNumber
              sender
              receiver
              destination
              history { status date }
              status
              station
              coordinates { lat lng }
            }
          }
        `
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ query, variables: { trackingNumber } }),
        })
        const json = await res.json()
        if (!res.ok || json.errors) throw new Error("Failed to fetch package")
        setCurrentPackageData(json.data.getPackageByTrackingNumber ?? null)
      } catch (err: any) {
        setError(err.message || "Failed to fetch package data")
        setCurrentPackageData(null)
      } finally {
        setIsLoading(false)
      }
    }
    if (trackingNumber) {
      fetchPackage(trackingNumber)
      console.log("Fetching package details for:", trackingNumber)
      console.log("Fetching package details for:", currentPackageData)
    }
  }, [trackingNumber, getToken])

  const handleRefresh = async () => {
    if (!trackingNumber) return
    setIsRefreshing(true)
    setError(null)
    try {
      const endpoint = "http://localhost:8000/graphql"
      const token = await getToken()
      const query = `
        query GetPackageByTrackingNumber($trackingNumber: String!) {
          getPackageByTrackingNumber(trackingNumber: $trackingNumber) {
            id
            trackingNumber
            sender
            receiver
            destination
            history { status date }
            status
            station
            coordinates { lat lng }
          }
        }
      `
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables: { trackingNumber } }),
      })
      const json = await res.json()
      if (!res.ok || json.errors) throw new Error("Failed to fetch package")
      setCurrentPackageData(json.data.getPackageByTrackingNumber ?? null)
    } catch (err: any) {
      setError(err.message || "Failed to fetch package data")
      setCurrentPackageData(null)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading package details...
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    )
  }
  if (!currentPackageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No package data found.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold">Tracking Details</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigator.clipboard.writeText(currentPackageData.trackingNumber)
              }
            >
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigator.share &&
                navigator.share({
                  title: "Package Tracking",
                  text: `Track package ${currentPackageData.trackingNumber}`,
                  url: window.location.href,
                })
              }
            >
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Package Details Card */}
        <div className="bg-card rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2">
                <span className="font-semibold">Tracking #:</span>
                <span className="ml-2">
                  {currentPackageData.trackingNumber}
                </span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Sender:</span>
                <span className="ml-2">{currentPackageData.sender}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Receiver:</span>
                <span className="ml-2">{currentPackageData.receiver}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Destination:</span>
                <span className="ml-2">{currentPackageData.destination}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Current Station:</span>
                <span className="ml-2">{currentPackageData.station}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Status:</span>
                <Badge className="ml-2" variant="outline">
                  {currentPackageData.status}
                </Badge>
              </div>
            </div>
            {/* Google Maps Preview for Coordinates */}
            <div>
              {currentPackageData.coordinates &&
                typeof currentPackageData.coordinates.lat === "number" &&
                typeof currentPackageData.coordinates.lng === "number" && (
                  <div className="rounded-lg overflow-hidden border border-muted">
                    <iframe
                      title="Google Maps Preview"
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${currentPackageData.coordinates.lat},${currentPackageData.coordinates.lng}&z=15&output=embed`}
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      Lat: {currentPackageData.coordinates.lat}, Lng:{" "}
                      {currentPackageData.coordinates.lng}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        <Timeline size={"sm"} className="-translate-x-5 flex items-center justify-center">
          {timelineStatuses.map((timelineStatus, index) => {
            // Find the current status index
            const currentStatusIndex = timelineStatuses.findIndex(
              status => status.key === currentPackageData.status
            )

            // Determine if this timeline item should be completed
            const isCompleted = index <= currentStatusIndex
            const isCurrent = index === currentStatusIndex

            // Get the actual date from history if available
            const historyItem = currentPackageData.history?.find(
              h => h.status === timelineStatus.key
            )

            // Format date to show just the date part
            const formatDate = (dateString: string) => {
              const date = new Date(dateString)
              return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            }

            const displayDate = historyItem?.date
              ? formatDate(historyItem.date)
              : isCurrent
                ? formatDate(new Date().toISOString())
                : ""

            return (
              <TimelineItem
                color="secondary"
                key={timelineStatus.key}
                date={displayDate}
                title={timelineStatus.label}
                description={timelineStatus.description}
                icon={isCompleted ? <Check /> : undefined}
              />
            )
          })}
        </Timeline>
      </main>
    </div>
  )
}
