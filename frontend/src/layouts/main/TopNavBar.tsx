import { Button, ConfigProvider, Drawer, Grid, Layout, Menu, Space, theme, Typography } from 'antd'
import { LogoutOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { appEnv } from '@/config/env'
import { useAuth } from '@/context/AuthContext'

type NavItem = { key: string; label: string; to: string }

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'jobs', label: 'Find Jobs', to: '/candidate/jobs' },
  { key: 'your-applications', label: 'Your Applications', to: '/candidate/your-applications' },
]

export function TopNavBar() {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated, isHR } = useAuth()
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
  const profilePath = isHR ? '/hr/dashboard' : '/candidate/profile'
  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/')
  }

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
            {isAuthenticated ? (
              <>
                <Link to={profilePath} style={{ textDecoration: 'none' }}>
                  <Button type="text" icon={<UserOutlined />}>
                    {user?.full_name ?? 'Account'}
                  </Button>
                </Link>
                <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button type="text">Sign In</Button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Button type="primary">Sign Up</Button>
                </Link>
              </>
            )}
          </Space>
        ) : (
          <Space size={8}>
            {isAuthenticated ? (
              <Button type="primary" icon={<UserOutlined />} onClick={() => navigate(profilePath)}>
                Account
              </Button>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button type="primary">Sign In</Button>
              </Link>
            )}
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
        <Space direction="vertical" size={10} style={{ marginTop: 16, width: '100%' }}>
          {isAuthenticated ? (
            <>
              <Link to={profilePath} style={{ textDecoration: 'none' }}>
                <Button block type="default" icon={<UserOutlined />} onClick={() => setMobileOpen(false)}>
                  {user?.full_name ?? 'Account'}
                </Button>
              </Link>
              <Button block danger icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button block type="default" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button block type="primary" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </Space>
      </Drawer>
    </Layout.Header>
  )
}
