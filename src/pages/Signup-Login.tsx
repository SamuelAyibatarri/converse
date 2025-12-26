import { SignUp_Login_Form } from "@/components/signup-login-form"

export default function SignupLoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUp_Login_Form />
      </div>
    </div>
  )
}
