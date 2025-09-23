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
        // Generate response based on package status using available fields
        let statusMessage = ""
        let hasButton = true

        switch (packageData.status.toLowerCase()) {
          case "delivered":
            statusMessage = `📦 Package Status: DELIVERED

Your package ${packageData.trackingNumber} has been successfully delivered to ${packageData.destination
              }.

• Delivery Status: ${packageData.status.toUpperCase()}
• Final Destination: ${packageData.destination}

Your package has reached its final destination. If you have any concerns about the delivery, please contact the carrier directly.`
            break

          case "in-transit":
          case "in transit":
            statusMessage = `🚛 Package Status: IN TRANSIT

Your package ${packageData.trackingNumber} is currently on its way to ${packageData.destination
              }.

• Current Status: ${packageData.status.toUpperCase()}
• Destination: ${packageData.destination}

Your package is actively being transported and should arrive as scheduled.`
            break

          case "pending":
            statusMessage = `⏳ Package Status: PENDING

Your package ${packageData.trackingNumber} is currently pending processing.

• Current Status: ${packageData.status.toUpperCase()}
• Destination: ${packageData.destination}

Your package is in the initial processing stage. It will begin transit shortly.`
            break

          case "exception":
            statusMessage = `⚠️ Package Status: EXCEPTION

Your package ${packageData.trackingNumber} has encountered a delivery exception.

• Current Status: ${packageData.status.toUpperCase()}
• Destination: ${packageData.destination}

There may be a delay or issue with your package. Please contact the carrier for more information about resolving this exception.`
            break

          case "not-found":
          case "not found":
            statusMessage = `❌ Package Status: NOT FOUND

The tracking number ${packageData.trackingNumber
              } could not be located in the system.

• Status: ${packageData.status.toUpperCase()}

Please verify the tracking number is correct or contact the sender for accurate tracking information.`
            hasButton = false
            break

          default:
            statusMessage = `📋 Package Information

Your package ${packageData.trackingNumber} is being tracked.

• Current Status: ${packageData.status.toUpperCase()}
• Destination: ${packageData.destination}

For detailed tracking information, please use the Track Package button below.`
            break
        }

        return {
          text: statusMessage,
          hasRedirectButton: hasButton,
        }
      } else {
        return {
          text: `❌ Package Not Found </br>

I was unable to locate a package with tracking number: ${trackingNumber}

This could be due to:
• Incorrect tracking number
• Package not yet in the system
• Tracking number from an unsupported carrier

Please verify the tracking number and try again, or contact your sender for assistance.`,
          hasRedirectButton: false,
        }
      }
    }

    if (
      lowerText.includes("track") ||
      lowerText.includes("package") ||
      lowerText.includes("order") ||
      lowerText.includes("delivery")
    ) {
      if (lowerText.includes("track")) {
        return {
          text: "I can help you track your package! Please enter your tracking number here, and I'll offer to redirect you to the detailed tracking page.",
          hasRedirectButton: false,
        }
      }
      if (lowerText.includes("where") || lowerText.includes("status")) {
        return {
          text: "To check your package location and status, please provide your tracking number. I'll help you navigate to the tracking page for detailed information.",
          hasRedirectButton: false,
        }
      }
      if (lowerText.includes("delivery time") || lowerText.includes("when")) {
        return {
          text: "Delivery times depend on the shipping method and carrier. Share your tracking number and I'll help you find the estimated delivery date!",
          hasRedirectButton: false,
        }
      }
      if (lowerText.includes("lost") || lowerText.includes("missing")) {
        return {
          text: "If your package seems lost, let's check the tracking status first. Please provide your tracking number and I can help identify the carrier.",
          hasRedirectButton: false,
        }
      }
      if (lowerText.includes("address") || lowerText.includes("change")) {
        return {
          text: "To change delivery address, you'll need to contact the carrier directly before the package is out for delivery. Share your tracking number and I can help identify the carrier.",
          hasRedirectButton: false,
        }
      }
      return {
        text: "I can help you with package tracking! Please provide your tracking number and I'll guide you to the detailed tracking information.",
        hasRedirectButton: false,
      }
    }

    return {
      text: "I'm specifically designed to help with package tracking and delivery questions. Please share your tracking number or ask about package-related topics!",
      hasRedirectButton: false,
    }
  }

  const handleRedirectToTracking = (trackingNumber: string) => {
    setSelectedTrackingNumber(trackingNumber)
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
                  : "bg-white"
                  }`}
              >
                <p className="text-sm text-left">{message.text}</p>
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
      <Card className="w-11/12 p-10 mx-auto bottom-6 right-6 z-50 transition-all duration-300}">
        <div>
          {/* If a tracking number is selected, show PackageDetails */}
          {showDetailsModal && selectedTrackingNumber && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute top-6 right-8 z-10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 shadow-lg"
                    onClick={() => setShowDetailsModal(false)}
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
                <div className="w-full h-full flex items-center justify-center">
                  <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-y-auto p-0">
                    <PackageDetails trackingNumber={selectedTrackingNumber} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {!showDetailsModal && (
            <>
              {/* Header */}
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl font-serif font-bold text-foreground flex items-center justify-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Search className="w-6 h-6 text-emerald-800" />
                  </div>
                  Enter Tracking Number or ask questions
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Track packages from all major carriers worldwide
                </CardDescription>
              </CardHeader>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 space-y-4">
                {messages.slice(-1).map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                      <div
                        className={`flex items-start gap-2 max-w-[60%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === "user"
                            ? "bg-gradient-to-r from-emerald-800 to-teal-700 text-white"
                            : "bg-white"
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
                            : "bg-white"
                            }`}
                        >
                          <p className="text-sm text-left">{message.text}</p>
                        </div>
                      </div>
                    </div>
                    {message.hasRedirectButton && message.trackingNumber && (
                      <div className="flex justify-start">
                        <Button
                          onClick={() =>
                            handleRedirectToTracking(message.trackingNumber!)
                          }
                          className="ml-10 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white text-xs px-3 py-1 h-8"
                        >
                          <Package className="h-3 w-3 mr-1" />
                          Track Package
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Quick suggestions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTION_QUERIES.slice(0, 3).map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs cursor-pointer h-7 px-2 bg-transparent hover:bg-white/80 border-white/30"
                      >
                        <Badge className="bg-emerald-700">{suggestion}</Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="px-4 border-t border-white/20">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !loading) {
                        handleSendMessage(inputValue)
                      }
                    }}
                    disabled={loading}
                    placeholder={
                      loading
                        ? "Processing your request..."
                        : "Enter tracking number or ask questions..."
                    }
                    className="flex-1 text-sm p-5 bg-white border border-gray-200 rounded-lg! focus:bg-white focus:ring-0!"
                  />
                  <Button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || loading}
                    className="bg-gradient-to-r from-emerald-800 to-teal-700 border-gray-200 rounded-lg! hover:from-emerald-700 hover:to-teal-600"
                  >
                    {loading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
      <div className="flex items-center justify-center h-[70vh] bg-transparent">
        <div>
          <h3 className="text-2xl font-medium text-center py-5">Enter your tracking number or ask</h3>
          <div className="relative p-4 space-y-4 min-h-16 min-w-md w-[45vw] bg-white rounded-2xl">
            <div className="flex-1 overflow-y-auto px-4 space-y-4">
              {renderMessages()}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="mt-3 relative border p-4 space-y-4 min-w-md w-[45vw] bg-card rounded-2xl">
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
