"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SectionWrapper } from "../../_components/sections/section-wrapper"
import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Heart, 
  Clock, 
  MessageCircle,
  Video,
  FileText,
  Search,
  Bell,
  Calendar,
  Smartphone,
  ArrowRight,
  Crown,
  Sparkles
} from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for occasional healthcare needs",
    features: [
      "1 consultation per month",
      "Basic symptom checker",
      "Health records storage",
      "Email support",
      "Mobile app access"
    ],
    popular: false,
    icon: Heart,
    color: "from-blue-500 to-blue-600"
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "/month",
    description: "Ideal for regular healthcare management",
    features: [
      "5 consultations per month",
      "Priority doctor booking",
      "Advanced symptom checker",
      "Digital prescriptions",
      "24/7 chat support",
      "Family accounts (up to 3)",
      "Health reminders",
      "Video consultations",
      "Prescription refills",
      "Health calendar"
    ],
    popular: true,
    icon: Crown,
    color: "from-purple-500 to-purple-600"
  },
  {
    name: "Family",
    price: "$39.99",
    period: "/month",
    description: "Complete healthcare for the whole family",
    features: [
      "Unlimited consultations",
      "Priority booking for all family",
      "AI-powered symptom checker",
      "Digital prescriptions",
      "24/7 phone & chat support",
      "Family accounts (up to 6)",
      "Smart health reminders",
      "HD video consultations",
      "Prescription management",
      "Health calendar & tracking",
      "Emergency consultation access",
      "Health reports & analytics"
    ],
    popular: false,
    icon: Users,
    color: "from-green-500 to-green-600"
  }
]

const features = [
  {
    category: "Consultations",
    items: [
      { name: "Video Consultations", basic: "1/month", premium: "5/month", family: "Unlimited" },
      { name: "Chat Consultations", basic: "1/month", premium: "5/month", family: "Unlimited" },
      { name: "Priority Booking", basic: false, premium: true, family: true },
      { name: "Emergency Access", basic: false, premium: false, family: true }
    ]
  },
  {
    category: "Health Tools",
    items: [
      { name: "Symptom Checker", basic: "Basic", premium: "Advanced", family: "AI-Powered" },
      { name: "Digital Prescriptions", basic: false, premium: true, family: true },
      { name: "Prescription Refills", basic: false, premium: true, family: true },
      { name: "Health Calendar", basic: false, premium: true, family: true }
    ]
  },
  {
    category: "Support & Access",
    items: [
      { name: "Email Support", basic: true, premium: true, family: true },
      { name: "Chat Support", basic: false, premium: "24/7", family: "24/7" },
      { name: "Phone Support", basic: false, premium: false, family: "24/7" },
      { name: "Family Accounts", basic: "1", premium: "3", family: "6" }
    ]
  },
  {
    category: "Advanced Features",
    items: [
      { name: "Health Reminders", basic: false, premium: true, family: true },
      { name: "Health Reports", basic: false, premium: false, family: true },
      { name: "Analytics Dashboard", basic: false, premium: false, family: true },
      { name: "Offline Access", basic: false, premium: true, family: true }
    ]
  }
]

const faqs = [
  {
    question: "Can I change my plan anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges."
  },
  {
    question: "Do you accept insurance?",
    answer: "We work with major insurance providers. You can check your coverage during the signup process, and we'll help you understand your benefits."
  },
  {
    question: "What if I'm not satisfied?",
    answer: "We offer a 30-day money-back guarantee. If you're not completely satisfied, we'll refund your subscription no questions asked."
  },
  {
    question: "Are there any hidden fees?",
    answer: "No hidden fees. The price you see is the price you pay. Consultation fees are included in your plan, and there are no setup or cancellation fees."
  },
  {
    question: "Can I use my plan for my family?",
    answer: "Yes! Our Premium plan includes up to 3 family members, and our Family plan includes up to 6 family members with individual accounts."
  },
  {
    question: "What happens if I exceed my consultation limit?",
    answer: "You can purchase additional consultations at a discounted rate, or upgrade to a higher plan to get more consultations included."
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const getYearlyPrice = (monthlyPrice: string) => {
    const price = parseFloat(monthlyPrice.replace('$', ''))
    const yearlyPrice = price * 12 * 0.8 // 20% discount
    return `$${yearlyPrice.toFixed(0)}`
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
              <Sparkles className="mr-2 h-4 w-4" />
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {" "}Healthcare Plan
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              From free basic access to comprehensive family care, we have a plan that fits your healthcare needs and budget.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save 20%
                </Badge>
              </span>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Pricing Cards */}
      <SectionWrapper className="py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1">
                      <Star className="mr-1 h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                  plan.popular ? 'ring-2 ring-purple-500' : ''
                }`}>
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <plan.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {billingCycle === 'yearly' && plan.price !== 'Free' 
                          ? getYearlyPrice(plan.price)
                          : plan.price
                        }
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground">
                          {billingCycle === 'yearly' ? '/year' : plan.period}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className={`w-full mt-6 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' 
                          : ''
                      }`}
                      asChild
                    >
                      <Link href="/signup">
                        {plan.name === 'Basic' ? 'Get Started Free' : 'Choose Plan'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Feature Comparison */}
      <SectionWrapper className="py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Compare Plans</h2>
            <p className="text-xl text-muted-foreground">
              See what's included in each plan
            </p>
          </motion.div>

          <div className="space-y-8">
            {features.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.items.map((item, itemIndex) => (
                        <div key={item.name} className="grid grid-cols-4 gap-4 items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-center">
                            {typeof item.basic === 'boolean' ? (
                              item.basic ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>
                            ) : (
                              <span className="text-sm">{item.basic}</span>
                            )}
                          </div>
                          <div className="text-center">
                            {typeof item.premium === 'boolean' ? (
                              item.premium ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>
                            ) : (
                              <span className="text-sm">{item.premium}</span>
                            )}
                          </div>
                          <div className="text-center">
                            {typeof item.family === 'boolean' ? (
                              item.family ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>
                            ) : (
                              <span className="text-sm">{item.family}</span>
                            )}
                          </div>
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
              Everything you need to know about our pricing
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
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
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
