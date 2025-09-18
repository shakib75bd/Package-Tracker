"use client"

import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs"
import { User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  return (
    <header className="border-b border-border/50 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              TrackIT
            </h1>
          </div>
          <nav className="flex items-center gap-3">
            <SignedOut>
              <Button
                variant="outline"
                className="text-emerald-800 hover:text-white hover:bg-emerald-800 transition-all duration-200 bg-white border-emerald-200 hover:border-emerald-800 font-medium px-6"
              >
                <SignInButton />
              </Button>
              <Button className="bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 hover:shadow-lg text-white font-medium px-6 transition-all duration-200">
                Sign Up
              </Button>
            </SignedOut>

            <SignedIn>
              {pathname === "/profile" ? (
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50 transition-all duration-200"
                  >
                    Home
                  </Button>
                </Link>
              ) : (
                <div>
                  <Button
                    variant="outline"
                    className="text-emerald-800 hover:text-white hover:bg-emerald-800 transition-all duration-200 bg-white border-emerald-200 hover:border-emerald-800 font-medium px-6"
                  >
                    <SignOutButton />
                  </Button>

                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      className="text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50 transition-all duration-200"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </div>
              )}
            </SignedIn>
          </nav>
        </div>
      </div>
    </header>
  )
}
