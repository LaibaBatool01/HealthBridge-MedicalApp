"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { 
  Search,
  Filter,
  Plus,
  FileText,
  Calendar,
  User,
  Clock,
  Edit,
  Save,
  X,
  RefreshCw,
  Download,
  Stethoscope,
  Pill,
  Heart
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  getDoctorConsultationNotes,
  getRecentConsultationNotes,
  getConsultationNotesWithFollowUp,
  getConsultationNotesWithPrescriptions,
  updateConsultationNotes,
  getConsultationNotesStats,
  type ConsultationNoteData
} from "@/actions/consultation-notes"

export default function ConsultationNotesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<ConsultationNoteData[]>([])
  const [filteredNotes, setFilteredNotes] = useState<ConsultationNoteData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNote, setSelectedNote] = useState<ConsultationNoteData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingNotes, setEditingNotes] = useState("")
  const [editingDiagnosis, setEditingDiagnosis] = useState("")
  const [stats, setStats] = useState<{
    total: number
    recent: number
    followUp: number
    prescriptions: number
  } | null>(null)

  useEffect(() => {
    loadConsultationNotes()
  }, [])

  useEffect(() => {
    filterNotes()
  }, [notes, searchTerm, activeTab, filterNotes])

  const loadConsultationNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [allNotes, statsData] = await Promise.all([
        getDoctorConsultationNotes(),
        getConsultationNotesStats()
      ])
      
      setNotes(allNotes)
      setStats(statsData)
    } catch (err) {
      console.error("Error loading consultation notes:", err)
      setError(err instanceof Error ? err.message : "Failed to load consultation notes")
    } finally {
      setLoading(false)
    }
  }

  const filterNotes = async () => {
    try {
      let filtered: ConsultationNoteData[] = []

      // Load different data based on active tab
      switch (activeTab) {
        case "all":
          filtered = notes
          break
        case "recent":
          filtered = await getRecentConsultationNotes(7)
          break
        case "followup":
          filtered = await getConsultationNotesWithFollowUp()
          break
        case "prescriptions":
          filtered = await getConsultationNotesWithPrescriptions()
          break
        default:
          filtered = notes
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(note =>
          note.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (note.diagnosis || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.symptoms.join(", ").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (note.notes || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Sort by consultation date (newest first)
      filtered.sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime())

      setFilteredNotes(filtered)
    } catch (error) {
      console.error("Error filtering notes:", error)
      setFilteredNotes(notes) // Fallback to all notes
    }
  }

  const handleEditNote = (note: ConsultationNoteData) => {
    setSelectedNote(note)
    setEditingNotes(note.notes || "")
    setEditingDiagnosis(note.diagnosis || "")
    setIsEditing(true)
  }

  const handleSaveNote = async () => {
    if (!selectedNote) return

    try {
      await updateConsultationNotes(selectedNote.consultationId, editingNotes, editingDiagnosis)
      
      // Refresh the notes
      await loadConsultationNotes()
      
      setIsEditing(false)
      setSelectedNote(null)
      setEditingNotes("")
      setEditingDiagnosis("")
    } catch (error) {
      console.error("Error updating note:", error)
      setError("Failed to update consultation notes")
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConsultationTypeColor = (type: string) => {
    switch (type) {
      case 'video_call': return 'bg-blue-100 text-blue-800'
      case 'chat_only': return 'bg-green-100 text-green-800'
      case 'in_person': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'video_call': return <Heart className="h-4 w-4" />
      case 'chat_only': return <FileText className="h-4 w-4" />
      case 'in_person': return <Stethoscope className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading consultation notes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Consultation Notes</h1>
          <p className="text-muted-foreground mt-2">
            Manage and review your consultation notes and patient records
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadConsultationNotes} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">All consultation notes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recent || 0}</div>
            <p className="text-xs text-muted-foreground">Recent consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.followUp || 0}</div>
            <p className="text-xs text-muted-foreground">Requiring follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.prescriptions || 0}</div>
            <p className="text-xs text-muted-foreground">With prescriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
            <Button 
              onClick={() => setError(null)} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search notes, patients, or diagnoses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tabs and Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="followup">Follow-up Required</TabsTrigger>
          <TabsTrigger value="prescriptions">With Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No consultation notes found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "Try adjusting your search terms or filters."
                    : "Your consultation notes will appear here once you start documenting patient visits."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={note.patientProfileImage || ''} />
                            <AvatarFallback>
                              {note.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{note.patientName}</h3>
                            <p className="text-sm text-muted-foreground mb-1">{note.patientEmail}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(new Date(note.consultationDate))} at {formatTime(new Date(note.consultationDate))}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={getConsultationTypeColor(note.consultationType)}>
                            {getConsultationTypeIcon(note.consultationType)}
                            <span className="ml-1">{note.consultationType.replace('_', ' ').toUpperCase()}</span>
                          </Badge>
                          <Button
                            onClick={() => handleEditNote(note)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Symptoms:</p>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(note.symptoms) ? note.symptoms.join(", ") : note.symptoms || "No symptoms recorded"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Diagnosis:</p>
                          <p className="text-sm text-muted-foreground">{note.diagnosis || "No diagnosis recorded"}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Notes:</p>
                          <p className="text-sm text-muted-foreground">{note.notes || "No notes recorded"}</p>
                        </div>

                        <div className="flex items-center gap-4 pt-2 border-t">
                          {note.prescriptionGiven && (
                            <Badge variant="outline" className="bg-green-50">
                              <Pill className="h-3 w-3 mr-1" />
                              Prescription Given
                            </Badge>
                          )}
                          {note.followUpRequired && (
                            <Badge variant="outline" className="bg-blue-50">
                              <Clock className="h-3 w-3 mr-1" />
                              Follow-up: {note.followUpDate ? formatDate(new Date(note.followUpDate)) : 'TBD'}
                            </Badge>
                          )}
                          <Badge variant="outline" className={note.status === 'completed' ? 'bg-green-50' : 'bg-yellow-50'}>
                            {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Note Modal */}
      {isEditing && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Edit Consultation Notes</h2>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-medium">Patient: {selectedNote.patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(selectedNote.consultationDate))} - {selectedNote.consultationType}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Diagnosis:</label>
                  <Input
                    value={editingDiagnosis}
                    onChange={(e) => setEditingDiagnosis(e.target.value)}
                    className="mt-1"
                    placeholder="Enter diagnosis..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Consultation Notes:</label>
                  <Textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    rows={8}
                    className="mt-1"
                    placeholder="Enter detailed consultation notes..."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveNote}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
