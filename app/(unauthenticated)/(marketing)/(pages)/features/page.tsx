"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SectionWrapper } from "../../_components/sections/section-wrapper"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Video, 
  MessageCircle, 
  Stethoscope, 
  Shield, 
  Clock, 
  Users, 
  FileText, 
  Bell, 
  Heart, 
  Search, 
  Calendar, 
  Smartphone,
  Zap,
  CheckCircle,
  Star
} from "lucide-react"

const features = [
  {
    icon: Video,
    title: "Video Consultations",
    description: "High-quality video calls with doctors from anywhere. Crystal clear audio and video for effective remote consultations.",
    benefits: ["HD Video Quality", "Screen Sharing", "Recording Option", "Background Blur"]
  },
  {
    icon: MessageCircle,
    title: "Chat Consultations",
    description: "Text-based consultations for non-urgent medical advice. Perfect for follow-ups and general health questions.",
    benefits: ["24/7 Availability", "File Sharing", "Voice Messages", "Quick Responses"]
  },
  {
    icon: Stethoscope,
    title: "Find & Book Doctors",
    description: "Browse verified doctors by specialty, read reviews, and book appointments instantly with our smart matching system.",
    benefits: ["Verified Doctors", "Specialty Filter", "Reviews & Ratings", "Instant Booking"]
  },
  {
    icon: FileText,
    title: "Digital Prescriptions",
    description: "Receive and manage prescriptions digitally. Track medications, dosages, and refill reminders all in one place.",
    benefits: ["Digital Format", "Medication Tracking", "Refill Reminders", "Pharmacy Integration"]
  },
  {
    icon: Search,
    title: "Symptom Checker",
    description: "AI-powered symptom assessment tool that helps you understand your symptoms and when to seek medical attention.",
    benefits: ["AI Assessment", "Symptom Database", "Risk Evaluation", "Recommendations"]
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Bank-level security and HIPAA compliance ensure your medical information is always protected and confidential.",
    benefits: ["HIPAA Compliant", "End-to-End Encryption", "Data Privacy", "Secure Storage"]
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Access healthcare anytime, anywhere. No more waiting for office hours or rushing to urgent care.",
    benefits: ["Round-the-Clock", "Emergency Support", "Quick Response", "Flexible Scheduling"]
  },
  {
    icon: Users,
    title: "Family Management",
    description: "Manage healthcare for your entire family. Book appointments, track medications, and share health records easily.",
    benefits: ["Family Profiles", "Shared Records", "Coordinated Care", "Parental Controls"]
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss a medication dose or appointment again with intelligent reminders and notifications.",
    benefits: ["Medication Alerts", "Appointment Reminders", "Health Check-ins", "Customizable"]
  },
  {
    icon: Calendar,
    title: "Health Calendar",
    description: "Track your health journey with a comprehensive calendar showing appointments, medications, and health milestones.",
    benefits: ["Visual Timeline", "Health History", "Progress Tracking", "Export Options"]
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Optimized for mobile devices with a responsive design that works seamlessly on smartphones and tablets.",
    benefits: ["Mobile Optimized", "Offline Access", "Push Notifications", "Touch Friendly"]
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Lightning-fast performance with 99.9% uptime. Get the care you need without technical interruptions.",
    benefits: ["Quick Loading", "High Uptime", "Low Latency", "Reliable Connection"]
  }
]

const stats = [
  { number: "10,000+", label: "Verified Doctors" },
  { number: "500,000+", label: "Happy Patients" },
  { number: "99.9%", label: "Uptime" },
  { number: "24/7", label: "Support" }
]

export default function FeaturesPage() {
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
              <Star className="mr-2 h-4 w-4" />
              Comprehensive Healthcare Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              Everything You Need for
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {" "}Digital Healthcare
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              From video consultations to digital prescriptions, HealthBridge provides a complete healthcare experience 
              that puts your health first, anytime and anywhere.
            </p>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Stats Section */}
      <SectionWrapper className="py-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Features Grid */}
      <SectionWrapper className="py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
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
              Ready to Experience Better Healthcare?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of patients who trust HealthBridge for their healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">
                  Contact Sales
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  )
}
