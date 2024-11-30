import { BalanceType, PrismaClient } from "@prisma/client";
import { prism } from "../config/db.js";
import moment from "moment";
import { ClientScheduleStatus } from "../core/schedule/schedule.validator.js";

/** @type {PrismaClient} */
const db = prism;

const releaseSpecialistSalary = async () => {
  console.log("\n\x1b[34m[CRON]\x1b[0m Daily Release Specialist Salary");

  try {
    const start = moment().subtract(1, "day").startOf("day"),
      end = moment().subtract(1, "day").endOf("day");

    const schedules = await db.schedule.findMany({
      where: {
        OR: [
          {
            end_date: {
              gte: start.toDate(),
              lte: end.toDate(),
            },
          },
        ],
      },
      include: {
        doctors: {
          select: {
            id: true,
            category: true,
            first_name: true,
            last_name: true,
            services: true,
          },
        },
        clients: {
          where: {
            OR: [{ status: null }, { status: ClientScheduleStatus.PRESENT }],
          },
        },
      },
    });

    const doctors = [];
    schedules.forEach((sc) => {
      if (!sc.clients?.length) return;

      sc.doctors.forEach((doc) => {
        const salary = doc.services.filter(
          (s) => s.service_id == sc.service_id
        );
        if (salary.length) {
          doctors.push({
            name: `${doc.category} - ${doc.first_name} ${doc.last_name}`,
            balance: {
              title: `Bayaran jadwal ${sc.title.toLowerCase()} - ${moment(sc.end_date).format("DD/MM/YYYY")}`,
              amount: salary[0].salary,
              holder: doc.id,
              type: BalanceType.IN,
            },
          });
        }
      });
    });

    const total = doctors.reduce((a, c) => (a += c.balance.amount), 0);
    if (doctors.length) {
      await db.balance.createMany({
        data: [
          {
            title: `Bayaran ${doctors.length} spesialis - ${moment().subtract(1, "day").format("DD/MM/YYYY")}`,
            amount: total,
            holder: "system",
            type: BalanceType.OUT,
          },
          ...doctors.map((doc) => doc.balance),
        ],
      });
      doctors.forEach((doc) => {
        console.log(`\x1b[32m+Rp${doc.balance.amount}\x1b[0m\t${doc.name} `);
      });
      console.log(`\x1b[31m-Rp${total}\x1b[0m\tSystem`);
    } else {
      console.log("NONE");
    }
  } catch (error) {
    console.error(error);
  }
};

export { releaseSpecialistSalary };
