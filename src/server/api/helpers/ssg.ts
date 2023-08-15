import { prisma } from "~/server/db";
import { appRouter } from "../root";
import SuperJSON from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";

export const createSSGHelper = () => {
  return createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: SuperJSON,
  });
};
