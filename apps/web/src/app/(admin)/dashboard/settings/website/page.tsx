import { apiClient } from '@marchen/api-client'

import {
  AppSidebarToolbarLayout,
  ToolsBar,
} from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { SettingsWebsiteArea } from '~/modules/dashboard/settings/components/website/SettingsWebsiteArea'
import { WebSiteSettingsProvider } from '~/modules/dashboard/settings/providers/WebSiteSettingsProvider'

export default async function SettingsWebsitePage() {
  const websiteData = await apiClient.site.get()
  return (
    <WebSiteSettingsProvider data={websiteData}>
      <AppSidebarToolbarLayout toolsArea={<ToolsBar title="更新" />}>
        <div className="ml-2 flex max-w-md flex-col gap-6">
          <SettingsWebsiteArea />
        </div>
      </AppSidebarToolbarLayout>
    </WebSiteSettingsProvider>
  )
}
