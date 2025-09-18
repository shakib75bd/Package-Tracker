"use client";

import { useState } from "react";
import { useAuth, SignedIn, SignedOut } from "@clerk/nextjs";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const { userId } = useAuth();
  const adminId = process.env.NEXT_PUBLIC_ADMIN_USER || process.env.ADMIN_USER;
  const isAdmin = userId === adminId;
  const [form, setForm] = useState({
    sender: "",
    receiver: "",
    destination: "",
    userId: "",
  });
  const [status, setStatus] = useState("");
  const [packageId, setPackageId] = useState("");
  const [message, setMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: Send GraphQL/mutation request to create package
    setMessage("Package created (mock)");
  }

  async function handleUpdateStatus(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: Send GraphQL/mutation request to update package status
    setMessage("Package status updated (mock)");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Admin Space</h1>
        <SignedIn>
          {isAdmin ? (
            <>
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Create Package</h2>
                <form className="space-y-4 max-w-lg" onSubmit={handleCreate}>
                  <Input
                    name="sender"
                    placeholder="Sender"
                    value={form.sender}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    name="receiver"
                    placeholder="Receiver"
                    value={form.receiver}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    name="destination"
                    placeholder="Destination"
                    value={form.destination}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    name="userId"
                    placeholder="User ID"
                    value={form.userId}
                    onChange={handleChange}
                    required
                  />
                  <Button type="submit">Create Package</Button>
                </form>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">
                  Update Package Status
                </h2>
                <form
                  className="space-y-4 max-w-lg"
                  onSubmit={handleUpdateStatus}
                >
                  <Input
                    name="packageId"
                    placeholder="Package ID"
                    value={packageId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPackageId(e.target.value)
                    }
                    required
                  />
                  <Input
                    name="status"
                    placeholder="New Status"
                    value={status}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setStatus(e.target.value)
                    }
                    required
                  />
                  <Button type="submit">Update Status</Button>
                </form>
              </section>

              {message && <div className="mt-4 text-green-600">{message}</div>}
            </>
          ) : (
            <div className="text-red-600">
              You are not authorized to access this page.
            </div>
          )}
        </SignedIn>
        <SignedOut>
          <div className="text-red-600">
            You must be signed in as admin to access this page.
          </div>
        </SignedOut>
      </main>
    </div>
  );
}
