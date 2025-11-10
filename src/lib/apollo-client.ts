import { ApolloLink, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { createClient } from "graphql-ws";
import possibleTypesResult from "../__generated__/possible-types";
import { PersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { generatePersistedQueryIdsFromManifest } from "@apollo/persisted-query-lists";

// Use the Next.js API route proxy to avoid CORS issues
const GRAPHQL_API_URL =
  typeof window === "undefined"
    ? "https://gql.opensea.io/graphql"
    : process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "/api/graphql";

// WebSocket URL for subscriptions (matches web app configuration)
const GRAPHQL_WS_BASE_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_WS_BASE_URL ||
  "wss://os2-wss.prod.privatesea.io";
const GRAPHQL_WS_URL = `${GRAPHQL_WS_BASE_URL}/subscriptions`;

export function createApolloClient() {
  const persistedQueryLink = new PersistedQueryLink(
    generatePersistedQueryIdsFromManifest({
      loadManifest: () =>
        import("../__generated__/persisted-query-manifest.json"),
    })
  );

  // HTTP link for queries and mutations
  const httpLink = persistedQueryLink.concat(
    new HttpLink({
      uri: GRAPHQL_API_URL,
      credentials: "include",
    })
  );

  // WebSocket link for subscriptions (only on client)
  // Following Apollo docs: https://www.apollographql.com/docs/react/data/subscriptions
  // Note: No connectionParams needed - just the URL (matching web app config)
  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url: GRAPHQL_WS_URL,
          })
        )
      : null;

  // Split link: use WebSocket for subscriptions, HTTP for queries/mutations
  const link =
    typeof window !== "undefined" && wsLink
      ? ApolloLink.split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === "OperationDefinition" &&
              definition.operation === "subscription"
            );
          },
          wsLink,
          httpLink
        )
      : httpLink;

  return new ApolloClient({
    link,
    cache: new InMemoryCache({
      // Configure possibleTypes for union/interface types
      // Auto-generated from schema introspection
      // Following Apollo docs: https://www.apollographql.com/docs/react/data/fragments#generating-possibletypes-automatically
      possibleTypes: possibleTypesResult.possibleTypes,
      typePolicies: {
        ActivityConnection: {
          fields: {
            items: {
              // Custom merge function to prepend new items and deduplicate
              // Optimized for performance with O(n) time complexity
              merge(existing = [], incoming = []) {
                if (incoming.length === 0) {
                  return existing;
                }
                if (existing.length === 0) {
                  return incoming;
                }

                // Build Set from existing refs for O(1) lookup
                const existingRefs = new Set<string>();
                for (const item of existing) {
                  existingRefs.add((item as { __ref: string }).__ref);
                }

                // Filter duplicates and build result array in single pass
                const result = [];
                for (const item of incoming) {
                  const ref = (item as { __ref: string }).__ref;
                  if (!existingRefs.has(ref)) {
                    result.push(item);
                  }
                }

                // Only create new array if we have new items
                if (result.length === 0) {
                  return existing;
                }

                // Prepend new items to existing
                return result.concat(existing);
              },
            },
          },
        },
      },
    }),
  });
}
