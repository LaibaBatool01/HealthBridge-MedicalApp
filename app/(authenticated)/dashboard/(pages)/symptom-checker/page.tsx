"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Heart,
  Brain,
  Activity,
  Thermometer,
  Stethoscope,
  ArrowRight,
  Info,
  Calendar,
  MapPin
} from "lucide-react"

interface Symptom {
  id: string
  name: string
  category: string
  description: string
  severity: 'mild' | 'moderate' | 'severe' | 'critical'
  duration: string
  frequency: string
  triggers?: string
  associatedSymptoms?: string[]
  bodyPart?: string
  onsetDate?: Date
  urgencyLevel: number
}

interface AssessmentResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  shouldSeekCare: boolean
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'routine'
  possibleConditions: string[]
}

const symptomCategories = [
  { value: 'respiratory', label: 'Respiratory', icon: Activity },
  { value: 'cardiovascular', label: 'Cardiovascular', icon: Heart },
  { value: 'neurological', label: 'Neurological', icon: Brain },
  { value: 'gastrointestinal', label: 'Gastrointestinal', icon: Stethoscope },
  { value: 'musculoskeletal', label: 'Musculoskeletal', icon: Activity },
  { value: 'dermatological', label: 'Dermatological', icon: Thermometer },
  { value: 'psychological', label: 'Psychological', icon: Brain },
  { value: 'genitourinary', label: 'Genitourinary', icon: Stethoscope },
  { value: 'endocrine', label: 'Endocrine', icon: Activity },
  { value: 'other', label: 'Other', icon: Info }
]

const commonSymptoms = [
  { name: 'Headache', category: 'neurological', severity: 'moderate' as const },
  { name: 'Fever', category: 'other', severity: 'moderate' as const },
  { name: 'Cough', category: 'respiratory', severity: 'mild' as const },
  { name: 'Chest Pain', category: 'cardiovascular', severity: 'severe' as const },
  { name: 'Nausea', category: 'gastrointestinal', severity: 'moderate' as const },
  { name: 'Fatigue', category: 'other', severity: 'mild' as const },
  { name: 'Shortness of Breath', category: 'respiratory', severity: 'severe' as const },
  { name: 'Dizziness', category: 'neurological', severity: 'moderate' as const },
  { name: 'Abdominal Pain', category: 'gastrointestinal', severity: 'moderate' as const },
  { name: 'Joint Pain', category: 'musculoskeletal', severity: 'moderate' as const }
]

export default function SymptomCheckerPage() {
  const [currentStep, setCurrentStep] = useState<'input' | 'assessment' | 'result'>('input')
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [symptomName, setSymptomName] = useState('')
  const [symptomDescription, setSymptomDescription] = useState('')
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | 'critical'>('moderate')
  const [duration, setDuration] = useState('')
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [isAssessing, setIsAssessing] = useState(false)

  const addSymptom = () => {
    if (!symptomName.trim() || !selectedCategory) return

      const newSymptom: Symptom = {
        id: Date.now().toString(),
      name: symptomName,
      category: selectedCategory,
      description: symptomDescription,
      severity,
      duration,
      frequency: 'constant',
      urgencyLevel: severity === 'critical' ? 5 : severity === 'severe' ? 4 : severity === 'moderate' ? 3 : 2,
      onsetDate: new Date()
    }

    setSymptoms([...symptoms, newSymptom])
    setSymptomName('')
    setSymptomDescription('')
    setSelectedCategory('')
    setSeverity('moderate')
    setDuration('')
  }

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id))
  }

  const quickAddSymptom = (symptom: typeof commonSymptoms[0]) => {
    const newSymptom: Symptom = {
      id: Date.now().toString(),
      name: symptom.name,
      category: symptom.category,
      description: `Experiencing ${symptom.name.toLowerCase()}`,
      severity: symptom.severity,
      duration: '1 day',
      frequency: 'constant',
      urgencyLevel: symptom.severity === 'critical' ? 5 : symptom.severity === 'severe' ? 4 : symptom.severity === 'moderate' ? 3 : 2,
      onsetDate: new Date()
    }

    setSymptoms([...symptoms, newSymptom])
  }

  const assessSymptoms = async () => {
    if (symptoms.length === 0) return

    setIsAssessing(true)
    setCurrentStep('assessment')

    // Simulate AI assessment
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Determine risk level based on symptoms
    const maxUrgency = Math.max(...symptoms.map(s => s.urgencyLevel))
    const hasCriticalSymptoms = symptoms.some(s => s.severity === 'critical')
    const hasSevereSymptoms = symptoms.some(s => s.severity === 'severe')

    let riskLevel: AssessmentResult['riskLevel'] = 'low'
    let urgency: AssessmentResult['urgency'] = 'routine'
    let shouldSeekCare = false

    if (hasCriticalSymptoms || maxUrgency >= 5) {
      riskLevel = 'critical'
      urgency = 'immediate'
      shouldSeekCare = true
    } else if (hasSevereSymptoms || maxUrgency >= 4) {
      riskLevel = 'high'
      urgency = 'within_24h'
      shouldSeekCare = true
    } else if (maxUrgency >= 3) {
      riskLevel = 'medium'
      urgency = 'within_week'
      shouldSeekCare = true
    } else {
      riskLevel = 'low'
      urgency = 'routine'
      shouldSeekCare = false
    }

    // Generate recommendations based on symptoms
    const recommendations: string[] = []
    const possibleConditions: string[] = []

    symptoms.forEach(symptom => {
      switch (symptom.category) {
        case 'cardiovascular':
          if (symptom.name.toLowerCase().includes('chest')) {
            recommendations.push('Seek immediate medical attention for chest pain')
            possibleConditions.push('Angina', 'Heart attack', 'Costochondritis')
          }
          break
        case 'respiratory':
          if (symptom.name.toLowerCase().includes('breath')) {
            recommendations.push('Monitor breathing and seek care if symptoms worsen')
            possibleConditions.push('Asthma', 'COPD', 'Pneumonia')
          }
          break
        case 'neurological':
          if (symptom.name.toLowerCase().includes('headache')) {
            recommendations.push('Rest in a quiet, dark room and stay hydrated')
            possibleConditions.push('Migraine', 'Tension headache', 'Sinus headache')
          }
          break
        default:
          recommendations.push(`Monitor ${symptom.name.toLowerCase()} symptoms`)
      }
    })

    if (recommendations.length === 0) {
      recommendations.push('Monitor symptoms and seek care if they persist or worsen')
    }

    const result: AssessmentResult = {
      riskLevel,
      recommendations,
      shouldSeekCare,
      urgency,
      possibleConditions
    }

    setAssessmentResult(result)
    setCurrentStep('result')
    setIsAssessing(false)
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'Seek immediate medical care'
      case 'within_24h': return 'Seek care within 24 hours'
      case 'within_week': return 'Schedule appointment within a week'
      case 'routine': return 'Monitor symptoms'
      default: return 'Monitor symptoms'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Symptom Checker</h1>
        <p className="text-muted-foreground">
          Describe your symptoms and get AI-powered health recommendations
        </p>
      </div>

      {currentStep === 'input' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Quick Add Common Symptoms */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Quick Add Common Symptoms
              </CardTitle>
              <CardDescription>
                Click on common symptoms to add them quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {commonSymptoms.map((symptom) => (
                  <Button
                    key={symptom.name}
                    variant="outline"
                    size="sm"
                    onClick={() => quickAddSymptom(symptom)}
                    className="text-xs"
                  >
                    {symptom.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Custom Symptom */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Custom Symptom</CardTitle>
              <CardDescription>
                Describe your symptoms in detail for better assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Symptom Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {symptomCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="h-4 w-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="symptom">Symptom Name</Label>
                  <Input
                    id="symptom"
                    value={symptomName}
                    onChange={(e) => setSymptomName(e.target.value)}
                    placeholder="e.g., Headache, Fever, Chest Pain"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={symptomDescription}
                  onChange={(e) => setSymptomDescription(e.target.value)}
                  placeholder="Describe your symptoms in detail..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 2 days, 1 week"
                />
              </div>
                <div className="flex items-end">
              <Button onClick={addSymptom} className="w-full">
                Add Symptom
              </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Symptoms */}
          {symptoms.length > 0 && (
            <Card className="mb-6">
            <CardHeader>
                <CardTitle>Current Symptoms ({symptoms.length})</CardTitle>
            </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {symptoms.map((symptom) => (
                    <div key={symptom.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={symptom.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {symptom.severity}
                          </Badge>
                          <span className="font-medium">{symptom.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{symptom.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {symptom.duration}
                          </span>
                          <span className="capitalize">{symptom.category}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSymptom(symptom.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
                  
          {/* Assessment Button */}
          <div className="text-center">
                  <Button 
              onClick={assessSymptoms}
              disabled={symptoms.length === 0}
              size="lg"
              className="px-8"
            >
              Assess Symptoms
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
          </div>
        </motion.div>
      )}

      {currentStep === 'assessment' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Symptoms</h2>
          <p className="text-muted-foreground">
            Our AI is assessing your symptoms and generating personalized recommendations...
          </p>
        </motion.div>
      )}

      {currentStep === 'result' && assessmentResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Risk Assessment */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getRiskLevelColor(assessmentResult.riskLevel)}`}></div>
                <CardTitle>Risk Assessment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Risk Level</h3>
                  <Badge 
                    variant={assessmentResult.riskLevel === 'critical' ? 'destructive' : 'secondary'}
                    className="text-lg px-4 py-2"
                  >
                    {assessmentResult.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Recommended Action</h3>
                  <p className="text-lg font-medium">
                    {getUrgencyText(assessmentResult.urgency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessmentResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p>{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Possible Conditions */}
          {assessmentResult.possibleConditions.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Possible Conditions
                </CardTitle>
                <CardDescription>
                  These are potential conditions based on your symptoms. Only a healthcare provider can provide a proper diagnosis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {assessmentResult.possibleConditions.map((condition, index) => (
                    <Badge key={index} variant="outline">
                      {condition}
                    </Badge>
                  ))}
                </div>
            </CardContent>
          </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setCurrentStep('input')}
              variant="outline"
              size="lg"
            >
              Add More Symptoms
            </Button>
            {assessmentResult.shouldSeekCare && (
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Book Consultation
              </Button>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800">Important Disclaimer</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This symptom checker is for informational purposes only and should not replace professional medical advice. 
                  If you're experiencing severe symptoms, please seek immediate medical attention.
                </p>
        </div>
      </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 