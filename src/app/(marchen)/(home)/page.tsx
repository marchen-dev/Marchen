import { HomeMasterCard } from '@domain/home/components/HomeMasterCard'
import { HomeRecentPosts } from '@domain/home/components/HomeRecentPosts'
import { HomeRecommendedPost } from '@domain/home/components/HomeRecommendedPost'
import { HomeSiteDataStatistics } from '@domain/home/components/HomeSiteDataStatistics'

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
      <HomeMasterCard />
      <HomeRecommendedPost />
      <HomeSiteDataStatistics />
    </section>
  )
}

const HomeContent = () => {
  return (
    <section className="mt-4">
      <HomeRecentPosts />
    </section>
  )
}
