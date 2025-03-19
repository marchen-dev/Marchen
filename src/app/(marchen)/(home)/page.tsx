import { HomeDropDown } from '@domain/home/components/HomeDropDown'
import { HomeFriends } from '@domain/home/components/HomeFriends'
import { HomeLeftColumn } from '@domain/home/components/HomeLeftColumn'
import { HomeRecentPosts } from '@domain/home/components/HomeRecentPosts'
import { HomeRightColumn } from '@domain/home/components/HomeRightColumn'
import { HomeSiteAnalysis } from '@domain/home/components/HomeSiteAnalysis'

export default function Home() {
  return (
    <div className="mx-auto flex min-w-0 max-w-content flex-col overflow-hidden md:px-5 ">
      <HomeInformation />
      <HomeContent />
    </div>
  )
}

const HomeInformation = () => {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center pb-36">
      <div className="grid grid-cols-1 items-center gap-5 px-5 md:grid-cols-2">
        <HomeLeftColumn />
        <HomeRightColumn />
      </div>

      <div className="absolute bottom-10 hidden w-full flex-col items-center gap-6 xl:flex">
        <HomeSiteAnalysis />
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
