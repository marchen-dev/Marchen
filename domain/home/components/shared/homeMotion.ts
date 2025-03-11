export const HomeFadeInVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

export const imageVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    filter: 'brightness(1.05)',
    transition: { duration: 0.4 },
  },
}

export const tagVariants = {
  initial: { opacity: 0, y: 10, scale: 0.9 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      type: 'spring',
      stiffness: 500,
    },
  }),
  hover: {
    y: -2,
    transition: { duration: 0.2 },
  },
}
