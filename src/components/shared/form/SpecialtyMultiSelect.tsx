"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ISpecialty } from "@/types/specialty.types"
import { ChevronDown } from "lucide-react"

interface SpecialtyMultiSelectProps {
  specialties: ISpecialty[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

const SpecialtyMultiSelect = ({ specialties, value, onChange, disabled = false }: SpecialtyMultiSelectProps) => {
  const selectedLabels = specialties
    .filter((specialty) => value.includes(specialty.id))
    .map((specialty) => specialty.title)

  const toggleSpecialty = (specialtyId: string, checked: boolean) => {
    onChange(checked
      ? [...value, specialtyId]
      : value.filter((selectedId) => selectedId !== specialtyId))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-between font-normal"
          aria-label="Select doctor specialties"
        >
          <span className="truncate text-left">
            {selectedLabels.length
              ? `${selectedLabels.length} selected: ${selectedLabels.slice(0, 2).join(", ")}${selectedLabels.length > 2 ? ", …" : ""}`
              : "Select specialties"}
          </span>
          <ChevronDown aria-hidden="true" className="ml-2 size-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) max-h-64 overflow-y-auto">
        <DropdownMenuLabel>Doctor specialties</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {specialties.length ? specialties.map((specialty) => (
          <DropdownMenuCheckboxItem
            key={specialty.id}
            checked={value.includes(specialty.id)}
            disabled={disabled}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(checked) => toggleSpecialty(specialty.id, checked === true)}
          >
            {specialty.title}
          </DropdownMenuCheckboxItem>
        )) : (
          <p className="px-2 py-3 text-sm text-muted-foreground">No specialties available.</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SpecialtyMultiSelect