import { HomeDropDown } from '~/modules/home/components/HomeDropDown'
import { HomeFriends } from '~/modules/home/components/HomeFriends'
import { HomeLeftColumn } from '~/modules/home/components/HomeLeftColumn'
import { HomeRecentPosts } from '~/modules/home/components/HomeRecentPosts'
import { HomeRightColumn } from '~/modules/home/components/HomeRightColumn'

export default function Home() {
  return (
    <div className="mx-auto flex min-w-0 max-w-wider flex-col overflow-hidden lg:px-7 ">
      <HomeInformation />
      <HomeContent />
    </div>
  )
}

const HomeInformation = () => {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center pb-12">
      <div className="grid grid-cols-1 items-center gap-10  lg:grid-cols-2 lg:gap-20">
        <HomeLeftColumn />
        <HomeRightColumn />
      </div>

      <div className="absolute bottom-10 hidden w-full flex-col items-center gap-6 xl:flex">
        <HomeDropDown />
      </div>
    </section>
  )
}

const HomeContent = () => {
  return (
    <section className="mt-5 flex flex-col gap-14">
      <HomeRecentPosts />
      <HomeFriends />
    </section>
  )
}
