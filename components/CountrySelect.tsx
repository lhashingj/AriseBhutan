'use client'

import { useState, useRef, useEffect, useMemo, KeyboardEvent } from 'react'
import { ChevronDown, X } from 'lucide-react'

// ─── Country data ────────────────────────────────────────────────────────────
// Pre-sorted alphabetically. isSaarc = true for the 7 SAARC member states
// (Bhutan is excluded — it is the destination, not a billable nationality).

export interface Country {
  name: string
  isSaarc: boolean
}

export const COUNTRIES: Country[] = [
  { name: 'Afghanistan',                       isSaarc: false },
  { name: 'Albania',                           isSaarc: false },
  { name: 'Algeria',                           isSaarc: false },
  { name: 'Andorra',                           isSaarc: false },
  { name: 'Angola',                            isSaarc: false },
  { name: 'Antigua and Barbuda',               isSaarc: false },
  { name: 'Argentina',                         isSaarc: false },
  { name: 'Armenia',                           isSaarc: false },
  { name: 'Australia',                         isSaarc: false },
  { name: 'Austria',                           isSaarc: false },
  { name: 'Azerbaijan',                        isSaarc: false },
  { name: 'Bahamas',                           isSaarc: false },
  { name: 'Bahrain',                           isSaarc: false },
  { name: 'Bangladesh',                        isSaarc: true  },
  { name: 'Barbados',                          isSaarc: false },
  { name: 'Belarus',                           isSaarc: false },
  { name: 'Belgium',                           isSaarc: false },
  { name: 'Belize',                            isSaarc: false },
  { name: 'Benin',                             isSaarc: false },
  { name: 'Bhutan',                            isSaarc: false },
  { name: 'Bolivia',                           isSaarc: false },
  { name: 'Bosnia and Herzegovina',            isSaarc: false },
  { name: 'Botswana',                          isSaarc: false },
  { name: 'Brazil',                            isSaarc: false },
  { name: 'Brunei',                            isSaarc: false },
  { name: 'Bulgaria',                          isSaarc: false },
  { name: 'Burkina Faso',                      isSaarc: false },
  { name: 'Burundi',                           isSaarc: false },
  { name: 'Cabo Verde',                        isSaarc: false },
  { name: 'Cambodia',                          isSaarc: false },
  { name: 'Cameroon',                          isSaarc: false },
  { name: 'Canada',                            isSaarc: false },
  { name: 'Central African Republic',          isSaarc: false },
  { name: 'Chad',                              isSaarc: false },
  { name: 'Chile',                             isSaarc: false },
  { name: 'China',                             isSaarc: false },
  { name: 'Colombia',                          isSaarc: false },
  { name: 'Comoros',                           isSaarc: false },
  { name: 'Congo, Democratic Republic',        isSaarc: false },
  { name: 'Congo, Republic of',               isSaarc: false },
  { name: 'Costa Rica',                        isSaarc: false },
  { name: 'Croatia',                           isSaarc: false },
  { name: 'Cuba',                              isSaarc: false },
  { name: 'Cyprus',                            isSaarc: false },
  { name: 'Czech Republic',                    isSaarc: false },
  { name: 'Denmark',                           isSaarc: false },
  { name: 'Djibouti',                          isSaarc: false },
  { name: 'Dominica',                          isSaarc: false },
  { name: 'Dominican Republic',               isSaarc: false },
  { name: 'Ecuador',                           isSaarc: false },
  { name: 'Egypt',                             isSaarc: false },
  { name: 'El Salvador',                       isSaarc: false },
  { name: 'Equatorial Guinea',                 isSaarc: false },
  { name: 'Eritrea',                           isSaarc: false },
  { name: 'Estonia',                           isSaarc: false },
  { name: 'Eswatini',                          isSaarc: false },
  { name: 'Ethiopia',                          isSaarc: false },
  { name: 'Fiji',                              isSaarc: false },
  { name: 'Finland',                           isSaarc: false },
  { name: 'France',                            isSaarc: false },
  { name: 'Gabon',                             isSaarc: false },
  { name: 'Gambia',                            isSaarc: false },
  { name: 'Georgia',                           isSaarc: false },
  { name: 'Germany',                           isSaarc: false },
  { name: 'Ghana',                             isSaarc: false },
  { name: 'Greece',                            isSaarc: false },
  { name: 'Grenada',                           isSaarc: false },
  { name: 'Guatemala',                         isSaarc: false },
  { name: 'Guinea',                            isSaarc: false },
  { name: 'Guinea-Bissau',                     isSaarc: false },
  { name: 'Guyana',                            isSaarc: false },
  { name: 'Haiti',                             isSaarc: false },
  { name: 'Honduras',                          isSaarc: false },
  { name: 'Hungary',                           isSaarc: false },
  { name: 'Iceland',                           isSaarc: false },
  { name: 'India',                             isSaarc: true  },
  { name: 'Indonesia',                         isSaarc: false },
  { name: 'Iran',                              isSaarc: false },
  { name: 'Iraq',                              isSaarc: false },
  { name: 'Ireland',                           isSaarc: false },
  { name: 'Israel',                            isSaarc: false },
  { name: 'Italy',                             isSaarc: false },
  { name: 'Jamaica',                           isSaarc: false },
  { name: 'Japan',                             isSaarc: false },
  { name: 'Jordan',                            isSaarc: false },
  { name: 'Kazakhstan',                        isSaarc: false },
  { name: 'Kenya',                             isSaarc: false },
  { name: 'Kiribati',                          isSaarc: false },
  { name: 'Kosovo',                            isSaarc: false },
  { name: 'Kuwait',                            isSaarc: false },
  { name: 'Kyrgyzstan',                        isSaarc: false },
  { name: 'Laos',                              isSaarc: false },
  { name: 'Latvia',                            isSaarc: false },
  { name: 'Lebanon',                           isSaarc: false },
  { name: 'Lesotho',                           isSaarc: false },
  { name: 'Liberia',                           isSaarc: false },
  { name: 'Libya',                             isSaarc: false },
  { name: 'Liechtenstein',                     isSaarc: false },
  { name: 'Lithuania',                         isSaarc: false },
  { name: 'Luxembourg',                        isSaarc: false },
  { name: 'Madagascar',                        isSaarc: false },
  { name: 'Malawi',                            isSaarc: false },
  { name: 'Malaysia',                          isSaarc: false },
  { name: 'Maldives',                          isSaarc: true  },
  { name: 'Mali',                              isSaarc: false },
  { name: 'Malta',                             isSaarc: false },
  { name: 'Marshall Islands',                  isSaarc: false },
  { name: 'Mauritania',                        isSaarc: false },
  { name: 'Mauritius',                         isSaarc: false },
  { name: 'Mexico',                            isSaarc: false },
  { name: 'Micronesia',                        isSaarc: false },
  { name: 'Moldova',                           isSaarc: false },
  { name: 'Monaco',                            isSaarc: false },
  { name: 'Mongolia',                          isSaarc: false },
  { name: 'Montenegro',                        isSaarc: false },
  { name: 'Morocco',                           isSaarc: false },
  { name: 'Mozambique',                        isSaarc: false },
  { name: 'Myanmar',                           isSaarc: false },
  { name: 'Namibia',                           isSaarc: false },
  { name: 'Nauru',                             isSaarc: false },
  { name: 'Nepal',                             isSaarc: false },
  { name: 'Netherlands',                       isSaarc: false },
  { name: 'New Zealand',                       isSaarc: false },
  { name: 'Nicaragua',                         isSaarc: false },
  { name: 'Niger',                             isSaarc: false },
  { name: 'Nigeria',                           isSaarc: false },
  { name: 'North Korea',                       isSaarc: false },
  { name: 'North Macedonia',                   isSaarc: false },
  { name: 'Norway',                            isSaarc: false },
  { name: 'Oman',                              isSaarc: false },
  { name: 'Pakistan',                          isSaarc: false },
  { name: 'Palau',                             isSaarc: false },
  { name: 'Palestine',                         isSaarc: false },
  { name: 'Panama',                            isSaarc: false },
  { name: 'Papua New Guinea',                  isSaarc: false },
  { name: 'Paraguay',                          isSaarc: false },
  { name: 'Peru',                              isSaarc: false },
  { name: 'Philippines',                       isSaarc: false },
  { name: 'Poland',                            isSaarc: false },
  { name: 'Portugal',                          isSaarc: false },
  { name: 'Qatar',                             isSaarc: false },
  { name: 'Romania',                           isSaarc: false },
  { name: 'Russia',                            isSaarc: false },
  { name: 'Rwanda',                            isSaarc: false },
  { name: 'Saint Kitts and Nevis',             isSaarc: false },
  { name: 'Saint Lucia',                       isSaarc: false },
  { name: 'Saint Vincent and the Grenadines',  isSaarc: false },
  { name: 'Samoa',                             isSaarc: false },
  { name: 'San Marino',                        isSaarc: false },
  { name: 'São Tomé and Príncipe',             isSaarc: false },
  { name: 'Saudi Arabia',                      isSaarc: false },
  { name: 'Senegal',                           isSaarc: false },
  { name: 'Serbia',                            isSaarc: false },
  { name: 'Seychelles',                        isSaarc: false },
  { name: 'Sierra Leone',                      isSaarc: false },
  { name: 'Singapore',                         isSaarc: false },
  { name: 'Slovakia',                          isSaarc: false },
  { name: 'Slovenia',                          isSaarc: false },
  { name: 'Solomon Islands',                   isSaarc: false },
  { name: 'Somalia',                           isSaarc: false },
  { name: 'South Africa',                      isSaarc: false },
  { name: 'South Korea',                       isSaarc: false },
  { name: 'South Sudan',                       isSaarc: false },
  { name: 'Spain',                             isSaarc: false },
  { name: 'Sri Lanka',                         isSaarc: false },
  { name: 'Sudan',                             isSaarc: false },
  { name: 'Suriname',                          isSaarc: false },
  { name: 'Sweden',                            isSaarc: false },
  { name: 'Switzerland',                       isSaarc: false },
  { name: 'Syria',                             isSaarc: false },
  { name: 'Taiwan',                            isSaarc: false },
  { name: 'Tajikistan',                        isSaarc: false },
  { name: 'Tanzania',                          isSaarc: false },
  { name: 'Thailand',                          isSaarc: false },
  { name: 'Timor-Leste',                       isSaarc: false },
  { name: 'Togo',                              isSaarc: false },
  { name: 'Tonga',                             isSaarc: false },
  { name: 'Trinidad and Tobago',               isSaarc: false },
  { name: 'Tunisia',                           isSaarc: false },
  { name: 'Turkey',                            isSaarc: false },
  { name: 'Turkmenistan',                      isSaarc: false },
  { name: 'Tuvalu',                            isSaarc: false },
  { name: 'Uganda',                            isSaarc: false },
  { name: 'Ukraine',                           isSaarc: false },
  { name: 'United Arab Emirates',              isSaarc: false },
  { name: 'United Kingdom',                    isSaarc: false },
  { name: 'United States',                     isSaarc: false },
  { name: 'Uruguay',                           isSaarc: false },
  { name: 'Uzbekistan',                        isSaarc: false },
  { name: 'Vanuatu',                           isSaarc: false },
  { name: 'Vatican City',                      isSaarc: false },
  { name: 'Venezuela',                         isSaarc: false },
  { name: 'Vietnam',                           isSaarc: false },
  { name: 'Yemen',                             isSaarc: false },
  { name: 'Zambia',                            isSaarc: false },
  { name: 'Zimbabwe',                          isSaarc: false },
]

// ─── Component ───────────────────────────────────────────────────────────────

export interface CountrySelectProps {
  /** The currently selected country name (controlled). */
  value?: string
  /** Called with the new country name string when the user makes a selection. */
  onChange?: (value: string) => void
  /** Called when the dropdown closes (useful for RHF Controller's field.onBlur). */
  onBlur?: () => void
  id?: string
  /** Renders a hidden <input name={name}> so the value is included in native form submits. */
  name?: string
  /** Extra Tailwind classes appended to the visible text input. */
  className?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

const BASE_INPUT =
  'w-full border border-stone-200 rounded-xl px-4 py-3 pr-16 text-sm ' +
  'focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ' +
  'transition-colors bg-white placeholder:text-stone-400 ' +
  'disabled:bg-stone-50 disabled:cursor-not-allowed ' +
  'dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 dark:placeholder:text-stone-500 dark:disabled:bg-stone-900'

export default function CountrySelect({
  value = '',
  onChange,
  onBlur,
  id,
  name,
  className = '',
  placeholder = 'Search country…',
  disabled = false,
  required = false,
}: CountrySelectProps) {
  const [query,       setQuery]       = useState('')
  const [open,        setOpen]        = useState(false)
  const [highlighted, setHighlighted] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)
  const listRef      = useRef<HTMLUListElement>(null)

  // While the dropdown is open the user sees the typed query; when closed they
  // see the selected country name so the field looks like a normal input.
  const displayValue = open ? query : value

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q))
  }, [query])

  // Close on outside click / focus-out
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted] as HTMLElement | undefined
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlighted])

  function close() {
    setOpen(false)
    setQuery('')
    setHighlighted(-1)
    onBlur?.()
  }

  function handleFocus() {
    if (disabled) return
    setQuery('')
    setOpen(true)
    setHighlighted(-1)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setOpen(true)
    setHighlighted(0)
  }

  function handleSelect(country: Country) {
    onChange?.(country.name)
    close()
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange?.('')
    setQuery('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) { setOpen(true); break }
        setHighlighted(h => Math.min(h + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlighted(h => Math.max(h - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (open && highlighted >= 0 && filtered[highlighted]) {
          handleSelect(filtered[highlighted])
        }
        break
      case 'Tab':
        // Select the top result on Tab so the user can tab through the form quickly
        if (open && filtered[0]) handleSelect(filtered[0])
        break
      case 'Escape':
        close()
        break
    }
  }

  return (
    <div ref={containerRef} className="relative">

      {/* Hidden input keeps the selected value in native form payloads */}
      {name && (
        <input type="hidden" name={name} value={value} />
      )}

      {/* Visible search / display input */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required && !value}
        className={`${BASE_INPUT} ${className}`}
      />

      {/* Right-side controls */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
        {value && !open && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="pointer-events-auto p-0.5 rounded text-stone-300 hover:text-stone-500 transition-colors"
            aria-label="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Dropdown list */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Countries"
          className="absolute z-50 mt-1.5 w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 focus:outline-none"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-stone-400 text-center select-none">
              No countries found
            </li>
          ) : (
            filtered.map((country, i) => {
              const isActive   = highlighted === i
              const isSelected = value === country.name
              return (
                <li
                  key={country.name}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(country) }}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer select-none transition-colors
                    ${isActive || isSelected
                      ? 'bg-amber-50 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300'
                      : 'text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-700/60'
                    }`}
                >
                  <span className={isSelected ? 'font-semibold' : ''}>{country.name}</span>
                  {country.isSaarc && (
                    <span className="ml-2 shrink-0 text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-md">
                      INR Rate
                    </span>
                  )}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
