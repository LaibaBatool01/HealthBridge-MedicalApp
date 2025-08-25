"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  FileText,
  Search,
  Plus,
  ArrowRight,
  Calendar,
  User,
  Tag,
  Send,
  BookOpen,
  Headphones,
  Shield,
  Zap
} from "lucide-react"

interface SupportTicket {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  response?: string
}

const supportCategories = [
  { value: 'technical', label: 'Technical Issue', icon: Zap },
  { value: 'billing', label: 'Billing & Payment', icon: Shield },
  { value: 'consultation', label: 'Consultation', icon: MessageCircle },
  { value: 'account', label: 'Account & Profile', icon: User },
  { value: 'prescription', label: 'Prescription', icon: FileText },
  { value: 'general', label: 'General Inquiry', icon: HelpCircle }
]

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
]

const faqs = [
  {
    category: 'General',
    questions: [
      {
        question: "How do I schedule a consultation?",
        answer: "You can schedule a consultation by going to the 'Find Doctors' page, browsing available doctors, and clicking 'Book Consultation'. You'll be able to choose between video calls, chat, or phone consultations."
      },
      {
        question: "What if I need to cancel an appointment?",
        answer: "You can cancel appointments up to 24 hours before the scheduled time through your dashboard. Go to 'My Consultations' and click on the appointment you want to cancel."
      },
      {
        question: "How do I update my medical information?",
        answer: "You can update your medical information in your profile settings. Go to 'Account' in your dashboard and select 'Medical Profile' to edit your information."
      }
    ]
  },
  {
    category: 'Technical',
    questions: [
      {
        question: "I can't access the video consultation room",
        answer: "Please check your internet connection and ensure your browser supports WebRTC. Try refreshing the page or using a different browser. If the issue persists, contact our technical support."
      },
      {
        question: "The app is loading slowly",
        answer: "Try clearing your browser cache and cookies. If you're on a mobile device, ensure you have a stable internet connection. The app works best on high-speed internet connections."
      },
      {
        question: "I can't upload my medical documents",
        answer: "Ensure your files are in PDF, JPG, or PNG format and are under 10MB. If you're still having issues, try using a different browser or contact support."
      }
    ]
  },
  {
    category: 'Billing',
    questions: [
      {
        question: "How do I check my billing history?",
        answer: "You can view your billing history in the 'Billing' section of your dashboard. All transactions, including consultation fees and subscription payments, are listed there."
      },
      {
        question: "I was charged twice for the same consultation",
        answer: "If you notice a duplicate charge, please contact our billing support immediately. We'll investigate and process a refund if necessary."
      },
      {
        question: "Do you accept insurance?",
        answer: "We work with major insurance providers. You can check your coverage during the booking process. Contact our support team for specific insurance-related questions."
      }
    ]
  }
]

const helpArticles = [
  {
    title: "Getting Started with HealthBridge",
    description: "Learn how to set up your account and start your first consultation",
    category: "Getting Started",
    readTime: "5 min read",
    icon: BookOpen
  },
  {
    title: "Understanding Your Medical Profile",
    description: "How to manage and update your medical information securely",
    category: "Account Management",
    readTime: "3 min read",
    icon: User
  },
  {
    title: "Video Consultation Best Practices",
    description: "Tips for a smooth and effective video consultation experience",
    category: "Consultations",
    readTime: "4 min read",
    icon: MessageCircle
  },
  {
    title: "Managing Your Prescriptions",
    description: "How to view, refill, and manage your digital prescriptions",
    category: "Prescriptions",
    readTime: "6 min read",
    icon: FileText
  },
  {
    title: "Privacy and Security",
    description: "Learn about our security measures and data protection policies",
    category: "Security",
    readTime: "7 min read",
    icon: Shield
  }
]

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'help'>('tickets')
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      title: 'Cannot access video consultation',
      description: 'I\'m trying to join my scheduled consultation but getting an error message.',
      category: 'technical',
      priority: 'high',
      status: 'open',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Payment not processed',
      description: 'I paid for my consultation but it\'s still showing as pending.',
      category: 'billing',
      priority: 'urgent',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      assignedTo: 'Support Team',
      response: 'We\'re investigating this issue. Please allow 24-48 hours for the payment to be processed.'
    }
  ])
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const
  })

  const getPriorityColor = (priority: string) => {
    const priorityData = priorities.find(p => p.value === priority)
    return priorityData?.color || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open'
      case 'in_progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      case 'closed': return 'Closed'
      default: return status
    }
  }

  const createTicket = () => {
    if (!newTicket.title || !newTicket.description || !newTicket.category) return

    const ticket: SupportTicket = {
      id: Date.now().toString(),
      title: newTicket.title,
      description: newTicket.description,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setTickets([ticket, ...tickets])
    setNewTicket({ title: '', description: '', category: '', priority: 'medium' })
    setShowNewTicket(false)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-muted-foreground">
          Get help with your account, consultations, and technical issues
        </p>
      </div>

      {/* Quick Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold mb-1">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">Get instant help</p>
            <Button size="sm" className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold mb-1">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-3">24/7 availability</p>
            <Button size="sm" variant="outline" className="w-full">
              Call Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-1">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">Within 24 hours</p>
            <Button size="sm" variant="outline" className="w-full">
              Send Email
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'tickets' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('tickets')}
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Support Tickets
        </Button>
        <Button
          variant={activeTab === 'faq' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('faq')}
          className="flex-1"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          FAQ
        </Button>
        <Button
          variant={activeTab === 'help' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('help')}
          className="flex-1"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Help Articles
        </Button>
      </div>

      {/* Support Tickets */}
      {activeTab === 'tickets' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Support Tickets</h2>
            <Button onClick={() => setShowNewTicket(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>

          {/* New Ticket Form */}
          {showNewTicket && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Support Ticket</CardTitle>
                <CardDescription>
                  Describe your issue in detail so we can help you quickly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Subject</Label>
                  <Input
                    id="title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportCategories.map((category) => (
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
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket({ ...newTicket, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Please provide detailed information about your issue..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={createTicket} disabled={!newTicket.title || !newTicket.description || !newTicket.category}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewTicket(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{ticket.title}</h3>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {priorities.find(p => p.value === ticket.priority)?.label}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusLabel(ticket.status)}
                        </Badge>
            </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(ticket.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {supportCategories.find(c => c.value === ticket.category)?.label}
                        </span>
                        {ticket.assignedTo && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.assignedTo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {ticket.response && (
                  <CardContent className="pt-0">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Response from Support Team</p>
                          <p className="text-sm text-blue-800">{ticket.response}</p>
                        </div>
              </div>
            </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Find quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <h4 className="font-semibold mb-2">{faq.question}</h4>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Help Articles */}
      {activeTab === 'help' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Help Articles</h2>
            <p className="text-muted-foreground">
              Detailed guides and tutorials to help you get the most out of HealthBridge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <article.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{article.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{article.readTime}</span>
          </div>
        </div>
      </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
