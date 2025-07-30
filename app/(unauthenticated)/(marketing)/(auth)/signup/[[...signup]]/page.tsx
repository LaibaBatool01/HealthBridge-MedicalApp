"use client"

import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { Stethoscope, Heart, Shield, Users, Calendar, FileText, Clock, MessageCircle } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"

type FeatureType = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}

export default function SignUpPage() {
  const { theme } = useTheme()
  const [userType, setUserType] = useState<"patient" | "doctor" | null>(null)

  const doctorFeatures: FeatureType[] = [
    {
      icon: Users,
      title: "Patient Network",
      desc: "Access to verified patients"
    },
    {
      icon: Calendar,
      title: "Flexible Schedule",
      desc: "Set your own hours"
    },
    {
      icon: FileText,
      title: "Digital Tools",
      desc: "Prescription & record management"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      desc: "HIPAA compliant infrastructure"
    }
  ]

  const patientFeatures: FeatureType[] = [
    {
      icon: Stethoscope,
      title: "Licensed Doctors",
      desc: "Verified medical professionals"
    },
    {
      icon: MessageCircle,
      title: "Online Consultations",
      desc: "Video & chat support"
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      desc: "Secure prescription delivery"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      desc: "Round-the-clock assistance"
    }
  ]

  const features = userType === "doctor" ? doctorFeatures : patientFeatures

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left side - Medical Benefits */}
        <motion.div
          className="hidden space-y-8 lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-4">
            <motion.h1
              className="text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {userType === "doctor" 
                ? "Join our medical network" 
                : "Take control of your health"
              }
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {userType === "doctor"
                ? "Connect with patients and provide quality healthcare from anywhere. Join thousands of licensed doctors on our platform."
                : "Connect with licensed doctors, get prescriptions, and manage your health journey with our secure, HIPAA-compliant platform."
              }
            </motion.p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-card rounded-lg border p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                }}
              >
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.4 + i * 0.1
                  }}
                >
                  <feature.icon className="text-primary mb-2 h-8 w-8" />
                </motion.div>
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="text-muted-foreground text-xs">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Trust indicators */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              <span className="text-sm font-medium">
                {userType === "doctor" ? "Join 500+ doctors" : "Trusted by 10,000+ patients"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 fill-green-500 text-green-500" />
              <span className="text-sm font-medium">HIPAA Compliant & Secure</span>
            </div>
          </motion.div>

          {/* Security badge */}
          <motion.div
            className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 15px rgba(34, 197, 94, 0.2)"
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </motion.div>
            <p className="text-sm font-medium">Bank-level encryption & security</p>
          </motion.div>
        </motion.div>

        {/* Right side - Sign up form */}
        <motion.div
          className="mx-auto w-full max-w-md lg:mx-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="mb-8 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="mb-2 text-2xl font-semibold">Join HealthCare Plus</h2>
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-block"
              >
                <Link
                  href="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Sign in here
                </Link>
              </motion.span>
            </p>
          </motion.div>

          {/* User Type Selection */}
          {!userType && (
            <motion.div
              className="mb-6 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-sm font-medium">I am a:</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:border-primary"
                  onClick={() => setUserType("patient")}
                >
                  <Heart className="h-6 w-6" />
                  <span>Patient</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:border-primary"
                  onClick={() => setUserType("doctor")}
                >
                  <Stethoscope className="h-6 w-6" />
                  <span>Doctor</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Selected user type indicator */}
          {userType && (
            <motion.div
              className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 p-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {userType === "patient" ? (
                <Heart className="h-5 w-5 text-primary" />
              ) : (
                <Stethoscope className="h-5 w-5 text-primary" />
              )}
              <span className="text-sm font-medium">
                Signing up as: {userType === "patient" ? "Patient" : "Doctor"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 text-xs"
                onClick={() => setUserType(null)}
              >
                Change
              </Button>
            </motion.div>
          )}

          {userType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SignUp
                forceRedirectUrl={userType === "doctor" ? "/onboarding/doctor" : "/onboarding"}
                signInUrl="/login"
                appearance={{ 
                  baseTheme: theme === "dark" ? dark : undefined,
                  elements: {
                    formButtonPrimary: "bg-primary hover:bg-primary/90",
                    footerActionLink: "text-primary hover:text-primary/90"
                  }
                }}
                unsafeMetadata={{
                  userType: userType
                }}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
