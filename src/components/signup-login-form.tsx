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
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signup, login} from "@/auth"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

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


  const loginUserForm: Interfaces.LAI = {
    email: emailInput,
    hashedPassword: passwordInput,
    role: usertype
  }
 
  const signupUserForm: Interfaces.CAI = {
    name: nameInput,
    email: emailInput,
    hashedPassword: passwordInput,
    role: usertype
  }

  const handleLoginClick = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = loginUserForm;
    
    try {
      const data = await login(formData as Interfaces.LAI);
      toast.success(`Welcome back, ${data.userData.name}`);
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occured try logging in again")
      }
    }
  }

  const handleSignupClick = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = signupUserForm;

    try {
      const data = await signup(formData as Interfaces.CAI);
      toast.success(`Welcome, ${data.userData.name}`)
      window.location.reload();

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
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
            <Button onClick={handleLoginClick} disabled={!isPasswordValid}>Login</Button>
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
