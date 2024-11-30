import { PrismaClient } from "@prisma/client";
import { prism } from "../config/db.js";
import moment from "moment";

/** @type {PrismaClient} */
const db = prism;

const generateRecurringSchedule = async () => {
  console.log("\n\x1b[34m[CRON]\x1b[0m Generate Recurring Schedules");

  try {
    const newSchedules = [];

    const schedules = await db.schedule.findMany({
      where: {
        is_locked: true,
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

      if (
        !data.recurring.includes(
          moment().add(1, "day").format("ddd").toLowerCase()
        )
      )
        return;

      if (data.end_date) {
        const diff = moment(data.end_date).diff(moment(data.start_date), "day");
        data.end_date = moment(data.end_date)
          .set({
            date: moment().add(1, "day").date(),
          })
          .add(diff, "day")
          .toDate();
      }

      data.start_date = moment(data.start_date)
        .set({
          date: moment().add(1, "day").date(),
        })
        .toDate();
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
