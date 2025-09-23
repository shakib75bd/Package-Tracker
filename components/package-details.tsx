"use client"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ArrowLeft,
  Copy,
  Share2,
  RefreshCw,
  MapPin,
} from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { type PackageData } from "@/lib/package-service"
import { motion } from "framer-motion"

const stationOrder = [
  "ELENGA",
  "SIRAJGONJ",
  "SHERPUR",
  "BOGURA",
  "POLASHBARI",
  "RANGPUR_HUB",
]
function getProgressIndex(station: string | undefined) {
  if (!station) return -1
  return stationOrder.indexOf(station)
}

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
    if (trackingNumber) fetchPackage(trackingNumber)
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

  const progressIndex = getProgressIndex(currentPackageData.station)

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
              <h1 className="text-lg font-semibold">Package Details</h1>
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

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Package Summary Card */}
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Tracking #{currentPackageData.trackingNumber}
              </CardTitle>
              <CardDescription>
                Current Status:{" "}
                <Badge variant="outline">{currentPackageData.status}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Sender</p>
                  <p className="font-medium">
                    {currentPackageData.sender ?? "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">Receiver</p>
                  <p className="font-medium">
                    {currentPackageData.receiver ?? "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">
                    {currentPackageData.destination ?? "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">Station</p>
                  <p className="font-medium">
                    {currentPackageData.station ?? "-"}
                  </p>
                </div>
                <div>
                  {currentPackageData.coordinates?.lat &&
                    currentPackageData.coordinates?.lng && (
                      <iframe
                        title="Google Map Preview"
                        width="100%"
                        height="200"
                        className="rounded-xl"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={`https://www.google.com/maps?q=${currentPackageData.coordinates.lat},${currentPackageData.coordinates.lng}&hl=es;z=14&output=embed`}
                      />
                    )}
                </div>
              </div>

              {/* Modern Timeline */}
              <div className="space-y-4">
                <h3 className="text-sm text-muted-foreground">
                  Delivery Timeline
                </h3>
                <div className="flex items-center justify-between relative">
                  {stationOrder.map((station, i) => {
                    const reached = i <= progressIndex
                    return (
                      <div
                        key={station}
                        className="flex-1 flex flex-col items-center"
                      >
                        <motion.div
                          initial={false}
                          animate={{
                            backgroundColor: reached
                              ? "hsl(var(--primary))"
                              : "hsl(var(--muted))",
                            scale: reached ? 1.1 : 1,
                          }}
                          className="w-4 h-4 rounded-full"
                        />
                        <p
                          className={`mt-2 text-xs ${
                            reached
                              ? "text-primary font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {station}
                        </p>
                      </div>
                    )
                  })}
                  {/* Line behind dots */}
                  <div className="absolute top-2 left-0 w-full h-0.5 bg-muted -z-10" />
                  <div
                    className="absolute top-2 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
                    style={{
                      width: `${
                        ((progressIndex + 1) / stationOrder.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
