"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db, consultations, doctors, patients, users, prescriptions, symptoms } from "@/db"
import { eq, and, desc, sql, like } from "drizzle-orm"

export interface DoctorPatientRecord {
  id: string
  userId: string
  dateOfBirth?: Date | null
  gender?: string | null
  bloodType?: string | null
  height?: number | null
  weight?: number | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  allergies?: string | null
  medicalHistory?: string | null
  currentMedications?: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone?: string | null
    profileImage?: string | null
  }
  consultationCount: number
  lastConsultation?: Date | null
  prescriptionCount: number
  activeSymptoms: number
}

async function getCurrentDoctorId(): Promise<string | null> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) return null

    const userRecord = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1)

    if (!userRecord[0]) return null

    const doctorRecord = await db
      .select({ id: doctors.id })
      .from(doctors)
      .where(eq(doctors.userId, userRecord[0].id))
      .limit(1)

    return doctorRecord[0]?.id || null
  } catch (error) {
    console.error("Error getting current doctor ID:", error)
    return null
  }
}

export async function getDoctorPatients(): Promise<DoctorPatientRecord[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    // Get all patients who have had consultations with this doctor
    const result = await db
      .selectDistinct({
        id: patients.id,
        userId: patients.userId,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        bloodType: patients.bloodType,
        height: patients.height,
        weight: patients.weight,
        address: patients.address,
        city: patients.city,
        state: patients.state,
        zipCode: patients.zipCode,
        country: patients.country,
        emergencyContactName: patients.emergencyContactName,
        emergencyContactPhone: patients.emergencyContactPhone,
        emergencyContactRelation: patients.emergencyContactRelation,
        allergies: patients.allergies,
        medicalHistory: patients.medicalHistory,
        currentMedications: patients.currentMedications,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage
        }
      })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .innerJoin(consultations, eq(consultations.patientId, patients.id))
      .where(eq(consultations.doctorId, doctorId))
      .orderBy(desc(patients.updatedAt))

    // Get additional statistics for each patient
    const patientsWithStats = await Promise.all(
      result.map(async (patient) => {
        // Get consultation count
        const consultationCountResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(consultations)
          .where(and(
            eq(consultations.patientId, patient.id),
            eq(consultations.doctorId, doctorId)
          ))

        // Get last consultation date
        const lastConsultationResult = await db
          .select({ scheduledAt: consultations.scheduledAt })
          .from(consultations)
          .where(and(
            eq(consultations.patientId, patient.id),
            eq(consultations.doctorId, doctorId)
          ))
          .orderBy(desc(consultations.scheduledAt))
          .limit(1)

        // Get prescription count from this doctor
        const prescriptionCountResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(prescriptions)
          .where(and(
            eq(prescriptions.patientId, patient.id),
            eq(prescriptions.doctorId, doctorId)
          ))

        // Get active symptoms count
        const activeSymptomsResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(symptoms)
          .where(and(
            eq(symptoms.patientId, patient.id),
            sql`${symptoms.resolvedDate} IS NULL`
          ))

        return {
          ...patient,
          consultationCount: consultationCountResult[0]?.count || 0,
          lastConsultation: lastConsultationResult[0]?.scheduledAt || null,
          prescriptionCount: prescriptionCountResult[0]?.count || 0,
          activeSymptoms: activeSymptomsResult[0]?.count || 0
        }
      })
    )

    return patientsWithStats as DoctorPatientRecord[]
  } catch (error) {
    console.error("Error fetching doctor patients:", error)
    return []
  }
}

export async function searchDoctorPatients(searchTerm: string): Promise<DoctorPatientRecord[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .selectDistinct({
        id: patients.id,
        userId: patients.userId,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        bloodType: patients.bloodType,
        height: patients.height,
        weight: patients.weight,
        address: patients.address,
        city: patients.city,
        state: patients.state,
        zipCode: patients.zipCode,
        country: patients.country,
        emergencyContactName: patients.emergencyContactName,
        emergencyContactPhone: patients.emergencyContactPhone,
        emergencyContactRelation: patients.emergencyContactRelation,
        allergies: patients.allergies,
        medicalHistory: patients.medicalHistory,
        currentMedications: patients.currentMedications,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage
        }
      })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .innerJoin(consultations, eq(consultations.patientId, patients.id))
      .where(and(
        eq(consultations.doctorId, doctorId),
        sql`(
          LOWER(${users.firstName}) LIKE LOWER(${`%${searchTerm}%`}) OR
          LOWER(${users.lastName}) LIKE LOWER(${`%${searchTerm}%`}) OR
          LOWER(${users.email}) LIKE LOWER(${`%${searchTerm}%`}) OR
          ${users.phone} LIKE ${`%${searchTerm}%`}
        )`
      ))
      .orderBy(desc(patients.updatedAt))

    const patientsWithStats = await Promise.all(
      result.map(async (patient) => {
        const consultationCountResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(consultations)
          .where(and(
            eq(consultations.patientId, patient.id),
            eq(consultations.doctorId, doctorId)
          ))

        const lastConsultationResult = await db
          .select({ scheduledAt: consultations.scheduledAt })
          .from(consultations)
          .where(and(
            eq(consultations.patientId, patient.id),
            eq(consultations.doctorId, doctorId)
          ))
          .orderBy(desc(consultations.scheduledAt))
          .limit(1)

        const prescriptionCountResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(prescriptions)
          .where(and(
            eq(prescriptions.patientId, patient.id),
            eq(prescriptions.doctorId, doctorId)
          ))

        const activeSymptomsResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(symptoms)
          .where(and(
            eq(symptoms.patientId, patient.id),
            sql`${symptoms.resolvedDate} IS NULL`
          ))

        return {
          ...patient,
          consultationCount: consultationCountResult[0]?.count || 0,
          lastConsultation: lastConsultationResult[0]?.scheduledAt || null,
          prescriptionCount: prescriptionCountResult[0]?.count || 0,
          activeSymptoms: activeSymptomsResult[0]?.count || 0
        }
      })
    )

    return patientsWithStats as DoctorPatientRecord[]
  } catch (error) {
    console.error("Error searching doctor patients:", error)
    return []
  }
}

export async function getPatientDetailById(patientId: string) {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return null

    // Verify this doctor has had consultations with this patient
    const accessCheck = await db
      .select({ id: consultations.id })
      .from(consultations)
      .where(and(
        eq(consultations.patientId, patientId),
        eq(consultations.doctorId, doctorId)
      ))
      .limit(1)

    if (!accessCheck[0]) return null

    // Get patient details
    const patientResult = await db
      .select({
        id: patients.id,
        userId: patients.userId,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        bloodType: patients.bloodType,
        height: patients.height,
        weight: patients.weight,
        address: patients.address,
        city: patients.city,
        state: patients.state,
        zipCode: patients.zipCode,
        country: patients.country,
        emergencyContactName: patients.emergencyContactName,
        emergencyContactPhone: patients.emergencyContactPhone,
        emergencyContactRelation: patients.emergencyContactRelation,
        allergies: patients.allergies,
        medicalHistory: patients.medicalHistory,
        currentMedications: patients.currentMedications,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage
        }
      })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(eq(patients.id, patientId))
      .limit(1)

    if (!patientResult[0]) return null

    // Get consultation history with this doctor
    const consultationHistory = await db
      .select({
        id: consultations.id,
        scheduledAt: consultations.scheduledAt,
        duration: consultations.duration,
        consultationType: consultations.consultationType,
        status: consultations.status,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        doctorNotes: consultations.doctorNotes,
        prescriptionGiven: consultations.prescriptionGiven,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        consultationFee: consultations.consultationFee,
        paymentStatus: consultations.paymentStatus
      })
      .from(consultations)
      .where(and(
        eq(consultations.patientId, patientId),
        eq(consultations.doctorId, doctorId)
      ))
      .orderBy(desc(consultations.scheduledAt))

    // Get prescriptions from this doctor
    const prescriptionHistory = await db
      .select({
        id: prescriptions.id,
        medicationName: prescriptions.medicationName,
        genericName: prescriptions.genericName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        duration: prescriptions.duration,
        quantity: prescriptions.quantity,
        instructions: prescriptions.instructions,
        status: prescriptions.status,
        startDate: prescriptions.startDate,
        endDate: prescriptions.endDate,
        isActive: prescriptions.isActive,
        createdAt: prescriptions.createdAt
      })
      .from(prescriptions)
      .where(and(
        eq(prescriptions.patientId, patientId),
        eq(prescriptions.doctorId, doctorId)
      ))
      .orderBy(desc(prescriptions.createdAt))

    // Get patient's symptoms
    const symptomHistory = await db
      .select({
        id: symptoms.id,
        symptomName: symptoms.symptomName,
        category: symptoms.category,
        description: symptoms.description,
        severity: symptoms.severity,
        duration: symptoms.duration,
        frequency: symptoms.frequency,
        onsetDate: symptoms.onsetDate,
        resolvedDate: symptoms.resolvedDate,
        createdAt: symptoms.createdAt
      })
      .from(symptoms)
      .where(eq(symptoms.patientId, patientId))
      .orderBy(desc(symptoms.createdAt))

    return {
      patient: patientResult[0],
      consultationHistory,
      prescriptionHistory,
      symptomHistory
    }
  } catch (error) {
    console.error("Error fetching patient detail:", error)
    return null
  }
}
