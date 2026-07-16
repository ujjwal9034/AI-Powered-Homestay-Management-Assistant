/**
 * Explore — Public Browse page for all homestays.
 *
 * Features:
 * - Search by name and location
 * - Filter by price range, minimum rating, amenities
 * - Sort by price, rating, or newest
 * - Responsive card grid with skeleton loading
 * - Fully supports dark mode
 */
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { fetchHomestays, resolveImageUrl, toggleWishlist } from '../services/api'
import { HomestayCardSkeleton } from '../components/SkeletonCard'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  ArrowUpDown,
  X,
  ChevronDown,
  Sparkles,
  Heart,
} from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'reviews', label: 'Most Reviewed' },
]

const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 – ₹3,000', min: 1000, max: 3000 },
  { label: '₹3,000 – ₹5,000', min: 3000, max: 5000 },
  { label: '₹5,000+', min: 5000, max: Infinity },
]

export default function Explore() {
  const { darkMode } = useTheme()
  const { user, updateUser, isAuthenticated } = useAuth()
  const [homestays, setHomestays] = useState([])
  const [loading, setLoading] = useState(true)

  // Wishlist set helper
  const wishlistSet = useMemo(() => new Set(user?.wishlist || []), [user?.wishlist])

  // Filter/search state
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('rating-desc')
  const [priceRange, setPriceRange] = useState(0) // index into PRICE_RANGES
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchHomestays()
        setHomestays(result.data || [])
      } catch (err) {
        console.warn('Failed to load homestays:', err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Extract unique locations for quick filter chips
  const locations = useMemo(() => {
    const locs = [...new Set(homestays.map((h) => h.location))]
    return locs.sort()
  }, [homestays])
  const [selectedLocation, setSelectedLocation] = useState('')

  // Filtered and sorted results
  const filteredHomestays = useMemo(() => {
    let results = [...homestays]

    // Search filter (name or location)
    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.location.toLowerCase().includes(q)
      )
    }

    // Location filter
    if (selectedLocation) {
      results = results.filter((h) => h.location === selectedLocation)
    }

    // Price range filter
    const range = PRICE_RANGES[priceRange]
    if (range) {
      results = results.filter(
        (h) => h.pricePerNight >= range.min && h.pricePerNight <= range.max
      )
    }

    // Rating filter
    if (minRating > 0) {
      results = results.filter((h) => h.rating >= minRating)
    }

    // Sort
    switch (sortBy) {
      case 'rating-desc':
        results.sort((a, b) => b.rating - a.rating)
        break
      case 'price-asc':
        results.sort((a, b) => a.pricePerNight - b.pricePerNight)
        break
      case 'price-desc':
        results.sort((a, b) => b.pricePerNight - a.pricePerNight)
        break
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'reviews':
        results.sort((a, b) => b.totalReviews - a.totalReviews)
        break
    }

    return results
  }, [homestays, search, sortBy, priceRange, minRating, selectedLocation])

  const activeFilterCount = [
    priceRange > 0,
    minRating > 0,
    selectedLocation !== '',
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearch('')
    setSortBy('rating-desc')
    setPriceRange(0)
    setMinRating(0)
    setSelectedLocation('')
  }

  const handleToggleWishlist = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      alert('Please sign in to save properties to your wishlist!')
      return
    }
    try {
      const res = await toggleWishlist(id)
      if (res.success) {
        updateUser({ wishlist: res.wishlist })
      }
    } catch (err) {
      console.warn('Failed to toggle wishlist:', err.message)
    }
  }

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : darkMode ? 'text-gray-600' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )

  return (
    <>
      {/* Hero banner */}
      <section className="relative bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-80 h-80 bg-primary-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-300 text-xs font-medium tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Explore Properties
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white leading-tight">
            Find Your Perfect{' '}
            <span className="bg-gradient-to-r from-primary-300 to-accent-400 bg-clip-text text-transparent">
              Getaway
            </span>
          </h1>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Browse verified homestays across India — filter by location, price, and rating to find your ideal stay.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
              <Search className="w-5 h-5 text-gray-300 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or location..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className={`absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t ${darkMode ? 'from-dark-900' : 'from-gray-50'} to-transparent`} />
      </section>

      {/* Main content */}
      <section className={`py-10 ${darkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toolbar: filters toggle + sort + result count */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  showFilters
                    ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : darkMode
                    ? 'border-gray-700 text-gray-300 hover:border-primary-600 hover:bg-gray-800'
                    : 'border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary-500 hover:text-primary-400 font-medium cursor-pointer"
                >
                  Clear all
                </button>
              )}

              <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {filteredHomestays.length} {filteredHomestays.length === 1 ? 'property' : 'properties'} found
              </span>
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm cursor-pointer ${darkMode ? 'border-gray-700 bg-dark-800 text-gray-300' : 'border-gray-200 bg-white text-gray-700'}`}>
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer appearance-none pr-6 text-sm"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div
              className={`rounded-2xl border p-6 mb-8 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}
              style={{ animation: 'slideDown 0.2s ease-out' }}
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Price range */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Price Range
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range, i) => (
                      <button
                        key={i}
                        onClick={() => setPriceRange(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          priceRange === i
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : darkMode
                            ? 'border-gray-600 text-gray-400 hover:border-primary-600'
                            : 'border-gray-200 text-gray-600 hover:border-primary-300'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Min rating */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Minimum Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[0, 3, 3.5, 4, 4.5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                          minRating === r
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : darkMode
                            ? 'border-gray-600 text-gray-400 hover:border-primary-600'
                            : 'border-gray-200 text-gray-600 hover:border-primary-300'
                        }`}
                      >
                        {r === 0 ? 'Any' : (
                          <>
                            {r}+
                            <Star className="w-3 h-3 fill-current" />
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location chips */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Location
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    <button
                      onClick={() => setSelectedLocation('')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        !selectedLocation
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : darkMode
                          ? 'border-gray-600 text-gray-400 hover:border-primary-600'
                          : 'border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      All
                    </button>
                    {locations.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setSelectedLocation(loc === selectedLocation ? '' : loc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                          selectedLocation === loc
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : darkMode
                            ? 'border-gray-600 text-gray-400 hover:border-primary-600'
                            : 'border-gray-200 text-gray-600 hover:border-primary-300'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <HomestayCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredHomestays.length === 0 ? (
            <div className={`rounded-2xl border border-dashed p-16 text-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Search className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <h3 className={`font-heading font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No properties match your search
              </h3>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Try adjusting your filters or search term.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHomestays.map((h) => (
                <Link
                  to={`/homestays/${h._id}`}
                  key={h._id}
                  className={`group rounded-3xl border overflow-hidden hover:shadow-xl transition-all duration-300 ${darkMode ? 'border-gray-700 bg-dark-800 hover:border-primary-700' : 'border-gray-200 bg-white hover:border-primary-300'}`}
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img
                      src={resolveImageUrl(h.image)}
                      alt={h.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Heart wishlist toggle */}
                    {isAuthenticated && user?.role === 'customer' && (
                      <button
                        onClick={(e) => handleToggleWishlist(e, h._id)}
                        className={`absolute top-3 left-3 p-2 rounded-full border backdrop-blur-sm transition-all duration-200 cursor-pointer shadow-md ${
                          wishlistSet.has(h._id)
                            ? 'bg-red-500 border-red-500 text-white hover:bg-red-650'
                            : 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${wishlistSet.has(h._id) ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    {/* Price badge */}
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
                      ₹{h.pricePerNight?.toLocaleString()}/night
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className={`font-heading font-semibold text-lg group-hover:text-primary-500 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {h.name}
                    </h3>
                    <p className={`text-sm mt-1 flex items-center gap-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <MapPin className="w-3.5 h-3.5" />
                      {h.location}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1.5">
                        {renderStars(h.rating)}
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          ({h.totalReviews})
                        </span>
                      </div>
                    </div>
                    {h.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {h.amenities.slice(0, 3).map((a) => (
                          <span key={a} className={`text-[10px] font-medium px-2 py-1 rounded-lg ${darkMode ? 'bg-dark-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                            {a}
                          </span>
                        ))}
                        {h.amenities.length > 3 && (
                          <span className={`text-[10px] font-medium px-2 py-1 rounded-lg ${darkMode ? 'bg-dark-900 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                            +{h.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
