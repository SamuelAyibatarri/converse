import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const VERIFY_JWT_ENDPOINT = 'http://localhost:8787/api/verifyJWT';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function verifyJWT(): Promise<boolean> {
  const localData = JSON.parse(localStorage.getItem("user_data")??'{"failure": true}');
  if (localData?.failure) return false;
  const userId: string = localData.userData.id;
  const role: string = localData.userData.role;
  const formData: {userId: string, role: string } = {
    userId: userId, role: role
  }
  const response = await fetch(VERIFY_JWT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localData.token}`
    },
    body: JSON.stringify(formData)
  })

  if (!response.ok) return false;
  return true;
}