"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { 
  BadgeCheck, 
  Bell, 
  ChevronsUpDown, 
  CreditCard, 
  LogOut, 
  Sparkles,
  Shield,
  AlertCircle,
  Heart,
  Stethoscope
} from "lucide-react"
import { SignOutButton } from "@clerk/nextjs"
import { MedicalUserData } from "./layout-client"

export function NavUser({
  user
}: {
  user: MedicalUserData
}) {
  const { isMobile } = useSidebar()

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getVerificationStatus = () => {
    if (user.isVerified) {
      return {
        icon: <BadgeCheck className="h-4 w-4 text-green-500" />,
        text: "Verified",
        color: "bg-green-100 text-green-800"
      }
    }
    return {
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      text: "Pending Verification",
      color: "bg-yellow-100 text-yellow-800"
    }
  }

  const verificationStatus = getVerificationStatus()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            {/* User Type & Verification Status */}
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex items-center gap-2">
                {user.userType === "patient" ? (
                  <Heart className="h-4 w-4 text-red-500" />
                ) : (
                  <Stethoscope className="h-4 w-4 text-blue-500" />
                )}
                <span className="capitalize">{user.userType} Account</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="flex items-center gap-2">
                {verificationStatus.icon}
                <span>{verificationStatus.text}</span>
                <Badge variant="secondary" className={`ml-auto text-xs ${verificationStatus.color}`}>
                  {user.isVerified ? "Verified" : "Pending"}
                </Badge>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade plan
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <SignOutButton redirectUrl="/">
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
