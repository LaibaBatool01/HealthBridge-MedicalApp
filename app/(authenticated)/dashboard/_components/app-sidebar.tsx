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
  Pill
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

  const data = {
    user: userData,
    teams: [
      {
        name: userData.userType === "patient" ? "My Health" : "My Practice",
        logo: userData.userType === "patient" ? Heart : Stethoscope,
        plan: userData.userType === "patient" ? "Patient Account" : "Doctor Account"
      }
    ],
    navMain: userData.userType === "patient" ? patientNavigation : doctorNavigation
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
