import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://os2-graphql.prod.privatesea.io/graphql",
  documents: ["src/**/*.{ts,tsx}"],
  ignoreNoDocuments: true,
  generates: {
    "./src/__generated__/graphql.ts": {
      plugins: ["typescript"],
      config: {
        enumsAsTypes: true,
      },
    },
    // Generate schema introspection for mocking
    "./src/__generated__/graphql.schema.json": {
      plugins: ["introspection"],
    },
    // Generate possibleTypes automatically from schema
    // Following Apollo docs: https://www.apollographql.com/docs/react/data/fragments#generating-possibletypes-automatically
    "./src/__generated__/possible-types.ts": {
      plugins: ["fragment-matcher"],
    },
    "./src/": {
      preset: "near-operation-file",
      presetConfig: {
        baseTypesPath: "./__generated__/graphql.ts",
      },
      plugins: ["typescript-operations"],
      config: {
        enumsAsTypes: true,
        avoidOptionals: {
          field: true,
          inputValue: false,
        },
        defaultScalarType: "unknown",
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
        inlineFragmentTypes: "mask",
        customDirectives: {
          apolloUnmask: true,
        },
        scalars: {
          DateTime: 'string',
          Address: 'string'
        }
      },
    },
  },
}

export default config
