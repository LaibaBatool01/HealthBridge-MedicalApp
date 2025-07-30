"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Heart, Shield } from "lucide-react"
import Link from "next/link"
import { SectionWrapper } from "./section-wrapper"

export function CTASection() {
  return (
    <SectionWrapper>
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Ready to take control of your health?
        </motion.h2>
        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg leading-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Join thousands of patients who trust our platform for their healthcare needs. Get started with a consultation today.
        </motion.p>
        <motion.div
          className="mt-10 flex items-center justify-center gap-x-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            size="lg"
            className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary-hover"
            asChild
          >
            <Link href="/signup">
              <Heart className="mr-2 h-4 w-4" />
              Find a Doctor
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="link"
            className="text-brand-primary hover:text-brand-primary-hover"
            asChild
          >
            <Link href="/features">
              <Shield className="mr-2 h-4 w-4" />
              Learn More <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </motion.div>
        
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-muted-foreground text-sm">
            🔒 HIPAA Compliant • 🩺 Licensed Doctors • ⚡ 24/7 Support
          </p>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
