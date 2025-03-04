import { HomeCard } from '@base/components/ui/Card/HomeCard'
import { cn } from '@base/lib/helper'
import Image from 'next/image'

export const HomeMasterInfo = () => {
  return (
    <HomeCard className="col-span-2 overflow-hidden lg:col-span-1">
      <div className="flex flex-col items-center gap-2">
        <Image
          src="https://y.suemor.com/suemor-avatar.jpeg"
          alt="avatar"
          className="rounded-full border-2 border-neutral-content"
          height={100}
          width={100}
        />
        <h2 className="text-2xl font-medium">SuemorのBlog</h2>
        <p className="text-secondary">所谓自由就是可以说二加二等于四的自由</p>
        <ul className="mt-2 flex gap-4 ">
          {socialMediaConfig.map((item) => (
            <li
              key={item.icon}
              className="flex size-9 items-center justify-center rounded-full bg-sky-600 text-base-100"
            >
              <i className={cn(item.icon, 'text-2xl')} />
            </li>
          ))}
        </ul>
      </div>
    </HomeCard>
  )
}

const socialMediaConfig = [
  {
    icon: 'icon-[mingcute--github-line]',
    link: '',
  },
  {
    icon: 'icon-[mingcute--telegram-line]',
    link: '',
  },
  {
    icon: 'icon-[mingcute--twitter-line]',
    link: '',
  },
  {
    icon: 'icon-[mingcute--weibo-line]',
    link: '',
  },
]
