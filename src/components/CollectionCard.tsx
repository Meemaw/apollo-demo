"use client"

import { type FragmentType, gql, type TypedDocumentNode } from "@apollo/client"
import { useFragment } from "@apollo/client/react"
import type { CollectionCardFragment } from "./CollectionCard.generated"

// Fragment definition colocated with component
// Following Apollo docs: https://www.apollographql.com/docs/react/data/fragments#colocating-fragments
export const COLLECTION_CARD_FRAGMENT: TypedDocumentNode<CollectionCardFragment> = gql`
    fragment CollectionCard on Collection {
      id
      slug
      name
      imageUrl
      stats {
        oneDay {
          volume {
            native {
              unit
              symbol
            }
          }
          sales
        }
      }
    }
  `

type Props = {
  collection: FragmentType<CollectionCardFragment>
}

export function CollectionCard({ collection: collectionRef }: Props) {
  const collection = useFragment({
    from: collectionRef,
    fragment: COLLECTION_CARD_FRAGMENT,
  }).data

  return (
    <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      {collection.imageUrl ? (
        <div className="aspect-square w-full overflow-hidden bg-gray-100">
          <img
            alt={collection.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            src={collection.imageUrl}
          />
        </div>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <span className="text-4xl">🖼️</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="mb-2 truncate text-lg font-bold text-gray-900">
          {collection.name}
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>24h Volume:</span>
            <span className="font-medium text-gray-900">
              {collection.stats?.oneDay?.volume?.native?.unit
                ? `${Number(collection.stats.oneDay.volume.native.unit).toFixed(2)} ${collection.stats.oneDay.volume.native.symbol}`
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>24h Sales:</span>
            <span className="font-medium text-gray-900">
              {collection.stats?.oneDay?.sales !== undefined &&
              collection.stats?.oneDay?.sales !== null
                ? String(collection.stats.oneDay.sales)
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
