import { db, users, patients, doctors } from "@/db"
import { eq } from "drizzle-orm"
import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Get the Webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    )
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occured", {
      status: 400,
    })
  }

  // Handle the webhook
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`)
  console.log("Webhook body:", body)

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const { 
        id: clerkUserId, 
        email_addresses, 
        first_name, 
        last_name, 
        image_url,
        phone_numbers,
        unsafe_metadata 
      } = evt.data

      const email = email_addresses[0]?.email_address
      const firstName = first_name || ""
      const lastName = last_name || ""
      const phone = phone_numbers[0]?.phone_number
      const profileImage = image_url
      const userType = (unsafe_metadata as any)?.userType as "patient" | "doctor" | undefined

      if (!email) {
        console.error("No email address found for user")
        return NextResponse.json({ error: "No email address found" }, { status: 400 })
      }

      // Default to patient if no userType is specified
      const finalUserType = userType || "patient"

      console.log(`Creating/updating user with type: ${finalUserType}`)

      if (eventType === "user.created") {
        // Create user in database
        const [newUser] = await db.insert(users).values({
          clerkUserId,
          userType: finalUserType,
          email,
          firstName,
          lastName,
          phone,
          profileImage,
          isActive: true,
          isVerified: false,
        }).returning()

        console.log("Created user:", newUser)

        // Create type-specific profile
        if (finalUserType === "patient") {
          const [newPatient] = await db.insert(patients).values({
            userId: newUser.id,
            country: "US", // default
          }).returning()
          
          console.log("Created patient profile:", newPatient)
        } else if (finalUserType === "doctor") {
          // For doctors, we'll create a basic profile that needs to be completed
          const [newDoctor] = await db.insert(doctors).values({
            userId: newUser.id,
            licenseNumber: "", // To be filled in verification process
            specialty: "general_practice", // default
            isAvailable: false, // Set to false until verified
          }).returning()
          
          console.log("Created doctor profile (pending verification):", newDoctor)
        }
      } else if (eventType === "user.updated") {
        // Update existing user
        await db.update(users)
          .set({
            email,
            firstName,
            lastName,
            phone,
            profileImage,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkUserId, clerkUserId))

        console.log("Updated user:", clerkUserId)
      }
    }

    return NextResponse.json({ message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    )
  }
} 