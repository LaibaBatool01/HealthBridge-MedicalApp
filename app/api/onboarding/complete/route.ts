import { db, users, patients } from "@/db"
import { eq } from "drizzle-orm"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const onboardingData = await req.json()

    // Get the user from our database
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1)

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
        userType: "patient", // Since this is the patient onboarding flow
        email,
        firstName,
        lastName,
        phone,
        profileImage,
        isActive: true,
        isVerified: false,
      }).returning()

      // Create patient profile
      await db.insert(patients).values({
        userId: newUser.id,
        country: "US", // default
      })

      user = newUser
      console.log("Created user and patient records:", user.id)
    }

    // Update patient profile with onboarding data
    await db
      .update(patients)
      .set({
        dateOfBirth: onboardingData.dateOfBirth || null,
        gender: onboardingData.gender || null,
        address: onboardingData.address || null,
        emergencyContactName: onboardingData.emergencyContact || null,
        emergencyContactPhone: onboardingData.emergencyPhone || null,
        bloodType: onboardingData.bloodType || null,
        allergies: JSON.stringify(onboardingData.allergies || []),
        medicalHistory: JSON.stringify({
          currentMedications: onboardingData.currentMedications || [],
          chronicConditions: onboardingData.chronicConditions || [],
          symptoms: onboardingData.symptoms || [],
          urgencyLevel: onboardingData.urgencyLevel || "low",
          symptomsDescription: onboardingData.symptomsDescription || "",
          preferredLanguage: onboardingData.preferredLanguage || "English",
          consultationType: onboardingData.consultationType || "either"
        }),
        updatedAt: new Date()
      })
      .where(eq(patients.userId, user.id))

    // Mark user as having completed onboarding
    await db
      .update(users)
      .set({
        isVerified: true, // Use this field to track onboarding completion
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))

    // Store the symptoms in session for doctor recommendations
    // This could also be stored in a separate table if needed
    console.log("Onboarding completed for user:", user.id)
    console.log("Symptoms:", onboardingData.symptoms)
    console.log("Urgency:", onboardingData.urgencyLevel)

    return NextResponse.json({ 
      success: true, 
      message: "Onboarding completed successfully",
      symptoms: onboardingData.symptoms,
      urgencyLevel: onboardingData.urgencyLevel
    })

  } catch (error) {
    console.error("Error completing onboarding:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 