"use server"

import { db, users, patients, doctors, consultations, prescriptions, symptoms, reminders } from "@/db"
import { eq, and, desc, gte, lte, count } from "drizzle-orm"
import { currentUser } from "@clerk/nextjs/server"

export async function getDashboardData() {
  const clerkUser = await currentUser()
  if (!clerkUser) {
    throw new Error("Not authenticated")
  }

  // Get user from database
  const user = await db.select().from(users).where(eq(users.clerkUserId, clerkUser.id)).limit(1)
  if (!user.length) {
    throw new Error("User not found")
  }

  const currentDbUser = user[0]
  
  if (currentDbUser.userType === "patient") {
    return await getPatientDashboardData(currentDbUser.id)
  } else if (currentDbUser.userType === "doctor") {
    return await getDoctorDashboardData(currentDbUser.id)
  }
  
  throw new Error("Invalid user type")
}

async function getPatientDashboardData(userId: string) {
  // Get patient record
  const patient = await db.select().from(patients).where(eq(patients.userId, userId)).limit(1)
  if (!patient.length) {
    throw new Error("Patient profile not found")
  }

  const patientId = patient[0].id

  // Get next appointment
  const nextAppointment = await db
    .select({
      id: consultations.id,
      scheduledAt: consultations.scheduledAt,
      doctorFirstName: users.firstName,
      doctorLastName: users.lastName,
      status: consultations.status
    })
    .from(consultations)
    .leftJoin(doctors, eq(consultations.doctorId, doctors.id))
    .leftJoin(users, eq(doctors.userId, users.id))
    .where(and(
      eq(consultations.patientId, patientId),
      gte(consultations.scheduledAt, new Date())
    ))
    .orderBy(consultations.scheduledAt)
    .limit(1)

  // Get active prescriptions count
  const activePrescriptions = await db
    .select({ count: count() })
    .from(prescriptions)
    .where(and(
      eq(prescriptions.patientId, patientId),
      eq(prescriptions.isActive, true)
    ))

  // Get prescriptions due today
  const prescriptionsDueToday = await db
    .select({ count: count() })
    .from(reminders)
    .where(and(
      eq(reminders.patientId, patientId),
      eq(reminders.reminderType, "medication"),
      eq(reminders.status, "active")
    ))

  // Get recent consultations (completed ones)
  const recentConsultations = await db
    .select({
      id: consultations.id,
      scheduledAt: consultations.scheduledAt,
      doctorFirstName: users.firstName,
      doctorLastName: users.lastName,
      diagnosis: consultations.diagnosis,
      status: consultations.status
    })
    .from(consultations)
    .leftJoin(doctors, eq(consultations.doctorId, doctors.id))
    .leftJoin(users, eq(doctors.userId, users.id))
    .where(and(
      eq(consultations.patientId, patientId),
      eq(consultations.status, "completed")
    ))
    .orderBy(desc(consultations.scheduledAt))
    .limit(5)

  // Get recent prescriptions
  const recentPrescriptions = await db
    .select({
      id: prescriptions.id,
      medicationName: prescriptions.medicationName,
      dosage: prescriptions.dosage,
      frequency: prescriptions.frequency,
      status: prescriptions.status,
      createdAt: prescriptions.createdAt
    })
    .from(prescriptions)
    .where(eq(prescriptions.patientId, patientId))
    .orderBy(desc(prescriptions.createdAt))
    .limit(5)

  // Get upcoming appointments
  const upcomingAppointments = await db
    .select({
      id: consultations.id,
      scheduledAt: consultations.scheduledAt,
      doctorFirstName: users.firstName,
      doctorLastName: users.lastName,
      consultationType: consultations.consultationType,
      status: consultations.status
    })
    .from(consultations)
    .leftJoin(doctors, eq(consultations.doctorId, doctors.id))
    .leftJoin(users, eq(doctors.userId, users.id))
    .where(and(
      eq(consultations.patientId, patientId),
      gte(consultations.scheduledAt, new Date())
    ))
    .orderBy(consultations.scheduledAt)
    .limit(5)

  return {
    nextAppointment: nextAppointment[0] || null,
    activePrescriptionsCount: activePrescriptions[0]?.count || 0,
    prescriptionsDueTodayCount: prescriptionsDueToday[0]?.count || 0,
    recentConsultations,
    recentPrescriptions,
    upcomingAppointments
  }
}

async function getDoctorDashboardData(userId: string) {
  // Get doctor record
  const doctor = await db.select().from(doctors).where(eq(doctors.userId, userId)).limit(1)
  if (!doctor.length) {
    throw new Error("Doctor profile not found")
  }

  const doctorId = doctor[0].id

  // Get today's appointments
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todaysAppointments = await db
    .select({ count: count() })
    .from(consultations)
    .where(and(
      eq(consultations.doctorId, doctorId),
      gte(consultations.scheduledAt, today),
      lte(consultations.scheduledAt, tomorrow)
    ))

  // Get total patients
  const totalPatients = await db
    .select({ count: count() })
    .from(consultations)
    .where(eq(consultations.doctorId, doctorId))

  // Get upcoming appointments
  const upcomingAppointments = await db
    .select({
      id: consultations.id,
      scheduledAt: consultations.scheduledAt,
      patientFirstName: users.firstName,
      patientLastName: users.lastName,
      consultationType: consultations.consultationType,
      status: consultations.status
    })
    .from(consultations)
    .leftJoin(patients, eq(consultations.patientId, patients.id))
    .leftJoin(users, eq(patients.userId, users.id))
    .where(and(
      eq(consultations.doctorId, doctorId),
      gte(consultations.scheduledAt, new Date())
    ))
    .orderBy(consultations.scheduledAt)
    .limit(5)

  return {
    todaysAppointmentsCount: todaysAppointments[0]?.count || 0,
    totalPatientsCount: totalPatients[0]?.count || 0,
    upcomingAppointments,
    rating: doctor[0].rating || 0,
    totalRatings: doctor[0].totalRatings || 0
  }
}