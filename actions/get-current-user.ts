"use server"

import { getCurrentMedicalUser } from "@/actions/users"

export async function getCurrentUserAction() {
  try {
    const user = await getCurrentMedicalUser()
    return { success: true, user }
  } catch (error) {
    console.error("Error getting current user:", error)
    return { success: false, error: "Failed to get user data" }
  }
}