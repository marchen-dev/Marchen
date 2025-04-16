const socialMediaIcon: Record<string, [string, string, string]> = {
  github: ['Github', 'icon-[mingcute--github-line]', '#333333'],
  twitter: ['Twitter', 'icon-[mingcute--twitter-line]', '#55ACEE'],
  facebook: ['Facebook', 'icon-[mingcute--facebook-line]', '#4267B2'],
  linkedin: ['LinkedIn', 'icon-[mingcute--linkedin-line]', '#2867B2'],
  youtube: ['YouTube', 'icon-[mingcute--youtube-line]', '#FF4444'],
  discord: ['Discord', 'icon-[mingcute--discord-line]', '#7289DA'],
  telegram: ['Telegram', 'icon-[mingcute--telegram-line]', '#37AEE2'],
  mastodon: ['Mastodon', 'icon-[mingcute--mastodon-line]', '#8C8DFF'],
  reddit: ['Reddit', 'icon-[mingcute--reddit-line]', '#FF6A33'],
  tiktok: ['TikTok', 'icon-[mingcute--tiktok-line]', '#444444'],
  weibo: ['Weibo', 'icon-[mingcute--weibo-line]', '#EA6F5A'],
  whatsapp: ['WhatsApp', 'icon-[mingcute--whatsapp-line]', '#4FCE5D'],
  email: ['Email', 'icon-[mingcute--mail-line]', '#EA6D60'],
  rss: ['RSS', 'icon-[mingcute--rss-line]', '#FFC04D'],
}

type SocialMediaItem = {
  name: string
  icon: string
  link: string
  color: string
}

export const parseSocialIcon = (socialMedia: Record<string, string> | null) => {
  if (!socialMedia) {
    return []
  }
  return Object.keys(socialMedia)?.reduce<SocialMediaItem[]>((acc, key) => {
    // 最多显示5个
    if (acc.length >= 5) {
      return acc
    }
    const mapSocialIcon = socialMediaIcon[key]
    if (mapSocialIcon) {
      const [name, icon, color] = mapSocialIcon
      acc.push({
        name,
        icon,
        color,
        link: socialMedia[key],
      })
    }
    return acc
  }, [])
}
