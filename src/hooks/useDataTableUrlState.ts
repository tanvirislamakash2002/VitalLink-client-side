"use client"

import { DataTableFilterValue, RangeOperator } from "@/components/shared/table/DataTableFilters"
import { PaginationState, SortingState } from "@tanstack/react-table"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useOptimistic, useTransition } from "react"

interface UseDataTableUrlStateOptions {
  sortFields: Record<string, string>
  filterParams?: string[]
  pageParam?: string
  pageSizeParam?: string
  searchParam?: string
  sortByParam?: string
  sortOrderParam?: string
  defaultPageSize?: number
}

function deleteFilterParam(params: URLSearchParams, param: string) {
  params.delete(param)
  for (const key of new Set(params.keys())) {
    if (key.startsWith(`${param}[`) && key.endsWith("]")) params.delete(key)
  }
}

export function useDataTableUrlState({
  sortFields,
  filterParams = [],
  pageParam = "page",
  pageSizeParam = "limit",
  searchParam = "searchTerm",
  sortByParam = "sortBy",
  sortOrderParam = "sortOrder",
  defaultPageSize = 10,
}: UseDataTableUrlStateOptions) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const queryParamsObject = Object.fromEntries(
    [...new Set(searchParams.keys())].map((key) => {
      const values = searchParams.getAll(key)
      return [key, values.length > 1 ? values : values[0]]
    })
  ) as Record<string, string | string[]>

  const pageNumber = Math.max(Number(searchParams.get(pageParam)) || 1, 1)
  const pageSize = Math.max(Number(searchParams.get(pageSizeParam)) || defaultPageSize, 1)
  const [optimisticPagination, setOptimisticPagination] = useOptimistic<PaginationState | null, PaginationState>(
    null,
    (_, nextPagination) => nextPagination
  )
  const [isNavigationPending, startTransition] = useTransition()
  const pagination = optimisticPagination ?? { pageIndex: pageNumber - 1, pageSize }

  const sortingColumnId = Object.entries(sortFields)
    .find(([, field]) => field === searchParams.get(sortByParam))?.[0]
  const sortOrder = searchParams.get(sortOrderParam)
  const sorting: SortingState = sortingColumnId && (sortOrder === "asc" || sortOrder === "desc")
    ? [{ id: sortingColumnId, desc: sortOrder === "desc" }]
    : []

  const filterValues: Record<string, DataTableFilterValue> = {}
  filterParams.forEach((param) => {
    const range = (Object.fromEntries(
      (["gt", "gte", "lt", "lte"] as const)
        .flatMap((operator) => {
          const value = searchParams.get(`${param}[${operator}]`)
          return value === null ? [] : [[operator, value]]
        })
    ) as Partial<Record<RangeOperator, string>>)
    if (Object.keys(range).length) {
      filterValues[param] = range
      return
    }

    const values = searchParams.getAll(param)
    filterValues[param] = values.length > 1 ? values : values[0]
  })

  const navigateWithParams = useCallback((params: URLSearchParams, nextPagination?: PaginationState) => {
    const query = params.toString()
    const nextUrl = query ? `${pathname}?${query}` : pathname
    if (nextUrl === (queryString ? `${pathname}?${queryString}` : pathname)) return

    startTransition(() => {
      if (nextPagination) setOptimisticPagination(nextPagination)
      router.push(nextUrl, { scroll: false })
    })
  }, [pathname, queryString, router, setOptimisticPagination, startTransition])

  const handleSortingChange = useCallback((nextSorting: SortingState) => {
    const params = new URLSearchParams(queryString)
    const sort = nextSorting[0]
    const field = sort && sortFields[sort.id]
    if (field) {
      params.set(sortByParam, field)
      params.set(sortOrderParam, sort.desc ? "desc" : "asc")
    } else {
      params.delete(sortByParam)
      params.delete(sortOrderParam)
    }
    params.set(pageParam, "1")
    navigateWithParams(params, { pageIndex: 0, pageSize: pagination.pageSize })
  }, [navigateWithParams, pageParam, pagination.pageSize, queryString, sortByParam, sortFields, sortOrderParam])

  const handlePaginationChange = useCallback((nextPagination: PaginationState) => {
    const nextPageIndex = nextPagination.pageSize !== pagination.pageSize ? 0 : nextPagination.pageIndex
    const nextState = { ...nextPagination, pageIndex: nextPageIndex }
    if (nextState.pageIndex === pagination.pageIndex && nextState.pageSize === pagination.pageSize) return

    const params = new URLSearchParams(queryString)
    params.set(pageParam, String(nextState.pageIndex + 1))
    params.set(pageSizeParam, String(nextState.pageSize))
    navigateWithParams(params, nextState)
  }, [navigateWithParams, pageParam, pageSizeParam, pagination, queryString])

  const handleSearchChange = useCallback((value: string) => {
    const params = new URLSearchParams(queryString)
    const normalizedValue = value.trim()
    if (normalizedValue) params.set(searchParam, normalizedValue)
    else params.delete(searchParam)

    if (params.get(searchParam) === searchParams.get(searchParam) && pageNumber === 1) return
    params.set(pageParam, "1")
    navigateWithParams(params, { pageIndex: 0, pageSize: pagination.pageSize })
  }, [navigateWithParams, pageNumber, pageParam, pagination.pageSize, queryString, searchParam, searchParams])

  const handleFilterChange = useCallback((param: string, value: DataTableFilterValue) => {
    const params = new URLSearchParams(queryString)
    const previousQuery = params.toString()
    deleteFilterParam(params, param)

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(param, item))
    } else if (typeof value === "string" && value) {
      params.set(param, value)
    } else if (value && typeof value === "object") {
      Object.entries(value).forEach(([operator, amount]) => {
        if (amount !== undefined && amount !== "") params.set(`${param}[${operator}]`, amount)
      })
    }

    if (params.toString() === previousQuery) return
    params.set(pageParam, "1")
    navigateWithParams(params, { pageIndex: 0, pageSize: pagination.pageSize })
  }, [navigateWithParams, pageParam, pagination.pageSize, queryString])

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(queryString)
    const previousQuery = params.toString()
    filterParams.forEach((param) => deleteFilterParam(params, param))
    if (params.toString() === previousQuery) return

    params.set(pageParam, "1")
    navigateWithParams(params, { pageIndex: 0, pageSize: pagination.pageSize })
  }, [filterParams, navigateWithParams, pageParam, pagination.pageSize, queryString])

  return {
    queryString,
    queryParamsObject,
    searchTerm: searchParams.get(searchParam) ?? "",
    sorting,
    pagination,
    filterValues,
    isNavigationPending,
    handleSortingChange,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    clearFilters,
  }
}