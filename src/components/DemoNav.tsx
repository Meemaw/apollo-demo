"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  href: string
  label: string
  description: string
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Simple Query",
    description: "Basic GraphQL query with useSuspenseQuery",
  },
  {
    href: "/pagination",
    label: "Pagination",
    description: "Cursor-based pagination example",
  },
  {
    href: "/subscriptions",
    label: "Activity Feed",
    description: "Real-time activity feed with subscriptions",
  },
  {
    href: "/collection-stats",
    label: "Collection Stats",
    description: "Real-time collection stats updates",
  },
]

export function DemoNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Apollo GraphQL Demo
            </h1>
          </div>
          <div className="flex space-x-4">
            {navItems.map(item => {
              const isActive = pathname === item.href
              return (
                <Link
                  className={`group relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  href={item.href}
                  key={item.href}
                  title={item.description}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 scale-x-0 bg-blue-600 transition-transform group-hover:scale-x-100" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
