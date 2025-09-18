"use client"

import UserProfile from "@/components/user-profile"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { useAuth, useUser } from "@clerk/nextjs"

export default function ProfilePage() {
  const { isSignedIn } = useUser()
  const router = useRouter()

  if (!isSignedIn) router.push("/")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <UserProfile />
      </main>
    </div>
  )
}
