export default async function PostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative mx-auto my-5 size-full max-w-reader xl:max-w-[calc(850px+200px+200px)]">
      {children}
    </div>
  )
}
