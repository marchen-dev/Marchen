import { HomeDropDown } from '@domain/home/components/HomeDropDown'
import { HomeMasterInfo } from '@domain/home/components/HomeMasterInfo'
import { HomePostCategories } from '@domain/home/components/HomePostCategories'
import { HomeRecentPosts } from '@domain/home/components/HomeRecentPosts'
import { HomeRecommendedPost } from '@domain/home/components/HomeRecommendedPost'
import { HomeSiteData } from '@domain/home/components/HomeSiteData'

export default function Home() {
  return (
    <div className="mx-auto flex min-w-0 max-w-[1350px] flex-col overflow-hidden md:px-5 ">
      <HomeInformation />
      <HomeContent />
    </div>
  )
}

const HomeInformation = () => {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col">
      <div className="flex flex-1 items-center">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4 ">
          <HomeMasterInfo />
          <HomeRecommendedPost />
          <HomeSiteData />
          <HomePostCategories />
        </div>
      </div>
      <HomeDropDown />
    </section>
  )
}

const HomeContent = () => {
  return (
    <section className="mt-8">
      <HomeRecentPosts />
    </section>
  )
}
