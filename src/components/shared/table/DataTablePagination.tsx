"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const PAGE_SIZE_OPTIONS = [1, 10, 20, 50, 100]

type PageItem = number | "ellipsis"

function getPageItems(pageCount: number, currentPage: number): PageItem[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  if (currentPage <= 5) {
    return [1, 2, 3, 4, 5, "ellipsis", pageCount]
  }

  if (currentPage >= pageCount - 4) {
    return [1, "ellipsis", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount]
  }

  return [1, "ellipsis", currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, "ellipsis", pageCount]
}

interface DataTablePaginationProps {
  pageIndex: number
  pageCount: number
  pageSize: number
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
  disabled?: boolean
}

const DataTablePagination = ({
  pageIndex,
  pageCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: DataTablePaginationProps) => {
  const [customLimit, setCustomLimit] = useState(String(pageSize))
  const [showCustomLimit, setShowCustomLimit] = useState(!PAGE_SIZE_OPTIONS.includes(pageSize))

  const currentPage = Math.min(Math.max(pageIndex + 1, 1), Math.max(pageCount, 1))
  const pageItems = getPageItems(Math.max(pageCount, 1), currentPage)
  const parsedCustomLimit = Number(customLimit)

  const applyCustomLimit = () => {
    if (Number.isInteger(parsedCustomLimit) && parsedCustomLimit > 0 && parsedCustomLimit !== pageSize) {
      onPageSizeChange(parsedCustomLimit)
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4 border-t pt-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-1" aria-label="Table pagination">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={disabled || pageIndex <= 0}
          aria-label="Previous page"
        >
          <ChevronLeft aria-hidden="true" />
          <span>Previous</span>
        </Button>

        {pageItems.map((item, index) => item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground" aria-hidden="true">...</span>
        ) : (
          <Button
            key={item}
            type="button"
            variant={item === currentPage ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(item - 1)}
            disabled={disabled}
            aria-label={`Go to page ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={disabled || pageIndex >= pageCount - 1}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="data-table-page-size" className="text-muted-foreground">Rows per page</label>
        <select
          id="data-table-page-size"
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          value={showCustomLimit ? "custom" : String(pageSize)}
          onChange={(event) => {
            if (event.target.value === "custom") {
              setShowCustomLimit(true)
              setCustomLimit(String(pageSize))
            } else {
              setShowCustomLimit(false)
              onPageSizeChange(Number(event.target.value))
            }
          }}
          disabled={disabled}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
          <option value="custom">Custom</option>
        </select>

        {showCustomLimit && (
          <div className="flex items-center gap-2">
            <Input
              aria-label="Custom rows per page"
              type="number"
              min={1}
              step={1}
              value={customLimit}
              onChange={(event) => setCustomLimit(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyCustomLimit()
              }}
              className="h-8 w-20"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyCustomLimit}
              disabled={disabled || !Number.isInteger(parsedCustomLimit) || parsedCustomLimit <= 0}
            >
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataTablePagination