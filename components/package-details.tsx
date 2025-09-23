"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  MapPin,
  Clock,
  Truck,
  CheckCircle,
  Circle,
  ArrowLeft,
  Copy,
  Share2,
  Bell,
  RefreshCw,
} from "lucide-react";
import { packageService, type PackageData } from "@/lib/package-service";

interface PackageDetailsProps {
  packageData: PackageData;
  onBack?: () => void;
}

export default function PackageDetails({
  packageData,
  onBack,
}: PackageDetailsProps) {
  const [currentPackageData, setCurrentPackageData] =
    useState<PackageData>(packageData);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updatedData = await packageService.trackPackage(
        currentPackageData.trackingNumber
      );
      if (updatedData) {
        setCurrentPackageData(updatedData);
      }
    } catch (error) {
      console.error("Failed to refresh package data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(currentPackageData.trackingNumber);
  };

  const shareTracking = () => {
    if (navigator.share) {
      navigator.share({
        title: "Package Tracking",
        text: `Track package ${currentPackageData.trackingNumber}`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-foreground hover:text-primary"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-serif font-bold text-foreground">
                  Package Details
                </h1>
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
                  className={`w-4 h-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button variant="outline" size="sm" onClick={copyTrackingNumber}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={shareTracking}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Package Overview */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-serif font-bold text-foreground mb-2">
                    Tracking #{currentPackageData.trackingNumber}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {currentPackageData.carrier} • {currentPackageData.service}
                  </CardDescription>
                </div>
                <Badge
                  className={packageService.getStatusColor(
                    currentPackageData.status
                  )}
                  variant="secondary"
                >
                  {packageService.getStatusText(currentPackageData.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Delivery Progress
                  </span>
                  <span className="text-foreground font-medium">
                    {currentPackageData.progress}%
                  </span>
                </div>
                <Progress value={currentPackageData.progress} className="h-2" />
              </div>

              {/* Key Information Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Estimated Delivery
                      </p>
                      <p className="font-semibold text-foreground">
                        {currentPackageData.estimatedDelivery}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">From → To</p>
                      <p className="font-semibold text-foreground">
                        {currentPackageData.origin} →{" "}
                        {currentPackageData.destination}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Package Details
                      </p>
                      <p className="font-semibold text-foreground">
                        {currentPackageData.weight} •{" "}
                        {currentPackageData.dimensions}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant={isNotificationEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setIsNotificationEnabled(!isNotificationEnabled)
                      }
                      className="flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      {isNotificationEnabled
                        ? "Notifications On"
                        : "Get Notifications"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-serif font-bold text-foreground">
                Tracking History
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Follow your package journey from origin to destination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentPackageData.events.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    {/* Timeline Icon */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          event.isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {event.isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </div>
                      {index < currentPackageData.events.length - 1 && (
                        <div
                          className={`w-0.5 h-12 mt-2 ${
                            event.isCompleted ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4
                            className={`font-semibold ${
                              event.isCompleted
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {event.status}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.timestamp}
                            </span>
                          </div>
                        </div>
                        {event.status === "In Transit" && (
                          <Truck className="w-5 h-5 text-secondary mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Package Location */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Live Package Location
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Real-time tracking on interactive map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border border-emerald-200/50">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-teal-100/20 rounded-xl"></div>
                <div className="relative text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-800 to-teal-700 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Package in Transit
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Your package is currently at:{" "}
                      <span className="font-medium text-foreground">
                        {currentPackageData.events.find(
                          (e) => e.isCompleted && e.status !== "Delivered"
                        )?.location || "Distribution Center"}
                      </span>
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>Next: {currentPackageData.destination}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span>ETA: {currentPackageData.estimatedDelivery}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 text-white">
                    <MapPin className="w-4 h-4 mr-2" />
                    Open Full Map View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Actions */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <MapPin className="w-4 h-4" />
                  View on Map
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Package className="w-4 h-4" />
                  Package Details
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Clock className="w-4 h-4" />
                  Delivery Instructions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
