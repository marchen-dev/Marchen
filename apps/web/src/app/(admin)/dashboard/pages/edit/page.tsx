import { apiClient } from '@marchen/api-client'
import type { PageResponseType } from '@marchen/api-client/interfaces/page.interface'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { PageEditorContent } from '~/modules/dashboard/pages/components/edit/PageEditorContent'
import { PageEditorHeader } from '~/modules/dashboard/pages/components/edit/PageEditorHeader'
import { PageEditorToolsArea } from '~/modules/dashboard/pages/components/edit/PageEditorToolsArea'
import { PageEditorFormProvider } from '~/modules/dashboard/pages/providers/PageEditorFormProvider'

export default async function DashboardPagesEditPage(params: {
  searchParams: Promise<{ id: string }>
}) {
  const { id } = await params.searchParams
  let page: PageResponseType | undefined
  if (id) {
    page = await apiClient.pages.getById(id)
  }

  return (
    <PageEditorFormProvider pageData={page}>
      <AppSidebarToolbarLayout
        toolsArea={<PageEditorToolsArea />}
        className="flex flex-col "
      >
        <PageEditorHeader />
        <PageEditorContent />
      </AppSidebarToolbarLayout>
    </PageEditorFormProvider>
  )
}
