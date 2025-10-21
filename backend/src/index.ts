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

// recreate __dirname for ESM
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
// :::::::::::::::::::: Helper Functions :::::::::::::::

// load Database
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

// Create a new agent 
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

// Create Customer
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

// Check login session
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

// Verify User
function verifyUser(_:Interfaces.LAI): boolean {
  loadDb();
  const currentTimestamp: number = Date.now()
  let loadedDbArr: Interfaces.AgentData[] | Interfaces.CustomerData[] = [];
  if (_.usertype === "agent") loadedDbArr = DBDATA.agents;
  if (_.usertype === "customer") loadedDbArr = DBDATA.customers;
  let userData = loadedDbArr.filter( x => x.email === _.email && x.passwordHash === _.passwordHash );
  if (!userData) return false;
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

// load User Data
function loadUserData(_:Interfaces.LAI, verified: boolean) {
  if (!verified) {
    throw new Error("Verification false, can't load data");
  }
  loadDb();
  let userData = DBDATA[`${_.usertype}s`].filter(x => x.passwordHash === _.passwordHash && x.email === _.email)
  // userData.map((x) => {
  //   let emptyChatData:string[] = [];
  //   x.chatHistory = emptyChatData;
  // })
  return JSON.stringify(userData)
}

// Verify LAI interface
function isLAI(obj: any): obj is Interfaces.LAI {
  return (
    obj &&
    typeof obj.email === "string" &&
    typeof obj.passwordHash === "string" &&
    (obj.usertype === "agent" || obj.usertype === "customer")
  )
}

// Verify CAI interface
function isCAI(obj: any): obj is Interfaces.CAI {
  return (
    obj &&
    typeof obj.name === "string" &&
    typeof obj.email === "string" &&
    typeof obj.passwordHash === "string" &&
    (obj.usertype === "agent" || obj.usertype === "customer")
  )
}


// Verify Auth Form Data
function verifyAuthFormData(_: any, action: "login" | "signup"): 1000 | 1001 | 2000 | 2001 | 3000 {
  if (action === "login") {
    if (!isLAI(_)) return 1001 //"Invalid login payload";
    return 1000 //"Valid login payload";
  }
  if (action === "signup") {
    if (!isCAI(_)) return 2001 //"Invalid signup payload";
    return 2000 //"Valid signup payload"
  }
  return 3000 // Should never return this
}
 
//:::::::::::: Endpoints ::::::::::::::::

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
    if (verifyUser(formData)) return c.json({message: 'Login Successful!', userData: loadUserData(formData, verifyUser(formData))}, 200) 
  } catch (error) {
    return c.json({ error: 'Failed to login', details: String(error) }, 500);
  }
})

// Create a new user
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
      // Validation passed, do nothing and continue
      break;
  }
  
  const usertype = c.req.param('usertype').toLowerCase();

  try {
      if (usertype === "agent") { 
        const user = createAgent(formData);
        return c.json({message: `Agent ${formData.name} create successfully`, data: user}, 200)
      } 
      
      if (usertype === "customer") {
        const user = createCustomer(formData);
        return c.json({message: `Customer ${formData.name} create successfully`, data: user}, 200)
      } 

      return c.json({ error: "Invalid user type specified in URL" }, 400); // 400 Bad Request

  } catch (error) {
    const detailsMessage = (error instanceof Error) ? error.message : String(error);
    
    if (detailsMessage === "User already exists, try logging in instead") {
      return c.json({ Error: 'Failed to create user', details: detailsMessage }, 409); // 409 Conflict
    }

    return c.json({ Error: 'Failed to create user', details: detailsMessage }, 500);
  }
})

export default app
