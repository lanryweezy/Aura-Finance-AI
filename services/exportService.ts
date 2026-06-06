
export const exportToCSV = (filename: string, data: any[]) => {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle strings with commas
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const exportFirsVatSchedule = (invoices: any[], periodStart: string, periodEnd: string) => {
    const schedule = invoices.map(inv => ({
        'Customer Name': inv.customer,
        'TIN': 'N/A', // Placeholder for TIN
        'Invoice Date': new Date(inv.issueDate).toLocaleDateString(),
        'Invoice Number': inv.id.slice(-6).toUpperCase(),
        'Net Amount': inv.amount,
        'VAT Amount (7.5%)': inv.vat,
        'Gross Amount': inv.total
    }));

    exportToCSV(`FIRS_VAT_Schedule_${periodStart}_to_${periodEnd}`, schedule);
};

export const exportFirsWhtSchedule = (invoices: any[], transactions: any[], periodStart: string, periodEnd: string) => {
    // Suffered WHT (Income)
    const incomeSchedule = invoices.filter(i => i.whtApplied).map(inv => ({
        'Beneficiary/Supplier': inv.customer,
        'TIN': 'N/A',
        'Nature of Transaction': 'Services/Supply',
        'Date': new Date(inv.issueDate).toLocaleDateString(),
        'Gross Amount': inv.amount,
        'WHT Rate': '5%',
        'WHT Amount': inv.amount * 0.05,
        'Type': 'Suffered (Credit)'
    }));

    // Payable WHT (Expenses)
    const expenseSchedule = transactions
        .filter(t => t.type === 'debit' && (t.category === 'Rent' || t.category === 'Professional Services' || t.category === 'Contractors'))
        .map(t => ({
            'Beneficiary/Supplier': t.narration,
            'TIN': 'N/A',
            'Nature of Transaction': t.category,
            'Date': new Date(t.date).toLocaleDateString(),
            'Gross Amount': t.amount,
            'WHT Rate': '5%',
            'WHT Amount': t.amount * 0.05,
            'Type': 'Payable (Debit)'
        }));

    exportToCSV(`FIRS_WHT_Schedule_${periodStart}_to_${periodEnd}`, [...incomeSchedule, ...expenseSchedule]);
};
