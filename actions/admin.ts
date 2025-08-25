"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { users, doctors, consultations, patients, prescriptions } from "@/db"
import { eq, count, sql, desc, gte, and } from "drizzle-orm"

export async function checkAdminAccess() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Not authenticated")
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId)
  })

  if (!currentUser || currentUser.userType !== "admin") {
    throw new Error("Access denied. Admin privileges required.")
  }

  return currentUser
}

export async function getCurrentAdminUser() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Not authenticated")
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId)
  })

  if (!currentUser || currentUser.userType !== "admin") {
    throw new Error("Access denied. Admin privileges required.")
  }

  return currentUser
}

export async function getSystemStats() {
  await checkAdminAccess()

  const [totalUsers, totalDoctors, pendingDoctors, monthlyConsultations] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(doctors),
    db.select({ count: count() }).from(doctors).where(eq(doctors.verificationStatus, "pending")),
    db.select({ count: count() }).from(consultations).where(
      gte(consultations.createdAt, new Date(new Date().setDate(1)))
    )
  ])

  return {
    totalUsers: totalUsers[0].count,
    totalDoctors: totalDoctors[0].count,
    pendingDoctors: pendingDoctors[0].count,
    monthlyConsultations: monthlyConsultations[0].count
  }
}

export async function getAllUsers() {
  await checkAdminAccess()

  const allUsers = await db.query.users.findMany({
    orderBy: desc(users.createdAt)
  })

  return allUsers
}

// Analytics data
export async function getAnalyticsData() {
  await checkAdminAccess()

  const [totalUsers, activeUsers, newUsersThisMonth, userTypes] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(users).where(eq(users.isActive, true)),
    db.select({ count: count() }).from(users).where(
      gte(users.createdAt, new Date(new Date().setDate(1)))
    ),
    db.select({ 
      userType: users.userType,
      count: count()
    }).from(users).groupBy(users.userType)
  ])

  return {
    totalUsers: totalUsers[0].count,
    activeUsers: activeUsers[0].count,
    newUsersThisMonth: newUsersThisMonth[0].count,
    userTypes: userTypes
  }
}

// Consultation reports
export async function getConsultationReports() {
  await checkAdminAccess()

  const [totalConsultations, monthlyConsultations, completedConsultations, totalRevenue] = await Promise.all([
    db.select({ count: count() }).from(consultations),
    db.select({ count: count() }).from(consultations).where(
      gte(consultations.createdAt, new Date(new Date().setDate(1)))
    ),
    db.select({ count: count() }).from(consultations).where(eq(consultations.status, "completed")),
    db.select({ 
      total: sql<number>`COALESCE(SUM(${consultations.consultationFee}), 0)`
    }).from(consultations).where(eq(consultations.status, "completed"))
  ])

  return {
    totalConsultations: totalConsultations[0].count,
    monthlyConsultations: monthlyConsultations[0].count,
    completedConsultations: completedConsultations[0].count,
    totalRevenue: Number(totalRevenue[0].total)
  }
}

// Financial reports
export async function getFinancialReports() {
  await checkAdminAccess()

  const [totalRevenue, monthlyRevenue, averageConsultationFee] = await Promise.all([
    db.select({ 
      total: sql<number>`COALESCE(SUM(${consultations.consultationFee}), 0)`
    }).from(consultations).where(eq(consultations.status, "completed")),
    db.select({ 
      total: sql<number>`COALESCE(SUM(${consultations.consultationFee}), 0)`
    }).from(consultations).where(
      and(
        gte(consultations.createdAt, new Date(new Date().setDate(1))),
        eq(consultations.status, "completed")
      )
    ),
    db.select({ 
      average: sql<number>`COALESCE(AVG(${consultations.consultationFee}), 0)`
    }).from(consultations).where(eq(consultations.status, "completed"))
  ])

  return {
    totalRevenue: Number(totalRevenue[0].total),
    monthlyRevenue: Number(monthlyRevenue[0].total),
    averageConsultationFee: Number(averageConsultationFee[0].average)
  }
}

// Verification reports (completely simplified version)
export async function getVerificationReports() {
  try {
    await checkAdminAccess()
    
    console.log("Fetching verification reports with simplified approach...")

    // Simple count queries without complex joins
    console.log("Fetching total doctors count...")
    const totalDoctorsResult = await db.select({ count: count() }).from(doctors)
    console.log("Total doctors result:", totalDoctorsResult)
    
    console.log("Fetching approved doctors count...")
    const approvedDoctorsResult = await db.select({ count: count() }).from(doctors).where(eq(doctors.verificationStatus, "approved"))
    console.log("Approved doctors result:", approvedDoctorsResult)
    
    console.log("Fetching rejected doctors count...")
    const rejectedDoctorsResult = await db.select({ count: count() }).from(doctors).where(eq(doctors.verificationStatus, "rejected"))
    console.log("Rejected doctors result:", rejectedDoctorsResult)
    
    console.log("Fetching pending doctors count...")
    const pendingDoctorsResult = await db.select({ count: count() }).from(doctors).where(eq(doctors.verificationStatus, "pending"))
    console.log("Pending doctors result:", pendingDoctorsResult)

    // Get recent doctors with simple query
    console.log("Fetching recent doctors...")
    const recentDoctorsResult = await db.select({
      id: doctors.id,
      verificationStatus: doctors.verificationStatus,
      specialty: doctors.specialty,
      licenseNumber: doctors.licenseNumber,
      userId: doctors.userId,
      createdAt: doctors.createdAt
    }).from(doctors).orderBy(desc(doctors.createdAt)).limit(10)
    console.log("Recent doctors result:", recentDoctorsResult)

    console.log("Fetched basic data with simple queries")

    // Get user details for recent doctors
    const recentDoctorsWithUsers = await Promise.all(
      recentDoctorsResult.map(async (doctor) => {
        try {
          console.log("Fetching user for doctor:", doctor.id)
          const userResult = await db.select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }).from(users).where(eq(users.id, doctor.userId)).limit(1)
          console.log("User result for doctor", doctor.id, ":", userResult)
          
          return {
            id: doctor.id,
            verificationStatus: doctor.verificationStatus,
            specialty: doctor.specialty,
            licenseNumber: doctor.licenseNumber,
            createdAt: doctor.createdAt,
            user: userResult[0] ? {
              id: userResult[0].id,
              firstName: userResult[0].firstName,
              lastName: userResult[0].lastName,
              email: userResult[0].email
            } : null
          }
        } catch (error) {
          console.error("Error fetching user for doctor:", doctor.id, error)
          return {
            id: doctor.id,
            verificationStatus: doctor.verificationStatus,
            specialty: doctor.specialty,
            licenseNumber: doctor.licenseNumber,
            createdAt: doctor.createdAt,
            user: null
          }
        }
      })
    )

    console.log("Successfully fetched verification reports")
    return {
      approvedThisMonth: Number(approvedDoctorsResult[0]?.count || 0),
      rejectedThisMonth: Number(rejectedDoctorsResult[0]?.count || 0),
      pendingDoctors: Number(pendingDoctorsResult[0]?.count || 0),
      totalDoctors: Number(totalDoctorsResult[0]?.count || 0),
      recentVerifications: recentDoctorsWithUsers
    }
  } catch (error) {
    console.error("Error in getVerificationReports:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    throw new Error("Failed to fetch verification reports")
  }
}

// Test database connectivity
export async function testDatabaseConnection() {
  try {
    console.log("Testing database connection...")
    
    // Simple test query
    const result = await db.select({ count: count() }).from(users)
    console.log("Database connection successful, user count:", result[0]?.count)
    
    return { success: true, userCount: result[0]?.count || 0 }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Get all doctors for admin view (simplified)
export async function getAllDoctorsForAdmin() {
  try {
    await checkAdminAccess()
    
    console.log("Fetching all doctors with simplified approach...")
    
    const allDoctors = await db.select({
      id: doctors.id,
      verificationStatus: doctors.verificationStatus,
      specialty: doctors.specialty,
      licenseNumber: doctors.licenseNumber,
      yearsOfExperience: doctors.yearsOfExperience,
      consultationFee: doctors.consultationFee,
      rating: doctors.rating,
      totalRatings: doctors.totalRatings,
      isAvailable: doctors.isAvailable,
      createdAt: doctors.createdAt,
      verifiedAt: doctors.verifiedAt,
      userId: doctors.userId
    }).from(doctors).orderBy(desc(doctors.createdAt))

    console.log(`Found ${allDoctors.length} doctors`)

    // Get user details for each doctor (simplified approach)
    const doctorsWithUsers = await Promise.all(
      allDoctors.map(async (doctor) => {
        try {
          const userResult = await db.select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            profileImage: users.profileImage
          }).from(users).where(eq(users.id, doctor.userId)).limit(1)
          
          return {
            ...doctor,
            user: userResult[0] || null
          }
        } catch (error) {
          console.error("Error fetching user for doctor:", doctor.id, error)
          return {
            ...doctor,
            user: null
          }
        }
      })
    )

    console.log("Successfully fetched doctors with user data")
    return doctorsWithUsers
  } catch (error) {
    console.error("Error in getAllDoctorsForAdmin:", error)
    throw new Error("Failed to fetch doctors")
  }
} 