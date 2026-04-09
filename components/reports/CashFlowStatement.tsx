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
        className={`${isTotal ? 'section-total' : ''} ${isHeader ? 'section-header' : ''} ${isSub ? 'section-item' : ''} ${onDrillDown ? 'cursor-pointer hover:bg-dark-secondary' : ''} ${isHeader ? (className ?? '') : ''}`}
        onClick={onDrillDown}
    >
        <td className={`py-2 ${isTotal || isHeader ? 'font-bold' : 'pl-4'} ${isSub ? 'pl-8' : ''}`} colSpan={isHeader ? 2 : 1}>{label}</td>
        {!isHeader && (
            <td className={`text-right font-mono ${!isHeader ? (className ?? '') : ''}`}>
                {typeof value === 'number' && (value < 0 ? `(${formatAmount(Math.abs(value))})` : formatAmount(value))}
            </td>
        )}
    </tr>
);

export const CashFlowStatement: React.FC<CashFlowStatementProps> = ({ data, onDrillDown }) => {
    const { formatAmount } = useCurrency();
    return (
        <Card>
            <h2 className="text-2xl font-semibold text-white mb-4">Statement of Cash Flows</h2>
            <table className="w-full text-white">
                <tbody>
                    <ReportRow label="Cash Flow from Operating Activities" isHeader formatAmount={formatAmount} />
                    <ReportRow label="Net Profit" value={data.netProfit} isSub className="text-gray-300" formatAmount={formatAmount} />
                    {/* Indirect method adjustments would go here. Simplified for now. */}
                    <ReportRow label="Net cash from operating activities" value={data.cashFromOperating} isTotal formatAmount={formatAmount} />

                    <tr className="h-4"><td colSpan={2}></td></tr>

                    <ReportRow label="Cash Flow from Financing Activities" isHeader formatAmount={formatAmount} />
                    <ReportRow label="Owner's Draw" value={-data.ownersDraw} isSub className="text-gray-300" formatAmount={formatAmount} onDrillDown={() => onDrillDown("Owner's Draw", 'debit', ["Owner's Draw"])} />
                    <ReportRow label="Net cash from financing activities" value={data.cashFromFinancing} isTotal formatAmount={formatAmount} />
                    
                    <tr className="h-4"><td colSpan={2}></td></tr>
                    
                    <ReportRow label="Net increase in cash" value={data.netCashFlow} isTotal className="text-xl" formatAmount={formatAmount} />

                    <tr className="h-4"><td colSpan={2}></td></tr>

                    <ReportRow label="Cash at beginning of period" value={data.beginningCash} isHeader className="text-base" formatAmount={formatAmount} />
                    <ReportRow label="Cash at end of period" value={data.endingCash} isHeader className="text-base" formatAmount={formatAmount} />
                </tbody>
            </table>
        </Card>
    );
};