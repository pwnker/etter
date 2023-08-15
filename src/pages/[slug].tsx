import Head from "next/head";
import { api } from "~/utils/api";

type PageProps = InferGetServerSidePropsType<typeof getStaticProps>;
const ProfilePage: NextPage<PageProps> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username: username,
  });

  if (!data) {
    return <div>404</div>;
  }

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <PageLayout>
        <div className="relative flex h-60 flex-col items-center bg-slate-600 p-8 text-center">
          <Image
            className="absolute bottom-0 -mb-[98px] rounded-full border-8 border-black opacity-100"
            src={data.profilePicture}
            width={196}
            height={196}
            alt="profile-picture"
          />
        </div>
        <div className="h-[98px]" />
        <div className="p-2 text-center">@{data.username}</div>
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import SuperJSON from "superjson";
import {
  type NextPage,
  type GetStaticProps,
  type InferGetServerSidePropsType,
} from "next";
import Image from "next/image";
import { PageLayout } from "~/components/layout";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: SuperJSON,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username: username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
