"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SectionWrapper } from "../../_components/sections/section-wrapper"
import { motion } from "framer-motion"
import { useState } from "react"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send, 
  CheckCircle,
  Star,
  ArrowRight,
  Building2,
  Users,
  Shield,
  Zap
} from "lucide-react"

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    contact: "support@healthbridge.com",
    response: "Within 24 hours"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak with our team",
    contact: "+1 (555) 123-4567",
    response: "24/7 availability"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Instant messaging support",
    contact: "Available on website",
    response: "Real-time response"
  }
]

const officeLocations = [
  {
    city: "San Francisco",
    address: "123 Healthcare Ave, Suite 100",
    state: "CA 94102",
    phone: "+1 (555) 123-4567",
    hours: "Mon-Fri: 9AM-6PM PST"
  },
  {
    city: "New York",
    address: "456 Medical Plaza, Floor 15",
    state: "NY 10001",
    phone: "+1 (555) 987-6543",
    hours: "Mon-Fri: 9AM-6PM EST"
  },
  {
    city: "Austin",
    address: "789 Tech Boulevard, Unit 200",
    state: "TX 73301",
    phone: "+1 (555) 456-7890",
    hours: "Mon-Fri: 9AM-6PM CST"
  }
]

const faqs = [
  {
    question: "How do I schedule a consultation?",
    answer: "You can schedule a consultation by signing up for an account, browsing our verified doctors, and booking an appointment through our platform. The process takes just a few minutes."
  },
  {
    question: "Is my medical information secure?",
    answer: "Yes, we use bank-level encryption and are fully HIPAA compliant. Your medical information is protected with the highest security standards available."
  },
  {
    question: "What if I need to cancel an appointment?",
    answer: "You can cancel appointments up to 24 hours before the scheduled time through your dashboard. Late cancellations may be subject to our cancellation policy."
  },
  {
    question: "Do you accept insurance?",
    answer: "We work with major insurance providers. You can check your coverage during the booking process, and we'll help you understand your benefits."
  },
  {
    question: "How do I get a prescription refill?",
    answer: "You can request prescription refills through your dashboard. Your doctor will review your request and can approve refills or schedule a follow-up consultation if needed."
  },
  {
    question: "What if I have a medical emergency?",
    answer: "If you're experiencing a medical emergency, please call 911 or go to the nearest emergency room immediately. Our platform is for non-emergency consultations only."
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <SectionWrapper className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">
              <MessageCircle className="mr-2 h-4 w-4" />
              Get in Touch
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              We're Here to
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {" "}Help You
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Have questions about our services? Need technical support? Want to partner with us? 
              We'd love to hear from you. Our team is here to help.
            </p>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Contact Methods */}
      <SectionWrapper className="py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">How Can We Help?</h2>
            <p className="text-xl text-muted-foreground">
              Choose the best way to reach us
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium text-lg">{method.contact}</p>
                      <p className="text-sm text-muted-foreground">Response: {method.response}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Contact Form & Office Locations */}
      <SectionWrapper className="py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. We'll get back to you within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder="What can we help you with?"
                        />
                      </div>
    <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          placeholder="Tell us more about your inquiry..."
                          rows={5}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Office Locations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Our Offices</CardTitle>
                  <CardDescription>
                    Visit us at one of our locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {officeLocations.map((office, index) => (
                      <div key={office.city} className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-semibold text-lg mb-2">{office.city}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>{office.address}</p>
                          <p>{office.state}</p>
                          <p className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {office.phone}
                          </p>
                          <p className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {office.hours}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* FAQ Section */}
      <SectionWrapper className="py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {faq.answer}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper className="py-16">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of patients who trust HealthBridge for their healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/features">
                  Learn More
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  )
}
