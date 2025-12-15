import { GoogleGenAI } from "@google/genai";
import { AssessmentResult, Patient } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");
  return new GoogleGenAI({ apiKey });
};

// --- SYSTEM PROMPT ---
const PSYCHIATRIC_SYSTEM_PROMPT = `
Eres un asistente de IA especializado en psiquiatría con las siguientes características:
1. ESPECIALIZACIÓN: Depresión, Ansiedad, Bipolaridad, Psicosis.
2. CONOCIMIENTO DE GUÍAS: NICE, APA, CANMAT.
3. FARMACOLOGÍA: ISRS, Duales, Antipsicóticos, Estabilizadores.
4. PSICOTERAPIAS: CBT, ACT, DBT.
5. CONTEXTO: Considera recursos y cultura latinoamericana.

Siempre:
- Basa recomendaciones en evidencia.
- Advierte sobre riesgos (suicidio, interacciones).
- Mantén confidencialidad.
`;

export const summarizeClinicalNote = async (noteText: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${PSYCHIATRIC_SYSTEM_PROMPT}
      
      Tarea: Generar un resumen clínico estructurado (SOAP mejorado).
      
      Nota cruda:
      "${noteText}"`,
    });

    return response.text || "No se pudo generar el resumen.";
  } catch (error) {
    console.error("Error summarizing note:", error);
    return "Error al conectar con Gemini AI.";
  }
};

export const analyzeAssessment = async (
    assessment: Partial<AssessmentResult>, 
    patientContext: Partial<Patient>
): Promise<any> => {
    try {
        const ai = getAiClient();
        const prompt = `
        ANALIZA ESTA EVALUACIÓN ${assessment.scale_code}:
        
        DATOS PACIENTE: Edad: ${patientContext.date_of_birth ? new Date().getFullYear() - new Date(patientContext.date_of_birth).getFullYear() : 'Desconocida'}.
        PUNTAJE TOTAL: ${assessment.total_score}
        RESPUESTAS: ${JSON.stringify(assessment.responses)}

        PROPORCIONA JSON con:
        1. interpretation (Texto breve)
        2. severity_level (minimal, mild, moderate, severe)
        3. risk_flags (Array de strings, ej: "Ideación suicida")
        4. clinical_recommendations (Array de strings)
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("AI Analysis failed", error);
        return null;
    }
}

export const generateTreatmentSuggestions = async (diagnosis: string, patientProfile?: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${PSYCHIATRIC_SYSTEM_PROMPT}
        Sugiere pautas de tratamiento para: "${diagnosis}".
        Perfil Paciente: ${patientProfile || 'General'}
        
        Incluye:
        1. Farmacoterapia (1ra y 2da línea)
        2. Psicoterapia
        3. Estilo de vida`
    });
    return response.text || "Sin sugerencias.";
  } catch (error) {
      console.error(error);
      return "Error obteniendo sugerencias.";
  }
}