import { HomeCard } from '@base/components/ui/Card'
import Image from 'next/image'

const content = `经历了漫长的假期之后，在 9 月 15 日的时候也是迎来了全新的大学生活，由于是转本班的缘故，我们班上一共有 60 个人，班主任是个男老师，对我们还是挺关心的，这点不错。

考虑到之前职高里面的经历，我没有选择住宿，而是在外租房走读，在泰州每月 1600 整租了一个 90 多平的房子。办了联通 20 元/月 1000M 的宽带，装宽带的小哥比较好说话，成功要到了公网 IP，配合 NAS 方便不少，顺便也跑了下 PCDN，基本每天 3.5 块收益。

至于课程安排，不出乎预料，都是一些水课，上课的时候我就坐在后排写一些自己的项目。

其中兼容 Web 版本尤为烦人，受限于浏览器限制，直到至今 Web 版本也是一个残血的阉割版。`

export const HomeRecommendedPost = () => {
  return (
    <div className="col-span-2 size-full xl:col-span-3">
      <HomeCard className="size-full overflow-hidden p-0">
        <div className="grid size-full grid-cols-3 ">
          <div className="relative h-full">
            <Image src={`/1.jpg`} fill className="object-cover" alt="cover" />
          </div>
          <div className="relative col-span-2 flex flex-col justify-between p-3">
            <div className="space-y-3">
              <h4 className="text-2xl font-medium">迟来的 2023 年度总结</h4>
              <p className="line-clamp-4 text-lg">{content}</p>
            </div>
            <div className="flex justify-between">
              <section className="flex items-center space-x-2 text-secondary">
                <i className="icon-[mingcute--tag-2-line] text-lg" />
                <span>Java</span>
                <span>Spring</span>
                <span>后端</span>
              </section>
              <time className="flex items-center gap-1">
                <i className="icon-[mingcute--time-duration-line] text-lg" />
                2023-11-06
              </time>
            </div>
          </div>
        </div>
      </HomeCard>
    </div>
  )
}
