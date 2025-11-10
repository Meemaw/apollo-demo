# Apollo GraphQL Demo

This is a demonstration of Apollo Client setup with GraphQL Code Generator for type-safe GraphQL queries.

## Features

- ✅ Apollo Client 4.x with React Suspense integration
- ✅ GraphQL Code Generator for TypeScript types
- ✅ Next.js API route proxy to avoid CORS issues
- ✅ Type-safe queries with full IntelliSense support
- ✅ React Suspense for automatic loading states
- ✅ WebSocket subscriptions for real-time updates
- ✅ Connects to OpenSea's internal GraphQL API

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Generate TypeScript Types

```bash
pnpm generate
```

This reads the GraphQL schema from `https://os2-graphql.prod.privatesea.io/graphql` and generates TypeScript types in `src/gql/`.

### 3. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see trending collections data.

## How It Works

### Apollo Client Setup

**File:** `src/lib/apollo-client.ts`

Creates an Apollo Client instance configured to use our local API proxy:

```typescript
export function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: "/api/graphql", // Local proxy
      credentials: "include",
    }),
    cache: new InMemoryCache(),
  })
}
```

### API Proxy

**File:** `src/app/api/graphql/route.ts`

A Next.js API route that proxies GraphQL requests to avoid CORS issues:

```typescript
export async function POST(request: NextRequest) {
  const response = await fetch(
    "https://os2-graphql.prod.privatesea.io/graphql",
    {
      method: "POST",
      headers: {
        /* ... */
      },
      body: await request.text(),
    },
  )
  return new NextResponse(await response.text())
}
```

### GraphQL Code Generator

**File:** `codegen.ts`

Configuration for generating types from the GraphQL schema:

```typescript
const config: CodegenConfig = {
  schema: "https://os2-graphql.prod.privatesea.io/graphql",
  documents: ["src/**/*.{ts,tsx}", "!src/gql/**/*"],
  generates: {
    "./src/gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
        gqlTagName: "gql",
      },
      // ... additional config
    },
  },
}
```

### Type-Safe Queries with Suspense

**File:** `src/components/TrendingCollections.tsx`

Uses the generated `gql` function for type-safe queries with React Suspense:

```typescript
import { gql } from "@apollo/client"
import { useSuspenseQuery } from "@apollo/client/react"

const TRENDING_COLLECTIONS_QUERY = gql`
  query TrendingCollectionsQuery($timeframe: Timeframe!, $limit: Int!) {
    trendingCollections(timeframe: $timeframe, limit: $limit) {
      items {
        ...CollectionCardList
      }
    }
  }
  ${COLLECTION_CARD_LIST_FRAGMENT}
`

const { data } = useSuspenseQuery(TRENDING_COLLECTIONS_QUERY, {
  variables: { timeframe: "ALL_TIME", limit: 10 },
})
// `data` is fully typed based on the query!
// Loading states handled by Suspense boundary
```

**Page with Suspense Boundary:**

```typescript
import { Suspense } from "react"

export default function Home() {
  return (
    <Suspense fallback={<TrendingCollectionsSkeleton />}>
      <TrendingCollections />
    </Suspense>
  )
}
```

## Benefits of This Setup

1. **Type Safety**: All GraphQL queries are fully typed. TypeScript knows exactly what fields exist and their types.

2. **IntelliSense**: Get autocomplete suggestions for all available fields when writing queries.

3. **Compile-Time Validation**: Invalid queries fail at build time, not runtime.

4. **Schema Sync**: Running `pnpm generate` keeps your types in sync with the backend schema.

5. **No Manual Types**: Types are automatically generated from the schema - no need to write them manually.

6. **React Suspense Integration**: `useSuspenseQuery` integrates with React Suspense for automatic loading states without manual `loading` checks.

7. **Real-time Updates**: WebSocket subscriptions provide live data updates with automatic cache management.

8. **Optimized Performance**: Apollo's InMemoryCache with normalized caching and automatic deduplication.

## Architecture Patterns

### Query Hooks with Suspense

All queries use `useSuspenseQuery` instead of `useQuery`:

- **No manual loading states**: Suspense boundaries handle loading UI
- **Automatic error boundaries**: Errors bubble up to error boundaries
- **Better UX**: Coordinated loading states across the app
- **Simpler code**: Components focus on rendering data, not loading states

### Subscriptions with Cache Updates

Real-time subscriptions update Apollo's cache directly:

```typescript
useSubscription(SUBSCRIPTION, {
  onData: ({ data }) => {
    // Update cache using writeQuery or cache.modify
    client.writeQuery({
      query: QUERY,
      data: updatedData,
    })
  },
})
```

No local state needed - UI automatically re-renders when cache updates!

## Development Workflow

### Option 1: Manual Generation (Recommended for Production)

1. Write your GraphQL query in your component
2. Run `pnpm generate` to generate/update types
3. Wrap components in Suspense boundaries with fallback UI
4. Use the typed `data` object with full IntelliSense support
5. If a field doesn't exist, you'll get a TypeScript error immediately

### Option 2: Watch Mode (Recommended for Development)

Run codegen in watch mode in a separate terminal:

```bash
pnpm generate:watch
```

Now types will auto-regenerate whenever you:

- Write a new GraphQL query
- Modify an existing query
- Change any `.ts` or `.tsx` file

Keep this running in a separate terminal while you develop, alongside `pnpm dev`.

### Typical Development Setup

```bash
# Terminal 1: Run dev server
pnpm dev

# Terminal 2: Run codegen in watch mode
pnpm generate:watch
```

## Schema Exploration

The generated types are in `src/gql/graphql.ts`. You can explore all available types, fields, and their relationships.

Key types:

- `Collection` - Collection data with stats, images, etc.
- `CollectionStats` - Statistics broken down by time periods
- `CollectionRollingStats` - Volume and sales for a time period
- `Volume` - Price volume data
