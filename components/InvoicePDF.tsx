

import React from 'react';
import type { Invoice, CompanyInfo, Customer } from '../types';
import { GstType } from '../types';
import { generatePdf } from '../services/pdfService';
import { Button } from './ui/Button';
import { numberToWords, formatDate } from '../services/utils';

interface InvoicePDFProps {
  invoice: Invoice;
  companyInfo: CompanyInfo;
  customers: Customer[];
}

interface InvoiceViewProps {
  invoice: Invoice;
  companyInfo: CompanyInfo;
  customers: Customer[];
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, companyInfo, customers }) => {
    const client = invoice.customer;

    const totalPacks = invoice.lorryReceipts.reduce((sum, lr) => sum + lr.packages.reduce((pkgSum, p) => pkgSum + p.count, 0), 0);
    const totalWeight = invoice.lorryReceipts.reduce((sum, lr) => sum + lr.packages.reduce((pkgSum, p) => pkgSum + p.chargedWeight, 0), 0);
    const totalFreight = invoice.lorryReceipts.reduce((sum, lr) => sum + lr.charges.freight, 0);
    const totalOtherCharges = invoice.lorryReceipts.reduce((sum, lr) => {
        return sum + lr.charges.aoc + lr.charges.hamali + lr.charges.bCh + lr.charges.trCh + lr.charges.detentionCh;
    }, 0);
    const subTotal = invoice.totalAmount;

    return (
        <div id="invoice-pdf" className="bg-white p-8 text-sm font-sans" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'sans-serif' }}>
            <div className="w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-2">
                         <div className="w-16 h-16 bg-red-600 text-white font-bold text-5xl flex items-center justify-center transform -skew-x-12">
                            A<sup className="text-xl absolute top-0 right-0 mr-1 mt-1">®</sup>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-wider text-gray-800">{companyInfo.name}</h1>
                    <p className="text-gray-600">{companyInfo.address}</p>
                    <p className="text-gray-600">PH: {companyInfo.phone1} / {companyInfo.phone2}</p>
                    <div className="flex justify-center space-x-4 text-gray-600">
                        <span>E-Mail : {companyInfo.email}</span>
                        <span>Web :- {companyInfo.website}</span>
                    </div>
                    <p className="font-bold mt-2">GSTIN:{companyInfo.gstin}</p>
                </div>

                {/* Customer and Invoice Details */}
                <div className="flex justify-between border-t border-b border-gray-400 py-4 mb-4">
                    <div className="w-1/2">
                        <p><span className="font-bold w-16 inline-block">Client :</span> {client?.name}</p>
                        <p><span className="font-bold w-16 inline-block">Add :</span></p>
                        <p className="pl-16 whitespace-pre-line">{client?.address}</p>
                        <p><span className="font-bold w-16 inline-block">State :</span> {client?.state}</p>
                        <p><span className="font-bold w-16 inline-block">GSTIN/- :</span> {client?.gstin}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-bold">Invoice No :</span> {invoice.invoiceNumber}</p>
                        <p><span className="font-bold">Date :</span> {formatDate(invoice.date)}</p>
                    </div>
                </div>

                <p className="mb-4 font-semibold">Sub : Freight charges due to us on following consignments carried to various destinations.</p>
                
                {/* Lorry Receipts Table */}
                <table className="w-full text-left text-xs mb-4 border-collapse border border-gray-400">
                    <thead className="bg-gray-100">
                        <tr className="border-b-2 border-black">
                            <th className="p-1 border border-gray-300">Lr No.</th>
                            <th className="p-1 border border-gray-300">Lr Date</th>
                            <th className="p-1 border border-gray-300">Destination</th>
                            <th className="p-1 border border-gray-300">Rep Date</th>
                            <th className="p-1 border border-gray-300">Del Date</th>
                            <th className="p-1 border border-gray-300">Inv No.</th>
                            <th className="p-1 border border-gray-300">Consignee</th>
                            <th className="p-1 border border-gray-300 text-right">Packs</th>
                            <th className="p-1 border border-gray-300 text-right">Weight</th>
                            <th className="p-1 border border-gray-300 text-right">Freight</th>
                            <th className="p-1 border border-gray-300 text-right">B Ch.</th>
                            <th className="p-1 border border-gray-300 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.lorryReceipts.map(lr => {
                            const consignee = lr.consignee;
                            const packs = lr.packages.reduce((sum, p) => sum + p.count, 0);
                            const weight = lr.packages.reduce((sum, p) => sum + p.chargedWeight, 0);
                            const otherCharges = lr.charges.aoc + lr.charges.hamali + lr.charges.bCh + lr.charges.trCh + lr.charges.detentionCh;
                            return (
                                <tr key={lr._id} className="border-b border-gray-300">
                                    <td className="p-1 border border-gray-300">{lr.lrNumber}</td>
                                    <td className="p-1 border border-gray-300">{formatDate(lr.date)}</td>
                                    <td className="p-1 border border-gray-300">{lr.to}</td>
                                    <td className="p-1 border border-gray-300">{lr.reportingDate ? formatDate(lr.reportingDate) : '-'}</td>
                                    <td className="p-1 border border-gray-300">{lr.deliveryDate ? formatDate(lr.deliveryDate) : '-'}</td>
                                    <td className="p-1 border border-gray-300">{lr.invoiceNo}</td>
                                    <td className="p-1 border border-gray-300">{consignee?.tradeName || consignee?.name}</td>
                                    <td className="p-1 border border-gray-300 text-right">{packs}</td>
                                    <td className="p-1 border border-gray-300 text-right">{weight.toLocaleString('en-IN')}</td>
                                    <td className="p-1 border border-gray-300 text-right">{lr.charges.freight.toLocaleString('en-IN')}</td>
                                    <td className="p-1 border border-gray-300 text-right">{otherCharges > 0 ? otherCharges.toLocaleString('en-IN') : '-'}</td>
                                    <td className="p-1 border border-gray-300 text-right font-semibold">{lr.totalAmount.toLocaleString('en-IN')}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                     <tfoot className="font-bold bg-gray-100 text-sm">
                        <tr className="border-t-2 border-black">
                            <td colSpan={7} className="p-1 border border-gray-300 text-right">Totals:</td>
                            <td className="p-1 border border-gray-300 text-right">{totalPacks.toLocaleString('en-IN')}</td>
                            <td className="p-1 border border-gray-300 text-right">{totalWeight.toLocaleString('en-IN')}</td>
                            <td className="p-1 border border-gray-300 text-right">{totalFreight.toLocaleString('en-IN')}</td>
                            <td className="p-1 border border-gray-300 text-right">{totalOtherCharges > 0 ? totalOtherCharges.toLocaleString('en-IN') : '-'}</td>
                            <td className="p-1 border border-gray-300 text-right">{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tfoot>
                </table>
                
                {/* Total */}
                 <div className="flex justify-end mb-4">
                    <div className="w-2/5 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Sub Total:</span>
                            <span>{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        {!invoice.isRcm && (
                            <>
                                {invoice.gstType === GstType.CGST_SGST && (
                                    <>
                                        <div className="flex justify-between">
                                            <span>Add CGST @ {invoice.cgstRate}%{invoice.isManualGst && <em className="text-xs ml-1">(Manual)</em>}:</span>
                                            <span>{invoice.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Add SGST @ {invoice.sgstRate}%{invoice.isManualGst && <em className="text-xs ml-1">(Manual)</em>}:</span>
                                            <span>{invoice.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </>
                                )}
                                {invoice.gstType === GstType.IGST && (
                                    <div className="flex justify-between">
                                        <span>Add IGST @ {invoice.igstRate}%{invoice.isManualGst && <em className="text-xs ml-1">(Manual)</em>}:</span>
                                        <span>{invoice.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="flex justify-between font-bold border-t-2 border-b-2 border-black py-1 text-base">
                            <span>Grand Total:</span>
                            <span>{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* RCM Notice */}
                {invoice.isRcm && (
                    <div className="text-center font-bold text-gray-700 my-4 p-2 border border-dashed border-gray-400">
                        <p>GST Payable under Reverse Charge as per Notification No. 13/2017 – CT (Rate).</p>
                    </div>
                )}

                {/* Amount in words and Remarks */}
                <div className="mb-8 text-sm">
                    <p><span className="font-bold">Rs : </span>{numberToWords(Math.round(invoice.grandTotal))} Only /-</p>
                    <p><span className="font-bold">Remark :</span> {invoice.remarks}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end pt-4 border-t">
                    <div className="relative">
                        <p className="font-bold">FOR {companyInfo.name}</p>
                        <div className="w-32 h-20 border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-500 -rotate-12 mt-4">
                            <div className="text-center leading-tight">
                                <p className="font-bold">ALL INDIA</p>
                                <p className="font-bold text-xs">LOGISTICS</p>
                                <p className="text-xs">CHENNAI</p>
                                <p className="text-xs">600 066</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-left text-sm">
                        <p className="font-bold underline">Bank Details</p>
                        <p>{companyInfo.bankName} BANK</p>
                        <p>Bank A/C:{companyInfo.accountNumber}</p>
                        <p>Bank IFSC: {companyInfo.ifsc}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, companyInfo, customers }) => {
    return (
        <div>
            <div className="mb-4 flex justify-end">
                <Button onClick={() => generatePdf('invoice-pdf-container', `Invoice-${invoice.invoiceNumber}`)}>
                    Download PDF
                </Button>
            </div>
            <div id="invoice-pdf-container" className="flex justify-center bg-gray-300 p-8">
                <InvoiceView invoice={invoice} companyInfo={companyInfo} customers={customers} />
            </div>
        </div>
    );
}