import LoginForm from '@/src/components/modules/Auth/LoginForm'
import React from 'react'

interface LoginParams {
  searchParams: Promise<{ redirect?: string }>
}
const LoginPage = async ({ searchParams }: LoginParams) => {
  const params = await searchParams
  const redirectPath = params.redirect

  return (
    <div>
      <LoginForm redirectPath={redirectPath} />
    </div>
  )
}

export default LoginPage
