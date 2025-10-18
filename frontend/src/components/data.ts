import image1 from '@/assets/avatar1.png';
import image2 from '@/assets/avatar2.png';

export interface User {
  id: number;
  name: string;
  username: string;
  img: string;
}

export interface Message {
  message: string;
  senderId: number;
  sentAt: string;
}

export const user: User = {
  id: 1,
  name: "Customer John Doe",
  username: "johndoe",
  img: image1,
};

export const friend: User = {
  id: 2,
  name: "Support Agent Jane",
  username: "jane_support",
  img: image2,
};

export const users: User[] = [user, friend];

export const messages: Message[] = [
  {
    message: "Hi there. I'm having trouble logging into my account. It says my password is incorrect even though I'm sure it's right.",
    senderId: 1,
    sentAt: "10:30 AM",
  },
  {
    message: "Hello! Thank you for contacting us. I'm sorry to hear you're having login issues. Can you please confirm the email address associated with your account?",
    senderId: 2,
    sentAt: "10:32 AM",
  },
  {
    message: "The email is john.doe@example.com.",
    senderId: 1,
    sentAt: "10:33 AM",
  },
  {
    message: "Thank you. I've located your account. It appears there may be a synchronization issue. I can send you a password reset link to resolve this. Would you like me to do that?",
    senderId: 2,
    sentAt: "10:35 AM",
  },
  {
    message: "Yes, please. That would be a great help!",
    senderId: 1,
    sentAt: "10:36 AM",
  },
  {
    message: "The password reset link has been sent to your email. Please check your inbox and spam folder. Let me know if you receive it.",
    senderId: 2,
    sentAt: "10:38 AM",
  },
];