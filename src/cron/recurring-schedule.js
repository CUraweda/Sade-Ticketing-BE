import { PrismaClient } from "@prisma/client";
import { prism } from "../config/db.js";
import { ScheduleRecurring } from "../core/schedule/schedule.validator.js";
import moment from "moment";

/** @type {PrismaClient} */
const db = prism;

const generateRecurringSchedule = async () => {
  console.log("\n[CRON] Generate Recurring Schedules");

  try {
    const newSchedules = [];

    const schedules = await db.schedule.findMany({
      where: {
        recurring: {
          not: null,
        },
      },
      include: {
        clients: true,
        doctors: true,
        bookings: true,
      },
    });

    schedules.forEach((sc) => {
      const data = sc;

      const current = moment();

      if (data.recurring == ScheduleRecurring.WEEKLY) {
        const diff = moment(current)
          .add(1, "days")
          .diff(data.start_date, "days");
        if (diff % 7 != 0) return;

        data.start_date = moment(data.start_date)
          .add(diff + 7, "days")
          .toDate();
        data.end_date = data.end_date
          ? moment(data.end_date)
              .add(diff + 7, "days")
              .toDate()
          : null;
      }

      data.parent_id = data.id;
      data.recurring = null;
      data.clients = {
        createMany: {
          data: data.clients.map((c) => ({ client_id: c.client_id })),
        },
      };
      data.doctors = {
        connect: data.doctors.map((d) => ({ id: d.id })),
      };
      data.bookings = {
        connect: data.bookings.map((b) => ({ id: b.id })),
      };

      delete data.id;

      newSchedules.push(sc);
    });

    let createdCount = 0;
    for (const sch of newSchedules) {
      try {
        await db.schedule.create({
          data: sch,
        });
        createdCount++;
      } catch {}
    }

    console.log(`- New schedules: ${createdCount}`);
  } catch (error) {
    console.error(error);
  }
};

export { generateRecurringSchedule };
