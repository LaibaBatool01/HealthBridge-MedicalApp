"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Send,
  User,
  Mail
} from "lucide-react"
import { getCurrentAdminUser } from "@/actions/admin"

interface SupportTicket {
  id: string
  title: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  userEmail: string
  userName: string
  createdAt: Date
  updatedAt: Date
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [reply, setReply] = useState("")

  // Mock data for demonstration
  const mockTickets: SupportTicket[] = [
    {
      id: "1",
      title: "Cannot access consultation room",
      description: "I'm trying to join my scheduled consultation but getting an error message.",
      status: "open",
      priority: "high",
      category: "Technical Issue",
      userEmail: "patient@example.com",
      userName: "John Doe",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: "2",
      title: "Payment not processed",
      description: "I paid for my consultation but it's still showing as pending.",
      status: "in_progress",
      priority: "urgent",
      category: "Payment Issue",
      userEmail: "doctor@example.com",
      userName: "Dr. Sarah Johnson",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    },
    {
      id: "3",
      title: "Account verification pending",
      description: "I submitted my documents for verification but haven't heard back.",
      status: "resolved",
      priority: "medium",
      category: "Account Issue",
      userEmail: "newdoctor@example.com",
      userName: "Dr. Michael Chen",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    }
  ]

  useEffect(() => {
    const loadSupport = async () => {
      try {
        setLoading(true)
        setError(null)
        await getCurrentAdminUser() // Verify admin access
        setTickets(mockTickets)
      } catch (err) {
        console.error("Error loading support tickets:", err)
        setError(err instanceof Error ? err.message : "Failed to load support tickets")
      } finally {
        setLoading(false)
      }
    }
    loadSupport()
  }, [])

  const handleReply = async () => {
    if (!selectedTicket || !reply.trim()) return

    try {
      // In a real app, you'd send the reply to the database
      console.log("Sending reply to ticket:", selectedTicket.id, reply)
      setReply("")
      setSelectedTicket(null)
      // You could also update the ticket status here
    } catch (err) {
      console.error("Error sending reply:", err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800"
      case "in_progress": return "bg-yellow-100 text-yellow-800"
      case "resolved": return "bg-green-100 text-green-800"
      case "closed": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800"
      case "high": return "bg-orange-100 text-orange-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Support Tickets...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Support</h2>
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
          <h1 className="text-3xl font-bold">Support Management</h1>
          <p className="text-muted-foreground">Manage user support tickets and inquiries</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Recent support requests from users</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{ticket.title}</h3>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.userName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {ticket.userEmail}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ticket.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No support tickets found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Support ticket overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Open Tickets</span>
                <Badge variant="outline">
                  {tickets.filter(t => t.status === "open").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">In Progress</span>
                <Badge variant="outline">
                  {tickets.filter(t => t.status === "in_progress").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Resolved</span>
                <Badge variant="outline">
                  {tickets.filter(t => t.status === "resolved").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Urgent</span>
                <Badge variant="outline" className="text-red-600">
                  {tickets.filter(t => t.priority === "urgent").length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {selectedTicket && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Reply to Ticket</CardTitle>
                <CardDescription>Send a response to {selectedTicket.userName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select defaultValue={selectedTicket.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Reply</label>
                  <Textarea
                    placeholder="Type your response..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleReply} disabled={!reply.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
