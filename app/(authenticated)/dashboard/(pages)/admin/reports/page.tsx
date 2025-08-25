"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  TrendingUp, 
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users
} from "lucide-react"
import { getVerificationReports } from "@/actions/admin"

interface VerificationData {
  approvedThisMonth: number
  rejectedThisMonth: number
  pendingDoctors: number
  totalDoctors: number
  recentVerifications: any[]
}

export default function ReportsPage() {
  const [data, setData] = useState<VerificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const reportsData = await getVerificationReports()
      setData(reportsData)
    } catch (err) {
      console.error("Error loading reports:", err)
      setError(err instanceof Error ? err.message : "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Reports...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Reports</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadReports}>Try Again</Button>
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Verification Reports</h1>
          <p className="text-muted-foreground">Doctor verification statistics and reports</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadReports}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalDoctors}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
              All registered doctors
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.approvedThisMonth}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              Approved doctors
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingDoctors}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-yellow-500 mr-1" />
              Pending verification
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.rejectedThisMonth}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              Rejected applications
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Verifications</CardTitle>
          <CardDescription>Latest doctor verification activities</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentVerifications.length > 0 ? (
            <div className="space-y-4">
              {data.recentVerifications.map((verification) => (
                <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {verification.verificationStatus === "approved" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={verification.verificationStatus === "approved" ? "default" : "destructive"}>
                        {verification.verificationStatus}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">
                        {verification.user?.firstName} {verification.user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {verification.specialty} • {verification.licenseNumber}
                      </p>
                    </div>
                  </div>
                                     <div className="text-right">
                     <p className="text-sm text-muted-foreground">
                       {verification.createdAt ? new Date(verification.createdAt).toLocaleDateString() : "N/A"}
                     </p>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent verifications</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
