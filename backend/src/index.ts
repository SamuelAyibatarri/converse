import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { v4 as uuidv4 } from 'uuid';
import type * as Interfaces from './Interfaces.js';
import fs, { existsSync } from 'fs';
import path from 'path'
import { json } from 'stream/consumers';
import { fileURLToPath } from 'url';
import { stream, streamText, streamSSE } from 'hono/streaming'
import { zstdCompress } from 'zlib';

/// recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono()

app.use(
  '/api/*', 
  cors({
    origin: 'http://localhost:5173', 
    allowMethods: ['POST', 'GET'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)
const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'database.json');

let DBDATA: Interfaces.Database = {
  agents: [],
  customers: [],
  chatData: []
}
/// :::::::::::::::::::: Helper Functions :::::::::::::::

/// load Database
function loadDb(): void {
  const _: Interfaces.Database = {
    agents: [],
    customers: [],
    chatData: []
  }

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
  }
    
  if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(_));
      DBDATA = _;
      return;
  }

  const database_data = JSON.parse(fs.readFileSync(dbPath, 'utf8')) as Interfaces.Database;
  DBDATA = database_data;
}

function checkIfUserExists(formData: Interfaces.LAI | Interfaces.CAI): boolean {
  loadDb();
  const agentData: Interfaces.AgentData[] = DBDATA.agents.filter(x => {return x.email == formData.email});
  const customerData: Interfaces.CustomerData[] = DBDATA.customers.filter(x => {return x.email == formData.email});
  if (agentData.length >= 1 || customerData.length >= 1) {
    return true;
  }
  return false;
}

/// Create a new agent 
function createAgent(_:Interfaces.CAI) {
  loadDb();
  if (checkIfUserExists(_)) {
    throw new Error("User already exists, try logging in instead");
    return;
  } 
  const data: Interfaces.AgentData = {
    id: uuidv4(),
    name: _.name,
    email: _.email,
    passwordHash: _.passwordHash,
    accountCreationDate: Date.now(),
    lastLogin: Date.now(),
    chatHistory: []
  }

  DBDATA.agents.push(data);
  fs.writeFileSync(dbPath, JSON.stringify(DBDATA, null, 2));
  return data;
}

/// Create Customer
function createCustomer(_:Interfaces.CAI) {
  if (checkIfUserExists(_)) {
    throw new Error("User already exists, try logging in instead");
    return;
  } 
  loadDb();
  const data: Interfaces.CustomerData = {
    id: uuidv4(),
    name: _.name,
    email: _.email,
    passwordHash: _.passwordHash,
    accountCreationDate: Date.now(),
    lastLogin: Date.now(),
    chatHistory: []
  }

  DBDATA.customers.push(data);
  fs.writeFileSync(dbPath, JSON.stringify(DBDATA, null, 2));

  return data;
} 

/// Find user type from id
function findUserType(userId: string): "agent" | "customer" | null {
  loadDb();
  if (DBDATA.agents.some(agent => agent.id === userId)) {
    return "agent";
  }
  if (DBDATA.customers.some(customer => customer.id === userId)) {
    return "customer";
  }
  return null;
}

// Create chat data, I don't even get the point of comments I believe my function's name convey their functionality pretty well
function createChatData(_: Interfaces.ChatData) {
  try {
    loadDb();
    let senderType: "agent" | "customer" | null= findUserType(_.senderId);
    let receiverType: "agent" | "customer" | null = findUserType(_.receiverId);
    if (senderType == null || receiverType == null) {
      throw new Error("User type can't be null");
    }
    let sender, receiver;
    if (senderType === "agent") {
        sender = DBDATA.agents.find(x => x.id === _.senderId);
    } else if(senderType === "customer") {
      sender = DBDATA.customers.find(x => x.id === _.senderId);
    }
    if (receiverType === "agent") {
        receiver = DBDATA.agents.find(x => x.id === _.receiverId);
    } else if(senderType === "customer") {
      receiver = DBDATA.customers.find(x => x.id === _.receiverId);
    }
    
    if (sender) {
      sender.chatHistory.push(_.chatDataId);
    } else {
      throw new Error("User not found");
    }

    if (receiver) {
      receiver.chatHistory.push(_.chatDataId);
    } else {
      throw new Error("User not found");
    }
    DBDATA.chatData.push(_);   
    fs.writeFileSync(dbPath, JSON.stringify(DBDATA, null, 2));
  } catch (error) {
    throw error;
  }
} 

/// Update chat data
function updateChatData(chatId: string, chat: Interfaces.Chat) {
  loadDb();
  const filteredChatData = DBDATA.chatData.find(x => x.chatDataId === chatId);
  if (!filteredChatData) {
    throw new Error("Chat data doesn't exist");
  }
  filteredChatData.chatData.push(chat);
  fs.writeFileSync(dbPath, JSON.stringify(DBDATA, null, 2));
}

/// Check login session
function checkLoginSession(_:Interfaces.LAI): boolean {
  loadDb();
  const currentTimestamp: number = Date.now()
  let loadedDbArr: Interfaces.AgentData[] | Interfaces.CustomerData[] = [];
  if (_.usertype === "agent") loadedDbArr = DBDATA.agents;
  if (_.usertype === "customer") loadedDbArr = DBDATA.customers;
  let userData = loadedDbArr.filter( x => x.email === _.email && x.passwordHash === _.passwordHash );
  if (!userData) return false;
  if (userData.length > 1) return false;
  if (currentTimestamp - userData[0].lastLogin > 86400) return false;
  return true;
}

/// Verify User
function verifyUser(_:Interfaces.LAI): boolean {
  loadDb();
  const currentTimestamp: number = Date.now()
  let loadedDbArr: Interfaces.AgentData[] | Interfaces.CustomerData[] = [];
  if (_.usertype === "agent") loadedDbArr = DBDATA.agents;
  if (_.usertype === "customer") loadedDbArr = DBDATA.customers;
  let userData = loadedDbArr.filter( x => x.email === _.email && x.passwordHash === _.passwordHash );
  if (userData.length === 0) return false;
  if (userData.length > 1) return false;
  const updatedData = DBDATA;
  for (let entry of updatedData[`${_.usertype}s`]) {
    if (entry === userData[0]) {
      entry.lastLogin = currentTimestamp;
    }
  }
  fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 2))
  return true;
}

/// Verify User Id
function verifyUserId(userId: string, userType: "agent" | "customer"): boolean {
  loadDb();
  let loadedDbArr: Interfaces.AgentData[] | Interfaces.CustomerData[] = [];
  if (userType === "agent") loadedDbArr = DBDATA.agents;
  if (userType === "customer") loadedDbArr = DBDATA.customers;
  let userData = loadedDbArr.filter(_ => _.id === userId);
  if (userData.length === 0) return false;
  if (userData.length > 1) return false;
  return true;
}

/// load User Data
function loadUserData(_:Interfaces.LAI, verified: boolean) {
  if (!verified) {
    throw new Error("Verification false, can't load data");
  }
  loadDb();
  let userData = DBDATA[`${_.usertype}s`].filter(x => x.passwordHash === _.passwordHash && x.email === _.email)
  /// userData.map((x) => {
  ///   let emptyChatData:string[] = [];
  ///   x.chatHistory = emptyChatData;
  /// })
  return JSON.stringify(userData[0])
}

/// Verify LAI interface
function isLAI(obj: any): obj is Interfaces.LAI {
  return (
    obj &&
    typeof obj.email === "string" &&
    typeof obj.passwordHash === "string" &&
    (obj.usertype === "agent" || obj.usertype === "customer")
  )
}

/// Verify CAI interface
function isCAI(obj: any): obj is Interfaces.CAI {
  return (
    obj &&
    typeof obj.name === "string" &&
    typeof obj.email === "string" &&
    typeof obj.passwordHash === "string" &&
    (obj.usertype === "agent" || obj.usertype === "customer")
  )
}


/// Verify Auth Form Data
function verifyAuthFormData(_: any, action: "login" | "signup"): 1000 | 1001 | 2000 | 2001 | 3000 {
  if (action === "login") {
    if (!isLAI(_)) return 1001 ///"Invalid login payload";
    return 1000 ///"Valid login payload";
  }
  if (action === "signup") {
    if (!isCAI(_)) return 2001 ///"Invalid signup payload";
    return 2000 ///"Valid signup payload"
  }
  return 3000 /// Should never return this
}

function createChat(senderId: string, receiverId: string) {

}
 
///:::::::::::: Endpoints ::::::::::::::::

app.get('/', (c) => {
  return c.text('Hono API is running! 🚀')
})

app.post('/api/auth/login/:usertype', async (c) => {
  const formData: Interfaces.LAI = await c.req.json();
  const _ = verifyAuthFormData(formData, "login");
  switch(_) {
    case 1001:
      return c.json({error: "Invalid login payload"}, 500);
      break;
    case 2000:
      return c.json({error: "Invalid payload structure"}, 500);
      break;
    case 2001:
      return c.json({error: "Invalid payload structure"}, 500);
      break;
    case 3000:
      return c.json({error: "Invalid payload"}, 500);
      break;
    default: 
      break;
  }
  const usertype: "agent" | "customer" = c.req.param('usertype') as "agent" | "customer";
  try {
    const isUserVerified = verifyUser(formData);
    if (!isUserVerified) { 
      throw new Error("Invalid login details, check your email and password")
    } else {
      return c.json({message: 'Login Successful!', userData: loadUserData(formData, verifyUser(formData))}, 200) 
    }

  } catch (error) {
    return c.json({ error: 'Failed to login', details: String(error) }, 500);
  }
})

/// Create a new user
app.post('/api/auth/signup/:usertype', async (c) => {
  const formData: Interfaces.CAI = await c.req.json();
  const _ = verifyAuthFormData(formData, "signup");
  
  switch(_) {
    case 1000:
      return c.json({error: "Invalid payload structure"}, 500);
    case 1001:
      return c.json({error: "Invalid payload structure"}, 500);
    case 2001:
      return c.json({error: "Invalid signup payload"}, 500);
    case 3000:
      return c.json({error: "Invalid payload"}, 500);
    default: 
      /// Validation passed, do nothing and continue
      break;
  }
  
  const usertype = c.req.param('usertype').toLowerCase();

  try {
      if (usertype === "agent") { 
        const user = createAgent(formData);
        return c.json({message: `Agent ${formData.name} create successfully`, userData: user}, 200)
      } 
      
      if (usertype === "customer") {
        const user = createCustomer(formData);
        return c.json({message: `Customer ${formData.name} create successfully`, userData: user}, 200)!
      } 

      return c.json({ error: "Invalid user type specified in URL" }, 400); /// 400 Bad Request

  } catch (error) {
    const detailsMessage = (error instanceof Error) ? error.message : String(error);
    
    if (detailsMessage === "User already exists, try logging in instead") {
      return c.json({ Error: 'Failed to create user', details: detailsMessage }, 409); /// 409 Conflict
    }

    return c.json({ Error: 'Failed to create user', details: detailsMessage }, 500);
  }
})

/// Create a chatData
app.post('/api/createChat/:userType/:userId', async (c) => {
    const formData: {receiverId: string, receiverType: "agent" | "customer"} = await c.req.json();
    const userType: "agent" | "customer" = c.req.param('userType') as "agent" | "customer";
    const userId: string = c.req.param('userId');
    const isSenderVerified: boolean = verifyUserId(userId, userType);
    const isReceiverVerified: boolean = verifyUserId(formData.receiverId, formData.receiverType);
    if (isSenderVerified && isReceiverVerified) {
      try {
        const newChatData: Interfaces.ChatData = {
          chatDataId: uuidv4(),
          chatTimestamp: Date.now(),
          senderId: userId,
          receiverId: formData.receiverId,
          chatData: []
        }
        createChatData(newChatData);
        return c.json({message: 'Data created successfully', chatDataId: newChatData.chatDataId}, 201);
      } catch (error) {
       return c.json({message: 'An error occured', details: error}, 500); 
      }
    }

})

/// Send a message
app.post('/api/chat/:chatId', async (c) => {
    const chatId: string = c.req.param('chatId');
    const formData: {
        readonly content: string;
        readonly senderId: string;
        readonly receiverId: string;
      } = await c.req.json();

    const senderType: "agent" | "customer" | null = findUserType(formData.senderId);
    const receiverType: "agent" | "customer" | null = findUserType(formData.receiverId);
    if (senderType == null || receiverType == null) throw new Error("User type can't be null");

    const _: Interfaces.Chat = {
      timestamp: Date.now(),
      content: formData.content,
      senderId: formData.senderId,
      receiverId: formData.receiverId
    }
    try {
      if(verifyUserId(formData.senderId, senderType) && verifyUserId(formData.receiverId, receiverType)) {
          updateChatData(chatId, _);
          return c.json({message: "Message sent successfully", data: _}, 201)
      }
      throw new Error("User Id not valid")
    } catch (error) {
      return c.json({message: "An error occured when trying to send your message", details: error}, 500);
    }
})

export default app
