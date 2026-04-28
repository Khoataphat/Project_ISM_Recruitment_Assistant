import { Button, ConfigProvider, Drawer, Grid, Layout, Menu, Space, theme, Typography } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { appEnv } from '@/config/env'

type NavItem = { key: string; label: string; to: string }

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'jobs', label: 'Find Jobs', to: '/candidate/jobs' },
  { key: 'your-applications', label: 'Your Applications', to: '/candidate/your-applications' },
]

export function TopNavBar() {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const selectedKey =
    navItems.find((i) => location.pathname.startsWith(i.to) && i.to !== '/')?.key ?? undefined

  const menuItems = useMemo(
    () =>
      navItems.map((i) => ({
        key: i.key,
        label: (
          <Link
            to={i.to}
            onClick={() => setMobileOpen(false)}
            style={{
              color: token.colorTextSecondary,
              fontWeight: 650,
              letterSpacing: '-0.01em',
            }}
          >
            {i.label}
          </Link>
        ),
      })),
    [token.colorTextSecondary]
  )

  const headerHeight = 80
  const isDesktop = !!screens.lg

  return (
    <Layout.Header
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 50,
        width: '100%',
        height: headerHeight,
        paddingInline: 0,
        background: `color-mix(in srgb, ${token.colorBgContainer} 85%, transparent)`,
        backdropFilter: 'blur(18px)',
        boxShadow: `0 12px 40px color-mix(in srgb, ${token.colorTextBase} 6%, transparent)`,
        borderBottom: `1px solid color-mix(in srgb, ${token.colorBorderSecondary} 55%, transparent)`,
      }}
    >
      <div
        style={{
          height: headerHeight,
          width: '100%',
          margin: '0 auto',
          padding: '0 12rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Typography.Text
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: token.colorText,
            }}
          >
            {appEnv.appName}
          </Typography.Text>
        </Link>

        {isDesktop ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <ConfigProvider
              theme={{
                components: {
                  Menu: {
                    horizontalItemSelectedColor: token.colorPrimary,
                    horizontalItemSelectedBg: 'transparent',
                    horizontalItemHoverColor: token.colorText,
                    horizontalItemHoverBg: 'transparent',
                    itemBg: 'transparent',
                    itemSelectedBg: 'transparent',
                    itemHoverBg: 'transparent',
                    activeBarBorderWidth: 0,
                  },
                },
              }}
            >
              <Menu
                mode="horizontal"
                disabledOverflow
                selectedKeys={selectedKey ? [selectedKey] : []}
                items={menuItems}
                style={{
                  borderBottom: 0,
                  background: 'transparent',
                  flex: '0 1 auto',
                  minWidth: 'max-content',
                }}
              />
            </ConfigProvider>
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {isDesktop ? (
          <Space size={12}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button type="text">Sign In</Button>
            </Link>
            <Link to="/main/jobs" style={{ textDecoration: 'none' }}>
              <Button type="primary">Post a Job</Button>
            </Link>
          </Space>
        ) : (
          <Space size={8}>
            <Link to="/main/jobs" style={{ textDecoration: 'none' }}>
              <Button type="primary" onClick={() => navigate('/hr/jobs')}>
                Post a Job
              </Button>
            </Link>
            <Button
              aria-label="Open menu"
              icon={<MenuOutlined />}
              onClick={() => setMobileOpen(true)}
            />
          </Space>
        )}
      </div>

      <Drawer
        title={appEnv.appName}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        placement="right"
        size="default"
      >
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemSelectedBg: token.colorPrimaryBg,
                itemSelectedColor: token.colorPrimary,
                itemHoverBg: token.colorFillTertiary,
                itemHoverColor: token.colorText,
                itemColor: token.colorTextSecondary,
                itemBorderRadius: token.borderRadiusLG,
              },
            },
          }}
        >
          <Menu mode="inline" selectedKeys={selectedKey ? [selectedKey] : []} items={menuItems} />
        </ConfigProvider>
        <div style={{ marginTop: 16 }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button block type="default" onClick={() => setMobileOpen(false)}>
              Sign In
            </Button>
          </Link>
        </div>
      </Drawer>
    </Layout.Header>
  )
}
