"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
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
      const endpoint =
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "/api/graphql"
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
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300 text-sm py-3 px-6 hover:bg-muted/50 flex items-center gap-2 whitespace-nowrap"
              >
                <Settings className="w-4 h-4" />
                Settings
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
                      packages.filter((p) => {
                        const s = String(p.status).toUpperCase()
                        return (
                          s === "PENDING" ||
                          s === "CONFIRMED" ||
                          s === "PROCESSING"
                        )
                      }).length
                    }
                  </div>
                  <div className="text-sm text-warning font-medium">
                    Pending
                  </div>
                </Card>
                <Card className="text-center p-6 border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:shadow-lg transition-all duration-300 rounded-2xl">
                  <div className="text-3xl font-bold text-destructive mb-2">
                    {
                      packages.filter(
                        (p) => String(p.status).toUpperCase() === "EXCEPTION"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-destructive font-medium">
                    Issues
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
                                    variant="secondary"
                                    className="uppercase"
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
                                  {pkg.carrier} • Last updated {pkg.lastUpdated}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    onViewPackage?.(pkg.trackingNumber)
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

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-10">
              <Card className="border-border/30 shadow-2xl glass rounded-3xl">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-serif font-bold text-foreground flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-800 shadow-lg">
                      <Bell className="h-6 w-6 text-white" />
                    </div>
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-base">
                    Customize how you receive updates about your packages and
                    account activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-success/10 border border-success/20 hover:bg-success/15 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="p-3 rounded-2xl bg-success shadow-lg">
                        <Mail className="w-6 h-6 text-success-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-lg">
                          Email Notifications
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Receive detailed package updates and delivery
                          confirmations
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 rounded-2xl bg-emerald-800/10 border border-emerald-800/20 hover:bg-emerald-800/15 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="p-3 rounded-2xl bg-emerald-800 shadow-lg">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-lg">
                          SMS Notifications
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Get instant alerts for critical package updates
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, sms: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 rounded-2xl bg-accent/10 border border-accent/20 hover:bg-accent/15 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="p-3 rounded-2xl bg-accent shadow-lg">
                        <Monitor className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-lg">
                          Push Notifications
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Real-time browser notifications for immediate updates
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, push: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/30 shadow-2xl glass rounded-3xl">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-serif font-bold text-foreground flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-muted shadow-lg">
                      <Settings className="h-6 w-6 text-muted-foreground" />
                    </div>
                    Account Management
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-base">
                    Manage your account data, privacy settings, and account
                    preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-4xl mx-auto">
                    <Button
                      variant="outline"
                      className="flex-1 justify-center bg-success/5 border-success/30 text-success hover:bg-success/10 hover:border-success/50 transition-all duration-300 h-12 rounded-xl font-medium min-w-0"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    {/* Updated Privacy button to use emerald-800 */}
                    <Button
                      variant="outline"
                      className="flex-1 justify-center bg-emerald-800/5 border-emerald-800/30 text-emerald-800 hover:bg-emerald-800/10 hover:border-emerald-800/50 transition-all duration-300 h-12 rounded-xl font-medium min-w-0"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Privacy
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 justify-center bg-destructive/5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-300 h-12 rounded-xl font-medium min-w-0"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
