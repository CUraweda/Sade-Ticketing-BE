import cors from "cors";
import express from "express";
import appRouter from "./router.js";
import httpStatus from "http-status";

const app = express();

// CORS
if (process.env.CORS_MODE === 'open') {
  app.use(cors());
  app.options('*', cors());
} else {
  app.use(cors({ origin: false }));
  app.options('*', cors({ origin: false }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res
    .status(200)
    .send(`Congratulations! API is working in port ${process.env.PORT}`);
});
app.use("/api", appRouter);
app.use("/public", express.static("public"));

app.use((req, res, next) => {
  res.status(httpStatus.NOT_FOUND).json({
    message: "Ticketing - path not found",
  });
});

export default app;
