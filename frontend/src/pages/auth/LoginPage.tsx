import { Button, Card, Checkbox, Form, Input, Typography, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

type LoginFormValues = {
  email: string
  password: string
  remember: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form] = Form.useForm<LoginFormValues>()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      const response = await apiClient.post('/auth/login', {
        email: values.email,
        password: values.password,
      })

      const { data } = response.data
      const { user, token } = data

      // Store token via context
      login(user, token)

      message.success(`Welcome back, ${user.full_name}!`)

      // Role-based redirection
      if (user.role === 'HR') {
        navigate('/hr/dashboard')
      } else {
        navigate('/candidate/jobs')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid email or password'
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card variant="borderless" styles={{ body: { padding: 0 } }}>
      <header style={{ marginBottom: 18 }}>
        <Typography.Title level={2} style={{ marginBottom: 4 }}>
          Sign In
        </Typography.Title>
        <Typography.Text type="secondary">
          Welcome back. Continue shaping your career with us.
        </Typography.Text>
      </header>

      <Form<LoginFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          label="Corporate Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="name@company.com" size="large" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
          hasFeedback
        >
          <Input.Password placeholder="••••••••" size="large" />
        </Form.Item>

        <Form.Item
          name="remember"
          valuePropName="checked"
          style={{ marginBottom: 12 }}
        >
          <Checkbox>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Remember me on this device
            </Typography.Text>
          </Checkbox>
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          Sign In
        </Button>
      </Form>

      <footer style={{ marginTop: 18, textAlign: 'center' }}>
        <Typography.Text type="secondary">
          Don&apos;t have an account? <Link to="/register">Create Account</Link>
        </Typography.Text>
      </footer>
    </Card>
  )
}
