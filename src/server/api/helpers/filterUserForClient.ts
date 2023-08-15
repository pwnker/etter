import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";

export type ClientUser = {
  id: string;
  username: string;
  profilePicture: string;
};

export default function filterUserForClient(user: User) {
  if (!user.username) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Username for user '${user.id}' is undefined`,
    });
  }
  return {
    id: user.id,
    username: user.username,
    profilePicture: user.imageUrl,
  };
}
