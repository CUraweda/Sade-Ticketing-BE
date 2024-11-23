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
        data.parent_id = data.id;
        data.recurring = null;
      }

      delete data.id;

      newSchedules.push(sc);
    });

    const res = await db.schedule.createMany({
      data: newSchedules,
      skipDuplicates: true,
    });

    console.log(`- New schedules: ${res.count}`);
  } catch (error) {
    console.error(error);
  }
};

export { generateRecurringSchedule };
