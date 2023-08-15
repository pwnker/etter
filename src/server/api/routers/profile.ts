import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import filterUserForClient from "../helpers/filterUserForClient";

const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${input.username} not found`,
        });
      }

      return filterUserForClient(user);
    }),
  getClientUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await clerkClient.users.getUser(input.id);
      return filterUserForClient(user);
    }),
});

export default profileRouter;
