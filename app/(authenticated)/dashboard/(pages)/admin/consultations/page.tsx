"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  TrendingUp, 
  Clock,
  CheckCircle,
  DollarSign,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { getConsultationReports } from "@/actions/admin"

interface ConsultationData {
  totalConsultations: number
  monthlyConsultations: number
  completedConsultations: number
  totalRevenue: number
}

export default function ConsultationReportsPage() {
  const [data, setData] = useState<ConsultationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConsultations = async () => {
    try {
      setLoading(true)
      setError(null)
      const consultationData = await getConsultationReports()
      setData(consultationData)
    } catch (err) {
      console.error("Error loading consultations:", err)
      setError(err instanceof Error ? err.message : "Failed to load consultation data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConsultations()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Consultation Data...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadConsultations}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
        </div>
      </div>
    )
  }

  const completionRate = data.totalConsultations > 0 ? ((data.completedConsultations / data.totalConsultations) * 100).toFixed(1) : "0"

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Consultation Reports</h1>
          <p className="text-muted-foreground">Consultation statistics and analytics</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadConsultations}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalConsultations}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              All time consultations
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Consultations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.monthlyConsultations}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              This month's consultations
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedConsultations}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              {completionRate}% completion rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              Total revenue from consultations
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultation Trends</CardTitle>
          <CardDescription>Monthly consultation volume and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Chart visualization</p>
              <p className="text-xs text-muted-foreground">Integration with chart library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
