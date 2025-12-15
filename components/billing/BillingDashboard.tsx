import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    AreaChart, Area 
} from 'recharts';
import { 
    DollarSign, TrendingUp, CreditCard, AlertCircle, Plus, FileText, 
    Download, CheckCircle, Clock 
} from 'lucide-react';
import { calculateFinancialMetrics, getRevenueHistory, getInvoices, createInvoice } from '../../services/billingService';
import { FinancialMetrics, Invoice, Patient } from '../../types';
import { InvoiceModal } from './InvoiceModal';

interface BillingDashboardProps {
    patients?: Patient[]; 
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({ patients = [] }) => {
    const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [metricsData, historyData, invoicesData] = await Promise.all([
                calculateFinancialMetrics(),
                getRevenueHistory(),
                getInvoices()
            ]);
            setMetrics(metricsData);
            setHistory(historyData);
            setInvoices(invoicesData);
        } catch (error) {
            console.error("Failed to load billing data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateInvoice = async (invoiceData: Partial<Invoice>) => {
        try {
            await createInvoice(invoiceData);
            await loadData();
            setIsCreateModalOpen(false);
        } catch (error) {
            alert("Error al crear la factura");
            console.error(error);
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-gray-500">Cargando datos financieros...</div>;
    }

    if (!metrics) {
        return <div className="p-12 text-center text-gray-500">No se pudieron cargar los datos.</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Facturación y Rentabilidad</h1>
                    <p className="text-gray-500">Gestión financiera, métricas de ingresos y control de caja.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Exportar Reporte</span>
                    </button>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nueva Factura</span>
                    </button>
                </div>
            </header>

            {/* Main Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    title="Ingresos Totales (Mes)" 
                    value={`$${metrics.total_revenue.toFixed(2)}`} 
                    trend="+12.5%" 
                    icon={DollarSign} 
                    color="green" 
                />
                <MetricCard 
                    title="Por Cobrar" 
                    value={`$${metrics.pending_revenue.toFixed(2)}`} 
                    trend={`${metrics.collection_rate.toFixed(0)}% Recaudado`} 
                    icon={Clock} 
                    color="orange" 
                />
                <MetricCard 
                    title="Margen Neto" 
                    value={`$${metrics.net_margin.toFixed(2)}`} 
                    trend="Rentabilidad Saludable" 
                    icon={TrendingUp} 
                    color="blue" 
                />
                <MetricCard 
                    title="Ticket Promedio" 
                    value={`$${metrics.average_ticket.toFixed(2)}`} 
                    trend="Por Consulta" 
                    icon={CreditCard} 
                    color="purple" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-6">Flujo de Caja (6 Meses)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="ingresos" stroke="#10B981" fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos" />
                                <Area type="monotone" dataKey="gastos" stroke="#EF4444" fillOpacity={1} fill="url(#colorGastos)" name="Gastos Operativos" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-6">Estado de Cartera</h3>
                    <div className="flex flex-col gap-6 justify-center h-[300px]">
                         <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-gray-700 font-medium">Pagado</span>
                            </div>
                            <span className="text-lg font-bold text-green-700">${metrics.collected_revenue.toFixed(2)}</span>
                         </div>
                         <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-orange-600" />
                                <span className="text-gray-700 font-medium">Pendiente</span>
                            </div>
                            <span className="text-lg font-bold text-orange-700">${metrics.pending_revenue.toFixed(2)}</span>
                         </div>
                         <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <span className="text-gray-700 font-medium">Vencido</span>
                            </div>
                            <span className="text-lg font-bold text-red-700">$0.00</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Facturas Recientes</h3>
                    <div className="flex gap-2 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">Todas</span>
                        <span className="px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">Pendientes</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Factura #</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Paciente</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Emisión</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Vencimiento</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Monto</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Estado</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No hay facturas registradas. Crea una nueva factura para comenzar.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-gray-600">{inv.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{inv.patient_name}</td>
                                        <td className="px-6 py-4 text-gray-500">{inv.issue_date}</td>
                                        <td className="px-6 py-4 text-gray-500">{inv.due_date}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">${inv.total.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={inv.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">Ver Detalle</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InvoiceModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateInvoice}
                patients={patients}
            />
        </div>
    );
};

const MetricCard = ({ title, value, trend, icon: Icon, color }: any) => {
    const colorClasses: any = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                {trend}
            </p>
        </div>
    );
}

const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
        pagada: 'bg-green-100 text-green-700 border-green-200',
        pendiente: 'bg-orange-100 text-orange-700 border-orange-200',
        vencida: 'bg-red-100 text-red-700 border-red-200',
        cancelada: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[status]}`}>
            {status}
        </span>
    );
};