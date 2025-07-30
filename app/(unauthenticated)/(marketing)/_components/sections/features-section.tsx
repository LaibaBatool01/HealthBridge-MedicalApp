"use client"

import { motion } from "framer-motion"
import {
  MessageCircle,
  Stethoscope,
  FileText,
  Bell,
  Shield,
  Clock
} from "lucide-react"
import { SectionWrapper } from "./section-wrapper"

const features = [
  {
    name: "Symptom Checker",
    description:
      "Describe your symptoms and get matched with the right specialist. AI-powered initial assessment to guide your care.",
    icon: Stethoscope
  },
  {
    name: "Online Consultations",
    description:
      "Video or chat with licensed doctors from anywhere. Get professional medical advice without leaving your home.",
    icon: MessageCircle
  },
  {
    name: "Digital Prescriptions",
    description:
      "Receive secure digital prescriptions with clear instructions. Direct integration with local pharmacies for delivery.",
    icon: FileText
  },
  {
    name: "Medication Reminders",
    description:
      "Never miss a dose with smart reminders. Track your medication schedule and monitor your treatment progress.",
    icon: Bell
  },
  {
    name: "Secure Health Records",
    description:
      "Your medical history is safely encrypted and always accessible. Share records securely with your healthcare providers.",
    icon: Shield
  },
  {
    name: "24/7 Support",
    description:
      "Round-the-clock medical support for urgent questions. Emergency guidance and immediate assistance when needed.",
    icon: Clock
  }
]

export function FeaturesSection() {
  return (
    <SectionWrapper className="relative" id="features">
      <div className="bg-[radial-gradient(45%_45%_at_50%_50%,theme(colors.brand-primary/20),transparent)] absolute inset-0 -z-10 opacity-20 dark:opacity-40" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            id="features-heading"
            className="text-primary text-base leading-7 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Complete Healthcare Solution
          </motion.h2>
          <motion.p
            className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need for better health
          </motion.p>
          <motion.p
            className="text-muted-foreground mt-6 text-lg leading-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            From symptom assessment to prescription delivery, we've got your health covered with licensed professionals.
          </motion.p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="group relative flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
              >
                <motion.div
                  className="bg-card ring-border w-fit rounded-lg p-2 ring-1"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <feature.icon
                    className="text-primary h-6 w-6"
                    aria-hidden="true"
                  />
                </motion.div>

                <dt className="text-foreground mt-4 flex items-center gap-x-3 text-base leading-7 font-semibold">
                  {feature.name}
                  <motion.div
                    className="from-primary/50 h-px flex-1 bg-gradient-to-r to-transparent"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                    style={{ transformOrigin: "left" }}
                  />
                </dt>

                <dd className="text-muted-foreground mt-4 flex flex-auto flex-col text-base leading-7">
                  <p className="flex-auto">{feature.description}</p>
                </dd>

                <motion.div
                  className="bg-accent/50 absolute -inset-x-4 -inset-y-2 scale-95 rounded-2xl opacity-0"
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </SectionWrapper>
  )
}
