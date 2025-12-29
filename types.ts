
export type Role = 'admin' | 'doctor' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  phone: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  medical_history?: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  doctorId: string;
  date: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
  reminderSent?: boolean;
}

export interface SessionRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  notes: string;
  care_instructions: string;
  createdAt: string;
}

export interface MessageLog {
  id: string;
  recipient: string;
  content: string;
  type: 'sms' | 'whatsapp';
  timestamp: string;
}
