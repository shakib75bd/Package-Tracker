"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Package, Search, Truck, MapPin, User, Zap } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useState } from "react"
import { PackageData } from "@/lib/package-service"
import { useAuth } from "@clerk/nextjs"
import Chatbot from "@/components/chatbot"

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

            <Chatbot />

            <div className="mb-16"></div>

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
  )
}
