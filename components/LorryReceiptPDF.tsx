import React, { useState } from 'react';
import type { LorryReceipt, CompanyInfo } from '../types';
import { generateMultiPagePdf } from '../services/pdfService';
import { Button } from './ui/Button';
import { formatDate, numberToWords } from '../services/utils';
import { Card } from './ui/Card';

interface LorryReceiptPDFProps {
  lorryReceipt: LorryReceipt;
  companyInfo: CompanyInfo;
}

interface LorryReceiptViewProps {
    lorryReceipt: LorryReceipt;
    companyInfo: CompanyInfo;
    copyType: string;
    hideCharges: boolean;
}

const copyTypes = [
  'Original for Consignor',
  'Duplicate for Transporter',
  'Triplicate for Consignee',
  'Office Copy'
];

export const LorryReceiptView: React.FC<LorryReceiptViewProps> = ({ lorryReceipt, companyInfo, copyType, hideCharges }) => {
    const { consignor, consignee, vehicle } = lorryReceipt;

    const charges = [
        { label: 'Freight', value: lorryReceipt.charges.freight },
        { label: 'AOC', value: lorryReceipt.charges.aoc },
        { label: 'Hamali', value: lorryReceipt.charges.hamali },
        { label: 'B. Ch.', value: lorryReceipt.charges.bCh },
        { label: 'Tr. Ch.', value: lorryReceipt.charges.trCh },
        { label: 'Detention Ch.', value: lorryReceipt.charges.detentionCh },
    ];
    
    return (
        <div className="bg-white p-4 text-xs font-mono break-inside-avoid shadow-lg" style={{ width: '210mm', minHeight:'297mm', fontFamily: 'monospace' }}>
            <div className="border-2 border-black p-2">
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-2 mb-2">
                    <p className="text-sm">!! Jai Bajarang Bali !!</p>
                    <p className="text-sm">!! Jai Dada Nath !!</p>
                    <div className="flex justify-between items-start">
                        <div className="w-20 h-20 bg-red-600 text-white font-bold text-6xl flex items-center justify-center transform -skew-x-12 ml-4">
                           A<sup className="text-lg absolute top-0 right-0 mr-1 mt-1">®</sup>
                        </div>
                        <div className="flex-grow">
                            <h1 className="text-4xl font-bold tracking-wider">{companyInfo.name}</h1>
                            <p>{companyInfo.address}</p>
                            <p>E-mail: {companyInfo.email} / Web.: {companyInfo.website}</p>
                        </div>
                        <div className="text-right">
                            <p>Mob.: {companyInfo.phone1}</p>
                            <p>{companyInfo.phone2}</p>
                        </div>
                    </div>
                </div>

                {/* Sub-Header */}
                <div className="grid grid-cols-3 gap-1 mb-1">
                    <div className="border border-black p-1">
                        <h3 className="font-bold text-center underline">SCHEDULE OF DEMURRAGE CHARGES</h3>
                        <p>Demurrage chargeable after 15 days from today @ Rs.1/- per day pay Quintal on weight charged.</p>
                    </div>
                    <div className="font-bold text-xl text-center flex items-center justify-center underline">
                        {copyType !== 'PREVIEW' ? copyType.toUpperCase() : 'DOCUMENT PREVIEW'}
                    </div>
                    <div className="border border-black p-1 text-center">
                        <p>PAN No.: {companyInfo.pan}</p>
                        <p>GSTIN : {companyInfo.gstin}</p>
                    </div>
                    <div className="border border-black p-1">
                        <h3 className="font-bold text-center underline">NOTICE</h3>
                        <p className="text-[10px] leading-tight">The consignments covered by this Lorry Receipt shall be stored at the destination under the control of the Transport Operator and shall be delivered to or to the order of the Consignee Bank whose name is mentioned in the Lorry Receipt. It will under no circumstances be delivered to anyone without the written authority from the Consignee Bank or its order, endorsed on the Consignee copy or on a separate letter of Authority.</p>
                    </div>
                    <div className="border border-black p-1 text-center flex flex-col justify-center">
                        <p className="font-bold">AT CARRIER'S / OWNER'S RISK</p>
                        <p>(Delete Whichever is inapplicable)</p>
                    </div>
                    <div className="border border-black p-1">
                        <h3 className="font-bold text-center underline">CAUTION</h3>
                         <p className="text-[10px] leading-tight">This Consignment will not be detained, diverted, re-routed or re-booked without Consignee Bank's written permission. We will be delivered at the destination.</p>
                    </div>
                </div>

                {/* Body */}
                <div className="grid grid-cols-5">
                    <div className="col-span-3 pr-1">
                       <div className="border-2 border-black p-1 h-12 flex items-start">
                           <span className="font-bold mr-2">CONSIGNMENT NOTE No.</span>
                           <span className="text-lg font-bold">{lorryReceipt.id}</span>
                       </div>
                       <div className="border-2 border-black border-t-0 p-1 min-h-[5rem]">
                           <span className="font-bold">Consignor's Name & Address</span>
                           <p>{consignor?.name}</p>
                           <p className="whitespace-pre-line">{consignor?.address}</p>
                       </div>
                       <div className="border-2 border-black border-t-0 p-1 min-h-[5rem]">
                           <span className="font-bold">Consignee's Name & Address</span>
                           <p>{consignee?.name}</p>
                           <p className="whitespace-pre-line">{consignee?.address}</p>
                       </div>
                    </div>
                    <div className="col-span-2">
                        <div className="border-2 border-black p-1 h-12 flex items-start">
                            <span className="font-bold mr-2">Date :</span>{formatDate(lorryReceipt.date)}
                        </div>
                        <div className="border-2 border-black border-t-0 p-1">
                            <p className="font-bold">INSURANCE</p>
                            <p className="text-[10px]">The Customer has stated that :</p>
                            {lorryReceipt.insurance?.hasInsured ? (
                                <>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 border border-black mr-1"></div> <span className="text-[10px]">He has not insured the Consignment</span>
                                        <span className="mx-2">OR</span>
                                        <div className="w-3 h-3 border border-black mr-1">X</div> <span className="text-[10px]">He has insured the Consignment</span>
                                    </div>
                                    <p className="text-[10px]">Company........ {lorryReceipt.insurance.company || 'N/A'}</p>
                                    <p className="text-[10px]">Policy No....... {lorryReceipt.insurance.policyNo || 'N/A'} .Date....... {lorryReceipt.insurance.date ? formatDate(lorryReceipt.insurance.date) : 'N/A'}</p>
                                    <p className="text-[10px]">Amount......... {lorryReceipt.insurance.amount || 'N/A'} .Risk.......... {lorryReceipt.insurance.risk || 'N/A'}</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 border border-black mr-1">X</div> <span className="text-[10px]">He has not insured the Consignment</span>
                                        <span className="mx-2">OR</span>
                                        <div className="w-3 h-3 border border-black mr-1"></div> <span className="text-[10px]">He has insured the Consignment</span>
                                    </div>
                                    <p className="text-[10px] italic mt-2">-- Consignment Not Insured --</p>
                                </>
                            )}
                            <p className="text-[10px]">Invoice No........ {lorryReceipt.invoiceNo || ''}</p>
                        </div>
                         <div className="border-2 border-black border-t-0 p-1 text-center">
                            <span className="font-bold">GST PAYABLE BY :</span> Consignor ( {lorryReceipt.gstPayableBy === 'Consignor' ? 'X' : ''} ) Consignee ( {lorryReceipt.gstPayableBy === 'Consignee' ? 'X' : ''} ) Transporter ( {lorryReceipt.gstPayableBy === 'Transporter' ? 'X' : ''} )
                        </div>
                        <div className="grid grid-cols-2">
                           <div className="border-2 border-black border-t-0 p-1"><span className="font-bold">Seal No.:</span> {lorryReceipt.sealNo}</div>
                           <div className="border-2 border-black border-t-0 border-l-0 p-1"><span className="font-bold">Vehicle No.:</span> {vehicle?.number}</div>
                        </div>
                        <div className="border-2 border-black border-t-0 p-1"><span className="font-bold">From :</span> {lorryReceipt.from}</div>
                        <div className="border-2 border-black border-t-0 p-1"><span className="font-bold">To :</span> {lorryReceipt.to}</div>
                    </div>
                </div>

                {/* Table */}
                <div className="grid grid-cols-12 border-2 border-black border-t-0">
                    <div className={hideCharges ? "col-span-12" : "col-span-8 border-r-2 border-black"}>
                        <div className="grid grid-cols-8 text-center font-bold border-b-2 border-black">
                            <div className="col-span-1 border-r-2 border-black p-1">No. of Pkgs.</div>
                            <div className="col-span-1 border-r-2 border-black p-1">Method of Packing</div>
                            <div className="col-span-4 border-r-2 border-black p-1">DESCRIPTION (Said to Contain)</div>
                            <div className="col-span-2 p-1">WEIGHT</div>
                        </div>
                        <div className="grid grid-cols-8 text-center font-bold border-b-2 border-black">
                            <div className="col-span-1 border-r-2 border-black p-1"></div>
                            <div className="col-span-1 border-r-2 border-black p-1"></div>
                            <div className="col-span-4 border-r-2 border-black p-1"></div>
                            <div className="col-span-1 border-r-2 border-black p-1">Actual</div>
                            <div className="col-span-1 p-1">Charged</div>
                        </div>
                         <div className="grid grid-cols-8 text-center min-h-[10rem]">
                            {lorryReceipt.packages.map((pkg, i) => (
                                <React.Fragment key={i}>
                                    <div className="col-span-1 border-r-2 border-black p-1">{pkg.count}</div>
                                    <div className="col-span-1 border-r-2 border-black p-1">{pkg.packingMethod}</div>
                                    <div className="col-span-4 border-r-2 border-black p-1 text-left">{pkg.description}</div>
                                    <div className="col-span-1 border-r-2 border-black p-1">{pkg.actualWeight}</div>
                                    <div className="col-span-1 p-1">{pkg.chargedWeight}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    {!hideCharges && (
                        <div className="col-span-4">
                            <div className="grid grid-cols-4 text-center font-bold border-b-2 border-black">
                                <div className="col-span-2 border-r-2 border-black p-1"></div>
                                <div className="col-span-2 p-1">AMOUNT TO PAY / PAID</div>
                            </div>
                            <div className="grid grid-cols-4 text-center font-bold border-b-2 border-black">
                                <div className="col-span-2 border-r-2 border-black p-1">Particulars</div>
                                <div className="col-span-1 border-r-2 border-black p-1">Rs.</div>
                                <div className="col-span-1 p-1">P.</div>
                            </div>
                            <div className="min-h-[10rem]">
                                {charges.map(charge => (
                                    <div key={charge.label} className="grid grid-cols-4 border-b-2 border-black h-6 items-center">
                                        <div className="col-span-2 border-r-2 border-black pl-1 h-full">{charge.label}</div>
                                        <div className="col-span-1 border-r-2 border-black pr-1 text-right h-full">{charge.value > 0 ? charge.value.toFixed(2) : ''}</div>
                                        <div className="col-span-1 h-full"></div>
                                    </div>
                                 ))}
                                 <div className="grid grid-cols-4 h-6 items-center">
                                    <div className="col-span-2 border-r-2 border-black h-full"></div>
                                    <div className="col-span-1 border-r-2 border-black h-full"></div>
                                    <div className="col-span-1 h-full"></div>
                                 </div>
                            </div>
                            <div className="grid grid-cols-4 font-bold border-t-2 border-black">
                                <div className="col-span-2 border-r-2 border-black p-1">TOTAL</div>
                                <div className="col-span-1 border-r-2 border-black p-1 text-right">{lorryReceipt.totalAmount.toFixed(2)}</div>
                                <div className="col-span-1 p-1"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="grid grid-cols-5 mt-1">
                    <div className="col-span-3 pr-1 space-y-1">
                        <div className="border border-black p-1"><span className="font-bold">E-Way Bill No.</span> {lorryReceipt.eWayBillNo}</div>
                        <div className="border border-black p-1">
                            <span className="font-bold">Value of Goods Rs.</span> {lorryReceipt.valueGoods.toLocaleString('en-IN')}
                            {lorryReceipt.valueGoods > 0 &&
                                <span className="italic block text-[10px]">
                                    ({numberToWords(lorryReceipt.valueGoods)} Rupees Only)
                                </span>
                            }
                        </div>
                        <p className="text-[10px] italic">Goods accepted for carriage on the terms and conditions printed overleaf.</p>
                    </div>
                    <div className="col-span-2 flex flex-col justify-end items-center">
                        <p className="font-bold mt-8 pt-4 border-t-2 border-black w-full text-center">Signature of the Transport Operator</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export const LorryReceiptPDF: React.FC<LorryReceiptPDFProps> = ({ lorryReceipt, companyInfo }) => {
    
    const [selections, setSelections] = useState(
        copyTypes.map(type => ({
            copyType: type,
            selected: true,
            hideCharges: false,
        }))
    );
    
    const handleSelectionChange = (index: number) => {
        setSelections(prev => prev.map((item, i) => i === index ? { ...item, selected: !item.selected } : item));
    };
    
    const handleHideChargesChange = (index: number) => {
        setSelections(prev => prev.map((item, i) => i === index ? { ...item, hideCharges: !item.hideCharges } : item));
    }

    const selectedCopies = selections.filter(s => s.selected);

    return (
        <div>
            <Card className="mb-4 sticky top-20 z-10">
                 <h3 className="text-xl font-semibold mb-4">Generate Lorry Receipt Copies</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                     {selections.map((item, index) => (
                         <div key={item.copyType} className="border p-4 rounded-lg bg-slate-50">
                            <div className="flex items-center mb-2">
                                <input 
                                    type="checkbox" 
                                    id={`select-${index}`} 
                                    checked={item.selected} 
                                    onChange={() => handleSelectionChange(index)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`select-${index}`} className="ml-3 font-medium text-sm text-gray-700">{item.copyType}</label>
                            </div>
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id={`hide-${index}`} 
                                    checked={item.hideCharges} 
                                    onChange={() => handleHideChargesChange(index)}
                                    disabled={!item.selected}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                                />
                                <label htmlFor={`hide-${index}`} className="ml-3 text-sm text-gray-600">Hide Charges</label>
                            </div>
                         </div>
                     ))}
                 </div>
                 <Button 
                    onClick={() => generateMultiPagePdf('lr-pdf-container', `LR-${lorryReceipt.id}-Copies`)}
                    disabled={selectedCopies.length === 0}
                >
                    Download {selectedCopies.length} {selectedCopies.length === 1 ? 'Copy' : 'Copies'} as PDF
                </Button>
            </Card>
            <div id="lr-pdf-container" className="flex flex-col items-center bg-gray-200 p-8 space-y-8">
                {selectedCopies.map(({ copyType, hideCharges }) => (
                    <LorryReceiptView 
                        key={copyType}
                        lorryReceipt={lorryReceipt} 
                        companyInfo={companyInfo}
                        copyType={copyType}
                        hideCharges={hideCharges}
                    />
                ))}
            </div>
        </div>
    );
}