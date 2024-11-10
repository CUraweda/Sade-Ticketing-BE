import { PrismaClient } from "@prisma/client";
import { prism } from "../config/db.js";
import moment from "moment";
import { BookingStatus } from "../core/booking/booking.validator.js";

/** @type {PrismaClient} */
const db = prism;

const updateBookingComplete = async () => {
  const now = moment();

  try {
    const bookingsOngoing = await db.booking.findMany({
      where: {
        status: BookingStatus.ONGOING,
      },
      select: {
        id: true,
        schedules: {
          select: {
            id: true,
            start_date: true,
            end_date: true,
          },
          orderBy: {
            start_date: "desc",
          },
          take: 1,
        },
      },
    });

    const bookingsComplete = bookingsOngoing.filter(
      (b) =>
        b.schedules.length &&
        moment(now).isAfter(
          b.schedules[0].end_date ?? b.schedules[0].start_date
        )
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
      `\n/cron/update-booking-complete.js\n====== Reservasi ======\nBerlangsung: ${bookingsOngoing.length} \nSelesai: ${bookingsComplete.length}`
    );
  } catch {}
};

export default updateBookingComplete;