import { getCurrentMedicalUser, getUserDisplayName } from "@/actions/users"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DashboardClientLayout from "./_components/layout-client"

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/login")
  }

  const medicalUser = await getCurrentMedicalUser()

  // If we can't get medical user, show an error but don't redirect (let fallback handle it)
  if (!medicalUser) {
    console.error("Could not load medical user profile")
    // The getCurrentMedicalUser function now has fallback mechanisms
    // so this should rarely happen, but if it does, we'll redirect
    redirect("/signup?error=profile_incomplete")
  }

  // Check if user account is active
  if (!medicalUser.isActive) {
    redirect("/?error=account_inactive")
  }

  // Redirect to onboarding if user hasn't completed it yet
  if (!medicalUser.isVerified) {
    if (medicalUser.userType === "patient") {
      redirect("/onboarding")
    } else if (medicalUser.userType === "doctor") {
      redirect("/onboarding/doctor")
    }
  }

  const userData = {
    id: medicalUser.id,
    name: getUserDisplayName(medicalUser),
    email: medicalUser.email,
    avatar: medicalUser.profileImage || clerkUser.imageUrl,
    userType: medicalUser.userType,
    isVerified: medicalUser.isVerified,
    // Include role-specific data
    ...(medicalUser.userType === "patient" && {
      patientData: (medicalUser as any).patientData
    }),
    ...(medicalUser.userType === "doctor" && {
      doctorData: (medicalUser as any).doctorData
    })
  }

  return (
    <DashboardClientLayout userData={userData}>
      {children}
    </DashboardClientLayout>
  )
}
