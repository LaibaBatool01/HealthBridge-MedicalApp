"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useState } from "react"
import { SectionWrapper } from "./section-wrapper"

const faqs = [
  {
    question: "Are all doctors on the platform licensed?",
    answer:
      "Yes, absolutely. All doctors on our platform are licensed medical professionals who have been verified and vetted. We check their credentials, licensing, and certifications before they can join our network."
  },
  {
    question: "How do I book a consultation?",
    answer:
      "Simply sign up, describe your symptoms or health concerns, and our system will match you with appropriate specialists. You can then choose your preferred doctor and book a time slot that works for you."
  },
  {
    question: "Is my medical information secure?",
    answer:
      "Your privacy and security are our top priorities. We use bank-level encryption and comply with HIPAA regulations. Your medical records and personal information are fully protected and only accessible to you and your authorized healthcare providers."
  },
  {
    question: "Can I get a prescription online?",
    answer:
      "Yes, if your condition requires medication, your doctor can issue digital prescriptions during or after your consultation. We integrate with local pharmacies for convenient pickup or delivery options."
  },
  {
    question: "What if I need emergency medical care?",
    answer:
      "Our platform is designed for non-emergency consultations. For medical emergencies, please call 911 or visit your nearest emergency room immediately. We provide 24/7 support for urgent but non-emergency health concerns."
  },
  {
    question: "How much does a consultation cost?",
    answer:
      "We offer transparent pricing with no hidden fees. Pay-per-visit consultations are $49, or choose our unlimited monthly plan for $99. All consultations include follow-up support and digital prescriptions when needed."
  }
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (question: string) => {
    setOpenItems(prev =>
      prev.includes(question)
        ? prev.filter(item => item !== question)
        : [...prev, question]
    )
  }

  return (
    <SectionWrapper id="faq">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h2
              className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Frequently asked questions
            </motion.h2>
            <motion.p
              className="text-muted-foreground mt-4 text-lg leading-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Everything you need to know about our healthcare platform
            </motion.p>
          </div>

          <dl className="mt-16 space-y-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Collapsible>
                  <CollapsibleTrigger
                    className="bg-card text-card-foreground hover:bg-accent flex w-full items-center justify-between rounded-lg p-6 text-left"
                    onClick={() => toggleItem(faq.question)}
                  >
                    <dt className="text-lg leading-7 font-semibold">
                      {faq.question}
                    </dt>
                    <motion.div
                      animate={{
                        rotate: openItems.includes(faq.question) ? 45 : 0
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus className="h-6 w-6 flex-none" aria-hidden="true" />
                    </motion.div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: openItems.includes(faq.question) ? 1 : 0,
                        height: openItems.includes(faq.question) ? "auto" : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <dd className="text-muted-foreground px-6 pb-6 text-base leading-7">
                        {faq.answer}
                      </dd>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </SectionWrapper>
  )
}
