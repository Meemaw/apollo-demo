"use client"

type ActivityTypeOption = {
  label: string
  value: string | null
}

const activityTypeOptions: ActivityTypeOption[] = [
  { label: "All", value: null },
  { label: "Sale", value: "SALE" },
  { label: "Listing", value: "LISTING" },
  { label: "Transfer", value: "TRANSFER" },
  { label: "Mint", value: "MINT" },
  { label: "Item Offer", value: "OFFER" },
  { label: "Collection Offer", value: "COLLECTION_OFFER" },
  { label: "Trait Offer", value: "TRAIT_OFFER" },
]

type Props = {
  value: string | null
  onChange: (value: string | null) => void
}

export function ActivityTypeFilter({ value, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value === "all" ? null : e.target.value
    onChange(selectedValue)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        className="text-sm font-medium text-gray-700"
        htmlFor="activity-type-filter"
      >
        Activity Type:
      </label>
      <select
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        id="activity-type-filter"
        onChange={handleChange}
        value={value || "all"}
      >
        {activityTypeOptions.map(option => (
          <option key={option.value || "all"} value={option.value || "all"}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export { activityTypeOptions }
