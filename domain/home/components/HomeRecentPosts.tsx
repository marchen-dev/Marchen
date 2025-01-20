import Image from 'next/image'

export const HomeRecentPosts = () => {
  return (
    <div>
      <h2 className="flex items-center gap-1 text-2xl font-medium">
        <i className="icon-[mingcute--history-line] text-3xl" />
        最新文章
      </h2>
      <ul className="mt-4 grid grid-cols-4 gap-4">
        <li>
          <PostCard />
        </li>
        <li>
          <PostCard />
        </li>
        <li>
          <PostCard />
        </li>
        <li>
          <PostCard />
        </li>
        <li>
          <PostCard />
        </li>
        <li>
          <PostCard />
        </li>
      </ul>
    </div>
  )
}

const content =
  '对于学习 TypeScript 了解类型的逆变、协变、双向协变和不变是很重要的，但你只要明白类型的父子级关系，这些概念理解起来就会容易许多，因此在讲述这些之前我们必须先学会类型的父子级关系。'
export const PostCard = () => {
  const num = Math.floor(Math.random() * (5 - 1 + 1)) + 1
  return (
    <div className="border-gray rounded-2xl border-2 bg-white  drop-shadow-sm">
      <div className="relative h-[155px]">
        <Image src={`/${num}.jpg`} fill className="object-cover" alt="cover" />
      </div>
      <div className="space-y-4 p-3">
        <h4 className="text-2xl font-medium">迟来的 2023 年度总结</h4>
        <p>{content.slice(0, 50)}...</p>
        <div className="flex justify-between">
          <div className="space-x-2">
            <span>Java</span>
            <span>Spring</span>
            <span>后端</span>
          </div>
          <time>2023-11-06</time>
        </div>
      </div>
    </div>
  )
}
