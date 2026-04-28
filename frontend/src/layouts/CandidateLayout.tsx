import { AppstoreOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons'
import { Flex, Layout, Menu, theme } from 'antd'
import type { CSSProperties } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { TopNavBar } from '@/layouts/main/TopNavBar'
import { CandidateJobFilters } from '@/layouts/candidate/CandidateJobFilters'

const HEADER_HEIGHT = 80
const SIDEBAR_WIDTH = 256
type CandidateCssVarKey =
  | '--candidate-primary'
  | '--candidate-text'
  | '--candidate-text-secondary'
  | '--candidate-text-tertiary'
  | '--candidate-border'
  | '--candidate-bg'
  | '--candidate-bg-layout'

export function CandidateLayout() {
  const { token } = theme.useToken()
  const location = useLocation()
  const navigate = useNavigate()
  const showJobFilters =
    location.pathname !== '/candidate/applications' &&
    location.pathname !== '/candidate/your-applications' &&
    location.pathname !== '/candidate/profile'

  const candidateMenuKey =
    location.pathname === '/candidate/applications' ||
    location.pathname === '/candidate/your-applications'
      ? 'applications'
      : location.pathname === '/candidate/profile'
        ? 'profile'
        : 'jobs'

  const cssVars: CSSProperties & Record<CandidateCssVarKey, string> = {
    // Used by `candidate-layout.css` for hover/focus styling.
    '--candidate-primary': token.colorPrimary,
    '--candidate-text': token.colorText,
    '--candidate-text-secondary': token.colorTextSecondary,
    '--candidate-text-tertiary': token.colorTextTertiary,
    '--candidate-border': token.colorBorderSecondary,
    '--candidate-bg': token.colorBgContainer,
    '--candidate-bg-layout': token.colorBgLayout,
  }

  return (
    <Layout className="candidate-shell" style={cssVars}>
      <TopNavBar />

      <Layout.Sider
        width={SIDEBAR_WIDTH}
        theme="light"
        className="candidate-sider"
        style={{
          position: 'fixed',
          left: 0,
          top: HEADER_HEIGHT,
          bottom: 0,
          overflow: 'auto',
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          padding: 24,
        }}
      >
        <Flex vertical gap={16} style={{ marginBottom: 8 }}>
          <Menu
            mode="inline"
            selectedKeys={[candidateMenuKey]}
            style={{ borderInlineEnd: 'none', background: 'transparent' }}
            items={[
              {
                key: 'jobs',
                icon: <UnorderedListOutlined />,
                label: 'Browse jobs',
                onClick: () => navigate('/candidate/jobs'),
              },
              {
                key: 'applications',
                icon: <AppstoreOutlined />,
                label: 'Your applications',
                onClick: () => navigate('/candidate/your-applications'),
              },
              {
                key: 'profile',
                icon: <UserOutlined />,
                label: 'Profile',
                onClick: () => navigate('/candidate/profile'),
              },
            ]}
          />
        </Flex>
        {showJobFilters ? <CandidateJobFilters /> : null}
      </Layout.Sider>

      <Layout.Content
        className="candidate-content"
        style={{
          marginLeft: SIDEBAR_WIDTH,
          paddingTop: HEADER_HEIGHT,
          minHeight: '100vh',
          background: token.colorBgLayout,
        }}
      >
        <div style={{ padding: 24 }}>
          <Outlet />
        </div>
      </Layout.Content>
    </Layout>
  )
}
