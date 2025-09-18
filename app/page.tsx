"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Search, Truck, MapPin, User, Zap } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      <main className="relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 opacity-30"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-12">
              <h2 className="text-6xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
                Track Your Package
                <span className="block bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 bg-clip-text text-transparent">
                  Anywhere, Anytime
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-sans leading-relaxed max-w-3xl mx-auto">
                Enter your tracking number below to get real-time updates on
                your package location and delivery status with our modern,
                intuitive interface.
              </p>
            </div>

            <Card className="max-w-3xl mx-auto mb-16 shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl font-serif font-bold text-foreground flex items-center justify-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Search className="w-6 h-6 text-emerald-800" />
                  </div>
                  Enter Tracking Number
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Track packages from all major carriers worldwide
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="text"
                    placeholder="Enter tracking number (e.g., 1Z999AA1234567890)"
                    className="flex-1 h-14 text-lg bg-white border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl"
                    disabled
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled
                    className="h-14 px-10 bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 hover:shadow-xl text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5" />
                      Track Package
                    </div>
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="mb-16">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-6">
                Quick Access
              </h3>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/profile">
                  <Button
                    variant="outline"
                    className="bg-white/50 backdrop-blur-sm hover:bg-primary/5 border-border/50 rounded-xl h-12 px-6 transition-all duration-200 hover:shadow-md"
                  >
                    <User className="w-5 h-5 mr-3" />
                    View My Packages
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="bg-white/50 backdrop-blur-sm hover:bg-secondary/5 border-border/50 rounded-xl h-12 px-6 transition-all duration-200 hover:shadow-md"
                  disabled
                >
                  <Package className="w-5 h-5 mr-3" />
                  Demo Tracking
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="text-center p-8 border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-800 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                  Real-time Tracking
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get live updates on your package location and estimated
                  delivery time with precision accuracy.
                </p>
              </Card>

              <Card className="text-center p-8 border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-700 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                  Multiple Carriers
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track packages from UPS, FedEx, USPS, DHL, and many more
                  carriers in one unified interface.
                </p>
              </Card>

              <Card className="text-center p-8 border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-700 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                  Package History
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Keep track of all your packages in one convenient location
                  with detailed history and analytics.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-white/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="font-serif font-bold text-xl bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
                TrackIT
              </span>
            </div>
            <p className="font-sans">
              © 2024 TrackIT. Track your packages with confidence and style.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
