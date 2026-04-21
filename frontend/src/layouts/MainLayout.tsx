import { Layout, theme } from 'antd'
import { Outlet } from 'react-router-dom'
import { TopNavBar } from './main/TopNavBar'

export function MainLayout() {
  const { token } = theme.useToken()
  const headerHeight = 80

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: token.colorBgLayout,
      }}
    >
      <TopNavBar />
      <Layout.Content
        style={{
          paddingTop: headerHeight,
        }}
      >
        <Outlet />
      </Layout.Content>
    </Layout>
  )
}

