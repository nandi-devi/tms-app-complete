import TruckHiringNote from '../models/truckHiringNote';
import Payment from '../models/payment';
import { THNStatus } from '../../types.js';

export const updateThnStatus = async (thnId: string) => {
  try {
    const thn = await TruckHiringNote.findById(thnId);
    if (!thn) {
      console.log(`TruckHiringNote with ID ${thnId} not found for status update.`);
      return;
    }

    const payments = await Payment.find({ truckHiringNoteId: thnId });
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    let newStatus: THNStatus;
    if (totalPaid >= thn.freight) {
      newStatus = THNStatus.PAID;
    } else if (totalPaid > 0) {
      newStatus = THNStatus.PARTIALLY_PAID;
    } else {
      newStatus = THNStatus.UNPAID;
    }

    thn.paidAmount = totalPaid;
    thn.balancePayable = thn.freight - totalPaid;
    thn.status = newStatus;

    await thn.save();

  } catch (error) {
    console.error(`Failed to update status for THN ${thnId}:`, error);
  }
};
