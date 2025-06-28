"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export const useTheme = (defaultTheme = "light") => {
  const [theme, setTheme] = useState(defaultTheme)

  useEffect(() => {
    // Get theme from local storage on component mount
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme) {
      setTheme(storedTheme)
    } else {
      setTheme(defaultTheme)
    }
  }, [defaultTheme])

  useEffect(() => {
    // Update local storage when theme changes
    localStorage.setItem("theme", theme)
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  return { theme, toggleTheme }
}

export const ThemeProvider = ({ children, defaultTheme }) => {
  const { theme, toggleTheme } = useTheme(defaultTheme)

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useThemeContext = () => {
  return useContext(ThemeContext)
}

