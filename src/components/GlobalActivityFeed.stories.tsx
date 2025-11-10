import { ApolloClient, ApolloLink, gql, InMemoryCache } from "@apollo/client"
import { SchemaLink } from "@apollo/client/link/schema"
import { ApolloProvider } from "@apollo/client/react"
import { addMocksToSchema } from "@graphql-tools/mock"
import { makeExecutableSchema } from "@graphql-tools/schema"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import React, { useState } from "react"
import possibleTypesResult from "../__generated__/possible-types"
import { MockSubscriptionLink } from "../lib/mock-subscription-link"
import { GlobalActivityFeed } from "./GlobalActivityFeed"

// Schema for activity feed
const typeDefs = gql`
  type Query {
    globalActivity(
      limit: Int!
      filter: GlobalActivityFilterInput
    ): ActivityConnection!
  }

  type Subscription {
    globalActivity(filter: GlobalActivityFilterInput): Activity!
  }

  input GlobalActivityFilterInput {
    activityTypes: [ActivityType!]
  }

  enum ActivityType {
    SALE
    LISTING
    TRANSFER
    MINT
    OFFER
    COLLECTION_OFFER
    TRAIT_OFFER
  }

  type ActivityConnection {
    items: [Activity!]!
  }

  union Activity = Sale | Listing | Transfer | Mint | Offer

  type Sale {
    id: ID!
    eventTime: String!
    type: ActivityType!
    collection: Collection
    item: Item
    price: Price!
    from: Profile!
    to: Profile!
  }

  type Listing {
    id: ID!
    eventTime: String!
    type: ActivityType!
    collection: Collection
    item: Item
    price: Price!
    from: Profile!
    to: Profile
  }

  type Transfer {
    id: ID!
    eventTime: String!
    type: ActivityType!
    collection: Collection
    item: Item
    price: Price
    from: Profile!
    to: Profile!
  }

  type Mint {
    id: ID!
    eventTime: String!
    type: ActivityType!
    collection: Collection
    item: Item
    price: Price
    from: Profile!
    to: Profile!
  }

  type Offer {
    id: ID!
    eventTime: String!
    type: ActivityType!
    collection: Collection
    item: Item
    price: Price!
    from: Profile!
    to: Profile
  }

  type Collection {
    name: String!
    imageUrl: String
  }

  type Item {
    name: String!
    imageUrl: String
  }

  type Price {
    native: TokenPrice!
  }

  type TokenPrice {
    unit: Float!
    symbol: String!
  }

  type Profile {
    address: String!
  }
`

// Mock initial activity data
const createMockActivity = (id: number, typename: string, type: string) => ({
  __typename: typename,
  id: `activity-${id}`,
  eventTime: new Date(Date.now() - id * 60_000).toISOString(),
  type, // Enum value (SALE, LISTING, etc.)
  collection: {
    name: `Collection ${id}`,
    imageUrl: `https://picsum.photos/seed/col${id}/100/100`,
  },
  item: {
    name: `Item #${id}`,
    imageUrl: `https://picsum.photos/seed/item${id}/100/100`,
  },
  price: {
    native: {
      unit: Number((Math.random() * 5).toFixed(4)),
      symbol: "ETH",
    },
  },
  from: {
    address: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, "0")}`,
  },
  to: {
    address: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, "0")}`,
  },
})

const INITIAL_ACTIVITIES = [
  createMockActivity(1, "Sale", "SALE"),
  createMockActivity(2, "Listing", "LISTING"),
  createMockActivity(3, "Transfer", "TRANSFER"),
  createMockActivity(4, "Mint", "MINT"),
  createMockActivity(5, "Sale", "SALE"),
]

// Extract query to avoid duplication
const GLOBAL_ACTIVITY_QUERY_FOR_CACHE = gql`
  query GlobalActivityStoryQuery($limit: Int!, $filter: GlobalActivityFilterInput) {
    globalActivity(limit: $limit, filter: $filter) {
      items {
        __typename
        id
        eventTime
        type
        collection {
          name
          imageUrl
        }
        item {
          name
          imageUrl
        }
        price {
          native {
            unit
            symbol
          }
        }
        from {
          address
        }
        to {
          address
        }
      }
    }
  }
`

// Wrapper component that simulates subscription updates via actual observable events
function GlobalActivityFeedWithMockSubscription() {
  const [counter, setCounter] = useState(100)
  const [mockSubLink] = useState(() => new MockSubscriptionLink())

  const [client] = useState(() => {
    const schema = makeExecutableSchema({ typeDefs })

    const schemaWithMocks = addMocksToSchema({
      schema,
      resolvers: {
        Query: {
          globalActivity: (_parent, args) => {
            console.log("📊 Query called with args:", args)
            const result = {
              items: INITIAL_ACTIVITIES,
            }
            console.log("📊 Returning initial activities:", result)
            return result
          },
        },
      },
    })

    // Combine SchemaLink (for queries) with MockSubscriptionLink (for subscriptions)
    const link = ApolloLink.from([
      mockSubLink,
      new SchemaLink({ schema: schemaWithMocks }),
    ])

    return new ApolloClient({
      link,
      cache: new InMemoryCache({
        possibleTypes: possibleTypesResult.possibleTypes,
      }),
    })
  })

  const addNewActivity = () => {
    const activityTypes = [
      { typename: "Sale", enumValue: "SALE" },
      { typename: "Listing", enumValue: "LISTING" },
      { typename: "Transfer", enumValue: "TRANSFER" },
      { typename: "Mint", enumValue: "MINT" },
      { typename: "Offer", enumValue: "OFFER" },
    ]
    const randomActivity =
      activityTypes[Math.floor(Math.random() * activityTypes.length)]
    const newActivity = createMockActivity(
      counter,
      randomActivity.typename,
      randomActivity.enumValue,
    )

    console.log("🔄 Triggering mock subscription event:", newActivity)
    setCounter(prev => prev + 1)

    /**
     * Trigger actual subscription observable event
     * This simulates a real WebSocket message, NOT just writing to cache!
     * The subscription's onData callback will handle the cache update.
     */
    mockSubLink.triggerSubscription("GlobalActivitySubscription", {
      globalActivity: newActivity as Record<string, unknown>,
    } as Record<string, unknown>)
  }

  return (
    <ApolloProvider client={client}>
      <div className="space-y-4">
        <div className="flex justify-center">
          <button
            className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700"
            onClick={addNewActivity}
            type="button"
          >
            🔄 Simulate New Activity (Triggers Subscription Event)
          </button>
        </div>
        <GlobalActivityFeed />
      </div>
    </ApolloProvider>
  )
}

const meta = {
  title: "Components/GlobalActivityFeed",
  component: GlobalActivityFeed,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    Story => (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof GlobalActivityFeed>

export default meta
type Story = StoryObj<typeof meta>

export const WithMockSubscription: Story = {
  render: () => <GlobalActivityFeedWithMockSubscription />,
  parameters: {
    docs: {
      description: {
        story:
          "Click the button to simulate subscription events that add new activities to Apollo's cache. Demonstrates client.writeQuery() for directly updating cached data without local state.",
      },
    },
  },
}
