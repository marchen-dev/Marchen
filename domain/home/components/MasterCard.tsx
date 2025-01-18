import { Card } from '@base/components/ui/Card/Card'
import Image from 'next/image'

export const MasterCard = () => {
  return (
    <Card className=" overflow-hidden">
      <div className="flex  flex-col items-center gap-2">
        <Image
          src="https://y.suemor.com/suemor-avatar.jpeg"
          alt="avatar"
          className="rounded-full"
          height={100}
          width={100}
        />
        <h2 className="text-2xl font-medium">SuemorのBlog</h2>
        <p className="text-zinc-600">所谓自由就是可以说二加二等于四的自由</p>
        <ul className="mt-2 flex gap-4 text-2xl">
          {socialMediaConfig.map((item) => (
            <li key={item.icon}>
              <i className={item.icon} />
            </li>
          ))}
        </ul>
      </div>
    </Card>
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
