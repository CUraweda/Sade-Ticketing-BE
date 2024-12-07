import { Router } from "express";
import authRouter from "./core/auth/auth.router.js";
import bankaccountRouter from "./core/bankaccount/bankaccount.router.js";
import bookingRouter from "./core/booking/booking.router.js";
import clientRouter from "./core/client/client.router.js";
import doctorRouter from "./core/doctor/doctor.router.js";
import locationRouter from "./core/location/location.router.js";
import paymentsRouter from "./core/payments/payments.router.js";
import questionRouter from "./core/question/question.router.js";
import questionnaireRouter from "./core/questionnaire/questionnaire.router.js";
import roleRouter from "./core/role/role.router.js";
import scheduleRouter from "./core/schedule/schedule.router.js";
import serviceRouter from "./core/service/service.router.js";
import servicecategoryRouter from "./core/servicecategory/servicecategory.router.js";
import serviceRecommendation from "./core/servicerecommendation/servicerecommendation.router.js";
import specialismRouter from "./core/specialism/specialism.router.js";
import userRouter from "./core/user/user.router.js";
import userFile from "./core/userfile/userfile.router.js";
import rescheduleRouter from "./core/reschedulerequest/reschedulerequest.router.js";
import invoiceRouter from "./core/invoice/invoice.router.js";
import feeRouter from "./core/fee/fee.router.js";
import questionnaireresponseRouter from "./core/questionnaireresponse/questionnaireresponse.router.js";
import dashboardRouter from "./core/dashboard/dashboard.router.js";
import daycarejournalRouter from "./core/daycarejournal/daycarejournal.router.js";
import daycarelogtimeRouter from "./core/daycarelogtime/daycarelogtime.router.js";
import documentRouter from "./core/document/document.router.js";
import notificationRouter from "./core/notification/notification.router.js";
import doctorgradeRouter from "./core/doctorgrade/doctorgrade.router.js";
import doctorserviceRouter from "./core/doctorservice/doctorservice.router.js";
import balanceRouter from "./core/balance/balance.router.js";
import chatroomRouter from "./core/chatroom/chatroom.router.js";
import chatRouter from "./core/chat/chat.router.js";
import clientprivilegeRouter from "./core/clientprivilege/clientprivilege.router.js";

const r = Router();

r.use("/auth", authRouter);
r.use("/role", roleRouter);
r.use("/user", userRouter);
r.use("/doctor", doctorRouter);
r.use("/specialism", specialismRouter);
r.use("/location", locationRouter);
r.use("/service", serviceRouter);
r.use("/service-category", servicecategoryRouter);
r.use("/client", clientRouter);
r.use("/questionnaire", questionnaireRouter);
r.use("/questionnaire-response", questionnaireresponseRouter);
r.use("/question", questionRouter);
r.use("/book", bookingRouter);
r.use("/payment", paymentsRouter);
r.use("/bank-account", bankaccountRouter);
r.use("/schedule", scheduleRouter);
r.use("/service-recommendation", serviceRecommendation);
r.use("/user-file", userFile);
r.use("/reschedule", rescheduleRouter);
r.use("/invoice", invoiceRouter);
r.use("/fee", feeRouter);
r.use("/dashboard", dashboardRouter);
r.use("/daycare-journal", daycarejournalRouter);
r.use("/daycare-log-time", daycarelogtimeRouter);
r.use("/document", documentRouter);
r.use("/notification", notificationRouter);
r.use("/doctor-grade", doctorgradeRouter);
r.use("/doctor-service", doctorserviceRouter);
r.use("/balance", balanceRouter);
r.use("/chat-room", chatroomRouter);
r.use("/chat", chatRouter);
r.use("/client-privilege", clientprivilegeRouter);

const appRouter = r;
export default appRouter;
