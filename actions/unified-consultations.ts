"use server"

import { getCurrentMedicalUser } from "./users"
import { getDoctorConsultations, getUpcomingConsultations as getUpcomingDoctorConsultations } from "./doctor-consultations"
import { getPatientConsultations, getUpcomingConsultations as getUpcomingPatientConsultations, getPastConsultations } from "./consultations"

export interface UnifiedConsultationData {
  id: string
  scheduledAt: Date
  status: string
  consultationType: string
  symptoms?: string | null
  diagnosis?: string | null
  doctorNotes?: string | null
  consultationFee?: string | null
  prescriptionGiven?: boolean | null
  followUpRequired?: boolean | null
  followUpDate?: Date | null
  videoRoomName?: string | null
  meetingStatus?: string | null
  createdAt: Date
  // Doctor info (for patient view)
  doctorId?: string
  doctorFirstName?: string
  doctorLastName?: string
  doctorSpecialty?: string
  doctorRating?: string
  doctorProfileImage?: string | null
  // Patient info (for doctor view)
  patient?: {
    id: string
    userId: string
    user: {
      firstName: string
      lastName: string
      email: string
      profileImage?: string | null
    }
  }
}

export interface ConsultationsResponse {
  userType: 'patient' | 'doctor'
  allConsultations: UnifiedConsultationData[]
  upcomingConsultations: UnifiedConsultationData[]
  pastConsultations: UnifiedConsultationData[]
}

export async function getUnifiedConsultations(): Promise<ConsultationsResponse> {
  try {
    // Get current user to determine type
    const currentUser = await getCurrentMedicalUser()
    if (!currentUser) {
      throw new Error("User not found")
    }

    const userType = currentUser.userType as 'patient' | 'doctor'

    if (userType === 'patient') {
      // Load patient consultations
      const [allPatientData, upcomingPatientData, pastPatientData] = await Promise.all([
        getPatientConsultations(),
        getUpcomingPatientConsultations(),
        getPastConsultations()
      ])

      return {
        userType,
        allConsultations: allPatientData as UnifiedConsultationData[],
        upcomingConsultations: upcomingPatientData as UnifiedConsultationData[],
        pastConsultations: pastPatientData as UnifiedConsultationData[]
      }
    } else {
      // Load doctor consultations
      const [allDoctorData, upcomingDoctorData] = await Promise.all([
        getDoctorConsultations(),
        getUpcomingDoctorConsultations()
      ])

      // Filter past consultations from all data
      const pastData = allDoctorData.filter(consultation => 
        consultation.status === 'completed' || consultation.status === 'cancelled'
      )

      return {
        userType,
        allConsultations: allDoctorData as UnifiedConsultationData[],
        upcomingConsultations: upcomingDoctorData as UnifiedConsultationData[],
        pastConsultations: pastData as UnifiedConsultationData[]
      }
    }
  } catch (error) {
    console.error("Error fetching unified consultations:", error)
    throw error
  }
}
