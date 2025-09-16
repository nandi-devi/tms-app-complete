import { z } from 'zod';

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
  customerId: z.string().min(1),
  lorryReceipts: z.array(z.object({ _id: z.string().min(1) })).min(1),
  date: z.string().min(1),
  totalAmount: z.number().nonnegative(),
  gstType: z.string(),
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
  date: z.string().min(1),
  consignorId: z.string().min(1),
  consigneeId: z.string().min(1),
  vehicleId: z.string().min(1),
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
  gstPayableBy: z.string().min(1),
});

export const updateLrSchema = createLrSchema.partial();

export const createPaymentSchema = z.object({
  invoiceId: z.string().optional(),
  truckHiringNoteId: z.string().optional(),
  amount: z.number().positive(),
  date: z.string().min(1),
  paymentMethod: z.string().min(1),
  remarks: z.string().optional(),
}).refine(data => data.invoiceId || data.truckHiringNoteId, {
  message: 'Either invoiceId or truckHiringNoteId is required',
});

export const updatePaymentSchema = createPaymentSchema.partial();

export const createTruckHiringNoteSchema = z.object({
  date: z.string().min(1),
  truckOwnerName: z.string().min(1),
  truckOwnerAddress: z.string().optional(),
  truckOwnerPhone: z.string().optional(),
  truckNumber: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  freight: z.number().nonnegative(),
  advancePaid: z.number().nonnegative(),
  remarks: z.string().optional(),
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


