import { prism } from "../../config/db.js";
import { BookingStatus } from "../../core/booking/booking.validator.js";
import { InvoiceStatus } from "../../core/invoice/invoice.validator.js";

const upBookingStatusOnUpdateInvoice = async ({ args, query }) => {
  const result = await query(args);

  // update booking
  try {
    await prism.booking.updateMany({
      where: {
        status: BookingStatus.NEED_PAYMENT,
        invoices: {
          some: {
            id: {
              in: args.where.id?.in
                ? args.where.id.in
                : args.where.id
                  ? [args.where.id]
                  : [],
            },
          },
          every: {
            status: InvoiceStatus.PAID,
          },
        },
      },
      data: {
        status: BookingStatus.NEED_APPROVAL,
      },
    });
    await prism.booking.updateMany({
      where: {
        invoices: {
          some: {
            id: {
              in: args.where.id?.in
                ? args.where.id.in
                : args.where.id
                  ? [args.where.id]
                  : [],
            },
            status: InvoiceStatus.ISSUED,
          },
        },
      },
      data: {
        status: BookingStatus.NEED_PAYMENT,
      },
    });
  } catch (err) {
    console.log(err);
  }

  return result;
};

export { upBookingStatusOnUpdateInvoice };
