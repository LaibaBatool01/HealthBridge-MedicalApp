"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { AppSidebar } from "./app-sidebar"

export type MedicalUserData = {
  id: string
  name: string
  email: string
  avatar: string
  userType: "patient" | "doctor" | "admin"
  isVerified: boolean
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

export default function DashboardClientLayout({
  children,
  userData
}: {
  children: React.ReactNode
  userData: MedicalUserData
}) {
  const pathname = usePathname()

  // Read the sidebar state from cookie on initial load
  const getCookieValue = (name: string) => {
    if (typeof document === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
    return null
  }

  const savedState = getCookieValue("sidebar_state")
  const defaultOpen = savedState === null ? true : savedState === "true"

  const getBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const breadcrumbs: { name: string; href: string; current: boolean }[] = []

    // Always start with Dashboard
    if (pathSegments.length >= 1 && pathSegments[0] === "dashboard") {
      breadcrumbs.push({
        name: "Dashboard",
        href: "/dashboard",
        current: pathSegments.length === 1
      })

      // Add subsequent segments
      for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i]
        const href = "/" + pathSegments.slice(0, i + 1).join("/")
        const isLast = i === pathSegments.length - 1

        // Format the segment name
        let pageName = segment
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        // Handle special cases
        if (segment === "find-doctors") pageName = "Find Doctors"
        if (segment === "symptom-checker") pageName = "Symptom Checker"
        if (segment === "consultations") pageName = "Consultations"
        if (segment === "prescriptions") pageName = "Prescriptions"
        if (segment === "medical-records") pageName = "Medical Records"

        if (!isLast) {
          breadcrumbs.push({ name: pageName, href, current: false })
        } else {
          breadcrumbs.push({ name: pageName, href: pathname, current: true })
        }
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar userData={userData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <div
                      key={`${crumb.href}-${index}`}
                      className="flex items-center"
                    >
                      {index > 0 && <BreadcrumbSeparator className="mx-2" />}
                      <BreadcrumbItem>
                        {crumb.current ? (
                          <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.name}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
