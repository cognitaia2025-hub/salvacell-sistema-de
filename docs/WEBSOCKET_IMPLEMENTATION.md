# WebSocket Real-time Implementation

This implementation provides real-time bidirectional communication between the backend and frontend using WebSockets.

## 📁 Structure

### Backend
```
backend/
├── websockets/
│   ├── __init__.py          # Module exports
│   ├── events.py            # Event types and models
│   └── manager.py           # WebSocket connection manager
└── routers/
    └── websocket.py         # WebSocket endpoints
```

### Frontend
```
src/
├── lib/websocket/
│   ├── types.ts             # TypeScript types
│   └── client.ts            # WebSocket client
├── contexts/
│   └── WebSocketContext.tsx # React context provider
├── hooks/
│   └── use-websocket.ts     # React hooks
└── components/WebSocket/
    ├── ConnectionStatus.tsx # Connection status indicator
    └── NotificationToast.tsx # Real-time notifications
```

## 🚀 Features

### Event Types
- **Orders**: `order_created`, `order_updated`, `order_status_changed`
- **Clients**: `client_created`, `client_updated`
- **Inventory**: `inventory_updated`, `stock_low`
- **Notifications**: `notification`
- **System**: `user_connected`, `user_disconnected`

### Connection Management
- Automatic reconnection with exponential backoff
- Connection status indicators
- Room-based broadcasting
- Per-user message targeting

## 📡 Backend Usage

### Emitting Events from Routers

```python
from routers.websocket import emit_order_created, emit_notification

# Emit an order created event
await emit_order_created({
    "folio": "ORD-001",
    "status": "pending",
    "cliente": "John Doe"
})

# Send a notification to all clients
await emit_notification("New order received!", severity="info")

# Send a notification to a specific user
await emit_notification("Your order is ready!", user_id="user-123", severity="success")
```

### WebSocket Stats Endpoint

```bash
# Get connection statistics
curl http://localhost:8000/ws/stats
```

Response:
```json
{
  "total_connections": 5,
  "unique_users": 3,
  "rooms": {
    "orders": 2,
    "inventory": 1
  }
}
```

## 💻 Frontend Usage

### Using the WebSocket Hook

```tsx
import { useWebSocket } from '@/hooks/use-websocket'
import { EventType } from '@/lib/websocket/types'

function OrdersPage() {
  useWebSocket(EventType.ORDER_CREATED, (event) => {
    console.log('New order created:', event.data)
    // Refresh orders list or show notification
  })
  
  useWebSocket(EventType.ORDER_STATUS_CHANGED, (event) => {
    console.log('Order status changed:', event.data)
    // Update specific order
  })
  
  return <div>Orders Page</div>
}
```

### Using Multiple Event Handlers

```tsx
import { useWebSocketEvents } from '@/hooks/use-websocket'
import { EventType } from '@/lib/websocket/types'

function Dashboard() {
  useWebSocketEvents({
    [EventType.ORDER_CREATED]: (event) => {
      // Handle new order
    },
    [EventType.STOCK_LOW]: (event) => {
      // Handle low stock alert
    },
    [EventType.NOTIFICATION]: (event) => {
      // Handle general notification
    },
  })
  
  return <div>Dashboard</div>
}
```

### Accessing WebSocket Client Directly

```tsx
import { useWebSocketContext } from '@/contexts/WebSocketContext'

function CustomComponent() {
  const { client, isConnected, status } = useWebSocketContext()
  
  const joinOrdersRoom = () => {
    if (client && isConnected) {
      client.joinRoom('orders')
    }
  }
  
  const sendCustomMessage = () => {
    if (client && isConnected) {
      client.send({
        command: 'custom_action',
        data: { foo: 'bar' }
      })
    }
  }
  
  return (
    <div>
      <p>Status: {status}</p>
      <button onClick={joinOrdersRoom}>Join Orders Room</button>
    </div>
  )
}
```

## 🔧 Configuration

### Backend WebSocket URL
The WebSocket endpoint is available at: `ws://localhost:8000/ws/connect`

### Frontend Configuration
Update the WebSocket URL in `src/contexts/WebSocketContext.tsx` if needed:

```tsx
<WebSocketProvider 
  url="ws://your-backend-url/ws/connect"
  autoConnect={true}
>
  {children}
</WebSocketProvider>
```

## 🧪 Testing

### Manual Testing

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend:
```bash
npm run dev
```

3. Open the browser developer console and check for WebSocket connection messages

### Connection Status
The `ConnectionStatus` component will show the current connection state:
- 🔄 Connecting (blue)
- ⭕ Disconnected (gray)
- 🔄 Reconnecting (yellow)
- ⚠️ Error (red)
- Hidden when connected (to avoid UI clutter)

## 📊 Performance Considerations

- **Auto-reconnection**: Maximum 5 attempts with 3-second intervals
- **Connection management**: Automatic cleanup of disconnected clients
- **Broadcasting**: Efficient room-based message distribution
- **Error handling**: Graceful degradation on connection failures

## 🔒 Security Notes

- Authentication can be added via the `token` query parameter
- Implement rate limiting for production use
- Validate all incoming messages on the backend
- Use WSS (WebSocket Secure) in production

## 📝 Future Enhancements

1. **Authentication**: Implement JWT token validation for WebSocket connections
2. **Message Queue**: Add Redis pub/sub for multi-server support
3. **Compression**: Enable WebSocket compression for large payloads
4. **Presence**: Track online/offline user status
5. **Typing Indicators**: Real-time typing indicators for chat features

## 🐛 Troubleshooting

### WebSocket Connection Fails
- Check that the backend is running on the correct port
- Verify CORS settings allow WebSocket connections
- Check browser console for error messages

### Messages Not Received
- Verify the event type matches on both sides
- Check that the WebSocket is in CONNECTED state
- Inspect network tab for WebSocket frames

### High Memory Usage
- Check for memory leaks in event handlers
- Ensure event handlers are properly cleaned up
- Monitor connection count with `/ws/stats` endpoint

## 📚 References

- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/)
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [WebSocket Protocol RFC 6455](https://tools.ietf.org/html/rfc6455)
