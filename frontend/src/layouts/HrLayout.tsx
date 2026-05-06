import {
  BuildOutlined,
  DashboardOutlined,
  MenuOutlined,
  PlusOutlined,
  ProjectOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button, ConfigProvider, Flex, Grid, Layout, Menu, theme, Typography } from 'antd'
import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { TopNavBar } from '@/layouts/main/TopNavBar'

const HEADER_HEIGHT = 80
const SIDEBAR_WIDTH = 256

type NavKey = 'dashboard' | 'jobs' | 'candidates' | 'settings'

function matchNavKey(pathname: string): NavKey {
  if (pathname.includes('/hr/candidates') || pathname.includes('/hr/candidate/')) {
    return 'candidates'
  }
  if (
    pathname.includes('/hr/my-job') ||
    pathname.includes('/hr/jobs') ||
    pathname.includes('/hr/job/')
  ) {
    return 'jobs'
  }
  if (pathname.includes('/hr/dashboard')) {
    return 'dashboard'
  }
  return 'dashboard'
}

export function HrLayout() {
  const { token } = theme.useToken()
  const location = useLocation()
  const selectedKey = matchNavKey(location.pathname)
  const screens = Grid.useBreakpoint()
  const isDesktop = Boolean(screens.lg)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const menuItems = useMemo(
    () => [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/hr/dashboard">Dashboard</Link>,
      },
      {
        key: 'jobs',
        icon: <ProjectOutlined />,
        label: <Link to="/hr/my-job">My Jobs</Link>,
      },
      {
        key: 'candidates',
        icon: <TeamOutlined />,
        label: <Link to="/hr/candidates">Candidates</Link>,
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        disabled: true,
        label: 'Settings',
      },
    ],
    []
  )

  const siderStyle: CSSProperties = {
    position: 'fixed',
    left: 0,
    top: HEADER_HEIGHT,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    overflow: 'auto',
    zIndex: 60,
    padding: token.padding,
    background: `rgba(255, 255, 255, 0.76)`,
    backdropFilter: 'blur(16px)',
    borderRight: `1px solid rgba(15, 23, 42, 0.08)`,
    boxShadow: '0 18px 55px rgba(0, 26, 67, 0.08)',
    display: 'flex',
    flexDirection: 'column',
  }

  const brandTitleStyle: CSSProperties = {
    margin: 0,
    fontSize: token.fontSizeLG,
    fontWeight: 900,
    lineHeight: 1.25,
    color: token.colorPrimary,
  }

  const brandSubtitleStyle: CSSProperties = {
    margin: 0,
    fontSize: token.fontSizeSM,
    color: token.colorTextSecondary,
    fontWeight: token.fontWeightStrong,
    letterSpacing: '0.06em',
  }

  const logoMarkStyle: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: token.borderRadiusLG,
    background: token.colorPrimary,
    color: token.colorWhite,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: token.fontSizeXL,
  }

  const postBtnStyle: CSSProperties = {
    height: 'auto',
    paddingBlock: token.paddingSM + 2,
    borderRadius: token.borderRadiusLG,
    fontWeight: 700,
    border: 'none',
    background: `linear-gradient(90deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
    boxShadow: `0 10px 28px color-mix(in srgb, ${token.colorPrimary} 22%, transparent)`,
  }

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <TopNavBar />

      {!isDesktop && mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close navigation"
          style={{
            position: 'fixed',
            inset: 0,
            top: HEADER_HEIGHT,
            background: 'rgba(15, 23, 42, 0.45)',
            zIndex: 55,
          }}
        />
      )}

      <Layout.Sider
        width={SIDEBAR_WIDTH}
        style={siderStyle}
        theme="light"
        breakpoint="lg"
        collapsedWidth={0}
        collapsible
        trigger={null}
        collapsed={!isDesktop ? !mobileNavOpen : false}
        onBreakpoint={(broken) => {
          if (!broken) setMobileNavOpen(false)
        }}
      >
        <Flex vertical style={{ minHeight: '100%' }}>
          <div
            style={{
              marginBottom: token.marginLG,
              padding: `${token.paddingXS}px ${token.paddingSM}px`,
            }}
          >
            <Flex align="center" gap={token.marginSM}>
              <div style={logoMarkStyle} aria-hidden>
                <BuildOutlined />
              </div>
              <div>
                <Typography.Title level={5} style={brandTitleStyle}>
                  Recruitment Hub
                </Typography.Title>
                <Typography.Paragraph style={brandSubtitleStyle}>
                  Enterprise Edition
                </Typography.Paragraph>
              </div>
            </Flex>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <div className="hr-surface hr-glass" style={{ padding: token.paddingXS }}>
              <ConfigProvider
                theme={{
                  components: {
                    Menu: {
                      itemSelectedBg: `color-mix(in srgb, ${token.colorPrimary} 10%, transparent)`,
                      itemSelectedColor: token.colorPrimary,
                      itemHoverBg: `color-mix(in srgb, ${token.colorPrimary} 6%, transparent)`,
                      itemHoverColor: token.colorText,
                      itemColor: token.colorTextSecondary,
                      itemBorderRadius: token.borderRadiusLG,
                      iconSize: token.fontSizeLG,
                      itemHeight: 44,
                      itemMarginInline: 6,
                      itemMarginBlock: 4,
                    },
                  },
                }}
              >
                <Menu
                  mode="inline"
                  selectedKeys={[selectedKey]}
                  items={menuItems}
                  style={{
                    borderInlineEnd: 0,
                    background: 'transparent',
                    fontWeight: 650,
                  }}
                />
              </ConfigProvider>
            </div>
          </div>

          <div style={{ paddingTop: token.paddingMD, paddingBottom: token.paddingXS }}>
            <Link to="/hr/my-job" style={{ display: 'block' }}>
              <Button type="primary" block icon={<PlusOutlined />} style={postBtnStyle}>
                Post New Job
              </Button>
            </Link>
          </div>
        </Flex>
      </Layout.Sider>

      <Layout
        style={{
          marginLeft: isDesktop ? SIDEBAR_WIDTH : 0,
          paddingTop: HEADER_HEIGHT,
          minHeight: '100vh',
          background: token.colorBgLayout,
        }}
      >
        <Layout.Content style={{ paddingTop: 0 }}>
          <div style={{ padding: token.paddingLG }}>
            {!isDesktop && (
              <Button
                type="primary"
                icon={<MenuOutlined />}
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
                style={{
                  position: 'fixed',
                  top: HEADER_HEIGHT + token.margin,
                  left: token.margin,
                  zIndex: 54,
                  borderRadius: 999,
                  boxShadow: '0 18px 55px rgba(0, 26, 67, 0.22)',
                }}
              />
            )}
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
