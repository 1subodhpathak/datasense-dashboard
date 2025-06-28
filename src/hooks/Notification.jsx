"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

export default function Notification({
  message = "",
  type = "info", // "success", "error", "warning", "info"
  duration = 5000, // Time in ms before auto-dismiss, 0 for no auto-dismiss
  onClose = () => {},
  isVisible = false,
}) {
  const [visible, setVisible] = useState(isVisible)

  useEffect(() => {
    setVisible(isVisible)

    // Auto-dismiss after duration if specified
    let timer
    if (isVisible && duration > 0) {
      timer = setTimeout(() => {
        setVisible(false)
        onClose()
      }, duration)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const handleClose = () => {
    setVisible(false)
    onClose()
  }

  if (!visible) return null

  // Define styles based on notification type
  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-800",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-800",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      text: "text-yellow-800",
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-800",
      icon: <Info className="h-5 w-5 text-blue-500" />,
    },
  }

  const currentStyle = styles[type] || styles.info

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-2">
      <div
        className={`flex items-start gap-3 rounded-lg border p-4 shadow-sm ${currentStyle.bg} ${currentStyle.border}`}
      >
        <div className="flex-shrink-0">{currentStyle.icon}</div>
        <div className={`flex-1 ${currentStyle.text}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-200"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

