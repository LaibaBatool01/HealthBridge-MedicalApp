"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Search, 
  Plus, 
  X, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Thermometer,
  Heart,
  Brain,
  Zap,
  Eye,
  Stethoscope,
  ArrowRight
} from "lucide-react"

type Symptom = {
  id: string
  name: string
  category: string
  severity: "mild" | "moderate" | "severe"
  duration: string
  description: string
}

type SymptomCategory = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  symptoms: string[]
}

const symptomCategories: SymptomCategory[] = [
  {
    id: "respiratory",
    name: "Respiratory",
    icon: Stethoscope,
    color: "bg-blue-100 text-blue-700",
    symptoms: ["Cough", "Shortness of breath", "Chest pain", "Wheezing", "Sore throat"]
  },
  {
    id: "cardiovascular", 
    name: "Heart & Circulation",
    icon: Heart,
    color: "bg-red-100 text-red-700",
    symptoms: ["Chest pain", "Palpitations", "Dizziness", "Fatigue", "Swelling"]
  },
  {
    id: "neurological",
    name: "Neurological",
    icon: Brain,
    color: "bg-purple-100 text-purple-700", 
    symptoms: ["Headache", "Dizziness", "Memory issues", "Numbness", "Seizures"]
  },
  {
    id: "gastrointestinal",
    name: "Digestive",
    icon: Zap,
    color: "bg-green-100 text-green-700",
    symptoms: ["Nausea", "Vomiting", "Diarrhea", "Abdominal pain", "Constipation"]
  },
  {
    id: "other",
    name: "General",
    icon: Thermometer,
    color: "bg-yellow-100 text-yellow-700",
    symptoms: ["Fever", "Fatigue", "Weight loss", "Night sweats", "Rash"]
  }
]

export default function SymptomCheckerPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([])
  const [currentSymptom, setCurrentSymptom] = useState({
    name: "",
    category: "",
    severity: "" as "mild" | "moderate" | "severe" | "",
    duration: "",
    description: ""
  })
  const [showAssessment, setShowAssessment] = useState(false)
  const [selectedBodyPart, setSelectedBodyPart] = useState("")

  const addSymptom = () => {
    if (currentSymptom.name && currentSymptom.severity && currentSymptom.duration) {
      const newSymptom: Symptom = {
        id: Date.now().toString(),
        name: currentSymptom.name,
        category: currentSymptom.category,
        severity: currentSymptom.severity,
        duration: currentSymptom.duration,
        description: currentSymptom.description
      }
      
      setSelectedSymptoms([...selectedSymptoms, newSymptom])
      setCurrentSymptom({
        name: "",
        category: "",
        severity: "",
        duration: "",
        description: ""
      })
    }
  }

  const removeSymptom = (id: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== id))
  }

  const generateAssessment = () => {
    setShowAssessment(true)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild": return "bg-green-100 text-green-800"
      case "moderate": return "bg-yellow-100 text-yellow-800"
      case "severe": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRecommendedSpecialist = (symptoms: Symptom[]) => {
    const categories = symptoms.map(s => s.category)
    if (categories.includes("cardiovascular")) return "Cardiologist"
    if (categories.includes("neurological")) return "Neurologist"
    if (categories.includes("respiratory")) return "Pulmonologist"
    if (categories.includes("gastrointestinal")) return "Gastroenterologist"
    return "General Practitioner"
  }

  const getUrgencyLevel = (symptoms: Symptom[]) => {
    const hasSevere = symptoms.some(s => s.severity === "severe")
    const hasMultipleModerate = symptoms.filter(s => s.severity === "moderate").length >= 2
    
    if (hasSevere) return { level: "High", color: "text-red-600", message: "Consider seeking immediate medical attention" }
    if (hasMultipleModerate) return { level: "Medium", color: "text-yellow-600", message: "Schedule an appointment within 24-48 hours" }
    return { level: "Low", color: "text-green-600", message: "Monitor symptoms and consult if they persist" }
  }

  if (showAssessment) {
    const urgency = getUrgencyLevel(selectedSymptoms)
    const specialist = getRecommendedSpecialist(selectedSymptoms)

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => setShowAssessment(false)}
            className="p-0"
          >
            ← Back to Symptom Checker
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Symptom Assessment
            </CardTitle>
            <CardDescription>
              Based on your reported symptoms, here's our assessment and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Urgency Level */}
            <div className={`p-4 rounded-lg border-l-4 ${urgency.level === 'High' ? 'border-red-500 bg-red-50' : urgency.level === 'Medium' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Urgency Level:</span>
                <Badge className={`${urgency.color} bg-transparent`}>{urgency.level}</Badge>
              </div>
              <p className={urgency.color}>{urgency.message}</p>
            </div>

            {/* Symptoms Summary */}
            <div>
              <h3 className="font-semibold mb-3">Your Reported Symptoms:</h3>
              <div className="space-y-2">
                {selectedSymptoms.map((symptom) => (
                  <div key={symptom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{symptom.name}</span>
                      <span className="text-muted-foreground ml-2">• {symptom.duration}</span>
                    </div>
                    <Badge className={getSeverityColor(symptom.severity)}>
                      {symptom.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommended Specialist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-semibold">{specialist}</p>
                      <p className="text-sm text-muted-foreground">
                        Best suited for your symptoms
                      </p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" asChild>
                    <a href="/dashboard/find-doctors">
                      Find {specialist}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Book a consultation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Monitor symptoms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Keep a symptom diary</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Schedule Consultation
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> This assessment is for informational purposes only and should not replace professional medical advice. 
                Always consult with a healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Symptom Checker</h1>
        <p className="text-muted-foreground mt-2">
          Tell us about your symptoms to get personalized recommendations and find the right specialist.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Symptom Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Select by Category</CardTitle>
              <CardDescription>
                Choose the category that best describes your symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {symptomCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => setCurrentSymptom({...currentSymptom, category: category.id})}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <category.icon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.symptoms.slice(0, 2).join(", ")}...
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Symptom Form */}
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Symptom</CardTitle>
              <CardDescription>
                Provide details about what you're experiencing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="symptom-name">Symptom Name</Label>
                  <Input
                    id="symptom-name"
                    placeholder="e.g., Headache, Cough, Fever"
                    value={currentSymptom.name}
                    onChange={(e) => setCurrentSymptom({...currentSymptom, name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="body-part">Body Part (Optional)</Label>
                  <Input
                    id="body-part"
                    placeholder="e.g., Head, Chest, Abdomen"
                    value={selectedBodyPart}
                    onChange={(e) => setSelectedBodyPart(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={currentSymptom.severity} onValueChange={(value: "mild" | "moderate" | "severe") => setCurrentSymptom({...currentSymptom, severity: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="How severe is it?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild - Barely noticeable</SelectItem>
                      <SelectItem value="moderate">Moderate - Noticeable discomfort</SelectItem>
                      <SelectItem value="severe">Severe - Significant discomfort</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={currentSymptom.duration} onValueChange={(value) => setCurrentSymptom({...currentSymptom, duration: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="How long?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Less than 1 hour">Less than 1 hour</SelectItem>
                      <SelectItem value="1-6 hours">1-6 hours</SelectItem>
                      <SelectItem value="6-24 hours">6-24 hours</SelectItem>
                      <SelectItem value="1-3 days">1-3 days</SelectItem>
                      <SelectItem value="3-7 days">3-7 days</SelectItem>
                      <SelectItem value="More than 1 week">More than 1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Additional Details (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe triggers, what makes it better/worse, any associated symptoms..."
                  value={currentSymptom.description}
                  onChange={(e) => setCurrentSymptom({...currentSymptom, description: e.target.value})}
                />
              </div>

              <Button onClick={addSymptom} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Symptom
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Selected Symptoms */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Your Symptoms
                <Badge variant="secondary">{selectedSymptoms.length}</Badge>
              </CardTitle>
              <CardDescription>
                {selectedSymptoms.length === 0 
                  ? "Add symptoms to get started" 
                  : "Review your symptoms before assessment"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedSymptoms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No symptoms added yet</p>
                </div>
              ) : (
                <>
                  {selectedSymptoms.map((symptom) => (
                    <div key={symptom.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{symptom.name}</span>
                          <Badge className={getSeverityColor(symptom.severity)}>
                            {symptom.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {symptom.duration}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSymptom(symptom.id)}
                        className="p-1 h-auto"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    onClick={generateAssessment}
                    className="w-full mt-4"
                    disabled={selectedSymptoms.length === 0}
                  >
                    Get Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 