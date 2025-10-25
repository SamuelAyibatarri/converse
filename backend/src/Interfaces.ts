export interface AgentData {
    readonly id: string;
    name: string;
    email: string;
    passwordHash: string;
    accountCreationDate: number;
    lastLogin: number;
    chatHistory: string[];
}

export interface CustomerData {
    readonly id: string;
    name: string;
    email: string;
    passwordHash: string;
    accountCreationDate: number;
    lastLogin: number;
    chatHistory: string[];
}

export interface Chat {
    name?: string;
    readonly timestamp: number;
    readonly content: string;
    readonly senderId: string;
    readonly receiverId: string;
}

export interface ChatData {
    chatDataId: string;
    senderId: string;
    receiverId: string;
    chatTimestamp: number;
    chatData: Chat[];
}

export interface CAI { /// CAI -> Create Account Interface
    name: string;
    email: string;
    passwordHash: string;
    usertype: "agent" | "customer";
}

export interface LAI { /// LAI -> Login Account Interface
    email: string;
    passwordHash: string;
    usertype: "agent" | "customer";
}

export interface Database {
    agents: AgentData[];
    customers: CustomerData[];
    chatData: ChatData[];
}
