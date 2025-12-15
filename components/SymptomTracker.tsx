import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Save, Sun, Moon, Zap, Smile, User, CheckCircle, Loader2 } from 'lucide-react';
import { Patient } from '../types';
import { createSymptomLog } from '../services/db';

interface SymptomTrackerProps {
    patients: Patient[];
}

export const SymptomTracker: React.FC<SymptomTrackerProps> = ({ patients = [] }) => {
    // Mock Data for Charts (To be replaced with real history fetch in next iteration)
    const data = [
        { date: 'Lun', mood: 6, anxiety: 4, sleep: 7 },
        { date: 'Mar', mood: 5, anxiety: 5, sleep: 6 },
        { date: 'Mié', mood: 7, anxiety: 3, sleep: 8 },
        { date: 'Jue', mood: 8, anxiety: 2, sleep: 7 },
        { date: 'Vie', mood: 6, anxiety: 4, sleep: 5 },
        { date: 'Sáb', mood: 9, anxiety: 1, sleep: 9 },
        { date: 'Dom', mood: 8, anxiety: 2, sleep: 8 },
    ];

    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [todayLog, setTodayLog] = useState({
        mood: 5,
        anxiety: 3,
        sleep: 7,
        medication: false
    });

    const handleSave = async () => {
        if (!selectedPatientId) {
            alert("Por favor seleccione un paciente para guardar el registro.");
            return;
        }

        setIsSaving(true);
        try {
            await createSymptomLog(selectedPatientId, {
                mood: todayLog.mood,
                anxiety: todayLog.anxiety,
                sleep_quality: todayLog.sleep,
                notes: "Registro diario desde monitor"
            });
            alert("Registro guardado exitosamente en la base de datos.");
            // Reset to defaults
            setTodayLog({ mood: 5, anxiety: 3, sleep: 7, medication: false });
        } catch (error) {
            alert("Error al guardar el registro. Verifique la conexión.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Monitor de Síntomas</h1>
                    <p className="text-gray-500">Seguimiento diario y patrones de recuperación.</p>
                </div>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-200">
                    Últimos 7 días
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Logger */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-8">
                    <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Registro de Hoy</h3>
                    
                    {/* Patient Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Paciente</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            >
                                <option value="">Seleccionar paciente...</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.first_name} {p.last_name} ({p.medical_record_number})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Mood Slider */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Smile className="w-4 h-4 text-indigo-500" /> Estado de Ánimo
                        </label>
                        <input 
                            type="range" min="1" max="10" 
                            value={todayLog.mood}
                            onChange={(e) => setTodayLog({...todayLog, mood: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Deprimido</span>
                            <span className="font-bold text-indigo-600 text-lg">{todayLog.mood}/10</span>
                            <span>Eufórico</span>
                        </div>
                    </div>

                    {/* Anxiety Slider */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Zap className="w-4 h-4 text-orange-500" /> Ansiedad
                        </label>
                        <input 
                            type="range" min="1" max="10" 
                            value={todayLog.anxiety}
                            onChange={(e) => setTodayLog({...todayLog, anxiety: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Calmo</span>
                            <span className="font-bold text-orange-600 text-lg">{todayLog.anxiety}/10</span>
                            <span>Pánico</span>
                        </div>
                    </div>

                    {/* Sleep */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Moon className="w-4 h-4 text-blue-500" /> Calidad de Sueño
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {[2,4,6,8,10].map(val => (
                                <button 
                                    key={val}
                                    onClick={() => setTodayLog({...todayLog, sleep: val})}
                                    className={`py-2 rounded-lg text-sm font-medium transition-all ${todayLog.sleep === val ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={!selectedPatientId || isSaving}
                        className={`w-full py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium ${
                            selectedPatientId && !isSaving
                            ? 'bg-gray-900 text-white hover:bg-gray-800' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Guardando...' : 'Guardar Registro'}
                    </button>
                </div>

                {/* Charts Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Mood & Anxiety Trends */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-6">Correlación Ánimo vs. Ansiedad</h4>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                                    />
                                    <Area type="monotone" dataKey="mood" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" name="Ánimo" />
                                    <Line type="monotone" dataKey="anxiety" stroke="#F97316" strokeWidth={2} dot={{r: 4, fill: '#F97316', strokeWidth: 0}} name="Ansiedad" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sleep Trend */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
                         <div className="h-[100px] w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <Line type="monotone" dataKey="sleep" stroke="#3B82F6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="text-right">
                             <p className="text-sm text-gray-500">Promedio Sueño</p>
                             <p className="text-3xl font-bold text-gray-900">7.2h</p>
                             <p className="text-xs text-green-600 flex items-center justify-end gap-1">
                                <Zap className="w-3 h-3" /> +15% vs semana anterior
                             </p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};