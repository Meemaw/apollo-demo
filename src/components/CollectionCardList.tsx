"use client";

import { type FragmentType, gql, type TypedDocumentNode } from "@apollo/client";
import { useFragment as readFragmentData, useSuspenseFragment } from "@apollo/client/react";
import { COLLECTION_CARD_FRAGMENT, CollectionCard } from "./CollectionCard";
import type { CollectionCardListFragment } from "./CollectionCardList.generated";

// Fragment that composes CollectionCard fragments
export const COLLECTION_CARD_LIST_FRAGMENT: TypedDocumentNode<CollectionCardListFragment> = gql`
  fragment CollectionCardList on Collection {
    id
    ...CollectionCard
  }
  ${COLLECTION_CARD_FRAGMENT}
`;

type Props = {
  collections: Array<FragmentType<CollectionCardListFragment>>;
};

export function CollectionCardList({ collections }: Props) {
  const { data } = useSuspenseFragment({
    from: collections,
    fragmentName: "CollectionCardList",
    fragment: COLLECTION_CARD_LIST_FRAGMENT,
  });

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => {
        return <CollectionCard collection={item} key={item.id} />;
      })}
    </div>
  );
}
