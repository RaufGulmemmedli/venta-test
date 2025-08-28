"use client"

import React, { useState, useEffect } from "react"

interface DropdownProps {
  options: { value: string; label: string }[]
  placeholder?: string
  onChange?: (value: string) => void
  value?: string
}

export default function Dropdown({ options, placeholder = "Seçim edin", onChange, value = "" }: DropdownProps) {
  const [selected, setSelected] = useState<string>(value)

  const handleChange = (selectedValue: string) => {
    setSelected(selectedValue)
    if (onChange) {
      onChange(selectedValue)
    }
  }

  // Update local state when external value changes
  useEffect(() => {
    setSelected(value)
  }, [value])

  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="border rounded-md px-3 py-2 w-full"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}