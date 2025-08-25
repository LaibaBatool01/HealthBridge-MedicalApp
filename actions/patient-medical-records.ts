"use server"

import { db, consultations, symptoms, prescriptions, users, patients, doctors } from "@/db"
import { eq, and, desc, or } from "drizzle-orm"
import { getCurrentMedicalUser } from "./users"

export interface MedicalRecord {
  id: string
  date: Date
  type: 'consultation' | 'symptom' | 'prescription' | 'lab_test' | 'procedure'
  title: string
  description: string
  doctor?: string
  doctorSpecialty?: string
  status: 'completed' | 'scheduled' | 'cancelled' | 'pending'
  attachments?: string[]
  data?: any // Additional type-specific data
}

export async function getPatientMedicalRecords(): Promise<MedicalRecord[]> {
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

    // Get consultation records
    const consultationRecords = await db
      .select({
        id: consultations.id,
        date: consultations.scheduledAt,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        doctorNotes: consultations.doctorNotes,
        status: consultations.status,
        consultationType: consultations.consultationType,
        consultationFee: consultations.consultationFee,
        prescriptionGiven: consultations.prescriptionGiven,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        createdAt: consultations.createdAt,
        // Doctor info
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        doctorSpecialty: doctors.specialty
      })
      .from(consultations)
      .leftJoin(doctors, eq(consultations.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(eq(consultations.patientId, patientId))
      .orderBy(desc(consultations.scheduledAt))

    // Get symptom records
    const symptomRecords = await db
      .select({
        id: symptoms.id,
        date: symptoms.createdAt,
        symptomName: symptoms.symptomName,
        category: symptoms.category,
        description: symptoms.description,
        severity: symptoms.severity,
        duration: symptoms.duration,
        frequency: symptoms.frequency,
        triggers: symptoms.triggers,
        associatedSymptoms: symptoms.associatedSymptoms,
        bodyPart: symptoms.bodyPart,
        onsetDate: symptoms.onsetDate,
        resolvedDate: symptoms.resolvedDate,
        medicationTaken: symptoms.medicationTaken,
        consultationRequested: symptoms.consultationRequested,
        urgencyLevel: symptoms.urgencyLevel,
        images: symptoms.images
      })
      .from(symptoms)
      .where(eq(symptoms.patientId, patientId))
      .orderBy(desc(symptoms.createdAt))

    // Get prescription records
    const prescriptionRecords = await db
      .select({
        id: prescriptions.id,
        date: prescriptions.createdAt,
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
        // Doctor info
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        doctorSpecialty: doctors.specialty
      })
      .from(prescriptions)
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt))

    // Transform data into medical records
    const medicalRecords: MedicalRecord[] = []

    // Add consultation records
    consultationRecords.forEach(record => {
      const doctorName = record.doctorFirstName && record.doctorLastName 
        ? `Dr. ${record.doctorFirstName} ${record.doctorLastName}`
        : 'Unknown Doctor'

      medicalRecords.push({
        id: record.id,
        date: record.date,
        type: 'consultation',
        title: `${record.consultationType?.replace('_', ' ').toUpperCase()} Consultation`,
        description: record.diagnosis || record.symptoms || 'Medical consultation',
        doctor: doctorName,
        doctorSpecialty: record.doctorSpecialty?.replace('_', ' ').toUpperCase(),
        status: record.status as 'completed' | 'scheduled' | 'cancelled',
        data: {
          symptoms: record.symptoms,
          diagnosis: record.diagnosis,
          doctorNotes: record.doctorNotes,
          consultationType: record.consultationType,
          consultationFee: record.consultationFee,
          prescriptionGiven: record.prescriptionGiven,
          followUpRequired: record.followUpRequired,
          followUpDate: record.followUpDate
        }
      })
    })

    // Add symptom records
    symptomRecords.forEach(record => {
      medicalRecords.push({
        id: record.id,
        date: record.date,
        type: 'symptom',
        title: `${record.symptomName} - ${record.severity?.toUpperCase()} Severity`,
        description: record.description,
        status: record.resolvedDate ? 'completed' : 'pending',
        data: {
          symptomName: record.symptomName,
          category: record.category,
          severity: record.severity,
          duration: record.duration,
          frequency: record.frequency,
          triggers: record.triggers,
          associatedSymptoms: record.associatedSymptoms,
          bodyPart: record.bodyPart,
          onsetDate: record.onsetDate,
          resolvedDate: record.resolvedDate,
          medicationTaken: record.medicationTaken,
          consultationRequested: record.consultationRequested,
          urgencyLevel: record.urgencyLevel,
          images: record.images
        }
      })
    })

    // Add prescription records
    prescriptionRecords.forEach(record => {
      const doctorName = record.doctorFirstName && record.doctorLastName 
        ? `Dr. ${record.doctorFirstName} ${record.doctorLastName}`
        : 'Unknown Doctor'

      medicalRecords.push({
        id: record.id,
        date: record.date,
        type: 'prescription',
        title: `${record.medicationName} Prescription`,
        description: `${record.dosage} - ${record.frequency} for ${record.duration} days`,
        doctor: doctorName,
        doctorSpecialty: record.doctorSpecialty?.replace('_', ' ').toUpperCase(),
        status: record.status as 'completed' | 'pending',
        data: {
          medicationName: record.medicationName,
          genericName: record.genericName,
          dosage: record.dosage,
          frequency: record.frequency,
          duration: record.duration,
          quantity: record.quantity,
          instructions: record.instructions,
          startDate: record.startDate,
          endDate: record.endDate,
          isActive: record.isActive
        }
      })
    })

    // Sort all records by date (newest first)
    medicalRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return medicalRecords
  } catch (error) {
    console.error("Error fetching patient medical records:", error)
    throw error
  }
}

export async function getMedicalRecordsByType(type: 'consultation' | 'symptom' | 'prescription' | 'lab_test' | 'procedure'): Promise<MedicalRecord[]> {
  try {
    const allRecords = await getPatientMedicalRecords()
    return allRecords.filter(record => record.type === type)
  } catch (error) {
    console.error("Error fetching medical records by type:", error)
    throw error
  }
}

export async function getMedicalRecordById(recordId: string, recordType: 'consultation' | 'symptom' | 'prescription'): Promise<MedicalRecord | null> {
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

    if (recordType === 'consultation') {
      const record = await db
        .select({
          id: consultations.id,
          date: consultations.scheduledAt,
          symptoms: consultations.symptoms,
          diagnosis: consultations.diagnosis,
          doctorNotes: consultations.doctorNotes,
          status: consultations.status,
          consultationType: consultations.consultationType,
          consultationFee: consultations.consultationFee,
          prescriptionGiven: consultations.prescriptionGiven,
          followUpRequired: consultations.followUpRequired,
          followUpDate: consultations.followUpDate,
          // Doctor info
          doctorFirstName: users.firstName,
          doctorLastName: users.lastName,
          doctorSpecialty: doctors.specialty
        })
        .from(consultations)
        .leftJoin(doctors, eq(consultations.doctorId, doctors.id))
        .leftJoin(users, eq(doctors.userId, users.id))
        .where(and(
          eq(consultations.id, recordId),
          eq(consultations.patientId, patientId)
        ))
        .limit(1)

      if (record.length === 0) return null

      const data = record[0]
      const doctorName = data.doctorFirstName && data.doctorLastName 
        ? `Dr. ${data.doctorFirstName} ${data.doctorLastName}`
        : 'Unknown Doctor'

      return {
        id: data.id,
        date: data.date,
        type: 'consultation',
        title: `${data.consultationType?.replace('_', ' ').toUpperCase()} Consultation`,
        description: data.diagnosis || data.symptoms || 'Medical consultation',
        doctor: doctorName,
        doctorSpecialty: data.doctorSpecialty?.replace('_', ' ').toUpperCase(),
        status: data.status as 'completed' | 'scheduled' | 'cancelled',
        data: {
          symptoms: data.symptoms,
          diagnosis: data.diagnosis,
          doctorNotes: data.doctorNotes,
          consultationType: data.consultationType,
          consultationFee: data.consultationFee,
          prescriptionGiven: data.prescriptionGiven,
          followUpRequired: data.followUpRequired,
          followUpDate: data.followUpDate
        }
      }
    }

    if (recordType === 'symptom') {
      const record = await db
        .select()
        .from(symptoms)
        .where(and(
          eq(symptoms.id, recordId),
          eq(symptoms.patientId, patientId)
        ))
        .limit(1)

      if (record.length === 0) return null

      const data = record[0]
      return {
        id: data.id,
        date: data.createdAt,
        type: 'symptom',
        title: `${data.symptomName} - ${data.severity?.toUpperCase()} Severity`,
        description: data.description,
        status: data.resolvedDate ? 'completed' : 'pending',
        data: {
          symptomName: data.symptomName,
          category: data.category,
          severity: data.severity,
          duration: data.duration,
          frequency: data.frequency,
          triggers: data.triggers,
          associatedSymptoms: data.associatedSymptoms,
          bodyPart: data.bodyPart,
          onsetDate: data.onsetDate,
          resolvedDate: data.resolvedDate,
          medicationTaken: data.medicationTaken,
          consultationRequested: data.consultationRequested,
          urgencyLevel: data.urgencyLevel,
          images: data.images
        }
      }
    }

    if (recordType === 'prescription') {
      const record = await db
        .select({
          id: prescriptions.id,
          date: prescriptions.createdAt,
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
          // Doctor info
          doctorFirstName: users.firstName,
          doctorLastName: users.lastName,
          doctorSpecialty: doctors.specialty
        })
        .from(prescriptions)
        .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
        .leftJoin(users, eq(doctors.userId, users.id))
        .where(and(
          eq(prescriptions.id, recordId),
          eq(prescriptions.patientId, patientId)
        ))
        .limit(1)

      if (record.length === 0) return null

      const data = record[0]
      const doctorName = data.doctorFirstName && data.doctorLastName 
        ? `Dr. ${data.doctorFirstName} ${data.doctorLastName}`
        : 'Unknown Doctor'

      return {
        id: data.id,
        date: data.date,
        type: 'prescription',
        title: `${data.medicationName} Prescription`,
        description: `${data.dosage} - ${data.frequency} for ${data.duration} days`,
        doctor: doctorName,
        doctorSpecialty: data.doctorSpecialty?.replace('_', ' ').toUpperCase(),
        status: data.status as 'completed' | 'pending',
        data: {
          medicationName: data.medicationName,
          genericName: data.genericName,
          dosage: data.dosage,
          frequency: data.frequency,
          duration: data.duration,
          quantity: data.quantity,
          instructions: data.instructions,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive
        }
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching medical record by ID:", error)
    throw error
  }
}

export async function getRecentMedicalActivity(limit: number = 10): Promise<MedicalRecord[]> {
  try {
    const allRecords = await getPatientMedicalRecords()
    return allRecords.slice(0, limit)
  } catch (error) {
    console.error("Error fetching recent medical activity:", error)
    throw error
  }
}
