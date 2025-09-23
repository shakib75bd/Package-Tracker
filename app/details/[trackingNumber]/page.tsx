'use client'
import PackageDetails from "@/components/package-details"
import { useParams } from "next/navigation"

export default function PackageDetailsPage() {
    const params = useParams()
    const trackingNumber = params.trackingNumber as string
    return <PackageDetails trackingNumber={trackingNumber} />
}