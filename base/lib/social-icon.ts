const socialMediaIcon: Record<string, [string, string, string]> = {
  github: ['Github', 'icon-[mingcute--github-line]', '#000'],
  twitter: ['Twitter', 'icon-[mingcute--twitter-line]', '#1DA1F2'],
  facebook: ['Facebook', 'icon-[mingcute--facebook-line]', '#1877F2'],
  linkedin: ['LinkedIn', 'icon-[mingcute--linkedin-line]', '#0A66C2'],
  youtube: ['YouTube', 'icon-[mingcute--youtube-line]', '#FF0000'],
  discord: ['Discord', 'icon-[mingcute--discord-line]', '#5865F2'],
  telegram: ['Telegram', 'icon-[mingcute--telegram-line]', '#26A5E4'],
  mastodon: ['Mastodon', 'icon-[mingcute--mastodon-line]', '#6364FF'],
  reddit: ['Reddit', 'icon-[mingcute--reddit-line]', '#FF4500'],
  tiktok: ['TikTok', 'icon-[mingcute--tiktok-line]', '#000000'],
  weibo: ['Weibo', 'icon-[mingcute--weibo-line]', '#E6162D'],
  whatsapp: ['WhatsApp', 'icon-[mingcute--whatsapp-line]', '#25D366'],
  email: ['Email', 'icon-[mingcute--mail-line]', '#EA4335'],
  rss: ['RSS', 'icon-[mingcute--rss-line]', '#FFA500'],
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
