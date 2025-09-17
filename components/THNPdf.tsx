import React, { useState } from 'react';
import type { TruckHiringNote, CompanyInfo } from '../types';
import { generatePdf } from '../services/pdfService';
import { Button } from './ui/Button';
import { formatDate, numberToWords } from '../services/utils';

interface THNPdfProps {
  truckHiringNote: TruckHiringNote;
  companyInfo: CompanyInfo;
  onBack: () => void;
}

export const THNView: React.FC<{truckHiringNote: TruckHiringNote, companyInfo: CompanyInfo}> = ({ truckHiringNote: thn, companyInfo }) => {
    return (
        <div id="thn-pdf" className="bg-white p-8 text-sm font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
            <div className="border-2 border-black p-4">
                {/* Header */}
                <div className="text-center mb-4 pb-2 border-b-2 border-black">
                    <h1 className="text-3xl font-bold">TRUCK HIRING NOTE</h1>
                </div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-2/3">
                        <h2 className="text-2xl font-bold">{companyInfo.name}</h2>
                        <p className="whitespace-pre-line">{companyInfo.address}</p>
                        <p>Email: {companyInfo.email} | Phone: {companyInfo.phone1}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-bold">THN No:</span> {thn.thnNumber}</p>
                        <p><span className="font-bold">Date:</span> {formatDate(thn.date)}</p>
                    </div>
                </div>

                {/* Details Table */}
                <table className="w-full border-collapse border border-gray-400 mb-4">
                    <tbody>
                        <tr>
                            <td className="font-bold border p-2 w-1/4">Transporter/Company Name</td>
                            <td className="border p-2 w-3/4" colSpan={3}>{thn.transporterCompanyName}</td>
                        </tr>
                        <tr>
                            <td className="font-bold border p-2">Truck Number</td>
                            <td className="border p-2">{thn.truckNumber || ''}</td>
                            <td className="font-bold border p-2">Expected Delivery</td>
                            <td className="border p-2">{formatDate(thn.expectedDeliveryDate)}</td>
                        </tr>
                        <tr>
                            <td className="font-bold border p-2">Origin</td>
                            <td className="border p-2">{thn.origin || ''}</td>
                            <td className="font-bold border p-2">Destination</td>
                            <td className="border p-2">{thn.destination || ''}</td>
                        </tr>
                         <tr>
                            <td className="font-bold border p-2">Type of Goods</td>
                            <td className="border p-2">{thn.goodsType || ''}</td>
                            <td className="font-bold border p-2">Weight</td>
                            <td className="border p-2">{thn.weight || 0} kg</td>
                        </tr>
                    </tbody>
                </table>

                {/* Financials */}
                <table className="w-full border-collapse border border-gray-400 mb-4">
                     <thead>
                        <tr className="bg-gray-100">
                            <th className="font-bold border p-2 text-left">Description</th>
                            <th className="font-bold border p-2 text-right">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border p-2">Freight</td>
                            <td className="border p-2 text-right">{(thn.freight || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td className="border p-2">Loading Charges</td>
                            <td className="border p-2 text-right">{(thn.loadingCharges || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td className="border p-2">Unloading Charges</td>
                            <td className="border p-2 text-right">{(thn.unloadingCharges || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td className="border p-2">Detention Charges</td>
                            <td className="border p-2 text-right">{(thn.detentionCharges || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="font-bold">
                            <td className="border p-2">Subtotal</td>
                            <td className="border p-2 text-right">{((thn.freight || 0) + (thn.loadingCharges || 0) + (thn.unloadingCharges || 0) + (thn.detentionCharges || 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td className="border p-2">CGST @ {(thn.gstRate || 0)/2}%</td>
                            <td className="border p-2 text-right">{(thn.cgstAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td className="border p-2">SGST @ {(thn.gstRate || 0)/2}%</td>
                            <td className="border p-2 text-right">{(thn.sgstAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td className="border p-2">IGST @ {thn.gstRate || 0}%</td>
                            <td className="border p-2 text-right">{(thn.igstAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="font-bold bg-gray-100">
                            <td className="border p-2">Grand Total</td>
                            <td className="border p-2 text-right">{(thn.grandTotal || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                         <tr>
                            <td className="border p-2">Advance Paid</td>
                            <td className="border p-2 text-right text-red-600">(-) {(thn.advancePaid || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="font-bold bg-gray-100">
                            <td className="border p-2">Balance Payable</td>
                            <td className="border p-2 text-right">{(thn.balancePayable || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-sm font-semibold mb-4">Amount in Words: {numberToWords(thn.balancePayable || 0)} Only /-</p>
                
                {/* Payment Terms and Reminders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="font-bold">Payment Terms: {thn.paymentTerms || 'COD'}</p>
                    </div>
                    <div>
                        <p className="font-bold">Reminders: {thn.reminders || 'None'}</p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="border border-gray-400 p-2 mb-8 min-h-[5rem]">
                    <p className="font-bold mb-1">Special Instructions:</p>
                    <p className="whitespace-pre-line">{thn.specialInstructions || 'None'}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end pt-8 mt-16">
                    <div className="w-1/2">
                        <div className="border-t-2 border-black pt-1">
                            <p>Signature of Transporter / Company</p>
                        </div>
                    </div>
                    <div className="w-1/2 text-right">
                        <div className="border-t-2 border-black pt-1">
                            <p>For {companyInfo.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const THNPdf: React.FC<THNPdfProps> = ({ truckHiringNote, companyInfo, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePdf = async () => {
        setIsGenerating(true);
        try {
            await generatePdf('thn-pdf-container', `THN-${truckHiringNote.thnNumber}`);
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
                <Button variant="secondary" onClick={onBack}>Back</Button>
            </div>
            <div id="thn-pdf-container" className="flex justify-center bg-gray-300 p-8">
                <THNView truckHiringNote={truckHiringNote} companyInfo={companyInfo} />
            </div>
        </div>
    );
}
