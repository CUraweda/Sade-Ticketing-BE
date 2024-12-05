import { getSocket } from "../../socket/index.js";

const sendNotif = async ({ args, query }) => {
  const result = await query({
    ...args,
    include: {
      users: true,
    },
  });

  if (result.users.length) {
    const io = getSocket();
    if (io) io.to(result.users.map((u) => u.user_id)).emit("new_notif");
  }

  return result;
};

export { sendNotif };
