"use server"

import { db, users, doctors } from "@/db"
import { eq, and, desc, asc } from "drizzle-orm"

export interface DoctorWithUser {
  id: string
  userId: string
  licenseNumber: string
  specialty: string
  subSpecialty?: string | null
  yearsOfExperience?: number | null
  education?: string | null
  certifications?: string | null
  hospitalAffiliations?: string | null
  bio?: string | null
  consultationFee?: string | null
  rating?: string | null
  totalRatings?: number | null
  isAvailable: boolean | null
  availableHours?: string | null
  languages?: string | null
  verificationStatus: string
  createdAt: Date
  updatedAt: Date
  // User data
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone?: string | null
    profileImage?: string | null
  }
}

export async function getAllDoctors(): Promise<DoctorWithUser[]> {
  try {
    const results = await db
      .select({
        id: doctors.id,
        userId: doctors.userId,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        subSpecialty: doctors.subSpecialty,
        yearsOfExperience: doctors.yearsOfExperience,
        education: doctors.education,
        certifications: doctors.certifications,
        hospitalAffiliations: doctors.hospitalAffiliations,
        bio: doctors.bio,
        consultationFee: doctors.consultationFee,
        rating: doctors.rating,
        totalRatings: doctors.totalRatings,
        isAvailable: doctors.isAvailable,
        availableHours: doctors.availableHours,
        languages: doctors.languages,
        verificationStatus: doctors.verificationStatus,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
        // User data
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
        }
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(
        and(
          eq(doctors.isAvailable, true),
          eq(doctors.verificationStatus, 'approved')
        )
      )
      .orderBy(desc(doctors.rating), asc(users.firstName))

    return results
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return []
  }
}

export async function getDoctorsBySpecialty(specialty: string): Promise<DoctorWithUser[]> {
  try {
    const results = await db
      .select({
        id: doctors.id,
        userId: doctors.userId,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        subSpecialty: doctors.subSpecialty,
        yearsOfExperience: doctors.yearsOfExperience,
        education: doctors.education,
        certifications: doctors.certifications,
        hospitalAffiliations: doctors.hospitalAffiliations,
        bio: doctors.bio,
        consultationFee: doctors.consultationFee,
        rating: doctors.rating,
        totalRatings: doctors.totalRatings,
        isAvailable: doctors.isAvailable,
        availableHours: doctors.availableHours,
        languages: doctors.languages,
        verificationStatus: doctors.verificationStatus,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
        // User data
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
        }
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(
        and(
          eq(doctors.specialty, specialty as any),
          eq(doctors.isAvailable, true),
          eq(doctors.verificationStatus, 'approved')
        )
      )
      .orderBy(desc(doctors.rating), asc(users.firstName))

    return results
  } catch (error) {
    console.error("Error fetching doctors by specialty:", error)
    return []
  }
}

export async function getDoctorById(doctorId: string): Promise<DoctorWithUser | null> {
  try {
    const [result] = await db
      .select({
        id: doctors.id,
        userId: doctors.userId,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        subSpecialty: doctors.subSpecialty,
        yearsOfExperience: doctors.yearsOfExperience,
        education: doctors.education,
        certifications: doctors.certifications,
        hospitalAffiliations: doctors.hospitalAffiliations,
        bio: doctors.bio,
        consultationFee: doctors.consultationFee,
        rating: doctors.rating,
        totalRatings: doctors.totalRatings,
        isAvailable: doctors.isAvailable,
        availableHours: doctors.availableHours,
        languages: doctors.languages,
        verificationStatus: doctors.verificationStatus,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
        // User data
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
        }
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.id, doctorId))
      .limit(1)

    return result || null
  } catch (error) {
    console.error("Error fetching doctor by ID:", error)
    return null
  }
}

export async function getDoctorByUserId(userId: string): Promise<DoctorWithUser | null> {
  try {
    const result = await db
      .select({
        id: doctors.id,
        userId: doctors.userId,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        subSpecialty: doctors.subSpecialty,
        yearsOfExperience: doctors.yearsOfExperience,
        education: doctors.education,
        certifications: doctors.certifications,
        hospitalAffiliations: doctors.hospitalAffiliations,
        bio: doctors.bio,
        consultationFee: doctors.consultationFee,
        rating: doctors.rating,
        totalRatings: doctors.totalRatings,
        isAvailable: doctors.isAvailable,
        availableHours: doctors.availableHours,
        languages: doctors.languages,
        verificationStatus: doctors.verificationStatus,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
        // User data
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
        }
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.userId, userId))
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error("Error fetching doctor by user ID:", error)
    return null
  }
}

export async function searchDoctors(query: string): Promise<DoctorWithUser[]> {
  try {
    const results = await db
      .select({
        id: doctors.id,
        userId: doctors.userId,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        subSpecialty: doctors.subSpecialty,
        yearsOfExperience: doctors.yearsOfExperience,
        education: doctors.education,
        certifications: doctors.certifications,
        hospitalAffiliations: doctors.hospitalAffiliations,
        bio: doctors.bio,
        consultationFee: doctors.consultationFee,
        rating: doctors.rating,
        totalRatings: doctors.totalRatings,
        isAvailable: doctors.isAvailable,
        availableHours: doctors.availableHours,
        languages: doctors.languages,
        verificationStatus: doctors.verificationStatus,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
        // User data
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
        }
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(
        and(
          eq(doctors.isAvailable, true),
          eq(doctors.verificationStatus, 'approved')
        )
      )
      .orderBy(desc(doctors.rating), asc(users.firstName))

    // Filter results based on query
    return results.filter(doctor => 
      doctor.user.firstName.toLowerCase().includes(query.toLowerCase()) ||
      doctor.user.lastName.toLowerCase().includes(query.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(query.toLowerCase()) ||
      (doctor.subSpecialty && doctor.subSpecialty.toLowerCase().includes(query.toLowerCase())) ||
      (doctor.bio && doctor.bio.toLowerCase().includes(query.toLowerCase()))
    )
  } catch (error) {
    console.error("Error searching doctors:", error)
    return []
  }
}

export async function getPendingDoctors() {
  try {
    const pendingDoctors = await db
      .select({
        id: doctors.id,
        userId: doctors.userId,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        subSpecialty: doctors.subSpecialty,
        yearsOfExperience: doctors.yearsOfExperience,
        education: doctors.education,
        certifications: doctors.certifications,
        languagesSpoken: doctors.languagesSpoken,
        consultationFee: doctors.consultationFee,
        bio: doctors.bio,
        isAvailable: doctors.isAvailable,
        verificationStatus: doctors.verificationStatus,
        verificationDate: doctors.verificationDate,
        verificationNotes: doctors.verificationNotes,
        rating: doctors.rating,
        totalRatings: doctors.totalRatings,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          profileImage: users.profileImage,
          createdAt: users.createdAt,
        }
      })
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.verificationStatus, "pending"))
      .orderBy(desc(doctors.createdAt))

    return pendingDoctors
  } catch (error) {
    console.error("Error fetching pending doctors:", error)
    return []
  }
}

export async function getAllDoctorsForAdmin() {
  try {
    const allDoctors = await db
      .select({
        id: doctors.id,
        userId: doctors.userId,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        subSpecialty: doctors.subSpecialty,
        yearsOfExperience: doctors.yearsOfExperience,
        education: doctors.education,
        certifications: doctors.certifications,
        languagesSpoken: doctors.languagesSpoken,
        consultationFee: doctors.consultationFee,
        bio: doctors.bio,
        isAvailable: doctors.isAvailable,
        verificationStatus: doctors.verificationStatus,
        verificationDate: doctors.verificationDate,
        verificationNotes: doctors.verificationNotes,
        rating: doctors.rating,
        totalRatings: doctors.totalRatings,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          profileImage: users.profileImage,
          createdAt: users.createdAt,
        }
      })
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .orderBy(desc(doctors.createdAt))

    return allDoctors
  } catch (error) {
    console.error("Error fetching all doctors for admin:", error)
    return []
  }
}

export async function getDoctorVerificationDetails(doctorId: string) {
  try {
    const doctor = await db
      .select({
        id: doctors.id,
        userId: doctors.userId,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        subSpecialty: doctors.subSpecialty,
        yearsOfExperience: doctors.yearsOfExperience,
        education: doctors.education,
        certifications: doctors.certifications,
        languagesSpoken: doctors.languagesSpoken,
        consultationFee: doctors.consultationFee,
        bio: doctors.bio,
        isAvailable: doctors.isAvailable,
        verificationStatus: doctors.verificationStatus,
        verificationDate: doctors.verificationDate,
        verificationNotes: doctors.verificationNotes,
        verifiedBy: doctors.verifiedBy,
        rating: doctors.rating,
        totalRatings: doctors.totalRatings,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          profileImage: users.profileImage,
          createdAt: users.createdAt,
        }
      })
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.id, doctorId))
      .limit(1)

    return doctor[0] || null
  } catch (error) {
    console.error("Error fetching doctor verification details:", error)
    return null
  }
}

export async function verifyDoctor(doctorId: string, adminId: string, status: "approved" | "rejected", notes?: string) {
  try {
    const [updatedDoctor] = await db
      .update(doctors)
      .set({
        verificationStatus: status,
        verificationDate: new Date(),
        verificationNotes: notes,
        verifiedBy: adminId,
        isAvailable: status === "approved" ? true : false,
        updatedAt: new Date()
      })
      .where(eq(doctors.id, doctorId))
      .returning()

    return updatedDoctor
  } catch (error) {
    console.error("Error verifying doctor:", error)
    throw error
  }
}