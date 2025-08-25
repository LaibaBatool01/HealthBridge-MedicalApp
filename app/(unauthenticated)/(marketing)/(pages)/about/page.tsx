"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SectionWrapper } from "../../_components/sections/section-wrapper"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Heart, 
  Shield, 
  Users, 
  Target, 
  Award, 
  Globe, 
  TrendingUp, 
  CheckCircle,
  Star,
  ArrowRight,
  Building2,
  Lightbulb,
  Zap
} from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Patient First",
    description: "Every decision we make is centered around improving patient outcomes and experiences."
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description: "We maintain the highest standards of data security and medical privacy compliance."
  },
  {
    icon: Users,
    title: "Accessibility",
    description: "Making quality healthcare accessible to everyone, regardless of location or circumstances."
  },
  {
    icon: Target,
    title: "Innovation",
    description: "Continuously innovating to provide cutting-edge healthcare solutions and technology."
  }
]

const milestones = [
  {
    year: "2020",
    title: "Founded",
    description: "HealthBridge was founded with a vision to democratize healthcare access."
  },
  {
    year: "2021",
    title: "First 1,000 Patients",
    description: "Reached our first milestone of serving 1,000 patients across the country."
  },
  {
    year: "2022",
    title: "Doctor Network Expansion",
    description: "Grew our network to 5,000+ verified doctors across 50+ specialties."
  },
  {
    year: "2023",
    title: "AI Integration",
    description: "Launched AI-powered symptom checker and smart appointment scheduling."
  },
  {
    year: "2024",
    title: "500,000+ Patients",
    description: "Now serving over 500,000 patients with 99.9% satisfaction rate."
  }
]

const team = [
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Medical Officer",
    bio: "Board-certified physician with 15+ years of experience in telemedicine and digital health.",
    avatar: "/api/placeholder/150/150"
  },
  {
    name: "Michael Chen",
    role: "Chief Technology Officer",
    bio: "Former tech leader at Google Health, passionate about healthcare technology innovation.",
    avatar: "/api/placeholder/150/150"
  },
  {
    name: "Emily Rodriguez",
    role: "Chief Executive Officer",
    bio: "Healthcare entrepreneur with a mission to make quality care accessible to everyone.",
    avatar: "/api/placeholder/150/150"
  },
  {
    name: "Dr. James Wilson",
    role: "Head of Clinical Operations",
    bio: "Specialist in clinical workflow optimization and patient care coordination.",
    avatar: "/api/placeholder/150/150"
  }
]

const stats = [
  { number: "500,000+", label: "Patients Served" },
  { number: "10,000+", label: "Verified Doctors" },
  { number: "50+", label: "Medical Specialties" },
  { number: "99.9%", label: "Patient Satisfaction" }
]

export default function AboutPage() {
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
              <Building2 className="mr-2 h-4 w-4" />
              About HealthBridge
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              Revolutionizing
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {" "}Healthcare Access
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              We're on a mission to make quality healthcare accessible to everyone, everywhere. 
              Through innovative technology and compassionate care, we're building the future of healthcare.
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

      {/* Mission & Vision */}
      <SectionWrapper className="py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    To democratize healthcare by making quality medical care accessible, affordable, and convenient 
                    for everyone, regardless of their location or circumstances. We believe that everyone deserves 
                    access to excellent healthcare.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    To become the world's most trusted digital healthcare platform, connecting millions of patients 
                    with qualified healthcare providers through innovative technology that enhances the quality of care 
                    and improves health outcomes globally.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* Values */}
      <SectionWrapper className="py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Journey */}
      <SectionWrapper className="py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-muted-foreground">
              From startup to healthcare leader
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 to-green-500"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="text-sm">
                            {milestone.year}
                          </Badge>
                          <CardTitle className="text-xl">{milestone.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">
                          {milestone.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="relative z-10 w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-4">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Team */}
      <SectionWrapper className="py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Leadership Team</h2>
            <p className="text-xl text-muted-foreground">
              Meet the experts driving healthcare innovation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm text-center">
                  <CardHeader>
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription className="text-sm font-medium text-blue-600">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {member.bio}
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
              Join Us in Transforming Healthcare
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Be part of the future of healthcare. Experience the difference that technology and compassion can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  )
}
