import React, { useState } from 'react';
import type { CompanyInfo } from '../types';
import { generatePdf } from '../services/pdfService';
import { Button } from './ui/Button';
import { formatDate } from '../services/utils';

// This component will be flexible enough to render either a Client or Company Ledger
interface LedgerPDFProps {
    title: string;
    transactions: any[]; // Using 'any' for flexibility between client/company ledger data structures
    columns: { key: string, label: string, align?: 'right' | 'left' | 'center' }[];
    companyInfo: CompanyInfo;
    summary?: { label: string, value: string | number, color?: string }[];
    onBack: () => void;
}

export const LedgerView: React.FC<Omit<LedgerPDFProps, 'title' | 'onBack'>> = ({ transactions, columns, companyInfo, summary }) => {
    return (
        <div id="ledger-pdf" className="bg-white p-8 text-sm font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
            <div className="w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-wider text-gray-800">{companyInfo.name}</h1>
                    <p className="text-gray-600">{companyInfo.address}</p>
                    <h2 className="text-2xl font-semibold mt-4 underline">{summary ? 'Ledger Report' : 'Company Ledger'}</h2>
                </div>

                {/* Summary Details */}
                {summary && (
                    <div className="border-t border-b border-gray-400 py-4 mb-4">
                        {summary.map(item => (
                            <p key={item.label}>
                                <span className="font-bold w-24 inline-block">{item.label}:</span>
                                <span className={item.color || ''}>{item.value}</span>
                            </p>
                        ))}
                    </div>
                )}

                {/* Transactions Table */}
                <table className="w-full text-left text-xs mb-4 border-collapse border border-gray-400">
                    <thead className="bg-gray-100">
                        <tr className="border-b-2 border-black">
                            {columns.map(col => (
                                <th key={col.key} className={`p-2 border border-gray-300 text-${col.align || 'left'}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, index) => (
                            <tr key={index} className="border-b border-gray-300">
                                {columns.map(col => (
                                    <td key={col.key} className={`p-2 border border-gray-300 text-${col.align || 'left'}`}>
                                        {tx[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                         {transactions.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="text-center p-4 text-gray-500">No transactions to display.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export const LedgerPDF: React.FC<LedgerPDFProps> = (props) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePdf = async () => {
        setIsGenerating(true);
        try {
            await generatePdf('ledger-pdf-container', `${props.title.replace(/\s+/g, '_')}-Ledger`);
        } catch (error) {
            console.error('PDF generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div>
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
            <div className="mb-4 flex justify-end no-print">
                <Button 
                    onClick={handleGeneratePdf} 
                    className="mr-4"
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                </Button>
                <Button variant="secondary" onClick={props.onBack}>Back</Button>
            </div>
            <div id="ledger-pdf-container" className="flex justify-center bg-gray-300 p-8">
                <LedgerView {...props} />
            </div>
        </div>
    );
}
