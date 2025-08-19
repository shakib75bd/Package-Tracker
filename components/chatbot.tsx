"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Maximize2, Minimize2, Send, Bot, User, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  "Lost package help",
  "Change delivery address",
]

const PROACTIVE_MESSAGES = [
  "💡 Tip: You can track multiple packages at once from your profile!",
  "🚚 Need help? I can assist with tracking, delivery updates, and more!",
  "📦 Having delivery issues? I'm here to help you resolve them!",
  "⏰ Want real-time updates? Let me show you how to set up notifications!",
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const detectTrackingNumber = (text: string): string | null => {
    // Common tracking number patterns
    const patterns = [
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

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    setTimeout(() => {
      const trackingNumber = detectTrackingNumber(text.trim())
      const botResponse = generateBotResponse(text.trim(), trackingNumber)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: "bot",
        timestamp: new Date(),
        hasRedirectButton: botResponse.hasRedirectButton,
        trackingNumber: trackingNumber || undefined,
      }
      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  const generateBotResponse = (
    userText: string,
    trackingNumber: string | null,
  ): { text: string; hasRedirectButton: boolean } => {
    const lowerText = userText.toLowerCase()

    if (trackingNumber) {
      return {
        text: `Great! I detected tracking number: ${trackingNumber}. Would you like me to redirect you to the tracking page to see the full details?`,
        hasRedirectButton: true,
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
    // This would typically use router.push or window.location
    // For now, we'll simulate the redirect by dispatching a custom event
    window.dispatchEvent(new CustomEvent("trackPackage", { detail: { trackingNumber } }))
    setIsOpen(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="absolute bottom-16 right-0 mb-2 mr-2">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 whitespace-nowrap">
            <p className="text-sm font-medium">Need help? I can assist!</p>
            <span className="text-lg">📦</span>
          </div>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isExpanded ? "inset-4" : "w-80 h-96"}`}>
      <div className="h-full bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-800 to-teal-700 text-white">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-semibold">Package Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-emerald-800 to-teal-700 text-white"
                        : "bg-muted"
                    }`}
                  >
                    {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-emerald-800 to-teal-700 text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
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
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {SUGGESTION_QUERIES.slice(0, 3).map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs h-7 px-2 bg-white/50 hover:bg-white/80 border-white/30"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/20">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
              placeholder="Enter tracking number or ask questions..."
              className="flex-1 bg-white/50 border-white/30 focus:bg-white/80"
            />
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
