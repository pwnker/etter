import Image from "next/image";
import Link from "next/link";
import { type RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

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

export default PostView;
