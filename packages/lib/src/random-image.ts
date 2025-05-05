export const randomImage = () => {
  const random = Math.floor(Math.random() * 5) + 1
  return `/${random}.jpg`
}
