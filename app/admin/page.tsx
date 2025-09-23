"use client";

import { useEffect, useState } from "react";
import { useAuth, SignedIn, SignedOut } from "@clerk/nextjs";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPage() {
  const { userId, getToken } = useAuth();
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
  const [error, setError] = useState("");
  const [packages, setPackages] = useState<
    Array<{
      id: string;
      trackingNumber: string;
      sender: string;
      receiver: string;
      destination: string;
      status: string;
      createdAt?: string;
      updatedAt?: string;
    }>
  >([]);
  const [loadingPkgs, setLoadingPkgs] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    console.log(form);
  }, [form]);

  async function fetchPackages() {
    setError("");
    setLoadingPkgs(true);
    try {
      const endpoint = "http://localhost:8000/graphql";
      const token = await getToken();
      const query = `query getPackages {getPackages { id trackingNumber sender receiver destination status }   }`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      if (!res.ok || json.errors) {
        const msg =
          json.errors?.map((e: any) => e.message).join(", ") || res.statusText;
        throw new Error(msg);
      }
      setPackages(json.data.getPackages || []);
    } catch (err: any) {
      setError(err.message || "Failed to load packages");
    } finally {
      setLoadingPkgs(false);
    }
  }

  useEffect(() => {
    // auto-load packages when admin page mounts and user is admin
    if (isAdmin) fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const endpoint = "http://localhost:8000/graphql";
      const token = await getToken();
      const query = `mutation createPackage(
      $sender: String!
      $receiver: String!
      $destination: String!
      $userId: String!
    ) {
      createPackage(
        sender: $sender
        receiver: $receiver
        destination: $destination
        userId: $userId
      ) {
        id
      }
    }`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables: { ...form } }),
      });
      const json = await res.json();
      if (!res.ok || json.errors) {
        const msg =
          json.errors?.map((e: any) => e.message).join(", ") || res.statusText;
        throw new Error(msg);
      }
      setMessage(`Created package ${json.data.createPackage.id}`);
      setForm({ sender: "", receiver: "", destination: "", userId: "" });
    } catch (err: any) {
      setError(err.message || "Failed to create package");
    }
  }

  async function handleUpdateStatus(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!status) {
      setError("Please select a status");
      return;
    }
    try {
      const endpoint = "http://localhost:8000/graphql";
      const token = await getToken();
      const query = `mutation updatePackageStatus($id: String!, $status: String!) {
        updatePackageStatus(id: $id, status: $status) { id status }
      }`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables: { id: packageId, status } }),
      });
      const json = await res.json();
      if (!res.ok || json.errors) {
        const msg =
          json.errors?.map((e: any) => e.message).join(", ") || res.statusText;
        throw new Error(msg);
      }
      setMessage(
        `Updated ${json.data.updatePackageStatus.id} to ${json.data.updatePackageStatus.status}`
      );
      setPackageId("");
      setStatus("");
    } catch (err: any) {
      setError(err.message || "Failed to update package status");
    }
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
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                      <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                      <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                      <SelectItem value="OUT_FOR_DELIVERY">
                        OUT_FOR_DELIVERY
                      </SelectItem>
                      <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit">Update Status</Button>
                </form>
              </section>

              <section className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">All Packages</h2>
                  <Button
                    variant="outline"
                    onClick={fetchPackages}
                    disabled={loadingPkgs}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        loadingPkgs ? "animate-spin" : ""
                      }`}
                    />
                    {loadingPkgs ? "Refreshing" : "Refresh"}
                  </Button>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tracking</TableHead>
                        <TableHead>Sender</TableHead>
                        <TableHead>Receiver</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.length === 0 && !loadingPkgs ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-muted-foreground py-6"
                          >
                            No packages found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        packages.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="max-w-[12rem] truncate">
                              {p.id}
                            </TableCell>
                            <TableCell>{p.trackingNumber}</TableCell>
                            <TableCell>{p.sender}</TableCell>
                            <TableCell>{p.receiver}</TableCell>
                            <TableCell>{p.destination}</TableCell>
                            <TableCell>{p.status}</TableCell>
                            <TableCell>{p.createdAt || "-"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    <TableCaption>
                      Showing {packages.length} package(s)
                    </TableCaption>
                  </Table>
                </div>
              </section>

              {error && <div className="mt-4 text-red-600">{error}</div>}
              {message && <div className="mt-2 text-green-600">{message}</div>}
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
