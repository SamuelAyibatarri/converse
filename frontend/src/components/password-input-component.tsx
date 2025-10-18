import { InfoIcon } from "lucide-react"
import { useState } from 'react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function PasswordInput() {
    const uppercaseLetters: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseLetter: string = uppercaseLetters.toLowerCase();
    const specialCharacters: string = "!, @, #, $, %, ^, &, *, +, _"
    const [password, setPassword] = useState<string>("");
    const [isPasswordValid, setValidPassword] = useState<boolean>(false);

    function validatePassword() {
        // Check if password is less than 8 characters
        if (password.length < 8) {
            console.error("Your password is less than 8 characters")
            return;
        } else {
            // Check if password has at least one uppercase letter
            const arrUL = uppercaseLetters.split("");
            for (let entry in arrUL) {
                if (password.includes(entry)) {
                    const arrSP = specialCharacters.split(",");
                    for (let entry in arrSP) {
                        if (password.includes(entry)) {
                            setValidPassword(true);
                            console.log("Password is valid")
                            return;
                        } else {
                            console.error("Your password must contain at least one special character")
                            return;
                        }
                    }
                } else {
                    console.error("Your password must have atleast one uppercase letter")
                    return;
                }
            }
        }
    }
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupInput placeholder="Enter password" type="password" />
        <InputGroupAddon align="inline-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                variant="ghost"
                aria-label="Info"
                size="icon-xs"
              >
                <InfoIcon />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Password must be at least 8 characters</p>
            </TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
