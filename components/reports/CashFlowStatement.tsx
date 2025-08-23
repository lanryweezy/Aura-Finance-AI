
import React from 'react';
import { Card } from '../ui/Card';
import type { CashFlowData } from '../../types';

interface CashFlowStatementProps {
    data: CashFlowData;
    onDrillDown: (title: string, type: 'credit' | 'debit', categories: string[]) => void;
}

const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

const ReportRow: React.FC<{label: string, value?: number, isTotal?: boolean, isHeader?: boolean, isSub?: boolean, className?: string, onDrillDown?: () => void}> = 
({ label, value, isTotal, isHeader, isSub, className, onDrillDown }) => (
    <tr 
        className={`${isTotal ? 'section-total' : ''} ${isHeader ? 'section-header' : ''} ${isSub ? 'section-item' : ''} ${onDrillDown ? 'cursor-pointer hover:bg-dark-secondary' : ''} ${isHeader ? (className ?? '') : ''}`}
        onClick={onDrillDown}
    >
        <td className={`py-2 ${isTotal || isHeader ? 'font-bold' : 'pl-4'} ${isSub ? 'pl-8' : ''}`} colSpan={isHeader ? 2 : 1}>{label}</td>
        {!isHeader && (
            <td className={`text-right font-mono ${!isHeader ? (className ?? '') : ''}`}>
                {typeof value === 'number' && (value < 0 ? `(${formatNaira(Math.abs(value))})` : formatNaira(value))}
            </td>
        )}
    </tr>
);

export const CashFlowStatement: React.FC<CashFlowStatementProps> = ({ data, onDrillDown }) => {
    return (
        <Card>
            <h2 className="text-2xl font-semibold text-white mb-4">Statement of Cash Flows</h2>
            <table className="w-full text-white">
                <tbody>
                    <ReportRow label="Cash Flow from Operating Activities" isHeader />
                    <ReportRow label="Net Profit" value={data.netProfit} isSub className="text-gray-300" />
                    {/* Indirect method adjustments would go here. Simplified for now. */}
                    <ReportRow label="Net cash from operating activities" value={data.cashFromOperating} isTotal />

                    <tr className="h-4"><td colSpan={2}></td></tr>

                    <ReportRow label="Cash Flow from Financing Activities" isHeader />
                    <ReportRow label="Owner's Draw" value={-data.ownersDraw} isSub className="text-gray-300" onDrillDown={() => onDrillDown("Owner's Draw", 'debit', ["Owner's Draw"])} />
                    <ReportRow label="Net cash from financing activities" value={data.cashFromFinancing} isTotal />
                    
                    <tr className="h-4"><td colSpan={2}></td></tr>
                    
                    <ReportRow label="Net increase in cash" value={data.netCashFlow} isTotal className="text-xl" />

                    <tr className="h-4"><td colSpan={2}></td></tr>

                    <ReportRow label="Cash at beginning of period" value={data.beginningCash} isHeader className="text-base" />
                    <ReportRow label="Cash at end of period" value={data.endingCash} isHeader className="text-base" />
                </tbody>
            </table>
        </Card>
    );
};