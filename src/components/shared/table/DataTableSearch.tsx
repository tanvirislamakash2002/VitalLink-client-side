"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface DataTableSearchProps {
  value: string
  onSearchChange: (value: string) => void
  debounceMs?: number
  placeholder?: string
}

const DataTableSearch = ({
  value,
  onSearchChange,
  debounceMs = 650,
  placeholder = "Search...",
}: DataTableSearchProps) => {
  const [inputValue, setInputValue] = useState(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const handleChange = (nextValue: string) => {
    setInputValue(nextValue)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      onSearchChange(nextValue.trim())
      timeoutRef.current = null
    }, debounceMs)
  }

  const handleClear = () => {
    setInputValue("")
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    if (inputValue || value) onSearchChange("")
  }

  return (
    <div className="relative min-w-64 max-w-md flex-[1_1_18rem]">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="text"
        value={inputValue}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 pl-9 pr-10"
      />
      {(inputValue || value) && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground"
          aria-label="Clear search"
          title="Clear search"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export default DataTableSearch