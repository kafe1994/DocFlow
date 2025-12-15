import { supabase } from '../integrations/supabase/client';
import { Patient, Appointment, AppointmentStatus, SymptomLog } from '../types';

// --- PATIENTS ---

export const getPatients = async (): Promise<Patient[]> => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patients:', error);
    // Return empty array instead of throwing to prevent UI crash on blank DB
    return [];
  }
  return data || [];
};

export const createPatient = async (patient: Partial<Patient>): Promise<Patient> => {
  if (!supabase) throw new Error("No database connection");

  // Remove undefined fields and id (let DB generate it)
  const { id, created_at, ...cleanData } = patient;

  const { data, error } = await supabase
    .from('patients')
    .insert([cleanData])
    .select()
    .single();

  if (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
  return data;
};

// --- APPOINTMENTS ---

export const getAppointments = async (): Promise<Appointment[]> => {
  if (!supabase) return [];

  // Fetch appointments and join with patient data
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(*)
    `)
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
  return data || [];
};

export const createAppointment = async (appointment: Partial<Appointment>): Promise<Appointment> => {
  if (!supabase) throw new Error("No database connection");

  // Clean data
  const { id, patient, ...cleanData } = appointment;

  const { data, error } = await supabase
    .from('appointments')
    .insert([cleanData])
    .select(`
      *,
      patient:patients(*)
    `)
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
  return data;
};

export const updateAppointment = async (appointment: Partial<Appointment>): Promise<Appointment> => {
    if (!supabase) throw new Error("No database connection");

    const { id, patient, ...cleanData } = appointment;

    if (!id) throw new Error("Appointment ID required for update");

    const { data, error } = await supabase
        .from('appointments')
        .update(cleanData)
        .eq('id', id)
        .select(`
            *,
            patient:patients(*)
        `)
        .single();

    if (error) {
        console.error('Error updating appointment:', error);
        throw error;
    }
    return data;
};

export const deleteAppointment = async (id: string): Promise<void> => {
    if (!supabase) throw new Error("No database connection");

    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting appointment:', error);
        throw error;
    }
};

export const updateAppointmentStatus = async (id: string, status: AppointmentStatus): Promise<void> => {
  if (!supabase) throw new Error("No database connection");

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// --- SYMPTOMS ---

export const createSymptomLog = async (patientId: string, log: Partial<SymptomLog>): Promise<void> => {
    if (!supabase) throw new Error("No database connection");

    const { error } = await supabase
        .from('symptom_logs')
        .insert([{
            patient_id: patientId,
            date: new Date().toISOString().split('T')[0], // Today
            mood: log.mood,
            anxiety: log.anxiety,
            sleep_quality: log.sleep_quality,
            notes: log.notes
        }]);

    if (error) {
        console.error("Error creating symptom log", error);
        throw error;
    }
};