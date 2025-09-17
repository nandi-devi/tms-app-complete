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
        <div id="thn-pdf" className="bg-white p-8 text-sm font-sans" style={{ width: '210mm', minHeight: '297mm', lineHeight: '1.4' }}>
            <div className="border-2 border-black p-4">
                {/* Header */}
                <div className="text-center mb-4 pb-2 border-b-2 border-black">
                    <h1 className="text-3xl font-bold">TRUCK HIRING NOTE</h1>
                </div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-2/3">
                        <h2 className="text-2xl font-bold">{companyInfo.name}</h2>
                        <p className="whitespace-pre-line text-sm">{companyInfo.address}</p>
                        <p className="text-sm font-semibold">Email: {companyInfo.email} | Phone: {companyInfo.phone1}</p>
                    </div>
                    <div className="text-right text-sm">
                        <p className="font-semibold"><span className="font-bold">THN No:</span> {thn.thnNumber}</p>
                        <p className="font-semibold"><span className="font-bold">Date:</span> {formatDate(thn.date)}</p>
                    </div>
                </div>

                {/* Details Table */}
                <table className="w-full border-collapse border border-gray-400 mb-4">
                    <tbody>
                        <tr className="bg-gray-50">
                            <td className="font-bold border p-3 w-1/4 text-sm">Transporter/Company Name</td>
                            <td className="border p-3 w-3/4 text-sm" colSpan={3}>{thn.transporterCompanyName}</td>
                        </tr>
                        <tr>
                            <td className="font-bold border p-3 text-sm">Truck Number</td>
                            <td className="border p-3 text-sm">{thn.truckNumber || ''}</td>
                            <td className="font-bold border p-3 text-sm">Expected Delivery</td>
                            <td className="border p-3 text-sm">{formatDate(thn.expectedDeliveryDate)}</td>
                        </tr>
                        <tr className="bg-gray-50">
                            <td className="font-bold border p-3 text-sm">Origin</td>
                            <td className="border p-3 text-sm">{thn.origin || ''}</td>
                            <td className="font-bold border p-3 text-sm">Destination</td>
                            <td className="border p-3 text-sm">{thn.destination || ''}</td>
                        </tr>
                         <tr>
                            <td className="font-bold border p-3 text-sm">Type of Goods</td>
                            <td className="border p-3 text-sm">{thn.goodsType || ''}</td>
                            <td className="font-bold border p-3 text-sm">Weight</td>
                            <td className="border p-3 text-sm">{thn.weight || 0} kg</td>
                        </tr>
                    </tbody>
                </table>

                {/* Financials */}
                <table className="w-full border-collapse border border-gray-400 mb-4">
                     <thead>
                        <tr className="bg-gray-100">
                            <th className="font-bold border p-3 text-left text-sm">Description</th>
                            <th className="font-bold border p-3 text-right text-sm">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="hover:bg-gray-50">
                            <td className="border p-3 text-sm">Freight</td>
                            <td className="border p-3 text-right text-sm">{(thn.freight || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="border p-3 text-sm">Loading Charges</td>
                            <td className="border p-3 text-right text-sm">{(thn.loadingCharges || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="border p-3 text-sm">Unloading Charges</td>
                            <td className="border p-3 text-right text-sm">{(thn.unloadingCharges || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="border p-3 text-sm">Detention Charges</td>
                            <td className="border p-3 text-right text-sm">{(thn.detentionCharges || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="font-bold bg-gray-50">
                            <td className="border p-3 text-sm">Subtotal</td>
                            <td className="border p-3 text-right text-sm">{((thn.freight || 0) + (thn.loadingCharges || 0) + (thn.unloadingCharges || 0) + (thn.detentionCharges || 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="border p-3 text-sm">CGST @ {(thn.gstRate || 0)/2}%</td>
                            <td className="border p-3 text-right text-sm">{(thn.cgstAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="border p-3 text-sm">SGST @ {(thn.gstRate || 0)/2}%</td>
                            <td className="border p-3 text-right text-sm">{(thn.sgstAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="border p-3 text-sm">IGST @ {thn.gstRate || 0}%</td>
                            <td className="border p-3 text-right text-sm">{(thn.igstAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="font-bold bg-gray-200">
                            <td className="border p-3 text-sm">Grand Total</td>
                            <td className="border p-3 text-right text-sm">{(thn.grandTotal || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                         <tr className="hover:bg-gray-50">
                            <td className="border p-3 text-sm">Advance Paid</td>
                            <td className="border p-3 text-right text-red-600 text-sm">(-) {(thn.advancePaid || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="font-bold bg-gray-200">
                            <td className="border p-3 text-sm">Balance Payable</td>
                            <td className="border p-3 text-right text-sm">{(thn.balancePayable || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
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
