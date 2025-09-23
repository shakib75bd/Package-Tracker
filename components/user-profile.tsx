"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import PackageDetails from "@/components/package-details" // Import the component
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  User,
  Package,
  Settings,
  Bell,
  MapPin,
  Clock,
  Trash2,
  Eye,
  Plus,
  Search,
  RefreshCw,
  ArrowLeft,
  Mail,
  Smartphone,
  Monitor,
  Download,
  Shield,
  Award,
} from "lucide-react"
import type { PackageData } from "@/lib/package-service"
import { useUser } from "@clerk/nextjs"

interface UserData {
  name: string
  email: string
  phone: string
  address: string
  memberSince: string
  totalPackages: number
  avatar?: string
}

const mockUserData: UserData = {
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main St, New York, NY 10001",
  memberSince: "January 2023",
  totalPackages: 24,
  avatar: "/business-headshot.png",
}

interface UserProfileProps {
  onBack?: () => void
  onViewPackage?: (trackingNumber: string) => void
}

export default function UserProfile({
  onBack,
  onViewPackage,
}: UserProfileProps) {
  const { getToken } = useAuth()
  const [userData, setUserData] = useState<UserData>(mockUserData)
  const [packages, setPackages] = useState<PackageData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingPackages, setIsLoadingPackages] = useState(true)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  })
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(
    null
  )

  // Clerk user
  const { user } = useUser()
  console.log(user?.fullName)

  useEffect(() => {
    const loadPackages = async () => {
      setIsLoadingPackages(true)
      try {
        const endpoint = "http://localhost:8000/graphql"
        const token = await getToken()
        const query = `query getPackages {   getPackages { id trackingNumber destination status }    }`
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ query }),
        })
        const json = await res.json()
        if (!res.ok || json.errors) {
          const msg =
            json.errors?.map((e: any) => e.message).join(", ") || res.statusText
          throw new Error(msg)
        }
        const apiPkgs: Array<{
          id: string
          trackingNumber: string
          destination: string
          status: string
        }> = json.data?.getPackages || []

        const mapped: PackageData[] = apiPkgs.map((p) => ({
          trackingNumber: p.trackingNumber,
          carrier: "Unknown",
          // Use raw server status; cast for local type compat
          status: p.status as unknown as PackageData["status"],
          estimatedDelivery: "-",
          origin: "-",
          destination: p.destination || "-",
          weight: "-",
          dimensions: "-",
          service: "-",
          progress: 0,
          events: [],
          lastUpdated: "-",
        }))

        setPackages(mapped)
        setUserData((prev) => ({ ...prev, totalPackages: mapped.length }))
      } catch (error) {
        console.error("Failed to load packages:", error)
      } finally {
        setIsLoadingPackages(false)
      }
    }

    loadPackages()
  }, [getToken])

  const filteredPackages = packages.filter((pkg) => {
    const q = searchQuery.toLowerCase()
    return (
      pkg.trackingNumber.toLowerCase().includes(q) ||
      pkg.destination.toLowerCase().includes(q) ||
      pkg.status.toLowerCase().includes(q)
    )
  })

  const refreshPackages = async () => {
    setIsLoadingPackages(true)
    try {
      const endpoint = "http://localhost:8000/graphql"
      const token = await getToken()
      const query = `query getPackages {\n        getPackages { id trackingNumber destination status }\n      }`
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query }),
      })
      const json = await res.json()
      if (!res.ok || json.errors) {
        const msg =
          json.errors?.map((e: any) => e.message).join(", ") || res.statusText
        throw new Error(msg)
      }
      const apiPkgs: Array<{
        id: string
        trackingNumber: string
        destination: string
        status: string
      }> = json.data?.getPackages || []
      const mapped: PackageData[] = apiPkgs.map((p) => ({
        trackingNumber: p.trackingNumber,
        carrier: "Unknown",
        status: p.status as unknown as PackageData["status"],
        estimatedDelivery: "-",
        origin: "-",
        destination: p.destination || "-",
        weight: "-",
        dimensions: "-",
        service: "-",
        progress: 0,
        events: [],
        lastUpdated: "-",
      }))
      setPackages(mapped)
    } catch (error) {
      console.error("Failed to refresh packages:", error)
    } finally {
      setIsLoadingPackages(false)
    }
  }

  // Handler for viewing a package
  const handleViewPackage = (trackingNumber: string) => {
    const pkg = packages.find((p) => p.trackingNumber === trackingNumber)
    if (pkg) setSelectedPackage(pkg)
  }

  // Handler for going back to the package list
  const handleBackFromDetails = () => {
    setSelectedPackage(null)
  }

  // Map status to badge color
  function getStatusBadgeColor(status: string) {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-success/20 text-success border-success/40"
      case "SHIPPED":
        return "bg-emerald-800/10 text-emerald-800 border-emerald-800/30"
      case "PROCESSING":
        return "bg-blue-100 text-blue-600 border-blue-400"
      case "PENDING":
        return "bg-warning/20 text-warning border-warning/40"
      case "OUT_FOR_DELIVERY":
        return "bg-orange-100 text-orange-600 border-orange-400"
      case "CONFIRMED":
        return "bg-muted text-muted-foreground border-muted-foreground/30"
      default:
        return "bg-gray-200 text-gray-700 border-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 glass sticky top-0 z-10">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center gap-6">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-foreground hover:text-emerald-800 hover:bg-emerald-800/10 transition-all duration-300 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            )}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-800 shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">
                  My Profile
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="max-w-7xl mx-auto">
          {selectedPackage ? (
            <PackageDetails
              trackingNumber={selectedPackage?.trackingNumber}
              onBack={handleBackFromDetails}
            />
          ) : (
            <Tabs defaultValue="overview" className="space-y-10">
              <TabsList className="flex w-fit mx-auto glass border border-border/30 shadow-xl p-2 rounded-2xl bg-background/80 backdrop-blur-md gap-1">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300 text-sm py-3 px-6 hover:bg-muted/50 flex items-center gap-2 whitespace-nowrap"
                >
                  <User className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="packages"
                  className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300 text-sm py-3 px-6 hover:bg-muted/50 flex items-center gap-2 whitespace-nowrap"
                >
                  <Package className="w-4 h-4" />
                  My Packages
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-10">
                <div className="grid lg:grid-cols-3 gap-10">
                  <Card className="lg:col-span-1 border-border/30 shadow-2xl glass hover:shadow-3xl transition-all duration-500 rounded-3xl">
                    <CardHeader className="text-center pb-6">
                      <div className="relative">
                        <Avatar className="w-32 h-32 mx-auto mb-6 ring-4 ring-secondary/30 shadow-2xl">
                          <AvatarImage
                            src={user?.imageUrl}
                            alt={user?.fullName!}
                          />
                          {/* Updated AvatarFallback to use emerald-800 */}
                          <AvatarFallback className="text-2xl font-bold bg-emerald-800 text-white">
                            {user?.fullName}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 p-2 bg-accent rounded-full shadow-lg">
                          <Award className="w-5 h-5 text-accent-foreground" />
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-serif font-bold text-foreground mb-2">
                        {user?.fullName}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground flex items-center justify-center gap-2 text-base">
                        <Clock className="w-4 h-4" />
                        Member since {user?.createdAt?.toDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="text-center p-6 rounded-2xl bg-secondary/20 border border-secondary/30">
                        <div className="text-4xl font-bold text-emerald-800 mb-2">
                          {userData.totalPackages}
                        </div>
                        <div className="text-sm text-muted-foreground font-semibold">
                          Total Packages Tracked
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2 border-border/30 shadow-2xl glass hover:shadow-3xl transition-all duration-500 rounded-3xl">
                    <CardHeader className="pb-8">
                      <CardTitle className="text-2xl font-serif font-bold text-foreground flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-800 shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        Contact Information
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-base">
                        Keep your contact details up to date for important
                        notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                              <Mail className="w-4 h-4 mr-2 sm:mr-2 sm:inline hidden" />
                              Email Address
                            </Label>
                            <p className="font-semibold text-foreground text-lg">
                              {user?.primaryEmailAddress?.emailAddress}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                              <Smartphone className="w-4 h-4 mr-2 sm:mr-2 sm:inline hidden" />
                              Phone Number
                            </Label>
                            <p className="font-semibold text-foreground text-lg">
                              {userData.phone}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                            <MapPin className="w-4 h-4 mr-2 sm:mr-2 sm:inline hidden" />
                            Delivery Address
                          </Label>
                          <p className="font-semibold text-foreground text-lg">
                            {userData.address}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="text-center p-6 border border-success/20 bg-success/5 hover:bg-success/10 hover:shadow-lg transition-all duration-300 rounded-2xl">
                    <div className="text-3xl font-bold text-success mb-2">
                      {
                        packages.filter(
                          (p) => String(p.status).toUpperCase() === "DELIVERED"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-success font-medium">
                      Delivered
                    </div>
                  </Card>
                  {/* Updated In Transit card to use emerald-800 */}
                  <Card className="text-center p-6 border border-emerald-800/20 bg-emerald-800/5 hover:bg-emerald-800/10 hover:shadow-lg transition-all duration-300 rounded-2xl">
                    <div className="text-3xl font-bold text-emerald-800 mb-2">
                      {
                        packages.filter((p) => {
                          const s = String(p.status).toUpperCase()
                          return s === "SHIPPED" || s === "OUT_FOR_DELIVERY"
                        }).length
                      }
                    </div>
                    <div className="text-sm text-emerald-800 font-medium">
                      In Transit
                    </div>
                  </Card>
                  <Card className="text-center p-6 border border-warning/20 bg-warning/5 hover:bg-warning/10 hover:shadow-lg transition-all duration-300 rounded-2xl">
                    <div className="text-3xl font-bold text-warning mb-2">
                      {
                        packages.filter(
                          (p) => String(p.status).toUpperCase() === "PENDING"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-warning font-medium">
                      Pending
                    </div>
                  </Card>
                  <Card className="text-center p-6 border border-blue-500/20 bg-blue-50 hover:bg-blue-100 hover:shadow-lg transition-all duration-300 rounded-2xl">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {
                        packages.filter(
                          (p) => String(p.status).toUpperCase() === "PROCESSING"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      Processing
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Packages Tab */}
              <TabsContent value="packages" className="space-y-6">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-serif font-bold text-foreground">
                          My Packages
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Track and manage all your packages
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={refreshPackages}
                          disabled={isLoadingPackages}
                        >
                          <RefreshCw
                            className={`w-4 h-4 mr-2 ${
                              isLoadingPackages ? "animate-spin" : ""
                            }`}
                          />
                          Refresh
                        </Button>
                        {/* Updated Add Package button to use emerald-800 */}
                        <Button className="bg-emerald-800 hover:bg-emerald-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Package
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search */}
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by tracking number, destination, or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Package List */}
                    {isLoadingPackages ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-emerald-800/30 border-t-emerald-800 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Loading packages...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredPackages.map((pkg) => (
                          <Card
                            key={pkg.trackingNumber}
                            className="border-border/30 hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    {/* Updated Package icon to use emerald-800 */}
                                    <Package className="w-5 h-5 text-emerald-800" />
                                    <h4 className="font-semibold text-foreground">
                                      {pkg.trackingNumber} • {pkg.destination}
                                    </h4>
                                    <Badge
                                      className={`uppercase border ${getStatusBadgeColor(
                                        pkg.status
                                      )}`}
                                    >
                                      {String(pkg.status)}
                                    </Badge>
                                  </div>
                                  <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                    <div>
                                      <span className="font-medium">
                                        Tracking:
                                      </span>{" "}
                                      {pkg.trackingNumber}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{pkg.estimatedDelivery}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      <span>{pkg.destination}</span>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    {pkg.carrier} • Last updated{" "}
                                    {pkg.lastUpdated}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleViewPackage(pkg.trackingNumber)
                                    }
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}
