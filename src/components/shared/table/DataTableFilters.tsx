"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"

export type RangeOperator = "gt" | "gte" | "lt" | "lte"
export type DataTableFilterValue = string | string[] | Partial<Record<RangeOperator, string>> | undefined

export interface DataTableFilterOption {
  label: string
  value: string
}

export type DataTableFilterDefinition =
  | { id: string; param: string; label: string; type: "single"; options: DataTableFilterOption[] }
  | { id: string; param: string; label: string; type: "multiple"; options: DataTableFilterOption[] }
  | { id: string; param: string; label: string; type: "range"; lowerLabel?: string; upperLabel?: string }

export interface DataTableFiltersProps {
  filters: DataTableFilterDefinition[]
  values: Record<string, DataTableFilterValue>
  onFilterChange: (param: string, value: DataTableFilterValue) => void
  disabled?: boolean
  debounceMs?: number
}

interface FilterControlProps {
  filter: DataTableFilterDefinition
  value: DataTableFilterValue
  onFilterChange: DataTableFiltersProps["onFilterChange"]
  disabled: boolean
  debounceMs: number
}

function FilterControl({ filter, value, onFilterChange, disabled, debounceMs }: FilterControlProps) {
  const selectedValues = Array.isArray(value) ? value : value ? [value as string] : []
  const rangeValue = filter.type === "range" && value && !Array.isArray(value) && typeof value !== "string" ? value : {}
  const [draftValues, setDraftValues] = useState<string[]>(selectedValues)
  const [lowerOperator, setLowerOperator] = useState<"gt" | "gte">(rangeValue.gt !== undefined ? "gt" : "gte")
  const [upperOperator, setUpperOperator] = useState<"lt" | "lte">(rangeValue.lt !== undefined ? "lt" : "lte")
  const [lowerValue, setLowerValue] = useState(rangeValue.gt ?? rangeValue.gte ?? "")
  const [upperValue, setUpperValue] = useState(rangeValue.lt ?? rangeValue.lte ?? "")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const filterParam = filter.param
  const filterType = filter.type

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  const scheduleRangeChange = (
    nextLowerValue = lowerValue,
    nextUpperValue = upperValue,
    nextLowerOperator = lowerOperator,
    nextUpperOperator = upperOperator,
  ) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const nextRange: Partial<Record<RangeOperator, string>> = {}
      if (nextLowerValue !== "") nextRange[nextLowerOperator] = nextLowerValue
      if (nextUpperValue !== "") nextRange[nextUpperOperator] = nextUpperValue
      onFilterChange(filterParam, Object.keys(nextRange).length ? nextRange : undefined)
      debounceRef.current = null
    }, debounceMs)
  }

  const applyMultiple = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onFilterChange(filterParam, draftValues.length ? draftValues : undefined)
      debounceRef.current = null
    }, debounceMs)
  }

  const clearFilter = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (filterType === "multiple") {
      setDraftValues([])
      debounceRef.current = setTimeout(() => {
        onFilterChange(filterParam, undefined)
        debounceRef.current = null
      }, debounceMs)
      return
    }
    if (filterType === "range") {
      setLowerValue("")
      setUpperValue("")
      scheduleRangeChange("", "")
      return
    }
    onFilterChange(filterParam, undefined)
  }

  const hasValue = filterType === "range"
    ? Boolean(rangeValue.gt || rangeValue.gte || rangeValue.lt || rangeValue.lte)
    : selectedValues.length > 0

  return (
    <details className="group relative">
      <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent [&::-webkit-details-marker]:hidden">
        <span>{filter.label}</span>
        {hasValue && <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{filterType === "multiple" ? selectedValues.length : "On"}</span>}
        <span aria-hidden="true" className="text-muted-foreground">⌄</span>
      </summary>

      <div className="absolute top-full left-0 z-30 mt-2 min-w-56 rounded-md border bg-popover p-3 text-popover-foreground shadow-md">
        {filterType === "single" && (
          <select
            aria-label={filter.label}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={selectedValues[0] ?? ""}
            onChange={(event) => onFilterChange(filterParam, event.target.value || undefined)}
            disabled={disabled}
          >
            <option value="">Any</option>
            {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        )}

        {filterType === "multiple" && (
          <div className="space-y-3">
            <div className="max-h-56 space-y-2 overflow-y-auto">
              {filter.options.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draftValues.includes(option.value)}
                    disabled={disabled}
                    onChange={(event) => setDraftValues((current) => event.target.checked
                      ? [...current, option.value]
                      : current.filter((item) => item !== option.value))}
                    className="size-4 accent-primary"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
              {!filter.options.length && <p className="text-sm text-muted-foreground">No options available.</p>}
            </div>
            <div className="flex justify-between gap-2 border-t pt-3">
              <Button type="button" size="sm" variant="ghost" onClick={clearFilter} disabled={disabled}>Clear</Button>
              <Button type="button" size="sm" onClick={applyMultiple} disabled={disabled}>Apply</Button>
            </div>
          </div>
        )}

        {filterType === "range" && (
          <div className="space-y-3">
            <label className="block space-y-1.5 text-xs text-muted-foreground">
              <span>{filter.lowerLabel ?? "Minimum"}</span>
              <div className="flex gap-2">
                <select
                  aria-label="Minimum comparison"
                  value={lowerOperator}
                  onChange={(event) => {
                    const nextOperator = event.target.value as "gt" | "gte"
                    setLowerOperator(nextOperator)
                    scheduleRangeChange(lowerValue, upperValue, nextOperator, upperOperator)
                  }}
                  disabled={disabled}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                >
                  <option value="gte">At least</option>
                  <option value="gt">Greater than</option>
                </select>
                <Input type="number" min="0" step="any" value={lowerValue} onChange={(event) => {
                  setLowerValue(event.target.value)
                  scheduleRangeChange(event.target.value)
                }} disabled={disabled} aria-label={filter.lowerLabel ?? "Minimum value"} />
              </div>
            </label>
            <label className="block space-y-1.5 text-xs text-muted-foreground">
              <span>{filter.upperLabel ?? "Maximum"}</span>
              <div className="flex gap-2">
                <select
                  aria-label="Maximum comparison"
                  value={upperOperator}
                  onChange={(event) => {
                    const nextOperator = event.target.value as "lt" | "lte"
                    setUpperOperator(nextOperator)
                    scheduleRangeChange(lowerValue, upperValue, lowerOperator, nextOperator)
                  }}
                  disabled={disabled}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                >
                  <option value="lte">At most</option>
                  <option value="lt">Less than</option>
                </select>
                <Input type="number" min="0" step="any" value={upperValue} onChange={(event) => {
                  setUpperValue(event.target.value)
                  scheduleRangeChange(lowerValue, event.target.value)
                }} disabled={disabled} aria-label={filter.upperLabel ?? "Maximum value"} />
              </div>
            </label>
            <div className="flex justify-end border-t pt-3">
              <Button type="button" size="sm" variant="ghost" onClick={clearFilter} disabled={disabled}>Clear range</Button>
            </div>
          </div>
        )}
      </div>
    </details>
  )
}

const DataTableFilters = ({ filters, values, onFilterChange, disabled = false, debounceMs = 700 }: DataTableFiltersProps) => (
  <div className="mb-4 flex flex-wrap items-start gap-2">
    {filters.map((filter) => (
      <FilterControl
        key={`${filter.id}-${JSON.stringify(values[filter.param] ?? null)}`}
        filter={filter}
        value={values[filter.param]}
        onFilterChange={onFilterChange}
        disabled={disabled}
        debounceMs={debounceMs}
      />
    ))}
  </div>
)

export default DataTableFilters