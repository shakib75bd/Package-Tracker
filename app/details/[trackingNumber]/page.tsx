'use client'
import { useParams } from "next/navigation"

export default function PackageDetails() {
    const params = useParams()
    const trackingNumber = params.trackingNumber as string
    return <div className="text-8xl">{trackingNumber}</div>
}