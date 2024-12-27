import ScheduleService from "../core/schedule/schedule.service.js";
import moment from "moment";

const createRepeatSchedules = async () => {
  console.log("\n\x1b[34m[CRON]\x1b[0m Create Repeat Schedules");

  const scheduleService = new ScheduleService();

  const start = moment().startOf("month").startOf("day"),
    end = moment().endOf("month").endOf("day");

  try {
    const count = await scheduleService.createRepeats([], start, end);
    console.log(`- New schedules: ${count}`);
  } catch (error) {
    console.error(error);
  }
};

export { createRepeatSchedules };
