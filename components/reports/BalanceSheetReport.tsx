import React from 'react';
import { Card } from '../ui/Card';
import type { BalanceSheetData } from '../../types';
import { useToast } from '../ui/Toast';
import { useCurrency } from "../ui/CurrencyProvider";

interface BalanceSheetReportProps {
    data: BalanceSheetData;
    onDrillDown: (title: string, type: 'credit' | 'debit', categories: string[]) => void;
}

const ReportRow: React.FC<{label: string, value?: number, isTotal?: boolean, isHeader?: boolean, className?: string, onDrillDown?: () => void, formatAmount: (v: number) => string}> =
({ label, value, isTotal, isHeader, className, onDrillDown, formatAmount }) => (
    <tr 
        className={`${isTotal ? 'section-total' : ''} ${isHeader ? 'section-header' : 'section-item'} ${onDrillDown ? 'cursor-pointer hover:bg-dark-secondary' : ''} ${isHeader ? (className ?? '') : ''}`}
        onClick={onDrillDown}
    >
        <td className={`py-2 ${isTotal || isHeader ? 'font-bold' : 'pl-4'}`} colSpan={isHeader ? 2 : 1}>{label}</td>
        {!isHeader && (
            <td className={`text-right font-mono ${!isHeader ? (className ?? '') : ''}`}>
                {typeof value === 'number' && formatAmount(value)}
            </td>
        )}
    </tr>
);

const RatioIndicator: React.FC<{ratio: number}> = ({ratio}) => {
    let status = { text: 'Healthy', color: 'text-green-400' };
    if (ratio === Infinity) {
        status = { text: 'No Liabilities', color: 'text-blue-400' };
    } else if (ratio < 1) {
        status = { text: 'Warning', color: 'text-red-400' };
    } else if (ratio < 1.5) {
        status = { text: 'Okay', color: 'text-yellow-400' };
    }
    
    return (
        <div className="mt-4 p-4 bg-dark-secondary rounded-lg text-center">
            <h4 className="text-sm font-semibold text-gray-400">Current Ratio</h4>
            <p className="text-2xl font-bold">{isFinite(ratio) ? ratio.toFixed(2) : '∞'}</p>
            <p className={`text-sm font-semibold ${status.color}`}>{status.text}</p>
            <p className="text-xs text-gray-500 mt-1">
                (Current Assets / Current Liabilities)
            </p>
        </div>
    )
}

export const BalanceSheetReport: React.FC<BalanceSheetReportProps> = ({ data, onDrillDown }) => {
    const { formatAmount } = useCurrency();
    const { showToast } = useToast();
    return (
        <Card>
            <h2 className="text-2xl font-semibold text-white mb-4">Balance Sheet</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3">
                    <table className="w-full text-white">
                        <tbody>
                            <ReportRow label="Assets" isHeader formatAmount={formatAmount} />
                            <ReportRow label="Current Assets" isHeader className="text-base font-semibold" formatAmount={formatAmount} />
                            <ReportRow label="Cash and Bank" value={data.cashAndBank} className="text-gray-300" formatAmount={formatAmount} onDrillDown={() => showToast("Drill-down for cash balance not implemented yet.", "info")} />
                            <ReportRow label="Accounts Receivable" value={data.accountsReceivable} className="text-gray-300" formatAmount={formatAmount} onDrillDown={() => showToast("Drill-down for receivables not implemented yet.", "info")} />
                            <ReportRow label="Inventory" value={data.inventory} className="text-gray-300" formatAmount={formatAmount} />
                            <ReportRow label="Total Current Assets" value={data.totalCurrentAssets} isTotal formatAmount={formatAmount} />

                            <tr className="h-6"><td colSpan={2}></td></tr>

                            <ReportRow label="Liabilities" isHeader formatAmount={formatAmount} />
                            <ReportRow label="Current Liabilities" isHeader className="text-base font-semibold" formatAmount={formatAmount} />
                            <ReportRow label="Accounts Payable" value={data.accountsPayable} className="text-gray-300" formatAmount={formatAmount} onDrillDown={() => showToast("Drill-down for payables not implemented yet.", "info")} />
                            <ReportRow label="Total Current Liabilities" value={data.totalCurrentLiabilities} isTotal formatAmount={formatAmount} />
                            
                            <tr className="h-6"><td colSpan={2}></td></tr>

                            <ReportRow label="Equity" isHeader formatAmount={formatAmount} />
                             <ReportRow label="Retained Earnings / Owner's Equity" value={data.equity} className="text-gray-300" formatAmount={formatAmount} />
                            <ReportRow label="Total Equity" value={data.equity} isTotal formatAmount={formatAmount} />

                        </tbody>
                    </table>
                </div>
                 <div className="md:col-span-2">
                    <RatioIndicator ratio={data.currentRatio} />
                </div>
            </div>
        </Card>
    );
};
