import { MasterCard } from '@domain/home/components/MasterCard'
import { RecommendedPost } from '@domain/home/components/RecommendedPost'
import { SiteDataStatistics } from '@domain/home/components/SiteDataStatistics'

export default function Home() {
  return (
    <>
      <FirstScreen />
    </>
  )
}

const FirstScreen = () => {
  return (
    <div className="mx-auto h-dvh min-w-0 max-w-7xl overflow-hidden">
      <div className="grid grid-cols-4 items-center gap-4 p-4">
        <MasterCard />
        <RecommendedPost />
        <SiteDataStatistics />
      </div>
    </div>
  )
}
