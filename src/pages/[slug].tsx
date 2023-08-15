import type { ClientUser } from "~/server/api/helpers/filterUserForClient";
import {
  type NextPage,
  type GetStaticProps,
  type InferGetServerSidePropsType,
} from "next";
import Image from "next/image";
import { PageLayout } from "~/components/layout";
import PostView from "~/components/PostView";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { createSSGHelper } from "~/server/api/helpers/ssg";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfileHead = (props: { user: ClientUser }) => {
  const { user } = props;
  return (
    <div>
      <div className="relative flex h-60 flex-col items-center bg-slate-600 p-8 text-center">
        <Image
          className="absolute bottom-0 -mb-[98px] rounded-full border-8 border-black opacity-100"
          src={user.profilePicture}
          width={196}
          height={196}
          alt="profile-picture"
        />
      </div>
      <div className="h-[98px]" />
      <div className="p-2 text-center">@{user.username}</div>
    </div>
  );
};

const ProfileFeed = (props: { user: ClientUser }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.user.id,
  });

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.length === 0) return <div>User has no posts</div>;

  return (
    <div>
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

type PageProps = InferGetServerSidePropsType<typeof getStaticProps>;
const ProfilePage: NextPage<PageProps> = ({ username }) => {
  const { data: user } = api.profile.getUserByUsername.useQuery({
    username: username,
  });

  if (!user) {
    return <div>404</div>;
  }

  return (
    <>
      <Head>
        <title>{`@${user.username}`}</title>
      </Head>
      <PageLayout>
        <ProfileHead user={user} />
        <ProfileFeed user={user} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createSSGHelper();

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
