import { WebSocketServer } from "ws";

const wss = new WebSocketServer({port: 9999});

wss.on('connection', ws => {
  console.log('Client connected');
  ws.send('Welcome');

  ws.on('message', message => {
    console.log('Received:', message.toString());
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => console.log('Client disconnected'));
});