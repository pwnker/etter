import { clerkClient } from "@clerk/nextjs";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { type User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/nodejs";

const filerUserForClient = (user: User) => {
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
};

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filerUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);
      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Author for post '${post.id}' is undefined`,
        });
      }

      if (!author.username) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Author.username for post '${post.id}' is undefined`,
        });
      }

      return {
        post,
        author,
      };
    });
  }),
  create: privateProcedure
    .input(
      z.object({
        content: z.string().nonempty(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return post;
    }),
});
