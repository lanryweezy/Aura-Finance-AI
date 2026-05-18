import React from 'react';
import { Card } from '../ui/Card';
import type { CashFlowData } from '../../types';
import { useCurrency } from "../ui/CurrencyProvider";

interface CashFlowStatementProps {
    data: CashFlowData;
    onDrillDown: (title: string, type: 'credit' | 'debit', categories: string[]) => void;
}

const ReportRow: React.FC<{label: string, value?: number, isTotal?: boolean, isHeader?: boolean, isSub?: boolean, className?: string, onDrillDown?: () => void, formatAmount: (v: number) => string}> =
({ label, value, isTotal, isHeader, isSub, className, onDrillDown, formatAmount }) => (
    <tr 
        className={`${isTotal ? 'section-total border-t-2 border-gray-100 dark:border-gray-800' : ''} ${isHeader ? 'section-header' : ''} ${isSub ? 'section-item' : ''} ${onDrillDown ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-secondary transition-colors' : ''} ${isHeader ? (className ?? '') : ''}`}
        onClick={onDrillDown}
    >
        <td className={`py-3 ${isTotal || isHeader ? 'font-bold text-gray-900 dark:text-white' : 'pl-6 text-gray-600 dark:text-gray-400 font-medium'} ${isSub ? 'pl-10' : ''}`} colSpan={isHeader ? 2 : 1}>{label}</td>
        {!isHeader && (
            <td className={`text-right font-mono font-bold ${!isHeader ? (className ?? '') : ''}`}>
                {typeof value === 'number' && (value < 0 ? `(${formatAmount(Math.abs(value))})` : formatAmount(value))}
            </td>
        )}
    </tr>
);

export const CashFlowStatement: React.FC<CashFlowStatementProps> = ({ data, onDrillDown }) => {
    const { formatAmount } = useCurrency();
    return (
        <Card className="border-gray-100 dark:border-white/5 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Statement of Cash Flows</h2>
            <table className="w-full">
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    <ReportRow label="Cash Flow from Operating Activities" isHeader formatAmount={formatAmount} />
                    <ReportRow label="Net Profit" value={data.netProfit} isSub className="text-gray-600 dark:text-gray-300" formatAmount={formatAmount} />
                    {/* Indirect method adjustments would go here. Simplified for now. */}
                    <ReportRow label="Net cash from operating activities" value={data.cashFromOperating} isTotal formatAmount={formatAmount} />

                    <tr className="h-4 bg-transparent"><td colSpan={2}></td></tr>

                    <ReportRow label="Cash Flow from Financing Activities" isHeader formatAmount={formatAmount} />
                    <ReportRow label="Owner's Draw" value={-data.ownersDraw} isSub className="text-gray-600 dark:text-gray-300" formatAmount={formatAmount} onDrillDown={() => onDrillDown("Owner's Draw", 'debit', ["Owner's Draw"])} />
                    <ReportRow label="Net cash from financing activities" value={data.cashFromFinancing} isTotal formatAmount={formatAmount} />
                    
                    <tr className="h-4 bg-transparent"><td colSpan={2}></td></tr>
                    
                    <ReportRow label="Net increase in cash" value={data.netCashFlow} isTotal className="text-xl text-brand-cyan" formatAmount={formatAmount} />

                    <tr className="h-4 bg-transparent"><td colSpan={2}></td></tr>

                    <ReportRow label="Cash at beginning of period" value={data.beginningCash} isHeader className="text-base" formatAmount={formatAmount} />
                    <ReportRow label="Cash at end of period" value={data.endingCash} isHeader className="text-base border-b-2 border-brand-cyan" formatAmount={formatAmount} />
                </tbody>
            </table>
        </Card>
    );
};