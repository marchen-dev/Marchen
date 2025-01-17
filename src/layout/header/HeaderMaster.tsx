import Image from 'next/image'

export const HeaderMaster = () => {
  return (
    <section className="flex items-center gap-3 lg:ml-6">
      <Image
        src="https://y.suemor.com/suemor-avatar.jpeg"
        alt="avatar"
        className="rounded-full"
        height={42}
        width={42}
      />
      <div className="hidden overflow-hidden lg:block">
        <h4 className="text-lg font-medium">SuemorのBlog</h4>
        <p className="truncate text-sm text-zinc-600 dark:text-base-content">
          所谓自由就是可以说二加二等于四的自由
        </p>
      </div>
    </section>
  )
}
