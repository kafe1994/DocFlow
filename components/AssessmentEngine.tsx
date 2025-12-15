import React, { useState } from 'react';
import { AssessmentResult, ScaleCode, Patient } from '../types';
import { analyzeAssessment } from '../services/aiService';
import { CheckCircle, AlertTriangle, Brain, ChevronRight, Activity } from 'lucide-react';

interface AssessmentEngineProps {
  patient: Patient;
  onSave: (result: AssessmentResult) => void;
}

const SCALES: Record<ScaleCode, { name: string; questions: string[] }> = {
    'PHQ9_PLUS': {
        name: 'PHQ-9 Plus (Depresión + Somático)',
        questions: [
            "Poco interés o placer en hacer cosas",
            "Se ha sentido decaído(a), deprimido(a) o sin esperanzas",
            "Dificultad para quedarse o permanecer dormido(a), o ha dormido demasiado",
            "Se ha sentido cansado(a) o con poca energía",
            "Sin apetito o ha comido en exceso",
            "Se ha sentido mal con usted mismo(a)",
            "Dificultad para concentrarse en ciertas actividades",
            "Se ha movido o hablado tan lento que otras personas podrían haberlo notado",
            "Pensamientos de que estaría mejor muerto(a) o de lastimarse"
        ]
    },
    'GAD7_PLUS': {
        name: 'GAD-7 Plus (Ansiedad Generalizada)',
        questions: [
            "Sentirse nervioso(a), intranquilo(a) o con los nervios de punta",
            "No poder dejar de preocuparse o no poder controlar la preocupación",
            "Preocuparse demasiado por diferentes cosas",
            "Dificultad para relajarse",
            "Estar tan inquieto(a) que le cuesta quedarse quieto(a)",
            "Ponerse fácilmente molesto(a) o irritable",
            "Sentir miedo como si algo terrible fuera a pasar"
        ]
    },
    'CSSRS': { name: 'Escala Columbia (Riesgo Suicida)', questions: [] },
    'WHODAS12': { name: 'WHODAS 2.0 (Funcionalidad)', questions: [] }
};

export const AssessmentEngine: React.FC<AssessmentEngineProps> = ({ patient, onSave }) => {
    const [selectedScale, setSelectedScale] = useState<ScaleCode | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState<Record<number, number>>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    const handleStart = (scale: ScaleCode) => {
        setSelectedScale(scale);
        setCurrentStep(0);
        setResponses({});
        setAnalysis(null);
    };

    const handleAnswer = (value: number) => {
        setResponses(prev => ({ ...prev, [currentStep]: value }));
        
        if (selectedScale && currentStep < SCALES[selectedScale].questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishAssessment();
        }
    };

    const finishAssessment = async () => {
        setIsAnalyzing(true);
        const total = (Object.values(responses) as number[]).reduce((a: number, b: number) => a + b, 0);
        
        // Convert number-indexed responses to string-indexed for the interface
        const responsesRecord: Record<string, number> = {};
        Object.entries(responses).forEach(([key, value]) => {
            responsesRecord[key] = value as number;
        });

        // Mock Assessment Result
        const result: Partial<AssessmentResult> = {
            scale_code: selectedScale!,
            total_score: total,
            responses: responsesRecord,
            date: new Date().toISOString()
        };

        // AI Analysis
        const aiAnalysis = await analyzeAssessment(result, patient);
        setAnalysis(aiAnalysis);
        setIsAnalyzing(false);
    };

    if (!selectedScale) {
        return (
            <div className="space-y-6 animate-in fade-in">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-indigo-600" />
                    Evaluaciones Psicométricas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Object.keys(SCALES) as ScaleCode[]).map((code) => (
                        <button
                            key={code}
                            onClick={() => handleStart(code)}
                            className="p-6 text-left bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-800 group-hover:text-indigo-600">{SCALES[code].name}</span>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500" />
                            </div>
                            <p className="text-sm text-gray-500">Evaluación adaptativa asistida por IA.</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (analysis) {
        return (
            <div className="space-y-6 animate-in zoom-in duration-300">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-8 h-8 text-indigo-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Resultados del Análisis</h3>
                            <p className="text-gray-500">{SCALES[selectedScale].name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Puntaje Total</p>
                            <p className="text-4xl font-bold text-indigo-600 mt-2">{Object.values(responses).reduce((a: number, b: number) => a + (b as number), 0)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Severidad IA</p>
                            <p className="text-xl font-bold text-gray-800 mt-2 capitalize">{analysis.severity_level || 'Pendiente'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Tendencia</p>
                            <p className="text-xl font-bold text-green-600 mt-2">Estable</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <Brain className="w-4 h-4" /> Interpretación Clínica (Gemini)
                            </h4>
                            <p className="text-blue-800">{analysis.interpretation}</p>
                        </div>

                        {analysis.risk_flags && analysis.risk_flags.length > 0 && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                                <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Alertas de Riesgo
                                </h4>
                                <ul className="list-disc list-inside text-red-800">
                                    {analysis.risk_flags.map((flag: string, i: number) => (
                                        <li key={i}>{flag}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button onClick={() => setSelectedScale(null)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cerrar</button>
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Guardar en Historia</button>
                    </div>
                </div>
            </div>
        );
    }

    const question = SCALES[selectedScale].questions[currentStep];
    const progress = ((currentStep + 1) / SCALES[selectedScale].questions.length) * 100;

    return (
        <div className="max-w-2xl mx-auto py-12">
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full mb-8">
                <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">
                    Pregunta {currentStep + 1} de {SCALES[selectedScale].questions.length}
                </span>
                <h3 className="text-2xl font-medium text-gray-900 mb-8 leading-relaxed">
                    {question}
                </h3>

                <div className="space-y-3">
                    {[
                        { val: 0, label: "Nunca" },
                        { val: 1, label: "Varios días" },
                        { val: 2, label: "Más de la mitad de los días" },
                        { val: 3, label: "Casi todos los días" }
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => handleAnswer(opt.val)}
                            className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex justify-between items-center group"
                        >
                            <span className="font-medium text-gray-700 group-hover:text-indigo-700">{opt.label}</span>
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-indigo-600 group-hover:bg-indigo-600 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {isAnalyzing && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600 font-medium animate-pulse">Analizando patrones con IA...</p>
                </div>
            )}
        </div>
    );
};