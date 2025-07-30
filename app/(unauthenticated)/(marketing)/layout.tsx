import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getCurrentMedicalUser } from "@/actions/users"
import { RedirectToast } from "@/components/payments/redirect-toast"
import { Footer } from "./_components/footer"
import { HeaderWrapper } from "./_components/header-wrapper"
import { ScrollIndicator } from "./_components/scroll-indicator"
import { StickyCTA } from "./_components/sticky-cta"

export default async function MarketingLayout({
  children
}: {
  children: React.ReactNode
}) {
  const clerkUser = await currentUser()
  
  // If user is authenticated, redirect to appropriate dashboard/onboarding
  if (clerkUser) {
    let medicalUser
    try {
      medicalUser = await getCurrentMedicalUser()
    } catch (error) {
      console.error("Error checking medical user profile:", error)
      // Continue to show marketing page if there's an error getting user data
    }
    
    if (medicalUser) {
      // Check if user account is active
      if (!medicalUser.isActive) {
        // Allow marketing page to show with error parameter for inactive accounts
        // The redirect will be handled by URL params
      } else {
        // Redirect to onboarding if user hasn't completed it yet
        if (!medicalUser.isVerified) {
          if (medicalUser.userType === "patient") {
            redirect("/onboarding")
          } else if (medicalUser.userType === "doctor") {
            redirect("/onboarding/doctor")
          }
        } else {
          // User is verified and active, redirect to dashboard
          redirect("/dashboard")
        }
      }
    }
  }
  
  return (
    <>
      <HeaderWrapper />
      {children}
      <Footer />
      <StickyCTA />
      <ScrollIndicator />
      <RedirectToast />
    </>
  )
}
