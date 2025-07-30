"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  Calendar, 
  Heart,
  Brain,
  Stethoscope,
  Eye,
  Zap,
  Filter,
  MessageCircle,
  Video
} from "lucide-react"

type Doctor = {
  id: string
  name: string
  specialty: string
  subSpecialty?: string
  rating: number
  reviewCount: number
  yearsExperience: number
  consultationFee: number
  isAvailable: boolean
  nextAvailable: string
  languages: string[]
  bio: string
  avatar?: string
  education: string[]
  certifications: string[]
}

const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    subSpecialty: "Interventional Cardiology",
    rating: 4.9,
    reviewCount: 127,
    yearsExperience: 12,
    consultationFee: 75,
    isAvailable: true,
    nextAvailable: "Today 2:30 PM",
    languages: ["English", "Spanish"],
    bio: "Specialized in heart disease prevention and minimally invasive cardiac procedures.",
    avatar: "/api/placeholder/100/100",
    education: ["Harvard Medical School", "Johns Hopkins Residency"],
    certifications: ["Board Certified Cardiologist", "FACC"]
  },
  {
    id: "2", 
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    subSpecialty: "Headache Medicine",
    rating: 4.8,
    reviewCount: 89,
    yearsExperience: 8,
    consultationFee: 80,
    isAvailable: true,
    nextAvailable: "Tomorrow 10:00 AM",
    languages: ["English", "Mandarin"],
    bio: "Expert in treating chronic headaches, migraines, and neurological disorders.",
    education: ["Stanford Medical School", "UCSF Neurology Residency"],
    certifications: ["Board Certified Neurologist"]
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "General Practice", 
    rating: 4.7,
    reviewCount: 203,
    yearsExperience: 15,
    consultationFee: 50,
    isAvailable: false,
    nextAvailable: "Monday 9:00 AM",
    languages: ["English", "Spanish", "Portuguese"],
    bio: "Comprehensive primary care with focus on preventive medicine and family health.",
    education: ["UCLA Medical School", "Kaiser Permanente Residency"],
    certifications: ["Board Certified Family Medicine"]
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Dermatology",
    subSpecialty: "Cosmetic Dermatology",
    rating: 4.9,
    reviewCount: 156,
    yearsExperience: 10,
    consultationFee: 85,
    isAvailable: true,
    nextAvailable: "Today 4:00 PM",
    languages: ["English"],
    bio: "Specialized in skin conditions, acne treatment, and cosmetic procedures.",
    education: ["Mayo Clinic Medical School", "Cleveland Clinic Residency"],
    certifications: ["Board Certified Dermatologist", "FAAD"]
  }
]

const specialties = [
  { id: "all", name: "All Specialties", icon: Stethoscope },
  { id: "general_practice", name: "General Practice", icon: Heart },
  { id: "cardiology", name: "Cardiology", icon: Heart },
  { id: "dermatology", name: "Dermatology", icon: Eye },
  { id: "neurology", name: "Neurology", icon: Brain },
  { id: "pediatrics", name: "Pediatrics", icon: Heart },
  { id: "psychiatry", name: "Psychiatry", icon: Brain },
  { id: "orthopedics", name: "Orthopedics", icon: Zap }
]

export default function FindDoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [doctors, setDoctors] = useState(mockDoctors)

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty = selectedSpecialty === "all" || 
                            doctor.specialty.toLowerCase().replace(" ", "_") === selectedSpecialty
    const matchesAvailability = !availableOnly || doctor.isAvailable
    
    return matchesSearch && matchesSpecialty && matchesAvailability
  })

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "experience":
        return b.yearsExperience - a.yearsExperience
      case "price_low":
        return a.consultationFee - b.consultationFee
      case "price_high":
        return b.consultationFee - a.consultationFee
      default:
        return 0
    }
  })

  const getSpecialtyIcon = (specialty: string) => {
    const specialtyData = specialties.find(s => 
      s.name.toLowerCase() === specialty.toLowerCase()
    )
    return specialtyData?.icon || Stethoscope
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Doctors</h1>
        <p className="text-muted-foreground mt-2">
          Search and connect with qualified healthcare professionals.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors by name or specialty..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={availableOnly ? "default" : "outline"}
                onClick={() => setAvailableOnly(!availableOnly)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Available Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found {sortedDoctors.length} doctors
            {selectedSpecialty !== "all" && ` in ${specialties.find(s => s.id === selectedSpecialty)?.name}`}
          </p>
        </div>

        {sortedDoctors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or removing filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedDoctors.map((doctor) => {
              const SpecialtyIcon = getSpecialtyIcon(doctor.specialty)
              
              return (
                <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Doctor Avatar */}
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={doctor.avatar} />
                        <AvatarFallback className="text-lg">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      {/* Doctor Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{doctor.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <SpecialtyIcon className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-600 font-medium">{doctor.specialty}</span>
                              {doctor.subSpecialty && (
                                <span className="text-muted-foreground">• {doctor.subSpecialty}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold">${doctor.consultationFee}</div>
                            <div className="text-sm text-muted-foreground">per consultation</div>
                          </div>
                        </div>

                        {/* Rating and Experience */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{doctor.rating}</span>
                            <span className="text-muted-foreground">({doctor.reviewCount} reviews)</span>
                          </div>
                          <div className="text-muted-foreground">
                            {doctor.yearsExperience} years experience
                          </div>
                          <div className="flex gap-1">
                            {doctor.languages.map((lang) => (
                              <Badge key={lang} variant="secondary" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-muted-foreground text-sm">{doctor.bio}</p>

                        {/* Availability and Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className={`text-sm font-medium ${doctor.isAvailable ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {doctor.isAvailable ? 'Available' : 'Next available'}: {doctor.nextAvailable}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <MessageCircle className="h-4 w-4" />
                              Message
                            </Button>
                            <Button size="sm" className="gap-2">
                              <Video className="h-4 w-4" />
                              Book Consultation
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 