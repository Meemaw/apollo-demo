import { composeStories } from "@storybook/react"
import { screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { render } from "../tests/render"
import * as stories from "./GlobalActivityFeed.stories"

const { WithMockSubscription } = composeStories(stories)

describe("GlobalActivityFeed Story", () => {
  test("displays initial activities from query", async () => {
    render(<WithMockSubscription />)

    // Wait for initial activities to load
    await waitFor(
      () => {
        // Should have the simulate button
        const button = screen.getByRole("button", {
          name: /Simulate New Activity/i,
        })
        expect(button).toBeInTheDocument()

        // Should have 5 initial activities
        const activities = screen.getAllByText(/Item #/i)
        expect(activities.length).toBe(5)
      },
      { timeout: 5000 },
    )
  })

  test("adds new activity when simulate button is clicked", async () => {
    const user = userEvent.setup()
    render(<WithMockSubscription />)

    // Wait for initial load
    await waitFor(
      () => {
        expect(screen.getAllByText(/Item #/i).length).toBe(5)
      },
      { timeout: 5000 },
    )

    // Get initial count
    const initialActivities = screen.getAllByText(/Item #/i)
    const initialCount = initialActivities.length

    // Click the simulate button
    const button = screen.getByRole("button", {
      name: /Simulate New Activity/i,
    })
    await user.click(button)

    // Wait for new activity to appear
    await waitFor(
      () => {
        const currentActivities = screen.getAllByText(/Item #/i)
        expect(currentActivities.length).toBe(initialCount + 1)
      },
      { timeout: 3000 },
    )
  })

  test("can add multiple activities via button clicks", async () => {
    const user = userEvent.setup()
    render(<WithMockSubscription />)

    // Wait for initial load
    await waitFor(
      () => {
        expect(screen.getAllByText(/Item #/i).length).toBe(5)
      },
      { timeout: 5000 },
    )

    // Click button 3 times
    const button = screen.getByRole("button", {
      name: /Simulate New Activity/i,
    })

    await user.click(button)
    await user.click(button)
    await user.click(button)

    // Should now have 8 activities (5 initial + 3 new)
    await waitFor(
      () => {
        const activities = screen.getAllByText(/Item #/i)
        expect(activities.length).toBe(8)
      },
      { timeout: 3000 },
    )
  })
})
