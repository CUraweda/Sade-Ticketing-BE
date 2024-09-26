import { prism } from "../../config/db.js";
import { BookingStatus } from "../../core/booking/booking.validator.js";
import { InvoiceStatus } from "../../core/invoice/invoice.validator.js";

const upBookingStatusOnUpdateManyInvoice = async ({ args, query }) => {
  const result = await query(args);

  // update booking
  try {
    await prism.booking.updateMany({
      where: {
        status: BookingStatus.NEED_PAYMENT,
        invoices: {
          some: {
            id: {
              in: args.where.id.in ?? args.where.id ?? [],
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
  } catch {}

  return result;
};

export { upBookingStatusOnUpdateManyInvoice };
