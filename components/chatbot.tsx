"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Bot,
  User,
  Package,
  Search,
  Loader,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { useAuth } from "@clerk/nextjs"
import { PackageData } from "@/lib/package-service"
import { useRouter } from "next/navigation"
import PackageDetails from "./package-details"
import { Skeleton } from "@/components/ui/skeleton"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  hasRedirectButton?: boolean
  trackingNumber?: string
}

const SUGGESTION_QUERIES = [
  "Track my package",
  "Where is my order?",
  "Delivery status update",
  "Package delivery time",
]

const PROACTIVE_MESSAGES = [
  "💡 Tip: You can track multiple packages at once from your profile!",
  "🚚 Need help? I can assist with tracking, delivery updates, and more!",
  "📦 Having delivery issues? I'm here to help you resolve them!",
  "⏰ Want real-time updates? Let me show you how to set up notifications!",
]

const MessageSkeleton = () => (
  <div className="space-y-2">
    <div className="flex justify-start">
      <div className="flex items-start gap-2 max-w-[60%]">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <Bot className="h-4 w-4" />
        </div>
        <div className="rounded-xl px-4 py-2 bg-white space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    </div>
  </div>
)

// Add this helper function to parse markdown-style bold text
const parseMessageText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2) // Remove ** from both ends
      return (
        <strong key={index} className="font-semibold text-emerald-800">
          {boldText}
        </strong>
      )
    }
    return part
  })
}

export default function Chatbot() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { getToken } = useAuth()
  const [pkg, setPkg] = useState<PackageData | null>()
  const [loading, setLoading] = useState<boolean>(false)
  const [trackingInput, setTrackingInput] = useState("")
  const router = useRouter()
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTrackingNumber, setSelectedTrackingNumber] = useState<
    string | null
  >(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your package tracking assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchPackage = async (trackingNumber: string) => {
    try {
      setLoading(true)
      const endpoint = "http://localhost:8000/graphql"
      const token = await getToken()
      const query = `
          query GetPackageByTrackingNumber($trackingNumber: String!) {
            getPackageByTrackingNumber(trackingNumber: $trackingNumber) {
              id
              trackingNumber
              destination
              status
            }
          }
        `
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables: { trackingNumber } }),
      })

      const json = await res.json()
      if (!res.ok || json.errors) {
        const msg =
          json.errors?.map((e: any) => e.message).join(", ") || res.statusText
        throw new Error(msg)
      }

      return json.data.getPackageByTrackingNumber ?? null
    } catch (err) {
      console.error("Failed to load packages:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // useEffect(() => {
  //   scrollToBottom()
  // }, [messages])

  const detectTrackingNumber = (text: string): string | null => {
    // Common tracking number patterns
    const patterns = [
      /PKG-[0-9]+/g, // Custom PKG format
      /\b1Z[0-9A-Z]{16}\b/g, // UPS
      /\b[0-9]{12}\b/g, // FedEx 12 digit
      /\b[0-9]{14}\b/g, // FedEx 14 digit
      /\b[0-9]{20}\b/g, // USPS
      /\b[A-Z]{2}[0-9]{9}[A-Z]{2}\b/g, // DHL
      /\b[0-9]{10,15}\b/g, // Generic tracking numbers
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        return match[0]
      }
    }
    return null
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return // Prevent sending while loading

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setLoading(true) // Start loading
    // wait 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Add temporary loading message
    const loadingMessage: Message = {
      id: (Date.now() + 0.5).toString(),
      text: "🔍 Searching for your package...",
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, loadingMessage])

    try {
      console.log("text[handleSendMessage]", text)
      const trackingNumber = detectTrackingNumber(text)
      console.log("tracking number [handleSendMessage]", trackingNumber)
      const res = await generateBotResponse(text, trackingNumber)
      console.log("showing results [handleSendMessage]", res)

      // Remove loading message and add actual response
      setMessages((prev) => {
        const withoutLoading = prev.filter(
          (msg) => msg.id !== loadingMessage.id
        )
        const actualMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: res.text,
          sender: "bot",
          timestamp: new Date(),
          hasRedirectButton: res.hasRedirectButton,
          trackingNumber: trackingNumber || undefined,
        }
        return [...withoutLoading, actualMessage]
      })
    } catch (error) {
      // Handle error and remove loading message
      setMessages((prev) => {
        const withoutLoading = prev.filter(
          (msg) => msg.id !== loadingMessage.id
        )
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I encountered an error while processing your request. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        }
        return [...withoutLoading, errorMessage]
      })
      console.error("Error in handleSendMessage:", error)
    } finally {
      setLoading(false) // End loading
    }
  }

  const generateBotResponse = async (
    userText: string,
    trackingNumber: string | null
  ): Promise<{ text: string; hasRedirectButton: boolean }> => {
    const lowerText = userText.toLowerCase()

    if (trackingNumber) {
      const packageData = await fetchPackage(trackingNumber)
      console.log("Package data received:", packageData)

      if (packageData) {
        let statusMessage = ""
        let hasButton = true

        switch (packageData.status.toLowerCase()) {
          case "delivered":
            statusMessage = `Great news! Your package **${packageData.trackingNumber}** has been successfully delivered to **${packageData.destination}**. 

The delivery is now complete. If you have any questions about the delivery or didn't receive your package, please contact the carrier directly for assistance.`
            break

          case "shipped":
          case "in-transit":
          case "in transit":
            statusMessage = `Your package **${packageData.trackingNumber}** is currently on its way to **${packageData.destination}**. 

It's actively being transported and should arrive as scheduled. You can track its progress for real-time updates.`
            break

          case "processing":
            statusMessage = `Your package **${packageData.trackingNumber}** is being processed and prepared for shipment to **${packageData.destination}**. 

It will be shipped soon and you'll receive updates once it's on its way.`
            break

          case "confirmed":
            statusMessage = `Your package **${packageData.trackingNumber}** has been confirmed and is ready for processing. 

Destination: **${packageData.destination}**. The package will move to the next stage shortly.`
            break

          case "pending":
            statusMessage = `Your package **${packageData.trackingNumber}** is currently pending and awaiting processing. 

Destination: **${packageData.destination}**. It's in the initial stage and will begin processing soon.`
            break

          case "out_for_delivery":
          case "out-for-delivery":
            statusMessage = `Exciting! Your package **${packageData.trackingNumber}** is out for delivery to **${packageData.destination}**. 

It should arrive today. Make sure someone is available to receive it.`
            break

          case "exception":
            statusMessage = `There's been a delivery exception with your package **${packageData.trackingNumber}** heading to **${packageData.destination}**. 

This could be due to an incorrect address, delivery attempt failure, or weather delays. Please contact the carrier to resolve this issue.`
            break

          case "not-found":
          case "not found":
            statusMessage = `I couldn't locate package **${packageData.trackingNumber}** in the system. 

Please double-check the tracking number or contact your sender for the correct information.`
            hasButton = false
            break

          default:
            statusMessage = `I found your package **${packageData.trackingNumber}** with status **${packageData.status.toUpperCase()}**. 

It's being tracked and heading to **${packageData.destination}**. Click below for detailed tracking information.`
            break
        }

        return {
          text: statusMessage,
          hasRedirectButton: hasButton,
        }
      } else {
        return {
          text: `I couldn't find a package with tracking number **${trackingNumber}**. 

This could mean:
- The tracking number might be incorrect
- The package isn't in the system yet  
- It's from an unsupported carrier

Please verify the number and try again, or contact your sender for help.`,
          hasRedirectButton: false,
        }
      }
    }

    // Handle general queries
    if (
      lowerText.includes("track") ||
      lowerText.includes("package") ||
      lowerText.includes("order") ||
      lowerText.includes("delivery")
    ) {
      if (lowerText.includes("track")) {
        return {
          text: "I'd be happy to help you track your package! Just share your **tracking number** and I'll look it up for you and provide detailed information.",
          hasRedirectButton: false,
        }
      }
      if (lowerText.includes("where") || lowerText.includes("status")) {
        return {
          text: "To check where your package is and its current status, I'll need your **tracking number**. Once you provide it, I can give you all the details about its location and progress.",
          hasRedirectButton: false,
        }
      }
      if (lowerText.includes("delivery time") || lowerText.includes("when")) {
        return {
          text: "Delivery times vary by carrier and shipping method. If you share your **tracking number**, I can help you find the estimated delivery date and current progress.",
          hasRedirectButton: false,
        }
      }
      if (lowerText.includes("lost") || lowerText.includes("missing")) {
        return {
          text: "I understand your concern about a potentially lost package. Let's check its tracking status first - please provide your **tracking number** and I'll help you see exactly where it is.",
          hasRedirectButton: false,
        }
      }
      if (lowerText.includes("address") || lowerText.includes("change")) {
        return {
          text: "To change a delivery address, you'll need to contact the carrier directly, ideally before the package is out for delivery. Share your **tracking number** and I can help identify which carrier to contact.",
          hasRedirectButton: false,
        }
      }
      return {
        text: "I'm here to help with your package tracking needs! Just provide your **tracking number** and I'll give you detailed information about your shipment.",
        hasRedirectButton: false,
      }
    }

    return {
      text: "I specialize in package tracking and delivery assistance. Feel free to share your **tracking number** or ask me any questions about your shipments!",
      hasRedirectButton: false,
    }
  }

  const handleRedirectToTracking = (trackingNumber: string) => {
    router.push(`/details/${trackingNumber}`)
    setShowDetailsModal(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  // Update the messages display logic
  const renderMessages = () => {
    // Show skeleton when loading and no messages to show
    if (loading && messages.slice(-1)[0]?.sender === "user") {
      return <MessageSkeleton />
    }

    // Show actual messages
    if (messages.length > 0) {
      return messages.slice(-1).map((message) => (
        <div key={message.id} className="space-y-2">
          <div
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex items-start gap-2 max-w-[100%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === "user"
                  ? "bg-gradient-to-r from-emerald-800 to-teal-700 text-white"
                  : "bg-muted"
                  }`}
              >
                {message.sender === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={`rounded-xl px-4 py-2 ${message.sender === "user"
                  ? "bg-gradient-to-r from-emerald-800 to-teal-700 text-white"
                  : "bg"
                  }`}
              >
                <p className="text-sm text-left">
                  {parseMessageText(message.text)}
                </p>
              </div>
            </div>
          </div>
          {message.hasRedirectButton && message.trackingNumber && (
            <div className="flex justify-start">
              <Button
                onClick={() => handleRedirectToTracking(message.trackingNumber!)}
                className="ml-10 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white text-xs px-3 py-1 h-8"
              >
                <Package className="h-3 w-3 mr-1" />
                Track Package
              </Button>
            </div>
          )}
        </div>
      ))
    }

    // Show skeleton when no messages found
    return <MessageSkeleton />
  }

  return (
    <>
      <div className="flex items-center justify-center  bg-white border py-10 rounded-3xl">
        <div>
          <h3 className="text-2xl font-medium text-center py-5">Enter your tracking number or ask</h3>
          <div className="relative p-4 space-y-4 min-h-16 min-w-md w-[45vw] rounded-2xl">
            <div className="flex-1 overflow-y-auto px-4 space-y-4">
              {renderMessages()}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="mt-3 relative border p-4 space-y-4 min-w-md w-[45vw] rounded-2xl">
            <input
              type="text"
              value={inputValue}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleSendMessage(inputValue)
                }
              }}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your tracking number..."
              disabled={loading}
              className="w-full p-0 m-0 bg-transparent! border-0 border-none! focus:border-0 focus:ring-0 focus:outline-none text-xl disabled:opacity-50"
            />
            <div className="flex justify-end">
              <Button
                variant="outline"
                disabled={!inputValue.trim() || loading}
                onClick={() => handleSendMessage(inputValue)}
                className="bg-white text-black rounded-xl px-6 py-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}