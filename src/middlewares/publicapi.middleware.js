import bcrypt from "bcrypt";
import { prism } from "../config/db.js";
import {
  catchResponse,
  Forbidden,
  Unauthenticated,
} from "../lib/response/catch.js";

/** @type {PrismaClient} */
const db = prism;

const publicApiMiddleware = () => async (req, res, next) => {
  try {
    const apiKey = req.header("x-api-key");
    if (!apiKey) throw new Unauthenticated("API key required");

    const keyEntry = await db.apiKey.findMany({ where: { status: "active" } });

    const validKey = keyEntry.find(
      async (entry) => await bcrypt.compare(apiKey, entry.key)
    );
    if (!validKey) throw new Forbidden("Invalid API key");

    next();
  } catch (error) {
    catchResponse(error, req, res);
  }
};

export default publicApiMiddleware;
