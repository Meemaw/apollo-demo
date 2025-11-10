"use client";

import { gql } from "@apollo/client";
import {
  useApolloClient,
  useSubscription,
  useSuspenseQuery,
} from "@apollo/client/react";
import { useState } from "react";
import { useAccumulateBatch } from "@/hooks/use-accomulate-batch";
import { ACTIVITY_ROW_FRAGMENT, ActivityRow } from "./ActivityRow";
import { ActivityType, ActivityTypeFilter } from "./ActivityTypeFilter";
import type {
  GlobalActivityQueryQuery,
  GlobalActivityQueryQueryVariables,
  GlobalActivitySubscriptionSubscription,
  GlobalActivitySubscriptionSubscriptionVariables,
} from "./GlobalActivityFeed.generated";

// Query to fetch initial activity
const GLOBAL_ACTIVITY_QUERY = gql`
  query GlobalActivityQuery($limit: Int!, $filter: GlobalActivityFilterInput) {
    globalActivity(limit: $limit, filter: $filter) {
      items {
        id
        type
        ...ActivityRow
      }
    }
  }
  ${ACTIVITY_ROW_FRAGMENT}
`;

// Subscription for real-time updates
const GLOBAL_ACTIVITY_SUBSCRIPTION = gql`
  subscription GlobalActivitySubscription($filter: GlobalActivityFilterInput) {
    globalActivity(filter: $filter) {
      id
      type
      ...ActivityRow
    }
  }
  ${ACTIVITY_ROW_FRAGMENT}
`;

type Activity = NonNullable<
  GlobalActivityQueryQuery["globalActivity"]
>["items"][number];

export function GlobalActivityFeed() {
  const client = useApolloClient();
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "connecting" | "connected" | "error"
  >("connecting");
  const [selectedActivityType, setSelectedActivityType] =
    useState<ActivityType>(null);

  // Build filter object (casting to proper ActivityType)
  const filter = selectedActivityType
    ? { activityTypes: [selectedActivityType] }
    : undefined;

  // Step 1: Fetch initial activity data
  const { data: queryData, refetch } = useSuspenseQuery<
    GlobalActivityQueryQuery,
    GlobalActivityQueryQueryVariables
  >(GLOBAL_ACTIVITY_QUERY, {
    variables: { limit: 20, filter },
  });

  // Refetch when filter changes
  const handleFilterChange = async (newType: ActivityType) => {
    setSelectedActivityType(newType);
    setSubscriptionStatus("connecting");
    const newFilter = newType ? { activityTypes: [newType] } : undefined;
    await refetch({ limit: 20, filter: newFilter });
  };

  // Step 2: Subscribe to real-time updates
  // Use useAccumulateBatch to batch incoming activities and update cache efficiently
  const updateCache = useAccumulateBatch<Activity>(
    (activities) => {
      // Write new activities to cache - type policy will handle merging and deduplication
      // TypeScript doesn't understand that fragment-masked types are compatible with full types,
      // but Apollo handles this correctly at runtime since the fragments contain all required data
      client.cache.modify({
        fields: {
          globalActivity(
            existingActivityConnection = {
              __typename: "ActivityConnection",
              items: [],
            }
          ) {
            return {
              ...existingActivityConnection,
              items: [
                activities.map((activity) => ({
                  id: activity.id,
                  __typename: activity.__typename,
                })),
                ...existingActivityConnection.items,
              ],
            };
          },
        },
      });
    },
    { leading: true, delay: 2000, resetKey: JSON.stringify(filter) }
  );

  // Following Apollo docs: https://www.apollographql.com/docs/react/data/subscriptions
  const { error: subscriptionError } = useSubscription<
    GlobalActivitySubscriptionSubscription,
    GlobalActivitySubscriptionSubscriptionVariables
  >(GLOBAL_ACTIVITY_SUBSCRIPTION, {
    variables: { filter },
    shouldResubscribe: true, // Automatically resubscribe on error/disconnect
    onComplete: () => {
      setSubscriptionStatus("connected");
    },
    onError: () => {
      setSubscriptionStatus("error");
    },
    ignoreResults: true,
    onData: ({ data }) => {
      if (data?.data?.globalActivity) {
        console.log("🔄 Subscription data:", data);
        const newActivity = data.data.globalActivity;
        setSubscriptionStatus("connected");

        // Pass activity to batch accumulator instead of directly updating cache
        updateCache(newActivity);
      }
    },
  });

  const error = subscriptionError;

  // Read activities directly from Apollo cache (no local state!)
  const activities = queryData?.globalActivity?.items || [];

  // Determine overall status
  const isConnected = subscriptionStatus === "connected";
  const hasError = !!error;

  return (
    <div className="space-y-6">
      {/* Activity Type Filter */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <ActivityTypeFilter
          onChange={handleFilterChange}
          value={selectedActivityType}
        />
      </div>

      {/* Connection Status Banner */}
      <div
        className={`rounded-lg border p-4 ${
          hasError
            ? "border-red-200 bg-red-50"
            : isConnected
            ? "border-green-200 bg-green-50"
            : "border-yellow-200 bg-yellow-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
              hasError
                ? "bg-red-600"
                : isConnected
                ? "bg-green-600"
                : "bg-yellow-600"
            } text-white`}
          >
            {hasError ? (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ) : isConnected ? (
              <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
            ) : (
              <div className="h-2 w-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
          </div>
          <div className="flex-1">
            <h4
              className={`font-semibold ${
                hasError
                  ? "text-red-900"
                  : isConnected
                  ? "text-green-900"
                  : "text-yellow-900"
              }`}
            >
              {hasError
                ? "Connection Error"
                : isConnected
                ? "Live Activity Feed"
                : "Connecting..."}
            </h4>
            <p
              className={`mt-1 text-sm ${
                hasError
                  ? "text-red-800"
                  : isConnected
                  ? "text-green-800"
                  : "text-yellow-800"
              }`}
            >
              {hasError ? (
                <div className="space-y-2">
                  <p className="font-medium">Connection Error</p>
                  <p>{error?.message || "Unknown error"}</p>
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium hover:underline">
                      Debug Info
                    </summary>
                    <div className="mt-2 space-y-1 rounded bg-red-100 p-2">
                      <p>
                        WebSocket URL:
                        wss://os2-wss.prod.privatesea.io/subscriptions
                      </p>
                      <p>
                        Error Type:{" "}
                        {subscriptionError ? "Subscription" : "Query"}
                      </p>
                      <p className="break-all">
                        Full Error: {JSON.stringify(error, null, 2)}
                      </p>
                    </div>
                  </details>
                </div>
              ) : isConnected ? (
                <>
                  <span className="font-medium">Step 1:</span>{" "}
                  <code className="rounded bg-green-100 px-1 py-0.5">
                    useSuspenseQuery
                  </code>{" "}
                  fetches initial data into Apollo cache (Suspense handles
                  loading). <span className="font-medium">Step 2:</span>{" "}
                  <code className="rounded bg-green-100 px-1 py-0.5">
                    useSubscription
                  </code>{" "}
                  receives real-time events.{" "}
                  <span className="font-medium">Step 3:</span>{" "}
                  <code className="rounded bg-green-100 px-1 py-0.5">
                    useAccumulateBatch
                  </code>{" "}
                  batches updates. <span className="font-medium">Step 4:</span>{" "}
                  <code className="rounded bg-green-100 px-1 py-0.5">
                    cache.modify + type policies
                  </code>{" "}
                  handle deduplication automatically!
                  {activities.length > 0 && (
                    <span className="ml-2 font-medium">
                      ({activities.length} cached events)
                    </span>
                  )}
                </>
              ) : (
                <>Establishing WebSocket connection for real-time updates...</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
            <p className="text-gray-600">
              No activity yet. The feed will update automatically when events
              occur.
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityRow activity={activity} key={activity.id} />
          ))
        )}
      </div>
    </div>
  );
}
