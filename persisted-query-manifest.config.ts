import { PersistedQueryManifestConfig } from "@apollo/generate-persisted-query-manifest";
import { createHmac } from "node:crypto";


const GRAPHQL_SIGNING_KEY =
  process.env.GRAPHQL_SIGNING_KEY || "46QDay7XQacqSrVb"

function generateQuerySignature(query: string): string {
  const hmac = createHmac("sha256", GRAPHQL_SIGNING_KEY)
  return hmac.update(query).digest("hex")
}

const config: PersistedQueryManifestConfig = {
  output: "./src/__generated__/persisted-query-manifest.json",
  createOperationId: (query) => generateQuerySignature(query)
};

export default config;
