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
import servicePriceRouter from "./core/serviceprice/serviceprice.router.js";
import privilegeRouter from "./core/privilege/privilege.router.js";
import signatureRouter from "./core/signature/signature.router.js";
import scheduleattendeeRouter from "./core/scheduleattendee/scheduleattendee.router.js";
import servicefeeRouter from "./core/servicefee/servicefee.router.js";
import settingRouter from "./core/setting/setting.router.js";
import daycarebookingRouter from "./core/daycarebooking/daycarebooking.router.js";
import daycarepriceRouter from "./core/daycareprice/daycareprice.router.js";
import daycarelinkbookRouter from "./core/daycarelinkbook/daycarelinkbook.router.js";
import daycareshortreportRouter from "./core/daycareshortreport/daycareshortreport.router.js";
import feetagRouter from "./core/feetag/feetag.router.js";
import daycareactivityRouter from "./core/daycareactivity/daycareactivity.router.js";
import apikeyRouter from "./core/apikey/apikey.router.js";
import publicapiRouter from "./core/publicapi/publicapi.router.js";

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
r.use("/service-price", servicePriceRouter);
r.use("/privilege", privilegeRouter);
r.use("/signature", signatureRouter);
r.use("/schedule-attendee", scheduleattendeeRouter);
r.use("/service-fee", servicefeeRouter);
r.use("/setting", settingRouter);
r.use("/daycare-booking", daycarebookingRouter);
r.use("/daycare-price", daycarepriceRouter);
r.use("/daycare-linkbook", daycarelinkbookRouter);
r.use("/daycare-short-report", daycareshortreportRouter);
r.use("/daycare-activity", daycareactivityRouter);
r.use("/fee-tag", feetagRouter);
r.use("/apikey", apikeyRouter);
r.use("/public-api", publicapiRouter);

const appRouter = r;
export default appRouter;
