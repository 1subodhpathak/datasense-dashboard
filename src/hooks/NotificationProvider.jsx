"use client"

import { createContext, useContext, useState } from "react"
import Notification from "./Notification"

// Create context
const NotificationContext = createContext()

// Provider component
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  // Add a new notification
  const showNotification = ({ message, type = "info", duration = 5000 }) => {
    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { id, message, type, duration }])
    return id
  }

  // Remove a notification by id
  const hideNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Convenience methods for different notification types
  const showSuccess = (message, duration) => showNotification({ message, type: "success", duration })
  const showError = (message, duration) => showNotification({ message, type: "error", duration })
  const showWarning = (message, duration) => showNotification({ message, type: "warning", duration })
  const showInfo = (message, duration) => showNotification({ message, type: "info", duration })

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        hideNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <div className="notification-container">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            isVisible={true}
            onClose={() => hideNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

// Custom hook to use the notification context
export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

