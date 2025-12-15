import React, { useState, useMemo } from 'react';
import { ClinicalAlert } from '../types';
import { 
    AlertTriangle, TrendingUp, TrendingDown, Minus, Activity, ShieldCheck, 
    ArrowUpRight, X, Phone, FileText, CheckCircle, Clock, Search, Eye, Users 
} from 'lucide-react';

interface AnalyticsDashboardProps {
    isDemoMode?: boolean;
}

// --- DATOS DE PRUEBA (SOLO PARA MODO DEMO) ---
const DEMO_ALERTS: ClinicalAlert[] = [
    {
        id: '1',
        patient_id: 'p1',
        type: 'clinical_deterioration',
        severity: 'high',
        title: 'Deterioro Clínico Detectado',
        description: 'Aumento del 35% en escala PHQ-9 (Paciente: Ana García)',
        date: 'Hace 2 horas',
        status: 'active'
    },
    {
        id: '2',
        patient_id: 'p2',
        type: 'suicide_risk',
        severity: 'critical',
        title: 'Alerta de Riesgo (Item 9)',
        description: 'Ideación reportada en evaluación remota (Paciente: Carlos Ruiz)',
        date: 'Hace 4 horas',
        status: 'active'
    }
];

const DEMO_PATIENTS = [
    { id: '1', name: 'Ana García', diagnosis: 'Depresión Mayor', lastEval: '2023-10-24', score: 18, risk: 'high', trend: 'deteriorating' },
    { id: '2', name: 'Carlos Ruiz', diagnosis: 'Trastorno Bipolar I', lastEval: '2023-10-22', score: 9, risk: 'moderate', trend: 'stable' },
    { id: '3', name: 'Elena Vazquez', diagnosis: 'Ansiedad Generalizada', lastEval: '2023-10-20', score: 5, risk: 'low', trend: 'improving' },
    { id: '4', name: 'Jorge Mendez', diagnosis: 'TDAH Adulto', lastEval: '2023-10-18', score: 12, risk: 'moderate', trend: 'improving' },
    { id: '5', name: 'Lucía Fernandez', diagnosis: 'Estrés Postraumático', lastEval: '2023-10-15', score: 21, risk: 'critical', trend: 'deteriorating' },
];

const DEMO_STATS = {
    responseRate: 68,
    adherence: 84,
    evalsCompleted: 142,
    prediction: 'Alta'
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isDemoMode = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Si es Demo, carga datos falsos. Si es Real, arrays vacíos y ceros.
    const [alerts, setAlerts] = useState<ClinicalAlert[]>(isDemoMode ? DEMO_ALERTS : []);
    const [selectedAlert, setSelectedAlert] = useState<ClinicalAlert | null>(null);
    
    const patientsList = isDemoMode ? DEMO_PATIENTS : [];
    const stats = isDemoMode ? DEMO_STATS : { responseRate: 0, adherence: 0, evalsCompleted: 0, prediction: '-' };

    const handleResolveAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        setSelectedAlert(null);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200'; // low
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'deteriorating': return <TrendingDown className="w-4 h-4 text-red-500" />;
            default: return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    const filteredPatients = patientsList.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Métricas Clínicas</h1>

            {/* Active Alerts Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className={`p-4 border-b flex justify-between items-center ${alerts.length > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                    <h3 className={`font-bold flex items-center gap-2 ${alerts.length > 0 ? 'text-red-900' : 'text-gray-700'}`}>
                        <AlertTriangle className="w-5 h-5" /> Alertas Clínicas Activas
                    </h3>
                    {alerts.length > 0 && (
                        <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">{alerts.length} Nuevas</span>
                    )}
                </div>
                <div className="divide-y divide-gray-100">
                    {alerts.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium text-gray-900">Sin alertas activas</p>
                            <p className="text-sm">El sistema no ha detectado riesgos recientes.</p>
                        </div>
                    ) : (
                        alerts.map(alert => (
                            <div key={alert.id} className="p-4 hover:bg-red-50/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${alert.severity === 'critical' ? 'bg-red-600 animate-pulse' : 'bg-orange-500'}`}></div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900">{alert.title}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border ${getSeverityColor(alert.severity)}`}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {alert.date}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedAlert(alert)}
                                    className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-sm"
                                >
                                    Gestionar
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        {isDemoMode && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>}
                    </div>
                    <p className="text-gray-500 text-sm">Tasa de Respuesta</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.responseRate}%</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm">Adherencia Tratamiento</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.adherence}%</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Activity className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm">Evaluaciones Completadas</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.evalsCompleted}</p>
                </div>

                <div className={`p-6 rounded-2xl shadow-sm border border-gray-200 ${isDemoMode ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${isDemoMode ? 'bg-white/20' : 'bg-gray-200'}`}>
                            <ArrowUpRight className={`w-6 h-6 ${isDemoMode ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                    </div>
                    <p className={`${isDemoMode ? 'text-indigo-100' : 'text-gray-500'} text-sm`}>Predicción Remisión</p>
                    <p className={`text-3xl font-bold ${isDemoMode ? 'text-white' : 'text-gray-400'}`}>{stats.prediction}</p>
                </div>
            </div>

            {/* AI Insights Panel */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Insights de Población (IA)</h3>
                
                {isDemoMode ? (
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-start gap-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Activity className="w-5 h-5 text-indigo-700" />
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900 mb-1">Patrón Detectado: Ansiedad Estacional</h4>
                            <p className="text-sm text-indigo-800 leading-relaxed">
                                El análisis de cohorte sugiere un aumento del 15% en síntomas GAD-7 durante los meses de invierno en su población de pacientes.
                                <br/><br/>
                                <strong>Sugerencia IA:</strong> Considerar protocolos preventivos de Vitamina D y luminoterapia para pacientes con historial de recurrencia.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Activity className="w-10 h-10 mb-3 opacity-20" />
                        <p className="font-medium">Insuficientes datos para análisis IA</p>
                        <p className="text-sm">El motor de IA generará insights cuando haya suficientes evaluaciones registradas.</p>
                    </div>
                )}
            </div>

            {/* Patient List Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-600" />
                            Monitoreo de Pacientes
                        </h3>
                        <p className="text-sm text-gray-500">Estado actual basado en últimas evaluaciones psicométricas.</p>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar paciente..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            disabled={patientsList.length === 0}
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Paciente</th>
                                <th className="px-6 py-4 font-semibold">Diagnóstico</th>
                                <th className="px-6 py-4 font-semibold">Última Eval.</th>
                                <th className="px-6 py-4 font-semibold">Nivel de Riesgo</th>
                                <th className="px-6 py-4 font-semibold text-center">Tendencia</th>
                                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map(patient => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{patient.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {patient.diagnosis}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {patient.lastEval}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(patient.risk)}`}>
                                                {patient.risk === 'critical' ? 'Crítico' : 
                                                 patient.risk === 'high' ? 'Alto' : 
                                                 patient.risk === 'moderate' ? 'Moderado' : 'Bajo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-2" title={patient.trend}>
                                                {getTrendIcon(patient.trend)}
                                                <span className="text-xs text-gray-500 capitalize">
                                                    {patient.trend === 'improving' ? 'Mejorando' : 
                                                     patient.trend === 'deteriorating' ? 'Empeorando' : 'Estable'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        {isDemoMode ? 
                                            "No se encontraron pacientes que coincidan con la búsqueda." :
                                            "No hay métricas disponibles. Realice evaluaciones a sus pacientes para ver datos aquí."
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ALERT MANAGEMENT MODAL */}
            {selectedAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-red-50 flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="p-3 bg-red-100 rounded-xl">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Gestionar Alerta</h3>
                                    <p className="text-sm text-red-800 font-medium opacity-80 mt-1">
                                        Nivel de Severidad: <span className="uppercase">{selectedAlert.severity}</span>
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedAlert(null)} 
                                className="text-gray-400 hover:text-gray-600 hover:bg-white/50 p-2 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">{selectedAlert.title}</h4>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 text-sm leading-relaxed">
                                    {selectedAlert.description}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Protocolo Sugerido (IA)</h4>
                                
                                <button className="w-full flex items-center gap-4 p-4 text-left border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all group">
                                    <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                                        <Phone className="w-5 h-5 text-green-700" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 group-hover:text-green-900">Contactar Paciente</p>
                                        <p className="text-xs text-gray-500 group-hover:text-green-700">Iniciar llamada de seguimiento prioritaria</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center gap-4 p-4 text-left border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
                                    <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <FileText className="w-5 h-5 text-blue-700" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 group-hover:text-blue-900">Revisar Historia Clínica</p>
                                        <p className="text-xs text-gray-500 group-hover:text-blue-700">Analizar últimas evaluaciones y medicación</p>
                                    </div>
                                </button>
                            </div>

                            {/* Actions Footer */}
                            <div className="pt-2 flex gap-3">
                                <button 
                                    onClick={() => setSelectedAlert(null)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Posponer Revisión
                                </button>
                                <button 
                                    onClick={() => handleResolveAlert(selectedAlert.id)}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex justify-center items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Marcar como Resuelto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};