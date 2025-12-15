export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'psychiatrist' | 'admin';
}

export interface Patient {
  id: string;
  medical_record_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  email?: string;
  created_at: string;
  diagnoses?: Diagnosis[];
}

export interface Diagnosis {
    id: string;
    name: string;
    category: string;
    is_active: boolean;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'consultation' | 'follow_up' | 'emergency' | 'evaluation' | 'therapy';

export interface Appointment {
  id: string;
  patient_id: string;
  psychiatrist_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  patient?: Patient; // Joined data
}

// --- PHASE 2: NEW TYPES ---

export type ScaleCode = 'PHQ9_PLUS' | 'GAD7_PLUS' | 'CSSRS' | 'WHODAS12';

export interface AssessmentQuestion {
    id: string;
    text: string;
    options: { value: number; label: string; description?: string }[];
}

export interface AssessmentResult {
    id: string;
    patient_id: string;
    scale_code: ScaleCode;
    total_score: number;
    responses: Record<string, number>;
    severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
    date: string;
    ai_interpretation?: string;
}

export interface ClinicalAlert {
    id: string;
    patient_id: string;
    type: 'suicide_risk' | 'clinical_deterioration' | 'treatment_non_response' | 'medication_adherence';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    date: string;
    status: 'active' | 'resolved';
}

export interface SymptomLog {
    date: string;
    mood: number; // 1-10
    anxiety: number; // 1-10
    sleep_quality: number; // 1-10
    notes?: string;
}

// --- PHASE 3: BILLING TYPES ---

export type InvoiceStatus = 'pendiente' | 'pagada' | 'cancelada' | 'vencida';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'seguro';

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface Invoice {
    id: string;
    patient_id: string;
    patient_name: string; // Denormalized for UI convenience
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax: number;
    total: number;
    status: InvoiceStatus;
    items: InvoiceItem[];
}

export interface FinancialMetrics {
    total_revenue: number;
    collected_revenue: number;
    pending_revenue: number;
    gross_margin: number;
    net_margin: number;
    average_ticket: number;
    collection_rate: number;
    monthly_growth: number;
}

export enum AppRoute {
  LOGIN = '/login',
  DASHBOARD = '/',
  PATIENTS = '/patients',
  APPOINTMENTS = '/appointments',
  NOTES = '/notes',
  ASSESSMENTS = '/assessments',
  ANALYTICS = '/analytics',
  BILLING = '/billing', // New Route
  SETTINGS = '/settings'
}