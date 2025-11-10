/**
 * Simplified Paginator for Apollo demo
 * Based on the web app's Paginator class pattern
 */

type SortBy = "CREATED_DATE" | "PRICE" | "LAST_SALE_DATE"
type SortDirection = "ASC" | "DESC"

type Sort = {
  by: SortBy
  direction: SortDirection
}

// Using any for flexibility to match GraphQL generated types
// biome-ignore lint/suspicious/noExplicitAny: Needed for Apollo cache compatibility
type Item = any

type Value = string | number | Date | undefined

/**
 * ItemPaginator handles inserting/updating items in a sorted list.
 * Used by subscriptions to maintain correct sort order when items update.
 */
export class ItemPaginator {
  /**
   * Get sortable values from an item based on sort field
   * Matching web app's ItemPaginator.getValues() logic
   */
  private getValues(item: Item, sortBy: SortBy | undefined): Value[] {
    switch (sortBy) {
      case "CREATED_DATE":
        return [
          typeof item.createdAt === "string" ? item.createdAt : undefined,
          item.id,
        ]
      case "PRICE":
        return [
          // Don't render price for compromised items - put them at the end
          item.enforcement?.isCompromised
            ? undefined
            : item.bestListing?.pricePerItem?.token?.unit,
          item.id,
        ]
      case "LAST_SALE_DATE":
        return [
          typeof item.lastSaleAt === "string" ? item.lastSaleAt : undefined,
          item.id,
        ]
      case undefined:
        return [item.id]
      default:
        return [item.id]
    }
  }

  /**
   * Compare two value arrays based on sort direction
   */
  private compare(
    a: Value[],
    b: Value[],
    direction: SortDirection | undefined,
  ): number {
    const multiplier = direction === "DESC" ? -1 : 1

    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const aVal = a[i]
      const bVal = b[i]

      // Handle undefined values (put them at the end)
      if (aVal === undefined && bVal === undefined) {
        continue
      }
      if (aVal === undefined) {
        return 1
      }
      if (bVal === undefined) {
        return -1
      }

      // Compare values
      if (aVal < bVal) {
        return -1 * multiplier
      }
      if (aVal > bVal) {
        return 1 * multiplier
      }
    }

    return 0
  }

  /**
   * Insert or update an item in a sorted list
   */
  public insertInOrder(item: Item, items: Item[], sort: Sort): Item[] {
    // Remove existing item with same ID if present
    const filteredItems = items.filter(i => i.id !== item.id)

    // Find insertion point based on sort
    const itemValues = this.getValues(item, sort.by)
    let insertIndex = filteredItems.length

    for (let i = 0; i < filteredItems.length; i++) {
      const currentValues = this.getValues(filteredItems[i], sort.by)
      if (this.compare(itemValues, currentValues, sort.direction) < 0) {
        insertIndex = i
        break
      }
    }

    // Insert at the correct position
    const result = [...filteredItems]
    result.splice(insertIndex, 0, item)
    return result
  }

  /**
   * Remove an item from the list
   */
  public remove(item: Item, items: Item[]): Item[] {
    return items.filter(i => i.id !== item.id)
  }
}

export const itemPaginator = new ItemPaginator()
