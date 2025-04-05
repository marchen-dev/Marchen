export default async function PostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative mx-auto my-5 size-full max-w-reader">
      {children}
    </div>
  )
}
