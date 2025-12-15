import React, { useState } from 'react';
import { summarizeClinicalNote } from '../services/aiService';
import { Wand2, Save, Loader2, Copy, Check } from 'lucide-react';

export const ClinicalNote: React.FC = () => {
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!note.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await summarizeClinicalNote(note);
      setSummary(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Asistente de Notas Clínicas</h1>
        <p className="text-gray-500">Redacte notas crudas y utilice Gemini AI para estructurarlas.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas de la sesión (Borrador)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escriba aquí los hallazgos desordenados, observaciones del paciente, síntomas reportados..."
              className="w-full h-96 p-4 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent resize-none"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {note.length} caracteres
              </span>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !note.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Estructurar con IA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Resumen Estructurado (Gemini)
              </label>
              {summary && (
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                  title="Copiar al portapapeles"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
            
            <div className="flex-1 bg-medical-50 rounded-lg p-6 border border-medical-100 overflow-y-auto min-h-[24rem]">
              {summary ? (
                <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                  {summary}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Wand2 className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-center text-sm">
                    El resumen generado por la IA aparecerá aquí.
                  </p>
                </div>
              )}
            </div>
            
            {summary && (
              <div className="mt-4 flex justify-end">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Save className="w-4 h-4" />
                  <span>Guardar en Historial</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};