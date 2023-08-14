import { clerkClient } from "@clerk/nextjs";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { type User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";

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
});
