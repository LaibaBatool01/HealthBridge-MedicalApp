"use server"

import { db, prescriptions, users, patients, doctors } from "@/db"
import { eq, and, desc, gte } from "drizzle-orm"
import { getCurrentMedicalUser } from "./users"

export async function getPatientPrescriptions() {
  try {
    const currentMedicalUser = await getCurrentMedicalUser()
    if (!currentMedicalUser || currentMedicalUser.userType !== 'patient') {
      throw new Error("Unauthorized - Patient access required")
    }

    // Get patient record
    const patientRecord = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, currentMedicalUser.id))
      .limit(1)

    if (patientRecord.length === 0) {
      throw new Error("Patient profile not found")
    }

    const patientId = patientRecord[0].id

    // Get all prescriptions for this patient with doctor info
    const prescriptionsList = await db
      .select({
        id: prescriptions.id,
        medicationName: prescriptions.medicationName,
        genericName: prescriptions.genericName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        customFrequency: prescriptions.customFrequency,
        duration: prescriptions.duration,
        quantity: prescriptions.quantity,
        instructions: prescriptions.instructions,
        sideEffects: prescriptions.sideEffects,
        interactions: prescriptions.interactions,
        refillsAllowed: prescriptions.refillsAllowed,
        status: prescriptions.status,
        pharmacyName: prescriptions.pharmacyName,
        pharmacyAddress: prescriptions.pharmacyAddress,
        pharmacyPhone: prescriptions.pharmacyPhone,
        startDate: prescriptions.startDate,
        endDate: prescriptions.endDate,
        isActive: prescriptions.isActive,
        createdAt: prescriptions.createdAt,
        updatedAt: prescriptions.updatedAt,
        // Doctor info
        doctorId: doctors.id,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        doctorSpecialty: doctors.specialty
      })
      .from(prescriptions)
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt))

    return prescriptionsList
  } catch (error) {
    console.error("Error fetching patient prescriptions:", error)
    throw error
  }
}

export async function getActivePrescriptions() {
  try {
    const currentMedicalUser = await getCurrentMedicalUser()
    if (!currentMedicalUser || currentMedicalUser.userType !== 'patient') {
      throw new Error("Unauthorized - Patient access required")
    }

    // Get patient record
    const patientRecord = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, currentMedicalUser.id))
      .limit(1)

    if (patientRecord.length === 0) {
      throw new Error("Patient profile not found")
    }

    const patientId = patientRecord[0].id

    // Get active prescriptions
    const activeList = await db
      .select({
        id: prescriptions.id,
        medicationName: prescriptions.medicationName,
        genericName: prescriptions.genericName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        customFrequency: prescriptions.customFrequency,
        duration: prescriptions.duration,
        quantity: prescriptions.quantity,
        instructions: prescriptions.instructions,
        sideEffects: prescriptions.sideEffects,
        interactions: prescriptions.interactions,
        refillsAllowed: prescriptions.refillsAllowed,
        status: prescriptions.status,
        pharmacyName: prescriptions.pharmacyName,
        pharmacyAddress: prescriptions.pharmacyAddress,
        pharmacyPhone: prescriptions.pharmacyPhone,
        startDate: prescriptions.startDate,
        endDate: prescriptions.endDate,
        isActive: prescriptions.isActive,
        createdAt: prescriptions.createdAt,
        // Doctor info
        doctorId: doctors.id,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        doctorSpecialty: doctors.specialty
      })
      .from(prescriptions)
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(and(
        eq(prescriptions.patientId, patientId),
        eq(prescriptions.isActive, true)
      ))
      .orderBy(desc(prescriptions.createdAt))

    return activeList
  } catch (error) {
    console.error("Error fetching active prescriptions:", error)
    throw error
  }
}

export async function getPrescriptionsByStatus(status: 'pending' | 'sent_to_pharmacy' | 'ready_for_pickup' | 'delivered' | 'completed') {
  try {
    const currentMedicalUser = await getCurrentMedicalUser()
    if (!currentMedicalUser || currentMedicalUser.userType !== 'patient') {
      throw new Error("Unauthorized - Patient access required")
    }

    // Get patient record
    const patientRecord = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, currentMedicalUser.id))
      .limit(1)

    if (patientRecord.length === 0) {
      throw new Error("Patient profile not found")
    }

    const patientId = patientRecord[0].id

    // Get prescriptions by status
    const statusList = await db
      .select({
        id: prescriptions.id,
        medicationName: prescriptions.medicationName,
        genericName: prescriptions.genericName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        customFrequency: prescriptions.customFrequency,
        duration: prescriptions.duration,
        quantity: prescriptions.quantity,
        instructions: prescriptions.instructions,
        status: prescriptions.status,
        pharmacyName: prescriptions.pharmacyName,
        pharmacyAddress: prescriptions.pharmacyAddress,
        pharmacyPhone: prescriptions.pharmacyPhone,
        startDate: prescriptions.startDate,
        endDate: prescriptions.endDate,
        isActive: prescriptions.isActive,
        createdAt: prescriptions.createdAt,
        // Doctor info
        doctorId: doctors.id,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        doctorSpecialty: doctors.specialty
      })
      .from(prescriptions)
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(and(
        eq(prescriptions.patientId, patientId),
        eq(prescriptions.status, status)
      ))
      .orderBy(desc(prescriptions.createdAt))

    return statusList
  } catch (error) {
    console.error("Error fetching prescriptions by status:", error)
    throw error
  }
}

export async function getPrescriptionById(prescriptionId: string) {
  try {
    const currentMedicalUser = await getCurrentMedicalUser()
    if (!currentMedicalUser || currentMedicalUser.userType !== 'patient') {
      throw new Error("Unauthorized - Patient access required")
    }

    // Get patient record
    const patientRecord = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, currentMedicalUser.id))
      .limit(1)

    if (patientRecord.length === 0) {
      throw new Error("Patient profile not found")
    }

    const patientId = patientRecord[0].id

    // Get specific prescription
    const prescriptionData = await db
      .select({
        id: prescriptions.id,
        consultationId: prescriptions.consultationId,
        medicationName: prescriptions.medicationName,
        genericName: prescriptions.genericName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        customFrequency: prescriptions.customFrequency,
        duration: prescriptions.duration,
        quantity: prescriptions.quantity,
        instructions: prescriptions.instructions,
        sideEffects: prescriptions.sideEffects,
        interactions: prescriptions.interactions,
        refillsAllowed: prescriptions.refillsAllowed,
        status: prescriptions.status,
        pharmacyName: prescriptions.pharmacyName,
        pharmacyAddress: prescriptions.pharmacyAddress,
        pharmacyPhone: prescriptions.pharmacyPhone,
        startDate: prescriptions.startDate,
        endDate: prescriptions.endDate,
        isActive: prescriptions.isActive,
        createdAt: prescriptions.createdAt,
        updatedAt: prescriptions.updatedAt,
        // Doctor info
        doctorId: doctors.id,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        doctorSpecialty: doctors.specialty
      })
      .from(prescriptions)
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(and(
        eq(prescriptions.id, prescriptionId),
        eq(prescriptions.patientId, patientId)
      ))
      .limit(1)

    if (prescriptionData.length === 0) {
      throw new Error("Prescription not found")
    }

    return prescriptionData[0]
  } catch (error) {
    console.error("Error fetching prescription by ID:", error)
    throw error
  }
}
