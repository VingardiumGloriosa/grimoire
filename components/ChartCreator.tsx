"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, MapPin, ChevronDown } from "lucide-react"
import { toast } from "sonner"

interface GeoResult {
  display_name: string
  lat: number
  lon: number
  timezone: string | null
}

export default function ChartCreator() {
  const router = useRouter()

  const [label, setLabel] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [birthTime, setBirthTime] = useState("")
  const [timeUnknown, setTimeUnknown] = useState(false)
  const [birthLocation, setBirthLocation] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [timezone, setTimezone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Geocoding state
  const [geoResults, setGeoResults] = useState<GeoResult[]>([])
  const [geoLoading, setGeoLoading] = useState(false)
  const [showGeoDropdown, setShowGeoDropdown] = useState(false)
  const [showManualCoords, setShowManualCoords] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchLocation = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setGeoResults([])
      setShowGeoDropdown(false)
      return
    }

    setGeoLoading(true)
    try {
      const res = await fetch(`/api/astrology/geocode?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const results: GeoResult[] = await res.json()
        setGeoResults(results)
        setShowGeoDropdown(results.length > 0)
      }
    } catch {
      // Silently fail; user can enter coordinates manually
    } finally {
      setGeoLoading(false)
    }
  }, [])

  function handleLocationInput(value: string) {
    setBirthLocation(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      searchLocation(value)
    }, 500)
  }

  function handleGeoSelect(result: GeoResult) {
    setBirthLocation(result.display_name)
    setLatitude(result.lat.toFixed(6))
    setLongitude(result.lon.toFixed(6))
    if (result.timezone) {
      setTimezone(result.timezone)
    }
    setShowGeoDropdown(false)
    setGeoResults([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/astrology/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          birth_date: birthDate,
          birth_time: timeUnknown ? null : birthTime || null,
          birth_location: birthLocation.trim(),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          timezone,
          time_unknown: timeUnknown,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to create chart")
      }

      const data = await res.json()
      toast.success("Chart saved")
      router.push(`/astrology/charts/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setSubmitting(false)
    }
  }

  const isValid =
    label.trim() &&
    birthDate &&
    birthLocation.trim() &&
    latitude &&
    longitude &&
    timezone &&
    (timeUnknown || birthTime)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Label */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Chart Label
        </Label>
        <Input
          type="text"
          placeholder="e.g. My Birth Chart"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
          required
        />
      </div>

      {/* Birth Date */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Birth Date
        </Label>
        <Input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body"
          required
        />
      </div>

      {/* Birth Time */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Birth Time
        </Label>
        <Input
          type="time"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          disabled={timeUnknown}
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body disabled:opacity-50"
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={timeUnknown}
            onChange={(e) => {
              setTimeUnknown(e.target.checked)
              if (e.target.checked) setBirthTime("")
            }}
            className="rounded border-[var(--color-border)] accent-forest"
          />
          <span className="font-body text-sm text-[var(--color-text-muted)] italic">
            I don&apos;t know my birth time
          </span>
        </label>
      </div>

      {/* Birth Location with Geocoding */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Birth Location
        </Label>
        <div className="relative">
          <div className="relative">
            <MapPin
              size={16}
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]"
            />
            <Input
              type="text"
              placeholder="Search for a city..."
              value={birthLocation}
              onChange={(e) => handleLocationInput(e.target.value)}
              onFocus={() => {
                if (geoResults.length > 0) setShowGeoDropdown(true)
              }}
              onBlur={() => {
                // Delay to allow click on dropdown
                setTimeout(() => setShowGeoDropdown(false), 200)
              }}
              className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)] pl-9"
              required
            />
            {geoLoading && (
              <Loader2
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-text-faint)]"
              />
            )}
          </div>

          {/* Geocoding results dropdown */}
          {showGeoDropdown && geoResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden">
              {geoResults.map((result, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleGeoSelect(result)}
                  className="w-full text-left px-4 py-2.5 font-body text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
                >
                  <span className="line-clamp-1">{result.display_name}</span>
                  <span className="text-xs text-[var(--color-text-faint)]">
                    {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Coordinates and timezone display */}
        {latitude && longitude && (
          <p className="font-body text-xs text-[var(--color-text-faint)] italic">
            Coordinates: {latitude}, {longitude}
            {timezone && <> &middot; {timezone.replace(/_/g, " ")}</>}
          </p>
        )}
      </div>

      {/* Manual coordinates toggle */}
      <button
        type="button"
        onClick={() => setShowManualCoords(!showManualCoords)}
        className="flex items-center gap-1.5 font-body text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors"
      >
        <ChevronDown
          size={12}
          strokeWidth={1.5}
          className={`transition-transform ${showManualCoords ? "rotate-180" : ""}`}
        />
        Enter coordinates manually
      </button>

      {showManualCoords && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Latitude
            </Label>
            <Input
              type="number"
              step="any"
              placeholder="e.g. 51.5074"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="bg-[var(--color-surface)] border-[var(--color-border)] font-body placeholder:text-[var(--color-text-faint)]"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Longitude
            </Label>
            <Input
              type="number"
              step="any"
              placeholder="e.g. -0.1278"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="bg-[var(--color-surface)] border-[var(--color-border)] font-body placeholder:text-[var(--color-text-faint)]"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="font-body text-sm text-blush italic">{error}</p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={!isValid || submitting}
        className="w-full bg-forest text-parchment hover:bg-forest-deep font-body disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Creating Chart...
          </>
        ) : (
          <>
            <Sparkles size={16} strokeWidth={1.5} className="mr-2" />
            Create Chart
          </>
        )}
      </Button>
    </form>
  )
}
