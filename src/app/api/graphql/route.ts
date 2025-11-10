import { type NextRequest, NextResponse } from "next/server"

const GRAPHQL_API_URL = "https://os2-graphql.prod.privatesea.io/graphql"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    const response = await fetch(GRAPHQL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": "apollo-demo",
        "user-agent": "OpenSea/Apollo-Demo",
      },
      body,
    })

    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("GraphQL proxy error:", error)
    return NextResponse.json(
      { error: "Failed to fetch from GraphQL API" },
      { status: 500 },
    )
  }
}
