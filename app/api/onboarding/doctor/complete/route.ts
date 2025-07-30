import { db, users, doctors } from "@/db"
import { eq } from "drizzle-orm"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("Doctor onboarding API called for user:", clerkUser.id)

    const onboardingData = await req.json()
    console.log("Onboarding data received:", {
      licenseNumber: onboardingData.licenseNumber,
      specialty: onboardingData.specialty,
      hasDocuments: {
        medicalLicense: !!onboardingData.medicalLicense,
        degreeCertificate: !!onboardingData.degreeCertificate
      }
    })

    // Get the user from our database
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1)

    console.log("User found in database:", user ? "Yes" : "No")
    
    // If user doesn't exist, create them as a fallback (webhook might have failed)
    if (!user) {
      console.log("User not found, creating user record as fallback...")
      
      const email = clerkUser.emailAddresses[0]?.emailAddress
      const firstName = clerkUser.firstName || ""
      const lastName = clerkUser.lastName || ""
      const phone = clerkUser.phoneNumbers[0]?.phoneNumber
      const profileImage = clerkUser.imageUrl

      if (!email) {
        return NextResponse.json({ error: "No email address found for user" }, { status: 400 })
      }

      // Create user record
      const [newUser] = await db.insert(users).values({
        clerkUserId: clerkUser.id,
        userType: "doctor", // Since this is the doctor onboarding flow
        email,
        firstName,
        lastName,
        phone,
        profileImage,
        isActive: true,
        isVerified: false,
      }).returning()

      user = newUser
      console.log("Created user record:", user.id)
    } else {
      console.log("User type:", user.userType)
    }

    if (user.userType !== "doctor") {
      return NextResponse.json({ 
        error: `User type is ${user.userType}, not doctor. Please contact support.` 
      }, { status: 400 })
    }

    // Check if doctor profile exists, if not create it
    const [existingDoctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, user.id))
      .limit(1)

    console.log("Existing doctor profile found:", existingDoctor ? "Yes" : "No")

    if (!existingDoctor) {
      // Create new doctor profile
      console.log("Creating new doctor profile...")
      await db
        .insert(doctors)
        .values({
          userId: user.id,
          licenseNumber: onboardingData.licenseNumber || "TEMP_LICENSE",
          specialty: onboardingData.specialty || "general_practice",
          subSpecialty: onboardingData.subSpecialty || null,
          yearsOfExperience: onboardingData.yearsOfExperience || 0,
          education: JSON.stringify({
            medicalSchool: onboardingData.medicalSchool,
            residency: onboardingData.residency,
            fellowship: onboardingData.fellowship || null
          }),
          certifications: JSON.stringify(onboardingData.boardCertifications || []),
          bio: onboardingData.professionalBio || null,
          consultationFee: onboardingData.consultationFee?.toString() || "75",
          languages: JSON.stringify(onboardingData.languages || ["English"]),
          availableHours: JSON.stringify(onboardingData.availableHours || {}),
          hospitalAffiliations: JSON.stringify(onboardingData.hospitalAffiliations || []),
          isAvailable: false, // Will be set to true after verification
          rating: "0.00",
          totalRatings: 0
        })
    } else {
      // Update existing doctor profile
      console.log("Updating existing doctor profile...")
      await db
        .update(doctors)
        .set({
          licenseNumber: onboardingData.licenseNumber,
          specialty: onboardingData.specialty,
          subSpecialty: onboardingData.subSpecialty || null,
          yearsOfExperience: onboardingData.yearsOfExperience || 0,
          education: JSON.stringify({
            medicalSchool: onboardingData.medicalSchool,
            residency: onboardingData.residency,
            fellowship: onboardingData.fellowship || null
          }),
          certifications: JSON.stringify(onboardingData.boardCertifications || []),
          bio: onboardingData.professionalBio || null,
          consultationFee: onboardingData.consultationFee?.toString() || "75",
          languages: JSON.stringify(onboardingData.languages || ["English"]),
          availableHours: JSON.stringify(onboardingData.availableHours || {}),
          hospitalAffiliations: JSON.stringify(onboardingData.hospitalAffiliations || []),
          isAvailable: false, // Will be set to true after verification
          rating: "0.00",
          totalRatings: 0,
          updatedAt: new Date()
        })
        .where(eq(doctors.userId, user.id))
    }

    // Mark user onboarding as complete (can access dashboard)
    await db
      .update(users)
      .set({
        isVerified: true, // Onboarding is complete, user can access dashboard
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))

    console.log("Doctor onboarding completed for user:", user.id)
    console.log("Specialty:", onboardingData.specialty)
    console.log("License:", onboardingData.licenseNumber)
    console.log("Documents uploaded:", {
      medicalLicense: !!onboardingData.medicalLicense,
      degreeCertificate: !!onboardingData.degreeCertificate,
      boardCertificate: !!onboardingData.boardCertificate
    })

    return NextResponse.json({ 
      success: true, 
      message: "Doctor onboarding completed successfully. Documents submitted for verification.",
      status: "pending_verification"
    })

  } catch (error) {
    console.error("Error completing doctor onboarding:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return NextResponse.json({ 
          error: "Database tables not set up. Please run the setup script first." 
        }, { status: 500 })
      }
      
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({ 
          error: "Doctor profile already exists. Please contact support." 
        }, { status: 400 })
      }
      
      console.error("Specific error:", error.message)
      return NextResponse.json({ 
        error: `Database error: ${error.message}` 
      }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 