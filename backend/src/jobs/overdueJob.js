import cron from 'node-cron';
import Request from '../models/Request.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export default function startOverdueJob() {
    const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';
    console.log('Starting overdue cron with schedule:', schedule);

    cron.schedule(schedule, async () => {
        try {
            const now = new Date();

            const toMark = await Request.find({
                status: 'issued',
                endDate: { $lt: now }
            })
                .populate('item', 'name').populate('requester', 'name email');

            if (!toMark.length) return;

            const admins = await User.find({ role: 'admin' }, '_id name');

            for (const r of toMark) {
                r.status = 'overdue';
                await r.save();

                await Notification.create({
                    user: r.requester._id,
                    title: 'Overdue equipment',
                    message: `Your booking for "${r.item?.name ?? 'item'}" is overdue. Please return it immediately.`
                });

                for (const admin of admins) {
                    await Notification.create({
                        user: admin._id,
                        title: 'Overdue item alert',
                        message: `Equipment "${r.item?.name ?? 'item'}" borrowed by ${r.requester?.name ?? 'a student'} is overdue and needs to be returned.`
                    });
                }}
            console.log(`Marked ${toMark.length} request(s) as overdue and sent notifications.`);
        } catch (err) {
            console.error('Overdue cron error', err);
        }
    });
}
