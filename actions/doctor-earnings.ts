"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db, consultations, doctors, patients, users, prescriptions } from "@/db"
import { eq, and, desc, sql, gte, lte } from "drizzle-orm"

export interface EarningsData {
  period: string
  totalEarnings: number
  consultations: number
  averagePerConsultation: number
  growth: number
}

export interface TransactionData {
  id: string
  consultationId: string
  date: Date
  patientName: string
  patientEmail: string
  consultationType: string
  amount: number
  status: 'completed' | 'pending' | 'cancelled'
  paymentMethod: string
  createdAt: Date
}

export interface EarningsBreakdown {
  video: { count: number; total: number }
  chat: { count: number; total: number }
  phone: { count: number; total: number }
  inPerson: { count: number; total: number }
}

async function getCurrentDoctorId(): Promise<string | null> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) return null

    const userRecord = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1)

    if (!userRecord[0]) return null

    const doctorRecord = await db
      .select({ id: doctors.id })
      .from(doctors)
      .where(eq(doctors.userId, userRecord[0].id))
      .limit(1)

    return doctorRecord[0]?.id || null
  } catch (error) {
    console.error("Error getting current doctor ID:", error)
    return null
  }
}

export async function getDoctorEarnings(period: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear' = 'thisMonth'): Promise<EarningsData | null> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return null

    const now = new Date()
    let startDate: Date
    let endDate: Date
    let previousStartDate: Date
    let previousEndDate: Date

    switch (period) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0)
        break
      case 'thisQuarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0)
        previousStartDate = new Date(now.getFullYear(), quarterStart - 3, 1)
        previousEndDate = new Date(now.getFullYear(), quarterStart, 0)
        break
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31)
        break
    }

    // Current period earnings
    const currentResult = await db
      .select({
        totalEarnings: sql<number>`COALESCE(SUM(${consultations.consultationFee}), 0)`,
        consultationCount: sql<number>`COUNT(*)`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.status, 'completed'),
        gte(consultations.scheduledAt, startDate),
        lte(consultations.scheduledAt, endDate)
      ))

    // Previous period earnings for growth calculation
    const previousResult = await db
      .select({
        totalEarnings: sql<number>`COALESCE(SUM(${consultations.consultationFee}), 0)`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.status, 'completed'),
        gte(consultations.scheduledAt, previousStartDate),
        lte(consultations.scheduledAt, previousEndDate)
      ))

    const current = currentResult[0]
    const previous = previousResult[0]
    
    const totalEarnings = current?.totalEarnings || 0
    const consultationCount = current?.consultationCount || 0
    const previousEarnings = previous?.totalEarnings || 0
    
    const growth = previousEarnings > 0 
      ? ((totalEarnings - previousEarnings) / previousEarnings) * 100 
      : 0

    const averagePerConsultation = consultationCount > 0 
      ? totalEarnings / consultationCount 
      : 0

    return {
      period,
      totalEarnings,
      consultations: consultationCount,
      averagePerConsultation,
      growth
    }
  } catch (error) {
    console.error("Error fetching doctor earnings:", error)
    return null
  }
}

export async function getAllDoctorEarnings(): Promise<EarningsData[]> {
  try {
    const periods: ('thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear')[] = [
      'thisMonth', 'lastMonth', 'thisQuarter', 'thisYear'
    ]
    
    const earningsPromises = periods.map(period => getDoctorEarnings(period))
    const results = await Promise.all(earningsPromises)
    
    return results.filter(result => result !== null) as EarningsData[]
  } catch (error) {
    console.error("Error fetching all doctor earnings:", error)
    return []
  }
}

export async function getDoctorTransactions(): Promise<TransactionData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .select({
        id: consultations.id,
        consultationId: consultations.id,
        date: consultations.scheduledAt,
        patientName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        patientEmail: users.email,
        consultationType: consultations.consultationType,
        amount: consultations.consultationFee,
        status: consultations.status,
        paymentMethod: sql<string>`'Credit Card'`, // Default since we don't have payment method in schema
        createdAt: consultations.createdAt
      })
      .from(consultations)
      .innerJoin(patients, eq(consultations.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(eq(consultations.doctorId, doctorId))
      .orderBy(desc(consultations.scheduledAt))
      .limit(50) // Limit to recent 50 transactions

    return result.map(item => ({
      ...item,
      status: item.status as 'completed' | 'pending' | 'cancelled',
      amount: item.amount || 0
    }))
  } catch (error) {
    console.error("Error fetching doctor transactions:", error)
    return []
  }
}

export async function getDoctorEarningsBreakdown(): Promise<EarningsBreakdown> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return {
      video: { count: 0, total: 0 },
      chat: { count: 0, total: 0 },
      phone: { count: 0, total: 0 },
      inPerson: { count: 0, total: 0 }
    }

    const result = await db
      .select({
        consultationType: consultations.consultationType,
        count: sql<number>`COUNT(*)`,
        total: sql<number>`COALESCE(SUM(${consultations.consultationFee}), 0)`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.status, 'completed')
      ))
      .groupBy(consultations.consultationType)

    const breakdown: EarningsBreakdown = {
      video: { count: 0, total: 0 },
      chat: { count: 0, total: 0 },
      phone: { count: 0, total: 0 },
      inPerson: { count: 0, total: 0 }
    }

    result.forEach(item => {
      const type = item.consultationType as keyof EarningsBreakdown
      if (type in breakdown) {
        breakdown[type] = {
          count: item.count,
          total: item.total
        }
      } else if (item.consultationType === 'video_call') {
        breakdown.video = {
          count: item.count,
          total: item.total
        }
      } else if (item.consultationType === 'chat_only') {
        breakdown.chat = {
          count: item.count,
          total: item.total
        }
      } else if (item.consultationType === 'in_person') {
        breakdown.inPerson = {
          count: item.count,
          total: item.total
        }
      }
    })

    return breakdown
  } catch (error) {
    console.error("Error fetching doctor earnings breakdown:", error)
    return {
      video: { count: 0, total: 0 },
      chat: { count: 0, total: 0 },
      phone: { count: 0, total: 0 },
      inPerson: { count: 0, total: 0 }
    }
  }
}

export async function getDoctorEarningsStats() {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return null

    const now = new Date()
    
    // This month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // This year
    const thisYearStart = new Date(now.getFullYear(), 0, 1)
    const thisYearEnd = new Date(now.getFullYear(), 11, 31)

    const [monthlyStats, yearlyStats, totalStats] = await Promise.all([
      // Monthly stats
      db.select({
        earnings: sql<number>`COALESCE(SUM(${consultations.consultationFee}), 0)`,
        consultations: sql<number>`COUNT(*)`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.status, 'completed'),
        gte(consultations.scheduledAt, thisMonthStart),
        lte(consultations.scheduledAt, thisMonthEnd)
      )),

      // Yearly stats
      db.select({
        earnings: sql<number>`COALESCE(SUM(${consultations.consultationFee}), 0)`,
        consultations: sql<number>`COUNT(*)`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.status, 'completed'),
        gte(consultations.scheduledAt, thisYearStart),
        lte(consultations.scheduledAt, thisYearEnd)
      )),

      // Total stats
      db.select({
        earnings: sql<number>`COALESCE(SUM(${consultations.consultationFee}), 0)`,
        consultations: sql<number>`COUNT(*)`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.status, 'completed')
      ))
    ])

    return {
      monthly: {
        earnings: monthlyStats[0]?.earnings || 0,
        consultations: monthlyStats[0]?.consultations || 0
      },
      yearly: {
        earnings: yearlyStats[0]?.earnings || 0,
        consultations: yearlyStats[0]?.consultations || 0
      },
      total: {
        earnings: totalStats[0]?.earnings || 0,
        consultations: totalStats[0]?.consultations || 0
      }
    }
  } catch (error) {
    console.error("Error fetching doctor earnings stats:", error)
    return null
  }
}

export async function getMonthlyEarningsTrend(months: number = 12) {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const results = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1)
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0)

      const monthlyData = await db
        .select({
          earnings: sql<number>`COALESCE(SUM(${consultations.consultationFee}), 0)`,
          consultations: sql<number>`COUNT(*)`
        })
        .from(consultations)
        .where(and(
          eq(consultations.doctorId, doctorId),
          eq(consultations.status, 'completed'),
          gte(consultations.scheduledAt, startDate),
          lte(consultations.scheduledAt, endDate)
        ))

      results.push({
        month: month.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        earnings: monthlyData[0]?.earnings || 0,
        consultations: monthlyData[0]?.consultations || 0
      })
    }

    return results
  } catch (error) {
    console.error("Error fetching monthly earnings trend:", error)
    return []
  }
}
