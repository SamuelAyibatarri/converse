let socket: WebSocket | null = null;
let reconnectDelay = 1000; 

export function connect() {
  socket = new WebSocket('ws://localhost:9999');

  socket.onopen = () => {
    console.log('Connected');
    reconnectDelay = 1000; 
  };

  socket.onmessage = e => console.log('Message from server:', e.data);

  socket.onclose = () => {
    console.warn('Disconnected');
    setTimeout(connect, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, 10000); // exponential backoff up to 10s
  };

  socket.onerror = err => {
    console.error('WebSocket error:', err);
    socket?.close();
  };
}

export function sendMessage() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const msg = JSON.stringify({
      message: 'Some message data',
      sender: 'some random uuid',
      receiver: 'another random uuid',
    });
    socket.send(msg);
  } else {
    console.warn('Socket not open');
  }
}
