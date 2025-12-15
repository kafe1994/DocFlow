import React, { useState } from 'react';
import { Search, Plus, FileText, MoreVertical, UserX } from 'lucide-react';
import { Patient } from '../types';
import { PatientFormModal } from './PatientFormModal';

interface PatientsProps {
  patients: Patient[];
  onAddPatient?: (patient: Partial<Patient>) => void;
}

export const Patients: React.FC<PatientsProps> = ({ patients, onAddPatient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(p => 
    p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.medical_record_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500">Gestión de expedientes e historias clínicas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Paciente</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o N° Historia..." 
            className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">N° Historia</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Paciente</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Edad</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Género</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Contacto</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-600">{patient.medical_record_number}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{patient.first_name} {patient.last_name}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{age} años</td>
                      <td className="px-6 py-4 text-gray-600">{patient.gender}</td>
                      <td className="px-6 py-4 text-gray-600">{patient.phone || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <UserX className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-lg font-medium text-gray-500">
                        {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                      </p>
                      <p className="text-sm">
                        {searchTerm ? 'Intente con otro término de búsqueda' : 'Comience creando un nuevo expediente.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PatientFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          if (onAddPatient) onAddPatient(data);
        }}
      />
    </div>
  );
};