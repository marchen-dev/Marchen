import { HomeMasterInfo } from '@domain/home/components/HomeMasterInfo'
import { HomeRecentPosts } from '@domain/home/components/HomeRecentPosts'
import { HomeRecommendedPost } from '@domain/home/components/HomeRecommendedPost'
import { HomeSiteData } from '@domain/home/components/HomeSiteData'

export default function Home() {
  return (
    <div className="mx-auto mt-2 min-w-0 max-w-7xl overflow-hidden">
      <HomeInformation />
      <HomeContent />
    </div>
  )
}

const HomeInformation = () => {
  return (
    <section className="grid grid-cols-4 items-center gap-4">
      <HomeMasterInfo />
      <HomeRecommendedPost />
      <HomeSiteData />
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
