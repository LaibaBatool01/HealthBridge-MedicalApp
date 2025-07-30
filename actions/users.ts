import { db, users, patients, doctors } from "@/db"
import { eq } from "drizzle-orm"
import { currentUser } from "@clerk/nextjs/server"

export type UserRole = "patient" | "doctor" | "admin"

export interface MedicalUser {
  id: string
  clerkUserId: string
  userType: UserRole
  email: string
  firstName: string
  lastName: string
  phone: string | null
  profileImage: string | null
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PatientProfile extends MedicalUser {
  patientData?: {
    id: string
    dateOfBirth?: string
    gender?: string
    bloodType?: string
    allergies?: string
    medicalHistory?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
  }
}

export interface DoctorProfile extends MedicalUser {
  doctorData?: {
    id: string
    licenseNumber: string
    specialty: string
    subSpecialty?: string
    yearsOfExperience?: number
    bio?: string
    consultationFee?: string
    rating?: string
    isAvailable: boolean
  }
}

/**
 * Create medical user profile automatically (fallback for missing webhook)
 */
async function createMedicalUserProfile(clerkUser: any): Promise<MedicalUser | null> {
  try {
    console.log("Creating medical user profile for:", clerkUser.id)
    
    const email = clerkUser.emailAddresses[0]?.emailAddress
    const firstName = clerkUser.firstName || ""
    const lastName = clerkUser.lastName || ""
    const phone = clerkUser.phoneNumbers[0]?.phoneNumber
    const profileImage = clerkUser.imageUrl

    if (!email) {
      console.error("No email address found for user")
      return null
    }

    // Debug the metadata
    console.log("Clerk user metadata:", clerkUser.unsafeMetadata)
    console.log("Raw userType from metadata:", (clerkUser.unsafeMetadata as any)?.userType)
    
    // Default to patient if no userType is specified
    const userType = (clerkUser.unsafeMetadata as any)?.userType as UserRole || "patient"
    
    console.log(`Creating user with type: ${userType}`)

    // Create user record
    const [newUser] = await db.insert(users).values({
      clerkUserId: clerkUser.id,
      userType: userType,
      email,
      firstName,
      lastName,
      phone,
      profileImage,
      isActive: true,
      isVerified: false,
    }).returning()

    console.log("Created user:", newUser)

    // Create role-specific profile
    if (userType === "patient") {
      const [newPatient] = await db.insert(patients).values({
        userId: newUser.id,
        country: "US",
      }).returning()
      console.log("Created patient profile:", newPatient)
    } else if (userType === "doctor") {
      const [newDoctor] = await db.insert(doctors).values({
        userId: newUser.id,
        licenseNumber: `TEMP_${Date.now()}`, // Temporary license number
        specialty: "general_practice",
        isAvailable: false,
      }).returning()
      console.log("Created doctor profile (pending verification):", newDoctor)
    }

    return newUser
  } catch (error) {
    console.error("Error creating medical user profile:", error)
    return null
  }
}

/**
 * Get current user's medical profile with role-specific data
 */
export async function getCurrentMedicalUser(): Promise<PatientProfile | DoctorProfile | null> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) return null

    // Try to get user from our medical database
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1)

    // If user doesn't exist, create them (fallback mechanism)
    if (!user) {
      console.log("User not found in medical database, creating profile...")
      const newUser = await createMedicalUserProfile(clerkUser)
      if (!newUser) return null
      user = newUser
    }

    const baseUser: MedicalUser = {
      id: user.id,
      clerkUserId: user.clerkUserId,
      userType: user.userType,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      profileImage: user.profileImage,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    // Get role-specific data
    if (user.userType === "patient") {
      try {
        const [patientData] = await db
          .select()
          .from(patients)
          .where(eq(patients.userId, user.id))
          .limit(1)

        return {
          ...baseUser,
          patientData: patientData ? {
            id: patientData.id,
            dateOfBirth: patientData.dateOfBirth || undefined,
            gender: patientData.gender || undefined,
            bloodType: patientData.bloodType || undefined,
            allergies: patientData.allergies || undefined,
            medicalHistory: patientData.medicalHistory || undefined,
            emergencyContactName: patientData.emergencyContactName || undefined,
            emergencyContactPhone: patientData.emergencyContactPhone || undefined,
          } : undefined
        } as PatientProfile
      } catch (error) {
        console.error("Error fetching patient data:", error)
        return baseUser as PatientProfile
      }

    } else if (user.userType === "doctor") {
      try {
        const [doctorData] = await db
          .select()
          .from(doctors)
          .where(eq(doctors.userId, user.id))
          .limit(1)

        return {
          ...baseUser,
          doctorData: doctorData ? {
            id: doctorData.id,
            licenseNumber: doctorData.licenseNumber,
            specialty: doctorData.specialty,
            subSpecialty: doctorData.subSpecialty || undefined,
            yearsOfExperience: doctorData.yearsOfExperience || undefined,
            bio: doctorData.bio || undefined,
            consultationFee: doctorData.consultationFee || undefined,
            rating: doctorData.rating || undefined,
            isAvailable: doctorData.isAvailable,
          } : undefined
        } as DoctorProfile
      } catch (error) {
        console.error("Error fetching doctor data:", error)
        return baseUser as DoctorProfile
      }
    }

    return baseUser as PatientProfile | DoctorProfile

  } catch (error) {
    console.error("Error getting current medical user:", error)
    
    // If database tables don't exist, return a mock user for development
    const clerkUser = await currentUser()
    if (!clerkUser) return null
    
    console.log("Database tables not found, using development mode...")
    return {
      id: "dev-user",
      clerkUserId: clerkUser.id,
      userType: "patient",
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      phone: null,
      profileImage: clerkUser.imageUrl || null,
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PatientProfile
  }
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentMedicalUser()
  return user?.userType === role
}

/**
 * Get user's display name
 */
export function getUserDisplayName(user: MedicalUser): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  return user.firstName || user.email.split('@')[0] || 'User'
} 