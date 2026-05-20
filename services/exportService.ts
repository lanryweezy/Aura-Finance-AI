
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

export const exportToQuickBooks = (data: any[]) => {
    // IIF format for QuickBooks Desktop
    const headers = "!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO";
    const rows = data.map(t => `TRNS\tCASH\t${t.date}\t${t.category}\t${t.vendor || ''}\t${t.amount}\t${t.id}\t${t.description}`);
    const content = [headers, ...rows, "!ENDTRNS"].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_quickbooks_${Date.now()}.iif`;
    a.click();
};

export const exportToXero = (data: any[]) => {
    // Xero Bank Statement CSV format
    const xeroData = data.map(t => ({
        '*Date': t.date,
        '*Amount': t.amount,
        'Payee': t.vendor || t.description,
        'Description': t.description,
        'Reference': t.id,
        'Check Number': ''
    }));
    exportToCSV(`aura_xero_${Date.now()}`, xeroData);
};

export const exportToSage = (data: any[]) => {
    // Sage One CSV format
    const sageData = data.map(t => ({
        'Date': t.date,
        'Reference': t.id,
        'Description': t.description,
        'Amount': t.amount,
        'Tax': '0.00',
        'Account': t.category
    }));
    exportToCSV(`aura_sage_${Date.now()}`, sageData);
};
