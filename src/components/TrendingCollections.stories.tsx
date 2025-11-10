import { ApolloClient, gql, InMemoryCache } from "@apollo/client"
import { SchemaLink } from "@apollo/client/link/schema"
import { ApolloProvider } from "@apollo/client/react"
import { addMocksToSchema } from "@graphql-tools/mock"
import { makeExecutableSchema } from "@graphql-tools/schema"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import React from "react"
import possibleTypesResult from "../__generated__/possible-types"
import { TrendingCollections } from "./TrendingCollections"

// Schema for the trending collections query
const typeDefs = gql`
  type Query {
    trendingCollections(
      timeframe: Timeframe!
      limit: Int!
    ): TrendingCollectionsConnection!
  }

  enum Timeframe {
    ALL_TIME
    ONE_DAY
    SEVEN_DAYS
    THIRTY_DAYS
  }

  type TrendingCollectionsConnection {
    items: [Collection!]!
  }

  type Collection {
    id: ID!
    slug: String!
    name: String!
    imageUrl: String
    stats: CollectionStats
  }

  type CollectionStats {
    oneDay: TimeWindowStats
  }

  type TimeWindowStats {
    volume: Volume
    sales: Int
  }

  type Volume {
    native: TokenPrice!
  }

  type TokenPrice {
    unit: Float!
    symbol: String!
  }
`

// Simple mock collection data
const MOCK_COLLECTIONS = [
  {
    id: "1",
    name: "Bored Ape Yacht Club",
    slug: "boredapeyachtclub",
    imageUrl:
      "https://i.seadn.io/gcs/files/a04fbd85806c87f77a45b8c2bd28726b.png",
  },
  {
    id: "2",
    name: "Pudgy Penguins",
    slug: "pudgypenguins",
    imageUrl:
      "https://i.seadn.io/gcs/files/58efc6f945ff198cfb1a4e57aeb5adb0.png",
  },
  {
    id: "3",
    name: "Azuki",
    slug: "azuki",
    imageUrl:
      "https://i.seadn.io/gcs/files/8586c8d72b5f94c3e6b77043d76df58e.png",
  },
  {
    id: "4",
    name: "Doodles",
    slug: "doodles",
    imageUrl:
      "https://i.seadn.io/s/raw/files/c91c80bd4e7e8d9c01ae4cbd87c54cd7.png",
  },
  {
    id: "5",
    name: "Milady",
    slug: "milady",
    imageUrl:
      "https://i.seadn.io/gcs/files/5a7e25ebdb904802241e63b93c5e0ab4.png",
  },
  {
    id: "6",
    name: "DeGods",
    slug: "degods",
    imageUrl:
      "https://i.seadn.io/gcs/files/54790f3d3c8cdad76a50d1bf8a0dab73.png",
  },
]

// Create mock Apollo client
function createMockClient(customResolvers = {}) {
  const schema = makeExecutableSchema({ typeDefs })

  const schemaWithMocks = addMocksToSchema({
    schema,
    resolvers: {
      Query: {
        trendingCollections: (_parent, args) => ({
          items: MOCK_COLLECTIONS.slice(0, args.limit || 10).map(
            collection => ({
              ...collection,
              stats: {
                oneDay: {
                  volume: {
                    native: {
                      unit: Number((Math.random() * 500 + 100).toFixed(2)),
                      symbol: "ETH",
                    },
                  },
                  sales: Math.floor(Math.random() * 200 + 50),
                },
              },
            }),
          ),
        }),
        ...customResolvers,
      },
    },
  })

  return new ApolloClient({
    link: new SchemaLink({ schema: schemaWithMocks }),
    cache: new InMemoryCache({
      possibleTypes: possibleTypesResult.possibleTypes,
    }),
  })
}

const meta = {
  title: "Components/TrendingCollections",
  component: TrendingCollections,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    Story => {
      const client = createMockClient()
      return (
        <ApolloProvider client={client}>
          <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-7xl">
              <Story />
            </div>
          </div>
        </ApolloProvider>
      )
    },
  ],
} satisfies Meta<typeof TrendingCollections>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Trending collections fetched with mocked GraphQL data using Apollo Client and GraphQL Testing Library.",
      },
    },
  },
}

export const Loading: Story = {
  decorators: [
    Story => {
      // Create a client that delays responses to show loading state
      const schema = makeExecutableSchema({ typeDefs })
      const schemaWithMocks = addMocksToSchema({ schema })

      const client = new ApolloClient({
        link: new SchemaLink({
          schema: schemaWithMocks,
        }),
        cache: new InMemoryCache({
          possibleTypes: possibleTypesResult.possibleTypes,
        }),
        // Force loading state for demonstration
        defaultOptions: {
          watchQuery: {
            fetchPolicy: "network-only",
          },
        },
      })

      return (
        <ApolloProvider client={client}>
          <Story />
        </ApolloProvider>
      )
    },
  ],
}
