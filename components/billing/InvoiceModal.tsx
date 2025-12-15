import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, User, Save, DollarSign } from 'lucide-react';
import { Patient, Invoice, InvoiceItem } from '../../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Invoice>) => void;
  patients: Patient[];
}

// Internal interface to handle form inputs safely (allowing empty strings)
interface FormItem {
    id: string;
    description: string;
    quantity: string | number;
    unit_price: string | number;
    total: number;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, onSubmit, patients }) => {
  const [patientId, setPatientId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  
  // Use FormItem to allow empty strings in inputs
  const [items, setItems] = useState<FormItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: '', total: 0 }
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState(21);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
        setPatientId('');
        const today = new Date().toISOString().split('T')[0];
        setIssueDate(today);
        setDueDate('');
        // Start with one empty item
        setItems([{ id: Date.now().toString(), description: '', quantity: 1, unit_price: '', total: 0 }]);
        setTaxRate(21);
    }
  }, [isOpen]);

  // Calculate totals
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const newTax = newSubtotal * (taxRate / 100);
    
    setSubtotal(newSubtotal);
    setTaxAmount(newTax);
    setTotal(newSubtotal + newTax);
  }, [items, taxRate]);

  // Auto-calculate Due Date
  useEffect(() => {
    if (issueDate && !dueDate) {
        const d = new Date(issueDate);
        d.setDate(d.getDate() + 15);
        setDueDate(d.toISOString().split('T')[0]);
    }
  }, [issueDate]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof FormItem, value: string) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'quantity' || field === 'unit_price') {
        // Allow updating the raw value (so user can type "0." or delete content)
        // @ts-ignore
        item[field] = value;

        // Calculate total only if valid numbers
        const qty = field === 'quantity' ? Number(value) : Number(item.quantity);
        const price = field === 'unit_price' ? Number(value) : Number(item.unit_price);
        
        if (!isNaN(qty) && !isNaN(price)) {
            item.total = qty * price;
        } else {
            item.total = 0;
        }
    } else {
        // @ts-ignore
        item[field] = value;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unit_price: '', total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return alert("Seleccione un paciente");
    
    const selectedPatient = patients.find(p => p.id === patientId);

    // Convert FormItems back to strict InvoiceItems for submission
    const finalItems: InvoiceItem[] = items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        total: item.total
    }));

    const invoiceData: Partial<Invoice> = {
        patient_id: patientId,
        patient_name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Desconocido',
        issue_date: issueDate,
        due_date: dueDate,
        subtotal,
        tax: taxAmount,
        total,
        items: finalItems,
        status: 'pendiente'
    };

    onSubmit(invoiceData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-indigo-600" />
                Nueva Factura
              </h2>
              <p className="text-sm text-gray-500">Genere un comprobante para un paciente registrado.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Paciente</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            required
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">Seleccionar...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fecha Emisión</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="date"
                            required
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fecha Vencimiento</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="date"
                            required
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-900">Conceptos</h3>
                    <button 
                        type="button"
                        onClick={addItem}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> Agregar Ítem
                    </button>
                </div>
                
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 border-b border-gray-200 text-gray-600">
                            <tr>
                                <th className="px-4 py-2 font-semibold w-1/2">Descripción</th>
                                <th className="px-4 py-2 font-semibold w-24 text-center">Cant.</th>
                                <th className="px-4 py-2 font-semibold w-32 text-right">Precio Unit.</th>
                                <th className="px-4 py-2 font-semibold w-32 text-right">Total</th>
                                <th className="px-4 py-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.map((item, index) => (
                                <tr key={item.id} className="bg-white">
                                    <td className="p-2">
                                        <input 
                                            type="text"
                                            placeholder="Descripción del servicio"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            className="w-full p-2 bg-white text-gray-900 border border-gray-200 rounded focus:border-indigo-500 outline-none"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            className="w-full p-2 bg-white text-gray-900 border border-gray-200 rounded text-center focus:border-indigo-500 outline-none"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input 
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                                className="w-full pl-6 p-2 bg-white text-gray-900 border border-gray-200 rounded text-right focus:border-indigo-500 outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-2 text-right font-medium text-gray-900">
                                        ${item.total?.toFixed(2)}
                                    </td>
                                    <td className="p-2 text-center">
                                        <button 
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            disabled={items.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                        <div className="flex items-center gap-2">
                            <span>Impuestos</span>
                            <input 
                                type="number" 
                                value={taxRate}
                                onChange={(e) => setTaxRate(Number(e.target.value))}
                                className="w-12 p-1 text-xs bg-white text-gray-900 border border-gray-200 rounded text-center"
                            />
                            <span className="text-xs">%</span>
                        </div>
                        <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSubmit}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm flex items-center gap-2 transition-colors"
            >
                <Save className="w-4 h-4" />
                Guardar Factura
            </button>
        </div>
      </div>
    </div>
  );
};