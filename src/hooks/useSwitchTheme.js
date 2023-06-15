import { darkTheme } from "@/styles/dark"
import { lightTheme } from "@/styles/light"

export const setCssVar = (isDark) => {
  const theme = isDark === 'dark' ? darkTheme : lightTheme
  Object.entries(theme).forEach(([name, value]) => {
    document.documentElement.style.setProperty(name, value)
  })
  if (isDark === 'dark') {
    localStorage.setItem('chatTheme', 'dark')
    document.documentElement.classList.add('dark')
  } else {
    localStorage.setItem('chatTheme', 'light')
    document.documentElement.classList.remove('dark')
  }
}