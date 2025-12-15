import React from 'react';
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  Activity,
  Layers,
  Database,
  Brain,
  BarChart3,
  Receipt
} from 'lucide-react';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  userEmail?: string;
  userName?: string;
  isDemoMode?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentRoute, 
  onNavigate, 
  onLogout,
  userEmail,
  userName,
  isDemoMode = false
}) => {
  
  const navItems = [
    { icon: Activity, label: 'Dashboard', route: AppRoute.DASHBOARD },
    { icon: Users, label: 'Pacientes', route: AppRoute.PATIENTS },
    { icon: Calendar, label: 'Agenda', route: AppRoute.APPOINTMENTS },
    { icon: FileText, label: 'Notas Clínicas', route: AppRoute.NOTES },
    { icon: Brain, label: 'Evaluaciones IA', route: AppRoute.ASSESSMENTS },
    { icon: BarChart3, label: 'Analíticas', route: AppRoute.ANALYTICS },
    { icon: Receipt, label: 'Facturación', route: AppRoute.BILLING }, // New Item
    { icon: Settings, label: 'Configuración', route: AppRoute.SETTINGS },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shadow-sm z-10">
        <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
          <div className="bg-gradient-to-tr from-indigo-600 to-blue-500 p-2 rounded-lg shadow-md">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">FlowDoc</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
              {userName ? userName[0].toUpperCase() : (userEmail ? userEmail[0].toUpperCase() : 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {userName || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">{userEmail || 'Psiquiatra'}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col bg-[#F8FAFC]">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10 shrink-0 shadow-sm">
           <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
               <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg">FlowDoc</span>
          </div>
          <button onClick={onLogout}>
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {/* Demo Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 px-4 py-2 flex items-center justify-center space-x-2 text-orange-800 text-sm shrink-0">
            <Database className="w-4 h-4 text-orange-600" />
            <span className="font-medium">Modo Simulador: Visualizando datos de ejemplo.</span>
          </div>
        )}

        {/* Welcome Header specifically for Claudio if logged in */}
        {userName === 'Dr. Claudio Dominicone' && currentRoute === AppRoute.DASHBOARD && (
             <div className="px-8 pt-8 pb-0">
                <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, <span className="text-indigo-600">Dr. Dominicone</span>
                </h1>
                <p className="text-gray-500 mt-1">Aquí tienes el resumen de tu consulta hoy.</p>
             </div>
        )}

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Navigation (Bottom) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 z-20 pb-safe">
        {navItems.slice(0, 5).map((item) => {
           const Icon = item.icon;
           const isActive = currentRoute === item.route;
           return (
             <button 
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`p-2 flex flex-col items-center ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}
             >
               <Icon className="w-6 h-6" />
             </button>
           )
        })}
      </div>
    </div>
  );
};