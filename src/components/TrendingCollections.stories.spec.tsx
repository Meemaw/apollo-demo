import { composeStories } from "@storybook/react"
import { screen, waitFor } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { render } from "../tests/render"
import * as stories from "./TrendingCollections.stories"

const { Default } = composeStories(stories)

describe("TrendingCollections Story", () => {
  test("renders Bored Ape Yacht Club collection", async () => {
    render(<Default />)

    await waitFor(
      () => {
        expect(screen.getByText("Bored Ape Yacht Club")).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })

  test("displays collection stats labels", async () => {
    render(<Default />)

    await waitFor(
      () => {
        const volumeLabels = screen.getAllByText(/24h Volume:/i)
        expect(volumeLabels.length).toBeGreaterThan(0)
      },
      { timeout: 5000 },
    )
  })

  test("shows Apollo useQuery info banner", async () => {
    render(<Default />)

    await waitFor(
      () => {
        expect(screen.getByText("Simple useQuery Hook")).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })
})
