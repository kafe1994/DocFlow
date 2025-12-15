import { supabase } from '../integrations/supabase/client';
import { Invoice, FinancialMetrics } from '../types';

export const getInvoices = async (): Promise<Invoice[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('issue_date', { ascending: false });

    if (error) {
        console.error("Error fetching invoices:", error);
        return [];
    }

    return data || [];
};

export const createInvoice = async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
    if (!supabase) throw new Error("No database connection");

    // Ensure items are stored as JSONB
    const payload = {
        ...invoiceData,
        // Make sure items are included in the payload
        items: invoiceData.items || [] 
    };

    const { data, error } = await supabase
        .from('invoices')
        .insert([payload])
        .select()
        .single();
    
    if (error) {
        console.error("Error creating invoice:", error);
        throw error;
    }
    return data;
};

export const calculateFinancialMetrics = async (): Promise<FinancialMetrics> => {
    // Fetch real data
    const invoices = await getInvoices();
    
    // 1. Calculate Totals
    const total_revenue = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    
    const collected_revenue = invoices
        .filter(inv => inv.status === 'pagada')
        .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
        
    const pending_revenue = invoices
        .filter(inv => inv.status === 'pendiente' || inv.status === 'vencida')
        .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

    // 2. Calculate Efficiency
    const invoiceCount = invoices.length;
    const average_ticket = invoiceCount > 0 ? total_revenue / invoiceCount : 0;
    const collection_rate = total_revenue > 0 ? (collected_revenue / total_revenue) * 100 : 0;

    // 3. Simple Margin Calculation
    // In a real app, you would fetch expenses from an 'expenses' table.
    // Here we estimate 30% operational costs and 15% tax/fees.
    const operational_costs = total_revenue * 0.30; 
    const taxes_costs = total_revenue * 0.15; 

    const gross_margin = total_revenue - operational_costs;
    const net_margin = gross_margin - taxes_costs;

    return {
        total_revenue,
        collected_revenue,
        pending_revenue,
        gross_margin,
        net_margin,
        average_ticket,
        collection_rate,
        monthly_growth: 0 // Needs historical data to calculate accurately
    };
};

export const getRevenueHistory = async () => {
    // For now, return static data for the chart structure
    // In a future phase, we can aggregate 'invoices' by month using SQL
    return [
        { name: 'Jul', ingresos: 4000, gastos: 2400 },
        { name: 'Ago', ingresos: 3000, gastos: 1398 },
        { name: 'Sep', ingresos: 2000, gastos: 9800 },
        { name: 'Oct', ingresos: 2780, gastos: 3908 },
        { name: 'Nov', ingresos: 1890, gastos: 4800 },
        { name: 'Dic', ingresos: 2390, gastos: 3800 },
    ];
};