"use client"

import { 
  Heart, 
  Stethoscope, 
  Calendar, 
  FileText, 
  Bell, 
  Activity,
  Settings2, 
  User, 
  Users,
  Search,
  MessageCircle,
  Pill,
  Shield,
  UserCheck,
  BarChart3
} from "lucide-react"
import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar"
import { NavMain } from "../_components/nav-main"
import { NavUser } from "../_components/nav-user"
import { TeamSwitcher } from "../_components/team-switcher"
import { MedicalUserData } from "./layout-client"

export function AppSidebar({
  userData,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  userData: MedicalUserData
}) {
  // Patient Navigation
  const patientNavigation = [
    {
      title: "Health Overview",
      url: "/dashboard",
      icon: Activity,
      isActive: true,
      items: [
        {
          title: "My Dashboard",
          url: "/dashboard"
        },
        {
          title: "Health Summary",
          url: "/dashboard/health-summary"
        }
      ]
    },
    {
      title: "Medical Care",
      url: "#",
      icon: Stethoscope,
      items: [
        {
          title: "Symptom Checker",
          url: "/dashboard/symptom-checker"
        },
        {
          title: "Find Doctors",
          url: "/dashboard/find-doctors"
        },
        {
          title: "Consultations",
          url: "/dashboard/consultations"
        }
      ]
    },
    {
      title: "My Health",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Prescriptions",
          url: "/dashboard/prescriptions"
        },
        {
          title: "Medical Records",
          url: "/dashboard/medical-records"
        },
        {
          title: "Reminders",
          url: "/dashboard/reminders"
        }
      ]
    },
    {
      title: "Account",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "/dashboard/account"
        },
        {
          title: "Billing",
          url: "/dashboard/billing"
        },
        {
          title: "Support",
          url: "/dashboard/support"
        }
      ]
    }
  ]

  // Doctor Navigation  
  const doctorNavigation = [
    {
      title: "Practice Overview",
      url: "/dashboard",
      icon: Activity,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard"
        },
        {
          title: "Today's Schedule",
          url: "/dashboard/schedule"
        },
        {
          title: "Verification Status",
          url: "/dashboard/verification-status"
        }
      ]
    },
    {
      title: "Patients",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Patient Queue",
          url: "/dashboard/patient-queue"
        },
        {
          title: "Consultations",
          url: "/dashboard/consultations"
        },
        {
          title: "Patient Records",
          url: "/dashboard/patient-records"
        }
      ]
    },
    {
      title: "Medical Tools",
      url: "#",
      icon: Stethoscope,
      items: [
        {
          title: "Write Prescription",
          url: "/dashboard/prescriptions"
        },
        {
          title: "Consultation Notes",
          url: "/dashboard/notes"
        }
      ]
    },
    {
      title: "Practice",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Schedule Settings",
          url: "/dashboard/schedule-settings"
        },
        {
          title: "Profile",
          url: "/dashboard/account"
        },
        {
          title: "Earnings",
          url: "/dashboard/earnings"
        }
      ]
    }
  ]

  // Admin Navigation
  const adminNavigation = [
    {
      title: "Admin Overview",
      url: "/dashboard",
      icon: Activity,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard"
        },
        {
          title: "System Stats",
          url: "/dashboard/admin/stats"
        }
      ]
    },
    {
      title: "Doctor Management",
      url: "#",
      icon: UserCheck,
      items: [
        {
          title: "Verification Queue",
          url: "/dashboard/admin"
        },
        {
          title: "All Doctors",
          url: "/dashboard/admin/doctors"
        },
        {
          title: "Verification Reports",
          url: "/dashboard/admin/reports"
        }
      ]
    },
    {
      title: "Platform Analytics",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "User Analytics",
          url: "/dashboard/admin/analytics"
        },
        {
          title: "Consultation Reports",
          url: "/dashboard/admin/consultations"
        },
        {
          title: "Financial Reports",
          url: "/dashboard/admin/finances"
        }
      ]
    },
    {
      title: "System Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Platform Settings",
          url: "/dashboard/admin/settings"
        },
        {
          title: "User Management",
          url: "/dashboard/admin/users"
        },
        {
          title: "Support Tickets",
          url: "/dashboard/admin/support"
        }
      ]
    }
  ]

  const getNavigationForUserType = (userType: string) => {
    switch (userType) {
      case "patient":
        return patientNavigation
      case "doctor":
        return doctorNavigation
      case "admin":
        return adminNavigation
      default:
        return patientNavigation
    }
  }

  const getTeamConfig = (userType: string) => {
    switch (userType) {
      case "patient":
        return {
          name: "My Health",
          logo: Heart,
          plan: "Patient Account"
        }
      case "doctor":
        return {
          name: "My Practice",
          logo: Stethoscope,
          plan: "Doctor Account"
        }
      case "admin":
        return {
          name: "HealthBridge Admin",
          logo: Shield,
          plan: "Administrator"
        }
      default:
        return {
          name: "My Health",
          logo: Heart,
          plan: "Patient Account"
        }
    }
  }

  const data = {
    user: userData,
    teams: [getTeamConfig(userData.userType)],
    navMain: getNavigationForUserType(userData.userType)
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
