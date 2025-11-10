"use client"

import { type FragmentType, gql, type TypedDocumentNode } from "@apollo/client"
import { useFragment } from "@apollo/client/react"
import type { ItemCardFragment } from "./ItemCard.generated"

// Fragment definition colocated with component
// Following Apollo docs: https://www.apollographql.com/docs/react/data/fragments#colocating-fragments
export const ITEM_CARD_FRAGMENT: TypedDocumentNode<ItemCardFragment> = gql`
  fragment ItemCard on Item {
    id
    name
    imageUrl
    chain {
      identifier
    }
    createdAt
    lastSaleAt
    lastTransferAt
    bestListing {
      pricePerItem {
        token {
          unit
        }
      }
      startTime
    }
    bestOffer {
      pricePerItem {
        usd
        token {
          unit
        }
      }
    }
    rarity {
      rank
    }
    enforcement {
      isDelisted
      isCompromised
    }
    lastSale {
      native {
        unit
      }
    }
  }
`

type Props = {
  item: FragmentType<ItemCardFragment>
}

export function ItemCard({ item: itemRef }: Props) {
  const { data: item } = useFragment({
    fragment: ITEM_CARD_FRAGMENT,
    from: itemRef,
  })
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {item.imageUrl ? (
        <div className="aspect-square w-full bg-gray-100">
          <img
            alt={item.name || "Item"}
            className="h-full w-full object-cover"
            src={item.imageUrl}
          />
        </div>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-gray-100">
          <span className="text-gray-400">No image</span>
        </div>
      )}
      <div className="p-4">
        <h4 className="truncate font-medium text-gray-900">
          {item.name || "Unnamed Item"}
        </h4>
        <p className="mt-1 text-sm text-gray-500">
          {String(item.chain?.identifier ?? "Unknown chain")}
        </p>
      </div>
    </div>
  )
}
