"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Crown, AlertCircle, CheckCircle2, X, Star, Infinity } from "lucide-react"

const RenderSubscription = ({ clerkId }) => {
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)

  // Fetch and poll subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch(
          `https://server.datasenseai.com/subscription/subscription-status?clerkId=${clerkId}`
        )
        const data = await response.json()
        
        if (response.ok) {
          localStorage.setItem("subscriptionStatus", JSON.stringify(data))
        } else {
          if (data.message === "User not subscribed") {
            localStorage.setItem("subscriptionStatus", JSON.stringify({ noSubscription: true }))
          } else {
            localStorage.setItem("subscriptionStatus", JSON.stringify(data))
          }
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error)
        localStorage.removeItem("subscriptionStatus")
      }
    }

    if (clerkId) {
      fetchSubscriptionStatus()
      const interval = setInterval(fetchSubscriptionStatus, 60000)
      return () => clearInterval(interval)
    }
  }, [clerkId])

  // Sync state with localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const storedStatus = localStorage.getItem("subscriptionStatus")
      setSubscriptionStatus(storedStatus ? JSON.parse(storedStatus) : null)
    }

    handleStorageChange()
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const getStatusDetails = () => {
    if (!subscriptionStatus) return null

    // Handle non-subscribed state
    if (subscriptionStatus.noSubscription) {
      return {
        icon: <Star className="h-5 w-5 text-gray-500" />,
        buttonIcon: <Crown className="h-4 w-4 text-gray-500" />,
        label: "Not Subscribed",
        color: "gray",
        action: "Subscribe Now",
        description: "Subscribe to unlock premium features",
        gradient: "from-gray-50 to-gray-100",
      }
    }

    const { plan, subscriptionStatus: status, fuel } = subscriptionStatus

    // Handle free tier
    if (plan === "free") {
      return {
        icon: <Star className="h-5 w-5 text-yellow-500" />,
        buttonIcon: <Crown className="h-4 w-4 text-yellow-500" />,
        label: "Free Plan",
        color: "yellow",
        action: "Upgrade to Premium",
        description: "Unlock all premium features",
        gradient: "from-yellow-50 to-yellow-100",
      }
    }

    // Handle active subscription
    if (["active", "authenticated"].includes(status)) {
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        buttonIcon: <Crown className="h-4 w-4 text-green-500" />,
        label: plan.charAt(0).toUpperCase() + plan.slice(1),
        color: "green",
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} membership`,
        gradient: "from-green-50 to-green-100",
        fuel: plan === "elite" ? "infinite" : fuel,
        isElite: plan === "elite"
      }
    }

    // Handle inactive/cancelled states
    return {
      icon: <X className="h-5 w-5 text-red-500" />,
      buttonIcon: <AlertCircle className="h-4 w-4 text-red-500" />,
      label: status === "cancelled" ? "Cancelled" : "Inactive",
      color: "red",
      action: status === "cancelled" ? "Reactivate Premium" : "Renew Subscription",
      description: status === "cancelled" 
        ? "Your premium subscription has been cancelled"
        : "Your premium access is inactive",
      gradient: "from-red-50 to-red-100",
      fuel: fuel,
    }
  }

  if (!subscriptionStatus) return null

  const statusDetails = getStatusDetails()
  const fuelPercentage = statusDetails.fuel && statusDetails.fuel !== "infinite"
    ? Math.min(Math.max((statusDetails.fuel / 200) * 100, 0), 100)
    : 100

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-2 hover:scale-105 transition-transform duration-200 shadow-sm hover:shadow-md"
        >
          {statusDetails.buttonIcon}
          <span className="sr-only">Subscription Status</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-xl rounded-lg overflow-hidden">
        <div className={`p-4 bg-gradient-to-br ${statusDetails.gradient} rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg text-gray-600">Membership Status</h4>
            <Badge
              variant={
                statusDetails.color === "yellow" ? "warning" : 
                statusDetails.color === "red" ? "destructive" : 
                statusDetails.color === "gray" ? "secondary" : "success"
              }
              className="px-3 py-1 text-xs font-medium uppercase text-gray-600"
            >
              {statusDetails.label}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-3">
            {statusDetails.icon}
            <h5 className="text-sm text-gray-600">{statusDetails.description}</h5>
          </div>

          {statusDetails.fuel !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Fuel Balance</span>
                <span className="text-sm font-semibold text-indigo-600">
                  {statusDetails.isElite ? (
                    <div className="flex items-center">
                      <Infinity className="h-4 w-4 mr-1" />
                      <span>Unlimited</span>
                    </div>
                  ) : (
                    statusDetails.fuel.toFixed(1)
                  )}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${statusDetails.isElite ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'}`}
                  style={{ width: `${fuelPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {statusDetails.isElite ? "Unlimited fuel for all premium features" : "Available fuel for premium features"}
              </p>
            </div>
          )}

          {statusDetails.action && (
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
              onClick={() => navigate("/subscription")}
            >
              {statusDetails.action}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default RenderSubscription