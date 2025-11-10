import type { RenderOptions } from "@testing-library/react"
import { render as rtlRender } from "@testing-library/react"
import { vi } from "vitest"

export const render = (ui: React.ReactElement, options?: RenderOptions) => {
  // Mock matchMedia for responsive components
  window.matchMedia =
    window.matchMedia ||
    vi.fn(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

  return rtlRender(ui, options)
}
