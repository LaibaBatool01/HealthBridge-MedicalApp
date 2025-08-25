"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db, doctors, users } from "@/db"
import { eq, and } from "drizzle-orm"

export interface DoctorVerificationStatus {
  id: string
  licenseNumber: string
  specialty: string
  subSpecialty?: string | null
  verificationStatus: "pending" | "approved" | "rejected"
  adminFeedback?: string | null
  verifiedAt?: Date | null
  createdAt: Date
  user: {
    firstName: string
    lastName: string
    email: string
    profileImage?: string | null
  }
  verifier?: {
    firstName: string
    lastName: string
    email: string
  } | null
}

export async function getDoctorVerificationStatus(): Promise<DoctorVerificationStatus | null> {
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
      .select({
        id: doctors.id,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        subSpecialty: doctors.subSpecialty,
        verificationStatus: doctors.verificationStatus,
        adminFeedback: doctors.adminFeedback,
        verifiedAt: doctors.verifiedAt,
        createdAt: doctors.createdAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImage: users.profileImage
        }
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.userId, userRecord[0].id))
      .limit(1)

    if (!doctorRecord[0]) return null

    // Get verifier information if available
    let verifier = null
    if (doctorRecord[0].verificationStatus === 'approved' || doctorRecord[0].verificationStatus === 'rejected') {
      const verifierRecord = await db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        })
        .from(users)
        .where(eq(users.userType, 'admin'))
        .limit(1)

      verifier = verifierRecord[0] || null
    }

    return {
      ...doctorRecord[0],
      verifier
    } as DoctorVerificationStatus
  } catch (error) {
    console.error("Error fetching doctor verification status:", error)
    return null
  }
}

export async function updateDoctorVerificationStatus(
  doctorId: string,
  status: "pending" | "approved" | "rejected",
  feedback?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return { success: false, message: "Unauthorized" }
    }

    // Check if current user is an admin
    const adminUser = await db
      .select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.clerkUserId, clerkUser.id),
        eq(users.userType, 'admin')
      ))
      .limit(1)

    if (!adminUser[0]) {
      return { success: false, message: "Admin access required" }
    }

    const updateData: any = {
      verificationStatus: status,
      adminFeedback: feedback || null,
      updatedAt: new Date()
    }

    if (status === 'approved') {
      updateData.verifiedAt = new Date()
      updateData.verifiedBy = adminUser[0].id
    }

    await db
      .update(doctors)
      .set(updateData)
      .where(eq(doctors.id, doctorId))

    return { success: true }
  } catch (error) {
    console.error("Error updating doctor verification status:", error)
    return { success: false, message: "Failed to update verification status" }
  }
}
