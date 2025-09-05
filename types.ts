export enum LorryReceiptStatus {
  CREATED = 'Created',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  INVOICED = 'Invoiced',
  PAID = 'Paid',
}

export enum GstPayableBy {
  CONSIGNOR = 'Consignor',
  CONSIGNEE = 'Consignee',
  TRANSPORTER = 'Transporter',
}

export enum GstType {
    CGST_SGST = 'CGST/SGST',
    IGST = 'IGST',
}

export enum PaymentType {
    ADVANCE = 'Advance',
    RECEIPT = 'Receipt',
}

export enum PaymentMode {
    CASH = 'Cash',
    CHEQUE = 'Cheque',
    NEFT = 'NEFT',
    RTGS = 'RTGS',
    UPI = 'UPI',
}

export interface Customer {
  _id: string;
  id: string;
  name: string; // Legal Name of Business
  tradeName?: string;
  address: string;
  state:string;
  gstin: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface Vehicle {
  _id: string;
  id: string;
  number: string;
}

export interface LorryReceipt {
  _id: string;
  id: string;
  date: string;
  reportingDate?: string;
  deliveryDate?: string;
  consignorId: string;
  consigneeId: string;
  vehicleId: string;
  from: string;
  to: string;
  packages: {
    count: number;
    packingMethod: string;
    description: string;
    actualWeight: number;
    chargedWeight: number;
  }[];
  charges: {
    freight: number;
    aoc: number;
    hamali: number;
    bCh: number;
    trCh: number;
    detentionCh: number;
  };
  totalAmount: number;
  eWayBillNo: string;
  valueGoods: number;
  gstPayableBy: GstPayableBy;
  status: LorryReceiptStatus;
  insurance: {
      hasInsured: boolean;
      company?: string;
      policyNo?: string;
      date?: string;
      amount?: number;
      risk?: string;
  },
  invoiceNo: string;
  sealNo: string;
}

export interface Invoice {
  _id: string;
  id: string;
  date: string;
  customerId: string;
  lorryReceipts: LorryReceipt[];
  totalAmount: number; // This will now act as the subtotal (taxable amount)
  remarks: string;
  gstType: GstType;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  isRcm: boolean; // Reverse Charge Mechanism
  isManualGst: boolean;
}

export interface CompanyInfo {
    name: string;
    address: string;
    state: string;
    phone1: string;
    phone2: string;
    email: string;
    website: string;
    gstin: string;
    pan: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
}

export interface Payment {
    _id: string;
    id: string;
    customerId: string;
    date: string;
    amount: number;
    type: PaymentType;
    mode: PaymentMode;
    referenceNo?: string;
    notes?: string;
}