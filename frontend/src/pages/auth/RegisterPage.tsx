import { Button, Card, Checkbox, Form, Input, Typography, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { register } from '@/services/authService'

type RegisterFormValues = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  terms: boolean
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm<RegisterFormValues>()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true)
    try {
      await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      })

      message.success('Account created successfully')
      navigate('/login')
    } catch (err: unknown) {
      if (err && typeof err === 'object') {
        const maybe = err as { response?: { data?: { message?: unknown } } }
        const apiMessage = maybe.response?.data?.message
        if (typeof apiMessage === 'string' && apiMessage.trim()) {
          message.error(apiMessage)
          return
        }
      }
      message.error('Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card variant="borderless" styles={{ body: { padding: 0 } }}>
      <header style={{ marginBottom: 18 }}>
        <Typography.Title level={2} style={{ marginBottom: 4 }}>
          Create Account
        </Typography.Title>
        <Typography.Text type="secondary">
          Begin your professional journey with the digital architect of careers.
        </Typography.Text>
      </header>

      <Form<RegisterFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
      >
        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <Input placeholder="Johnathan Doe" size="large" />
        </Form.Item>

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
          rules={[{ required: true, message: 'Please enter a password' }]}
          hasFeedback
        >
          <Input.Password placeholder="••••••••" size="large" />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const password = getFieldValue('password')
                if (!value || value === password) return Promise.resolve()
                return Promise.reject(new Error('Passwords do not match'))
              },
            }),
          ]}
        >
          <Input.Password placeholder="••••••••" size="large" />
        </Form.Item>

        <Form.Item
          name="terms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, checked) =>
                checked
                  ? Promise.resolve()
                  : Promise.reject(new Error('You must accept the terms')),
            },
          ]}
          style={{ marginBottom: 12 }}
        >
          <Checkbox>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              I agree to the{' '}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Privacy Policy
              </a>
              .
            </Typography.Text>
          </Checkbox>
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          Create Account
        </Button>
      </Form>

      <footer style={{ marginTop: 18, textAlign: 'center' }}>
        <Typography.Text type="secondary">
          Already have an account? <Link to="/login">Sign In</Link>
        </Typography.Text>
      </footer>
    </Card>
  )
}
