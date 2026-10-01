"use client"

import { useCallback } from "react"

interface SearchParamsReader {
  get(name: string): string | null
  toString(): string
}

interface UseSearchTermUrlSyncOptions {
  searchParams: SearchParamsReader
  navigate: (params: URLSearchParams) => void
  searchParam?: string
  pageParam?: string
}

export function useSearchTermUrlSync({
  searchParams,
  navigate,
  searchParam = "searchTerm",
  pageParam = "page",
}: UseSearchTermUrlSyncOptions) {
  const searchTerm = searchParams.get(searchParam) ?? ""

  const handleSearchTermChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const normalizedValue = value.trim()

    if (normalizedValue) params.set(searchParam, normalizedValue)
    else params.delete(searchParam)

    if (params.get(searchParam) === searchParams.get(searchParam) && Number(searchParams.get(pageParam) || 1) === 1) {
      return
    }

    params.set(pageParam, "1")
    navigate(params)
  }, [navigate, pageParam, searchParam, searchParams])

  return { searchTerm, handleSearchTermChange }
}