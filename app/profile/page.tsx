"use client";

import UserProfile from "@/components/user-profile";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { useAuth } from "@clerk/nextjs";

export default function ProfilePage() {
  const { getToken } = useAuth();
  async function fetchToken() {
    const token = await getToken();
    console.log("CLERK TOKEN: ", token); // Returns the JWT auth token
  }

  fetchToken();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <UserProfile />
      </main>
    </div>
  );
}
