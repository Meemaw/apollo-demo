"use client"

type SortOption = {
  label: string
  value: string
  sortBy: "CREATED_DATE" | "PRICE" | "LAST_SALE_DATE"
  direction: "ASC" | "DESC"
}

const sortOptions: SortOption[] = [
  {
    label: "Recently Created",
    value: "recently_created",
    sortBy: "CREATED_DATE",
    direction: "DESC",
  },
  {
    label: "Oldest",
    value: "oldest",
    sortBy: "CREATED_DATE",
    direction: "ASC",
  },
  {
    label: "Price: Low to High",
    value: "price_low_to_high",
    sortBy: "PRICE",
    direction: "ASC",
  },
  {
    label: "Price: High to Low",
    value: "price_high_to_low",
    sortBy: "PRICE",
    direction: "DESC",
  },
  {
    label: "Recently Sold",
    value: "recently_sold",
    sortBy: "LAST_SALE_DATE",
    direction: "DESC",
  },
]

type Props = {
  value: string
  onChange: (option: SortOption) => void
}

export function SortSelect({ value, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sortOptions.find(opt => opt.value === e.target.value)
    if (selected) {
      onChange(selected)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label
        className="text-sm font-medium text-gray-700"
        htmlFor="sort-select"
      >
        Sort by:
      </label>
      <select
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        id="sort-select"
        onChange={handleChange}
        value={value}
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export { sortOptions }
export type { SortOption }
