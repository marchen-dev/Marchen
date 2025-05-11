export default async function PageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative mx-auto mt-5  size-full max-w-reader xl:max-w-[calc(850px+200px+200px)]">
      {children}
    </div>
  )
}
