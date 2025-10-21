import { GalleryVerticalEnd } from "lucide-react"
import { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "./password-input-component"
import * as Interfaces from '@/Interfaces'
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signup, login } from "@/auth"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { useNavigate } from "react-router-dom";

type UserRoleType = "agent" | "customer";

export function SignUp_Login_Form({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [pageState, setPageState] = useState<"login" | "signup">("login");
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [isPasswordValid, setValidPasswordBool] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");
  const [usertype, setUserType] = useState<UserRoleType>("agent");

  const navigate = useNavigate();

  const loginUserForm: Interfaces.LAI = {
    email: emailInput,
    passwordHash: passwordInput,
    usertype: usertype
  }
 
  const signupUserForm: Interfaces.CAI = {
    name: nameInput,
    email: emailInput,
    passwordHash: passwordInput,
    usertype: usertype
  }

  function handleLoginClick() {
    console.log("Trying to log in");
    login(loginUserForm);
  }

  const handleSignupClick = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = signupUserForm;

    try {
      const user = await signup(formData as Interfaces.CAI);
      toast.success(`Welcome, ${user.name}`)
      window.location.reload();

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        // alert(error.message)
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  };
  
  useEffect(() => {
    if (isPasswordValid === true)  console.log("Password is now valid!");
    return;
  }, [isPasswordValid])

  function setLoginPage(): void {
    setPageState("login");
  };

  function setSignupPage(): void {
    setPageState("signup");
  };

  // function handleSignup() {
  //   const signUpData: Interfaces.CAI = {
  //     name: string;
  //     email: string;
  //     passwordHash: string;
  //     usertype: "agent" | "customer";
  //   }
  //   login()
  // }

  const loginForm =  <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Converse Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Converse Inc.</h1>
            <FieldDescription>
              Don&apos;t have an account? <a href="#" onClick={setSignupPage}>Sign up</a>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={emailInput}
              onChange={(event) => { setEmailInput(event.target.value) }}
              required
            />
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput passwordInput={passwordInput} passwordValid={setValidPasswordBool} setPassword={setPasswordInput}/>
          </Field>
          <Field>
            <Button onClick={handleLoginClick} disabled={!isPasswordValid || (nameInput.length === 0)}>Login</Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </Button>
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>

      const signUpForm =  <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Converse Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Converse Inc.</h1>
            <FieldDescription>
              Already have an account? <a href="#" onClick={setLoginPage}>Sign in</a>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={emailInput}
              onChange={(event) => { setEmailInput(event.target.value) }}
              required
            />
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput passwordInput={passwordInput} passwordValid={setValidPasswordBool} setPassword={setPasswordInput}/>
            <FieldLabel htmlFor="text">Full Name</FieldLabel>
            <Input 
              id="full-name"
              type="text"
              placeholder="Surname first eg. Doe John"
              value={nameInput}
              onChange={(event) => { setNameInput(event.target.value) }}
              required = {true}
              />
          </Field>
          <Field>
            <FieldLabel htmlFor="role">Role</FieldLabel>
             <RadioGroup defaultValue={usertype} onValueChange={(newValue) => { setUserType(newValue as UserRoleType)}} className="flex flex-row w-full justify-between">
                <div className="flex items-center space-x-2 border rounded-lg h-10 w-auto p-3">
                  <RadioGroupItem value="agent" id="agent" />
                  <Label htmlFor="agent" className="">Agent</Label>
                </div>
                <div className="flex items-center space-x-2 justify-around border p-3 rounded-lg">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="agent">Customer</Label>
                </div>
              </RadioGroup>
          </Field>
          <Field>
            <Button onClick={handleSignupClick} disabled={!isPasswordValid || (nameInput.length === 0)}>Create Account</Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </Button>
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  return (
    <>    
      {pageState === "login" ? loginForm : signUpForm}
      <Toaster />
    </>

  )
}
