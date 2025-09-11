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


