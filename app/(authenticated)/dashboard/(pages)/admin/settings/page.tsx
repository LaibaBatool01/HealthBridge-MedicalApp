"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings, 
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react"
import { getCurrentAdminUser } from "@/actions/admin"

interface AdminSettings {
  platformName: string
  consultationFee: number
  platformFeePercentage: number
  autoApproveDoctors: boolean
  requireDocumentVerification: boolean
  maxConsultationDuration: number
  enableNotifications: boolean
  maintenanceMode: boolean
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    platformName: "HealthBridge",
    consultationFee: 85,
    platformFeePercentage: 10,
    autoApproveDoctors: false,
    requireDocumentVerification: true,
    maxConsultationDuration: 30,
    enableNotifications: true,
    maintenanceMode: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        // In a real app, you'd fetch settings from the database
        // For now, we'll use default settings
        await getCurrentAdminUser() // Verify admin access
        setLoading(false)
      } catch (err) {
        console.error("Error loading settings:", err)
        setError(err instanceof Error ? err.message : "Failed to load settings")
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      // In a real app, you'd save settings to the database
      // For now, we'll simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess("Settings saved successfully!")
    } catch (err) {
      console.error("Error saving settings:", err)
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Settings...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Settings</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                value={settings.platformName}
                onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                placeholder="Enter platform name"
              />
            </div>
            
            <div>
              <Label htmlFor="consultationFee">Default Consultation Fee ($)</Label>
              <Input
                id="consultationFee"
                type="number"
                value={settings.consultationFee}
                onChange={(e) => setSettings({...settings, consultationFee: Number(e.target.value)})}
                placeholder="85"
              />
            </div>

            <div>
              <Label htmlFor="platformFee">Platform Fee Percentage (%)</Label>
              <Input
                id="platformFee"
                type="number"
                value={settings.platformFeePercentage}
                onChange={(e) => setSettings({...settings, platformFeePercentage: Number(e.target.value)})}
                placeholder="10"
              />
            </div>

            <div>
              <Label htmlFor="maxDuration">Max Consultation Duration (minutes)</Label>
              <Select 
                value={settings.maxConsultationDuration.toString()}
                onValueChange={(value) => setSettings({...settings, maxConsultationDuration: Number(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Settings</CardTitle>
            <CardDescription>Doctor verification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoApprove">Auto-approve Doctors</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve new doctor registrations
                </p>
              </div>
              <Switch
                id="autoApprove"
                checked={settings.autoApproveDoctors}
                onCheckedChange={(checked) => setSettings({...settings, autoApproveDoctors: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireDocs">Require Document Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require document upload for doctor verification
                </p>
              </div>
              <Switch
                id="requireDocs"
                checked={settings.requireDocumentVerification}
                onCheckedChange={(checked) => setSettings({...settings, requireDocumentVerification: checked})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>System-wide configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email and push notifications
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => setSettings({...settings, enableNotifications: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put platform in maintenance mode
                </p>
              </div>
              <Switch
                id="maintenance"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              System Health Check
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertCircle className="h-4 w-4 mr-2" />
              View Error Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
