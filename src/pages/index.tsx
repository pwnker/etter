import type { RouterOutputs } from "~/utils/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Try again later.");
      }
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.imageUrl}
        alt="profile image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="Type some emojis!"
        className="w-full bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      {!isPosting && input !== "" && (
        <button disabled={isPosting} onClick={() => mutate({ content: input })}>
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex flex-col justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div
      key={post.id}
      className="mt-4  flex w-full flex-col gap-3 border-b border-slate-400 p-4"
    >
      <pre className="flex gap-2">
        <Image
          src={author.profilePicture}
          alt="profile-picture"
          width={56}
          height={56}
          className="flex h-14 w-14 rounded-full"
        />
        <span className="flex flex-col">
          <Link href={`/@${author.username}`}>
            <span>@{author.username}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin opacity-80">
              {dayjs(post.createdAt).fromNow()}
            </span>
          </Link>
        </span>
      </pre>
      <span className="text-2xl">{post.content}</span>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) {
    return (
      <div className="absolute inset-0 m-auto h-fit w-fit">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return <div>Something went wrong</div>;
  }

  return (
    <div className="flex flex-col-reverse">
      {data.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <PageLayout>
        <div className="flex rounded-lg border-2 border-slate-400 p-4">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {isSignedIn && <CreatePostWizard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
}
