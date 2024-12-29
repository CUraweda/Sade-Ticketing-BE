import { PrismaClient } from "@prisma/client";
import { prism } from "../config/db.js";
import moment from "moment";
import { BookingStatus } from "../core/booking/booking.validator.js";

/** @type {PrismaClient} */
const db = prism;

const updateBookingComplete = async () => {
  console.log(`\n\x1b[34m[CRON]\x1b[0m Update Bookings Completed`);
  const now = moment();

  try {
    const bookingsOngoing = await db.booking.findMany({
      where: {
        status: BookingStatus.ONGOING,
      },
      select: {
        id: true,
        quantity: true,
        _count: {
          select: {
            schedules: {
              where: { is_blocked: false },
            },
          },
        },
      },
    });

    const bookingsComplete = bookingsOngoing.filter(
      (b) => b._count.schedules >= b.quantity
    );

    await db.booking.updateMany({
      where: {
        id: {
          in: bookingsComplete.map((b) => b.id),
        },
      },
      data: {
        status: BookingStatus.COMPLETED,
      },
    });

    console.log(
      `- Ongoing bookings: ${bookingsOngoing.length} \n- Completed bookings: ${bookingsComplete.length}`
    );
  } catch (err) {
    console.log(err);
  }
};

export default updateBookingComplete;
