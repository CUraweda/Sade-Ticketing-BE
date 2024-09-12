import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const path = "prisma/seeder/data";

async function seedDatabase() {
  let files = [];

  try {
    files = await fs.readdir(path);
  } catch (error) {
    console.error("ERR(read seeder data):", error);
    return;
  }

  try {
    for (let file of files) {
      const jsonFile = await fs.readFile(path + "/" + file, "utf8");
      const data = JSON.parse(jsonFile);

      for (const dat of data) {
        const keys = Object.keys(dat);
        if (keys.includes("password")) {
          const salt = await bcrypt.genSalt();
          dat["password"] = await bcrypt.hash(dat["password"], salt);
        }

        try {
          await prisma[file.split("_")[1].split(".")[0]].create({
            data: dat,
          });
          console.log("DONE: seed " + file);
        } catch (error) {
          if (error.code === "P2002") {
            console.warn(
              `ERR(seed): Unique constraint violation on ${file} (SKIPPED)`
            );
          } else {
            throw error;
          }
        }
      }
    }
  } catch (error) {
    console.error("ERR(seed):", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
