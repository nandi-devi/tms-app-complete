import React from 'react';
import type { TruckHiringNote } from '../types';
import { Button } from './ui/Button';
import { formatDate } from '../services/utils';

interface THNPdfProps {
    thn: TruckHiringNote;
    onBack: () => void;
}

export const THNPdf: React.FC<THNPdfProps> = ({ thn, onBack }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Truck Hiring Note #{thn.thnNumber}</h2>
                <div>
                    <Button onClick={handlePrint} className="mr-4">Print</Button>
                    <Button variant="secondary" onClick={onBack}>Back</Button>
                </div>
            </div>

            <div className="bg-white p-8 shadow-lg rounded-lg print:shadow-none">
                {/* Header */}
                <div className="text-center mb-8 border-b pb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">TRUCK HIRING NOTE</h1>
                    <p className="text-gray-600">THN No: {thn.thnNumber} | Date: {formatDate(thn.date)}</p>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Truck Details</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Truck Number:</span>
                                <span>{thn.truckNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Truck Type:</span>
                                <span>{thn.truckType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Capacity:</span>
                                <span>{thn.vehicleCapacity} tons</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Trip Details</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">From:</span>
                                <span>{thn.loadingLocation}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">To:</span>
                                <span>{thn.unloadingLocation}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Loading Date:</span>
                                <span>{formatDate(thn.loadingDateTime)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Expected Delivery:</span>
                                <span>{formatDate(thn.expectedDeliveryDate)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Party Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Agency Details</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Agency Name:</span>
                                <span>{thn.agencyName}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Truck Owner Details</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Owner Name:</span>
                                <span>{thn.truckOwnerName}</span>
                            </div>
                            {thn.truckOwnerContact && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Contact:</span>
                                    <span>{thn.truckOwnerContact}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cargo Information */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Cargo Information</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="font-medium">Type of Goods:</span>
                            <span>{thn.goodsType}</span>
                        </div>
                    </div>
                </div>

                {/* Financial Details */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Financial Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Freight Rate:</span>
                                <span>₹{thn.freightRate.toLocaleString('en-IN')} ({thn.freightRateType.replace('_', ' ')})</span>
                            </div>
                            {thn.additionalCharges > 0 && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Additional Charges:</span>
                                    <span>₹{thn.additionalCharges.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-semibold text-lg border-t pt-2">
                                <span>Total Amount:</span>
                                <span>₹{(thn.freightRate + (thn.additionalCharges || 0)).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Advance Paid:</span>
                                <span>₹{thn.advanceAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Payment Mode:</span>
                                <span>{thn.paymentMode}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-red-600 border-t pt-2">
                                <span>Balance Amount:</span>
                                <span>₹{thn.balanceAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Terms */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Payment Terms</h3>
                    <p className="text-gray-700">{thn.paymentTerms}</p>
                </div>

                {/* Additional Information */}
                {(thn.linkedLR || thn.linkedInvoice || thn.remarks) && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Additional Information</h3>
                        <div className="space-y-2">
                            {thn.linkedLR && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Linked LR:</span>
                                    <span>{thn.linkedLR}</span>
                                </div>
                            )}
                            {thn.linkedInvoice && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Linked Invoice:</span>
                                    <span>{thn.linkedInvoice}</span>
                                </div>
                            )}
                            {thn.remarks && (
                                <div>
                                    <span className="font-medium">Remarks:</span>
                                    <p className="mt-1 text-gray-700">{thn.remarks}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-8 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Agency Signature</h4>
                            <div className="h-16 border-b border-gray-300"></div>
                            <p className="text-sm text-gray-600 mt-2">{thn.agencyName}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Truck Owner Signature</h4>
                            <div className="h-16 border-b border-gray-300"></div>
                            <p className="text-sm text-gray-600 mt-2">{thn.truckOwnerName}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
