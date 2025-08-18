import type React from "react"
import Header from "./Header"
import Navigation from "./Navigation"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app">
      <Header />
      <Navigation />
      <main className="main-content">
        <div className="container">{children}</div>
      </main>
    </div>
  )
}

export default Layout
