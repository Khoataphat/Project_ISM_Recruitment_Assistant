import {
  Avatar,
  Button,
  ConfigProvider,
  Divider,
  Drawer,
  Dropdown,
  Grid,
  Layout,
  Menu,
  Space,
  theme,
  Typography,
} from 'antd'
import type { MenuProps } from 'antd'
import { DashboardOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { appEnv } from '@/config/env'
import { useAuth } from '@/context/AuthContext'

type NavItem = { key: string; label: string; to: string }

function navPathMatch(pathname: string, to: string): boolean {
  if (to === '/') return false
  return pathname === to || pathname.startsWith(`${to}/`)
}

function selectedNavKey(pathname: string, items: NavItem[]): string | undefined {
  if (pathname === '/' || pathname === '/main' || pathname === '/main/') {
    return 'home'
  }
  const match = [...items]
    .filter((i) => i.to !== '/' && navPathMatch(pathname, i.to))
    .sort((a, b) => b.to.length - a.to.length)[0]
  return match?.key
}

export function TopNavBar() {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { isAuthenticated, user, logout, isCandidate, isHR } = useAuth()
  const screens = Grid.useBreakpoint()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navItems = useMemo((): NavItem[] => {
    const home: NavItem = { key: 'home', label: 'Home', to: '/' }
    if (!isAuthenticated) {
      return [home, { key: 'browse', label: 'Browse jobs', to: '/main/jobs' }]
    }
    if (isCandidate) {
      return [
        home,
        { key: 'jobs', label: 'Find Jobs', to: '/candidate/jobs' },
        {
          key: 'your-applications',
          label: 'Your Applications',
          to: '/candidate/your-applications',
        },
      ]
    }
    if (isHR) {
      return [
        home,
        { key: 'dashboard', label: 'Dashboard', to: '/hr/dashboard' },
        { key: 'hr-jobs', label: 'Jobs', to: '/hr/jobs' },
      ]
    }
    return [home, { key: 'browse', label: 'Browse jobs', to: '/main/jobs' }]
  }, [isAuthenticated, isCandidate, isHR])

  const selectedKey = useMemo(
    () => selectedNavKey(location.pathname, navItems),
    [location.pathname, navItems]
  )

  const menuItems = useMemo(
    () =>
      navItems.map((i) => ({
        key: i.key,
        label: (
          <Link
            to={i.to}
            onClick={() => setMobileOpen(false)}
            className="top-nav-link"
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
    [navItems, token.colorTextSecondary]
  )

  const headerHeight = 80
  const isDesktop = !!screens.lg
  const displayName = user?.full_name?.trim() || user?.email || 'User'
  const avatarText = displayName.trim().charAt(0).toUpperCase()

  const onLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/login')
  }

  const userAvatarMenuItems: MenuProps['items'] = [
    ...(isHR
      ? [
          {
            key: 'hr-dashboard',
            label: 'HR Dashboard',
            icon: <DashboardOutlined />,
            onClick: () => navigate('/hr/dashboard'),
          },
        ]
      : []),
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: onLogout,
    },
  ]

  return (
    <Layout.Header
      className="top-nav-shell"
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
        className="top-nav-inner"
        style={{
          height: headerHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link to="/" className="top-nav-brand" style={{ textDecoration: 'none' }}>
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
          <div className="top-nav-center">
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
                className="top-nav-menu-root"
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
          isAuthenticated && user ? (
            <Dropdown
              menu={{ items: userAvatarMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                className="top-nav-user-trigger"
                style={{ paddingInline: 8, height: 40 }}
              >
                <Space size={10}>
                  <Avatar size="small" style={{ background: token.colorPrimary }}>
                    {avatarText}
                  </Avatar>
                  <Typography.Text style={{ fontWeight: 650 }}>{displayName}</Typography.Text>
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Space size={12} className="top-nav-actions-desktop">
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button type="text" className="top-nav-cta-secondary">
                  Sign In
                </Button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button type="primary" className="top-nav-cta-primary">
                  Post a Job
                </Button>
              </Link>
            </Space>
          )
        ) : (
          <Space size={8} className="top-nav-actions-mobile">
            {isAuthenticated && user ? (
              <Dropdown
                menu={{ items: userAvatarMenuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button type="text" aria-label="Open user menu" className="top-nav-user-trigger">
                  <Avatar size="small" style={{ background: token.colorPrimary }}>
                    {avatarText}
                  </Avatar>
                </Button>
              </Dropdown>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button type="primary" className="top-nav-cta-primary">
                  Post a Job
                </Button>
              </Link>
            )}
            <Button
              aria-label="Open menu"
              icon={<MenuOutlined />}
              className="top-nav-menu-toggle"
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
        <Divider style={{ margin: '16px 0' }} />
        <div>
          {isAuthenticated && user ? (
            <div>
              <div style={{ marginBottom: 12 }}>
                <Space size={12}>
                  <Avatar style={{ background: token.colorPrimary }}>{avatarText}</Avatar>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography.Text style={{ fontWeight: 650 }}>{displayName}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {user.email}
                    </Typography.Text>
                  </div>
                </Space>
              </div>
              <Button block type="default" icon={<LogoutOutlined />} onClick={onLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Link to="/login" style={{ textDecoration: 'none', display: 'block' }}>
                <Button block type="primary" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none', display: 'block' }}>
                <Button block type="default" onClick={() => setMobileOpen(false)}>
                  Post a Job (employers)
                </Button>
              </Link>
            </Space>
          )}
        </div>
      </Drawer>
    </Layout.Header>
  )
}
