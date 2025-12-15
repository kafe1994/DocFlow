import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClinicalNote } from './components/ClinicalNote';
import { Patients } from './components/Patients';
import { Appointments } from './components/Appointments';
import { AssessmentEngine } from './components/AssessmentEngine';
import { SymptomTracker } from './components/SymptomTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { BillingDashboard } from './components/billing/BillingDashboard';
import { AppRoute, Appointment, Patient, AppointmentStatus } from './types';
import { supabase } from './integrations/supabase/client';
import * as db from './services/db';
import { Layers, ArrowRight, Activity, User, Lock, Sparkles, AlertCircle, UserPlus, Stethoscope, Brain, FlaskConical } from 'lucide-react';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>(AppRoute.DASHBOARD);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  
  // App Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Login State
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  
  // App Mode State
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [userName, setUserName] = useState('');

  // Initial Data Load
  const loadData = async () => {
      setDataLoading(true);
      try {
          // Parallel fetch for speed
          const [patientsData, appointmentsData] = await Promise.all([
              db.getPatients(),
              db.getAppointments()
          ]);
          setPatients(patientsData);
          setAppointments(appointmentsData);
      } catch (error) {
          console.error("Error loading data:", error);
          // Don't clear data on error if we had some
      } finally {
          setDataLoading(false);
      }
  };

  useEffect(() => {
    // 1. Check if Supabase client is initialized
    if (!supabase) {
      console.warn("Supabase client not initialized. Proceeding to login screen.");
      setLoading(false);
      return;
    }

    // 2. Check Session
    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setSession(session);
                // Si el email coincide, usamos el nombre real, sino el del email
                const email = session.user.email || '';
                if (email.includes('claudio') || email.includes('dominicone')) {
                    setUserName('Dr. Claudio Dominicone');
                } else {
                    setUserName(email);
                }
                loadData();
            }
        } catch (error) {
            console.error("Session check failed", error);
        } finally {
            setLoading(false);
        }
    };

    checkSession();

    // 3. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          const email = session.user.email || '';
          if (email.includes('claudio') || email.includes('dominicone')) {
              setUserName('Dr. Claudio Dominicone');
          } else {
              setUserName(email);
          }
          loadData();
      } else {
          setAppointments([]);
          setPatients([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setAuthMessage('');

    if (!supabase) {
        setLoginError('Error de configuración: Base de datos no disponible.');
        return;
    }

    if (!user.includes('@')) {
         setLoginError('Por favor ingrese un email válido.');
         return;
    }

    if (isSignUp) {
        // Handle Sign Up
        const { data, error } = await supabase.auth.signUp({
            email: user,
            password,
        });

        if (error) {
            setLoginError(error.message);
        } else {
            if (data.user && !data.session) {
                setAuthMessage('Registro iniciado. Por favor revise su correo.');
                setIsSignUp(false);
            } else if (data.session) {
                setSession(data.session);
            }
        }
    } else {
        // Handle Login
        const { error } = await supabase.auth.signInWithPassword({
            email: user,
            password,
        });
        if (error) {
             if (error.message.includes("Invalid login")) {
                 setLoginError("Credenciales incorrectas.");
             } else {
                 setLoginError(error.message);
             }
        }
    }
  };

  const handleDemoAccess = () => {
      // Configurar sesión falsa
      setSession({ user: { email: 'demo@flowdoc.app', id: 'demo-user' } });
      setUserName('Modo Prueba');
      setIsDemoMode(true);

      // --- INYECTAR DATOS FALSOS PARA EL DASHBOARD DE PRUEBA ---
      const mockPatients: Patient[] = [
        { id: '1', first_name: 'Ana', last_name: 'García', medical_record_number: '2024-001-PSI', date_of_birth: '1990-05-15', gender: 'Femenino', created_at: new Date().toISOString() },
        { id: '2', first_name: 'Carlos', last_name: 'Ruiz', medical_record_number: '2024-002-PSI', date_of_birth: '1985-11-20', gender: 'Masculino', created_at: new Date().toISOString() },
        { id: '3', first_name: 'Elena', last_name: 'Vazquez', medical_record_number: '2024-003-PSI', date_of_birth: '1995-02-10', gender: 'Femenino', created_at: new Date().toISOString() },
      ];

      const today = new Date().toISOString().split('T')[0];
      const mockAppointments: Appointment[] = [
        { id: '101', patient_id: '1', psychiatrist_id: 'demo', appointment_date: today, start_time: '09:00', end_time: '09:50', status: 'scheduled', type: 'consultation', patient: mockPatients[0] },
        { id: '102', patient_id: '2', psychiatrist_id: 'demo', appointment_date: today, start_time: '11:00', end_time: '11:50', status: 'confirmed', type: 'therapy', patient: mockPatients[1] },
        { id: '103', patient_id: '3', psychiatrist_id: 'demo', appointment_date: today, start_time: '15:00', end_time: '15:50', status: 'scheduled', type: 'follow_up', patient: mockPatients[2] },
      ];

      setPatients(mockPatients);
      setAppointments(mockAppointments);
  };

  const handleLogout = async () => {
    setSession(null);
    setUserName('');
    setIsDemoMode(false);
    setUser('');
    setPassword('');
    setAppointments([]);
    setPatients([]);
    if (supabase) await supabase.auth.signOut();
  };

  const handleAddPatient = async (newPatientData: Partial<Patient>) => {
    if (isDemoMode) {
        alert("Modo Prueba: Los datos no se guardan permanentemente.");
        // Simular guardado local
        const fakePatient = { ...newPatientData, id: Math.random().toString(), created_at: new Date().toISOString() } as Patient;
        setPatients(prev => [fakePatient, ...prev]);
        return;
    }

    try {
        const year = new Date().getFullYear();
        const count = patients.length + 1;
        const recordNumber = `${year}-${count.toString().padStart(3, '0')}-PSI`;

        const payload = {
            ...newPatientData,
            medical_record_number: recordNumber
        };

        const createdPatient = await db.createPatient(payload);
        setPatients(prev => [createdPatient, ...prev]);
    } catch (error) {
        alert("Error al guardar paciente. Verifique su conexión.");
    }
  };

  const handleAddAppointment = async (newApt: Partial<Appointment>) => {
      if (isDemoMode) {
          alert("Modo Prueba: Los datos no se guardan permanentemente.");
          // Simular guardado local
          const fakeApt = { ...newApt, id: Math.random().toString(), patient: patients.find(p => p.id === newApt.patient_id) } as Appointment;
          setAppointments(prev => [...prev, fakeApt]);
          return;
      }
      
      try {
          const payload = {
              ...newApt,
              psychiatrist_id: session?.user?.id
          };
          const createdApt = await db.createAppointment(payload);
          setAppointments(prev => [...prev, createdApt]);
      } catch (error) {
          alert("Error al agendar cita. Verifique disponibilidad o conexión.");
      }
  };

  const handleEditAppointment = async (updatedApt: Partial<Appointment>) => {
    if (isDemoMode) {
        alert("Modo Prueba: Cambios temporales.");
        setAppointments(prev => prev.map(a => a.id === updatedApt.id ? { ...a, ...updatedApt } : a));
        return;
    }

    try {
        const result = await db.updateAppointment(updatedApt);
        setAppointments(prev => prev.map(a => a.id === updatedApt.id ? result : a));
    } catch (error) {
        alert("Error al actualizar la cita.");
        console.error(error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (isDemoMode) {
        alert("Modo Prueba: Eliminado temporalmente.");
        setAppointments(prev => prev.filter(a => a.id !== id));
        return;
    }

    if (!window.confirm("¿Está seguro de eliminar permanentemente esta cita?")) return;

    try {
        await db.deleteAppointment(id);
        setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
        alert("Error al eliminar la cita.");
    }
  };

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
      if (isDemoMode) {
           setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
           return;
      }

      try {
          await db.updateAppointmentStatus(id, status);
          setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      } catch (error) {
          console.error("Failed to update status", error);
          alert("No se pudo actualizar el estado de la cita.");
      }
  };

  // Render Content based on Route
  const renderContent = () => {
    if (dataLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                <p>Sincronizando registros...</p>
            </div>
        )
    }

    // Default patient for demo in Phase 2 features if none selected
    const demoPatient = patients[0] || { first_name: 'Demo', last_name: 'Patient', id: 'demo' } as Patient;

    switch (currentRoute) {
      case AppRoute.DASHBOARD:
        return <Dashboard appointments={appointments} patients={patients} onNavigate={setCurrentRoute} />;
      case AppRoute.NOTES:
        return <ClinicalNote />;
      case AppRoute.PATIENTS:
        return <Patients patients={patients} onAddPatient={handleAddPatient} />;
      case AppRoute.APPOINTMENTS:
        return (
            <Appointments 
                appointments={appointments} 
                patients={patients}
                onAddAppointment={handleAddAppointment}
                onEditAppointment={handleEditAppointment}
                onDeleteAppointment={handleDeleteAppointment}
                onUpdateStatus={handleUpdateStatus}
            />
        );
      case AppRoute.ASSESSMENTS:
        return <AssessmentEngine patient={demoPatient} onSave={() => alert('Guardado simulado')} />;
      case AppRoute.ANALYTICS:
        return (
          <div className="grid grid-cols-1 gap-8">
             <AnalyticsDashboard isDemoMode={isDemoMode} />
             <SymptomTracker patients={patients} />
          </div>
        );
      case AppRoute.BILLING:
        return <BillingDashboard patients={patients} />;
      default:
        return <Dashboard appointments={appointments} patients={patients} onNavigate={setCurrentRoute} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Login Screen
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-4 font-sans">
        
        {/* Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex z-10 min-h-[500px]">
          
          {/* Left Side: Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <Layers className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">FlowDoc</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {isSignUp ? 'Crear Cuenta' : 'Portal de Acceso'}
              </h2>
              <p className="text-gray-500 text-sm">
                  {isSignUp ? 'Registro profesional.' : 'Ingrese a su consultorio virtual.'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1 uppercase tracking-wide">Email</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="email"
                        required
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="claudio@dominicone.com"
                    />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1 uppercase tracking-wide">Contraseña</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        minLength={6}
                    />
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                   <AlertCircle className="w-4 h-4 shrink-0" />
                   <span>{loginError}</span>
                </div>
              )}
              
              {authMessage && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                   <Sparkles className="w-4 h-4 shrink-0" />
                   <span>{authMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold flex items-center justify-center gap-2 mt-2"
              >
                {isSignUp ? (
                    <>
                        <span>Registrarme</span>
                        <UserPlus className="w-4 h-4" />
                    </>
                ) : (
                    <>
                        <span>Ingresar</span>
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
                 <button 
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setLoginError('');
                        setAuthMessage('');
                    }}
                    className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    {isSignUp 
                        ? '¿Ya tienes cuenta? Inicia sesión' 
                        : '¿No tienes cuenta? Crea una aquí'}
                </button>
            </div>

            {/* SEPARADOR */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400">O ingresa como invitado</span>
                </div>
            </div>

            {/* BOTÓN DASHBOARD DE PRUEBA */}
            <button 
              onClick={handleDemoAccess}
              className="w-full py-3 bg-white text-gray-700 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-medium flex items-center justify-center gap-2 group"
            >
              <FlaskConical className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              <span>Ingresar al Dashboard de Prueba</span>
            </button>

          </div>

          {/* Right Side: Personalized Banner */}
          <div className="hidden md:flex w-1/2 bg-gradient-to-br from-slate-800 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden text-white">
             {/* Abstract Decorations */}
             <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
             
             <div className="relative z-10 flex items-center gap-2 opacity-80">
                <Brain className="w-5 h-5 text-indigo-300" />
                <span className="text-xs font-semibold tracking-widest uppercase text-indigo-200">Plataforma Privada</span>
             </div>

             <div className="relative z-10 mt-auto">
                 <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 mb-8 shadow-xl">
                    <h3 className="text-3xl font-bold mb-2">Bienvenido,</h3>
                    <h3 className="text-2xl font-light text-indigo-100 mb-4">Dr. Claudio Dominicone</h3>
                    <div className="h-0.5 w-12 bg-indigo-400 mb-4"></div>
                    <p className="text-gray-200 text-sm leading-relaxed">
                        Su espacio digital está listo. Gestione sus pacientes, optimice su agenda y acceda a herramientas de IA para sus notas clínicas con total seguridad.
                    </p>
                 </div>

                 <div className="flex items-center gap-6 text-indigo-200 text-xs font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        <span>Gestión Clínica</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>Panel Inteligente</span>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Layout
  return (
    <Layout 
      currentRoute={currentRoute} 
      onNavigate={setCurrentRoute}
      onLogout={handleLogout}
      userEmail={session.user.email}
      userName={userName}
      isDemoMode={isDemoMode}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;