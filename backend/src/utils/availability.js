import mongoose from 'mongoose';
import Request from '../models/Request.js';

export async function computeAvailableQuantity(equipmentId, equipmentTotalQty, startDate, endDate) {
  const activeStatuses = ['approved', 'issued'];
  const itemId = typeof equipmentId === 'string' ? new mongoose.Types.ObjectId(equipmentId) : equipmentId;
  const overlaps = await Request.aggregate([
    {
        $match: {
            item: itemId,
            status: { $in: activeStatuses },
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) },
        }
    },
    {
        $group: {
            _id: null,
            total: { $sum: '$quantity' }
        }
    }
  ]);
  const booked = overlaps.length ? overlaps[0].total : 0;
  const available = Math.max(0, (equipmentTotalQty || 0) - booked);
  return { booked, available };
}
