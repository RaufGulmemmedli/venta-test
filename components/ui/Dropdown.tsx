"use client"

import React, { useState, useEffect } from "react"

interface Option {
  value: string
  label: string
}

interface DropdownProps {
  value: string
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string        // əlavə etdik
  triggerClassName?: string // (istəsən ayrıca trigger üslubu)
  disabled?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  onChange,
  placeholder = "Seçin",
  className = "",
  triggerClassName = "",
  disabled
}) => {
  return (
    <div className={className}>
      <select
        disabled={disabled}
        className={`w-full border rounded px-3 h-10 text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary ${triggerClassName}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {!value && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export default Dropdown