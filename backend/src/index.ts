import { Hono } from 'hono'
import { v4 as uuidv4 } from 'uuid';
import type * as Interfaces from './Interfaces.js';
import fs, { existsSync } from 'fs';
import path from 'path'
import { json } from 'stream/consumers';
import { fileURLToPath } from 'url';

// recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono()

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

// Create a new agent 
function createAgent(_:Interfaces.CAI) {
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
  console.log("User created successfully")
}

// Create Customer
function createCustomer(_:Interfaces.CAI) {
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
  console.log("User created successfully")
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
  // userData[0].lastLogin = currentTimestamp;
  // updatedData[`${_.usertype}s`] = [...DBDATA[`${_.usertype}s`], userData[0]]
  fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 2))
  return true;
}

// load User Data
function loadUserData(_:Interfaces.LAI, verified: boolean) {
  if (!verified) {
    throw new Error("Verification false, can't load data");
  }
  return 
}
 
//:::::::::::: Endpoints ::::::::::::::::

app.get('/', (c) => {
  return c.text('Hono API is running! 🚀')
})

app.post('/api/auth/login/:usertype', async (c) => {
  const formData: Interfaces.LAI = await c.req.json();
  const usertype: "agent" | "customer" = c.req.param('usertype') as "agent" | "customer";
  try {
    if (verifyUser(formData)) return c.json({message: 'Login Successful!'}, 200) 
  } catch (error) {
    return c.json({ error: 'Failed to login', details: String(error) }, 500);
  }
})

// Create a new user
app.post('/api/auth/signup/:usertype', async (c) => {
  const formData: Interfaces.CAI = await c.req.json();
  const usertype: "agent" | "customer" = c.req.param('usertype') as "agent" | "customer";
  try {
      if (usertype == "agent") {
        createAgent(formData);
        return c.json({message: `Agent ${formData.name} create successfully`}, 200)
      } 
      if (usertype == "customer") {
        createCustomer(formData);
        return c.json({message: `Customer ${formData.name} create successfully`}, 200)
      }
  } catch (error) {
    return c.json({ error: 'Failed to create user', details: String(error) }, 500);
  }

})

export default app