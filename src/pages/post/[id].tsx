import Head from "next/head";
import { PageLayout } from "~/components/layout";

export default function SinglePostPage() {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <PageLayout>
        <div>Single Post Page</div>
      </PageLayout>
    </>
  );
}
