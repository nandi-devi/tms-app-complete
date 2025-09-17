import { z } from 'zod';
import { GstType, GstPayableBy, InvoiceStatus, LorryReceiptStatus, PaymentType, PaymentMode } from '../types';

export const paginationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const invoiceListQuerySchema = paginationQuerySchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customerId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const lrListQuerySchema = paginationQuerySchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customerId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const createInvoiceSchema = z.object({
  invoiceNumber: z.number().positive().optional(),
  customer: z.string().min(1),
  lorryReceipts: z.array(z.string().min(1)).min(1),
  date: z.string().min(1),
  totalAmount: z.number().nonnegative(),
  gstType: z.nativeEnum(GstType),
  cgstRate: z.number().nonnegative(),
  sgstRate: z.number().nonnegative(),
  igstRate: z.number().nonnegative(),
  cgstAmount: z.number().nonnegative(),
  sgstAmount: z.number().nonnegative(),
  igstAmount: z.number().nonnegative(),
  grandTotal: z.number().nonnegative(),
  isRcm: z.boolean().optional(),
  isManualGst: z.boolean().optional(),
  remarks: z.string().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const createLrSchema = z.object({
  lrNumber: z.number().positive().optional(),
  date: z.string().min(1),
  consignor: z.string().min(1),
  consignee: z.string().min(1),
  vehicle: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  packages: z.array(z.object({
    count: z.number().positive(),
    packingMethod: z.string().min(1),
    description: z.string().min(1),
    actualWeight: z.number().nonnegative(),
    chargedWeight: z.number().nonnegative(),
  })).min(1),
  charges: z.object({
    freight: z.number().nonnegative().default(0),
    aoc: z.number().nonnegative().default(0),
    hamali: z.number().nonnegative().default(0),
    bCh: z.number().nonnegative().default(0),
    trCh: z.number().nonnegative().default(0),
    detentionCh: z.number().nonnegative().default(0),
  }),
  totalAmount: z.number().nonnegative(),
  eWayBillNo: z.string().optional(),
  valueGoods: z.number().optional(),
  gstPayableBy: z.nativeEnum(GstPayableBy),
  reportingDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  insurance: z.object({
    hasInsured: z.boolean().default(false),
    company: z.string().optional(),
    policyNo: z.string().optional(),
    date: z.string().optional(),
    amount: z.number().optional(),
    risk: z.string().optional(),
  }).optional(),
  invoiceNo: z.string().optional(),
  sealNo: z.string().optional(),
});

export const updateLrSchema = createLrSchema.partial();

export const createPaymentSchema = z.object({
  invoiceId: z.string().optional(),
  truckHiringNoteId: z.string().optional(),
  customer: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().min(1),
  type: z.nativeEnum(PaymentType),
  mode: z.nativeEnum(PaymentMode),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => data.invoiceId || data.truckHiringNoteId, {
  message: 'Either invoiceId or truckHiringNoteId is required',
});

export const updatePaymentSchema = createPaymentSchema.partial();

export const createTruckHiringNoteSchema = z.object({
  date: z.string().min(1),
  truckNumber: z.string().min(1),
  truckType: z.string().min(1),
  vehicleCapacity: z.number().positive(),
  loadingLocation: z.string().min(1),
  unloadingLocation: z.string().min(1),
  loadingDateTime: z.string().min(1),
  expectedDeliveryDate: z.string().min(1),
  goodsType: z.string().min(1),
  agencyName: z.string().min(1),
  truckOwnerName: z.string().min(1),
  truckOwnerContact: z.string().optional(),
  freightRate: z.number().nonnegative(),
  freightRateType: z.string().min(1),
  advanceAmount: z.number().nonnegative().optional(),
  paymentMode: z.string().min(1),
  paymentTerms: z.string().min(1),
  additionalCharges: z.number().nonnegative().optional(),
  remarks: z.string().optional(),
  linkedLR: z.string().optional(),
  linkedInvoice: z.string().optional(),
});

export const updateTruckHiringNoteSchema = createTruckHiringNoteSchema.partial();

export const createPromissoryNoteSchema = z.object({
  supplier: z.string().min(1),
  amount: z.number().positive(),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  paymentTerms: z.string().optional(),
  isPaid: z.boolean().optional(),
});

export const updatePromissoryNoteSchema = createPromissoryNoteSchema.partial();

export const podUploadSchema = z.object({
  receiverName: z.string().min(1),
  receiverPhone: z.string().optional(),
  remarks: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  recordedBy: z.string().optional(),
});

export const backupDataSchema = z.object({
  customers: z.array(z.any()),
  vehicles: z.array(z.any()),
  lorryReceipts: z.array(z.any()),
  invoices: z.array(z.any()),
  truckHiringNotes: z.array(z.any()),
  payments: z.array(z.any()),
  counters: z.array(z.any()),
  numberingConfigs: z.array(z.any()),
});


