"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  Stethoscope,
  Heart,
  Brain,
  Activity,
  Thermometer,
  Users,
  ArrowRight,
  CheckCircle,
  Video,
  MessageCircle
} from "lucide-react"
import { getAllDoctors, getDoctorsBySpecialty, searchDoctors, type DoctorWithUser } from "@/actions/doctors"

const specialties = [
  { value: 'general_practice', label: 'General Practice', icon: Stethoscope },
  { value: 'cardiology', label: 'Cardiology', icon: Heart },
  { value: 'dermatology', label: 'Dermatology', icon: Thermometer },
  { value: 'endocrinology', label: 'Endocrinology', icon: Activity },
  { value: 'gastroenterology', label: 'Gastroenterology', icon: Stethoscope },
  { value: 'neurology', label: 'Neurology', icon: Brain },
  { value: 'oncology', label: 'Oncology', icon: Activity },
  { value: 'pediatrics', label: 'Pediatrics', icon: Users },
  { value: 'psychiatry', label: 'Psychiatry', icon: Brain },
  { value: 'orthopedics', label: 'Orthopedics', icon: Activity },
  { value: 'ophthalmology', label: 'Ophthalmology', icon: Activity },
  { value: 'gynecology', label: 'Gynecology', icon: Users },
  { value: 'urology', label: 'Urology', icon: Stethoscope },
  { value: 'radiology', label: 'Radiology', icon: Activity },
  { value: 'emergency_medicine', label: 'Emergency Medicine', icon: Activity },
  { value: 'other', label: 'Other', icon: Stethoscope }
]

type SortOption = 'rating' | 'experience' | 'fee' | 'name'
type SortOrder = 'asc' | 'desc'

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorWithUser[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available'>('all')

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    filterAndSortDoctors()
  }, [filterAndSortDoctors])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const allDoctors = await getAllDoctors()
      setDoctors(allDoctors)
    } catch (error) {
      console.error('Error loading doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortDoctors = useCallback(() => {
    let filtered = [...doctors]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doctor => 
        doctor.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.subSpecialty && doctor.subSpecialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doctor.bio && doctor.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by specialty
    if (selectedSpecialty && selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty)
    }

    // Filter by availability
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(doctor => doctor.isAvailable)
    }

    // Sort doctors
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'rating':
          aValue = parseFloat(a.rating || '0')
          bValue = parseFloat(b.rating || '0')
          break
        case 'experience':
          aValue = a.yearsOfExperience || 0
          bValue = b.yearsOfExperience || 0
          break
        case 'fee':
          aValue = parseFloat(a.consultationFee || '0')
          bValue = parseFloat(b.consultationFee || '0')
          break
        case 'name':
          aValue = `${a.user.firstName} ${a.user.lastName}`
          bValue = `${b.user.firstName} ${b.user.lastName}`
          break
        default:
          aValue = 0
          bValue = 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredDoctors(filtered)
  }, [doctors, searchQuery, selectedSpecialty, sortBy, sortOrder, availabilityFilter])

  const handleSpecialtyChange = async (specialty: string) => {
    setSelectedSpecialty(specialty)
    if (specialty && specialty !== 'all') {
      try {
        setLoading(true)
        const specialtyDoctors = await getDoctorsBySpecialty(specialty)
        setDoctors(specialtyDoctors)
      } catch (error) {
        console.error('Error loading doctors by specialty:', error)
      } finally {
        setLoading(false)
      }
    } else {
      loadDoctors()
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length >= 3) {
      try {
        setLoading(true)
        const searchResults = await searchDoctors(query)
        setDoctors(searchResults)
      } catch (error) {
        console.error('Error searching doctors:', error)
      } finally {
        setLoading(false)
      }
    } else if (query.length === 0) {
      loadDoctors()
    }
  }

  const getSpecialtyIcon = (specialty: string) => {
    const specialtyData = specialties.find(s => s.value === specialty)
    return specialtyData?.icon || Stethoscope
  }

  const getSpecialtyLabel = (specialty: string) => {
    const specialtyData = specialties.find(s => s.value === specialty)
    return specialtyData?.label || specialty.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatConsultationFee = (fee: string | null) => {
    if (!fee) return 'Contact for pricing'
    return `$${parseFloat(fee).toFixed(0)}`
  }

  const getNextAvailableTime = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    return tomorrow.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Doctors</h1>
        <p className="text-muted-foreground">
          Browse verified doctors and book consultations
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by name, specialty..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Specialty</label>
              <Select value={selectedSpecialty} onValueChange={handleSpecialtyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.value} value={specialty.value}>
                      <div className="flex items-center gap-2">
                        <specialty.icon className="h-4 w-4" />
                        {specialty.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="fee">Consultation Fee</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-sm font-medium mb-2 block">Order</label>
              <div className="flex gap-2">
                <Button
                  variant={sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('desc')}
                  className="flex-1"
                >
                  <SortDesc className="h-4 w-4 mr-1" />
                  Desc
                </Button>
                <Button
                  variant={sortOrder === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('asc')}
                  className="flex-1"
                >
                  <SortAsc className="h-4 w-4 mr-1" />
                  Asc
                </Button>
              </div>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Availability</label>
            <div className="flex gap-2">
              <Button
                variant={availabilityFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAvailabilityFilter('all')}
              >
                All Doctors
              </Button>
              <Button
                variant={availabilityFilter === 'available' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAvailabilityFilter('available')}
              >
                Available Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {loading ? 'Loading...' : `${filteredDoctors.length} doctors found`}
        </h2>
        {!loading && filteredDoctors.length > 0 && (
          <p className="text-muted-foreground">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </p>
        )}
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedSpecialty('')
              loadDoctors()
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Dr. {doctor.user.firstName} {doctor.user.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {(() => {
                          const IconComponent = getSpecialtyIcon(doctor.specialty)
                          return <IconComponent className="h-4 w-4" />
                        })()}
                        {getSpecialtyLabel(doctor.specialty)}
                        {doctor.subSpecialty && (
                          <span className="text-xs text-muted-foreground">
                            • {doctor.subSpecialty}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant={doctor.isAvailable ? 'default' : 'secondary'}>
                      {doctor.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(parseFloat(doctor.rating || '0'))
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {parseFloat(doctor.rating || '0').toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({doctor.totalRatings || 0} reviews)
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Experience and Fee */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {doctor.yearsOfExperience || 0}+ years
                    </span>
                    <span className="font-medium">
                      {formatConsultationFee(doctor.consultationFee ?? null)}
                    </span>
                  </div>

                  {/* Bio */}
                  {doctor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {doctor.bio}
                    </p>
                  )}

                  {/* Languages */}
                  {doctor.languages && (
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        try {
                          const languages = JSON.parse(doctor.languages ?? '[]')
                          return languages.map((lang: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))
                        } catch {
                          return null
                        }
                      })()}
                    </div>
                  )}

                  {/* Next Available */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Next available: {getNextAvailableTime()}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" size="sm">
                      <Video className="h-4 w-4 mr-1" />
                      Book Video
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
} 