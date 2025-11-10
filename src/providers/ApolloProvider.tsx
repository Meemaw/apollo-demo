"use client"
import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs"
import { createApolloClient } from "@/lib/apollo-client"

type Props = {
  children: React.ReactNode
}

export function ApolloProvider({ children }: Props) {
  return (
    <ApolloNextAppProvider makeClient={createApolloClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
