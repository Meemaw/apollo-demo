import { ApolloLink, Observable } from "@apollo/client"

/**
 * MockSubscriptionLink allows programmatic triggering of subscription events
 * This is the proper way to test subscriptions - simulating actual observable events
 * rather than just writing to cache.
 */
export class MockSubscriptionLink extends ApolloLink {
  // biome-ignore lint/suspicious/noExplicitAny: add proper typing
  private observers = new Map<string, any>()

  request(
    operation: ApolloLink.Operation,
    forward: (op: ApolloLink.Operation) => Observable<ApolloLink.Result>,
  ): Observable<ApolloLink.Result> {
    // Only handle subscriptions - forward everything else
    if (
      operation.query.definitions[0]?.kind === "OperationDefinition" &&
      operation.query.definitions[0]?.operation === "subscription"
    ) {
      return new Observable(observer => {
        const key = operation.operationName || "subscription"
        this.observers.set(key, observer)

        return () => {
          this.observers.delete(key)
        }
      })
    }
    return forward(operation)
  }

  /**
   * Trigger a subscription event with data
   * This simulates what would happen when a real WebSocket message arrives
   */
  triggerSubscription(operationName: string, data: Record<string, unknown>) {
    const observer = this.observers.get(operationName)
    if (observer) {
      observer.next({ data })
    } else {
      console.warn(`No observer found for subscription: ${operationName}`)
    }
  }

  /**
   * Trigger an error on a subscription
   */
  triggerError(operationName: string, error: Error) {
    const observer = this.observers.get(operationName)
    if (observer) {
      observer.error(error)
    }
  }
}
