import {useEffect, useState} from "react";


/**
 * React hook for the system theme (dark or light mode).
 *
 * @return 'light' or 'dark'
 */
export const useSystemTheme = () => {
  const [theme, setTheme] = useState(
      () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  )

  useEffect(() => {
    if (window.matchMedia) {
      const matcher = window.matchMedia("(prefers-color-scheme: dark)")
      setTheme(matcher.matches ? "dark" : "light")

      const changeListener = (evt) => {
        setTheme(evt.matches ? "dark" : "light")
      }

      matcher.addEventListener('change', changeListener)
      return () => {
        matcher.removeEventListener("change", changeListener)
      }
    }
  }, [])

  return theme
}