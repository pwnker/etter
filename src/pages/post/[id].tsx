import {
  type NextPage,
  type GetStaticProps,
  type InferGetServerSidePropsType,
} from "next";
import { PageLayout } from "~/components/layout";
import { createSSGHelper } from "~/server/api/helpers/ssg";
import Head from "next/head";
import { api } from "~/utils/api";
import PostView from "~/components/PostView";

type PageProps = InferGetServerSidePropsType<typeof getStaticProps>;
const PostPage: NextPage<PageProps> = ({ id }) => {
  const { data: fullPost } = api.posts.getSinglePost.useQuery({
    postId: id,
  });

  if (!fullPost) {
    return <div>404</div>;
  }

  return (
    <>
      <Head>
        <title>{`${fullPost.post.content} - @${fullPost.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...fullPost} key={fullPost.post.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.posts.getSinglePost.prefetch({ postId: id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default PostPage;
