
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { LoginView } from "@/components/auth/login-view"

const LoginPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!!session) {
    redirect("/dashboard")
  }
  return (
    <LoginView />
  )
}

export default LoginPage