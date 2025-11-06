import cron from 'node-cron';
import Request from '../models/Request.js';
import Notification from '../models/Notification.js';

export default function startOverdueJob() {
  const schedule = process.env.CRON_SCHEDULE || '0 9 * * *'; // default 9am daily
  console.log('Starting overdue cron with schedule:', schedule);
  cron.schedule(schedule, async () => {
    try {
      const now = new Date();
      const toMark = await Request.find({ 
        status: 'issued',
        endDate: { $lt: now }
      }).populate('item', 'name');
      for (const r of toMark) {
        r.status = 'overdue';
        await r.save();
        await Notification.create({
          user: r.requester,
          title: 'Overdue equipment',
          message: `Your booking for "${r.item?.name ?? 'item'}" is overdue. Please return immediately.`
        });
      }
      if (toMark.length) console.log(`Marked ${toMark.length} request(s) overdue.`);
    } catch (err) {
      console.error('Overdue cron error', err);
    }
  });
}
