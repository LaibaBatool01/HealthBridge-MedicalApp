# Chat Consultation Setup Guide

This guide will help you set up the real-time chat consultation feature with Supabase.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with a PostgreSQL database
2. **Environment Variables**: Configure the required environment variables

## Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration (required for real-time chat)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Database URL (should already be configured)
DATABASE_URL="your_supabase_database_url"

# Clerk Authentication (should already be configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key" 
CLERK_SECRET_KEY="your_clerk_secret_key"
```

## Database Setup

### Option 1: Run the SQL Script Manually

1. Open your Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `db/create-messages-table.sql`
3. Run the script to create the messages table and set up RLS policies

### Option 2: Use Drizzle Migration (if push works)

```bash
npx drizzle-kit push
```

If you encounter errors with `drizzle-kit push`, use Option 1 instead.

## Features Implemented

### ✅ Real-time Chat System
- **Messages Table**: Complete schema with message types, status, and attachments
- **Real-time Updates**: Powered by Supabase real-time subscriptions
- **Message Types**: Text, prescription, system messages, file attachments
- **Message Status**: Sent, delivered, read, failed
- **Row Level Security**: Users can only see/send messages in their consultations

### ✅ Chat UI Components
- **Real-time Message Display**: Messages appear instantly for both users
- **Message Status Indicators**: Read receipts and delivery status
- **Typing Indicators**: Visual feedback when sending messages
- **Error Handling**: Graceful error handling with user feedback
- **Responsive Design**: Works on desktop and mobile

### ✅ Integration with Consultation System
- **Consultation Context**: Chat is tied to specific consultation IDs
- **Doctor/Patient Identity**: Messages show sender names and types
- **Video Call Integration**: Switch between chat and video seamlessly
- **Quick Actions**: Request prescriptions, schedule follow-ups

## How to Test

### 1. Create a Consultation
1. Go to `/consultation/book`
2. Select a doctor and book a chat consultation
3. You'll be redirected to `/consultation/chat?id={consultationId}`

### 2. Test Real-time Messaging
1. **Open Two Browser Windows**:
   - Window 1: Login as a patient, navigate to chat consultation
   - Window 2: Login as a doctor (same consultation)

2. **Send Messages**: 
   - Type and send messages from both sides
   - Messages should appear in real-time on both sides
   - Check message timestamps and read status

3. **Test Features**:
   - Switch to video call
   - End consultation
   - Refresh page (messages should persist)

### 3. Test Error Scenarios
1. **Network Issues**: Disconnect internet and try sending messages
2. **Invalid Consultation**: Try accessing with invalid consultation ID
3. **Unauthorized Access**: Try accessing another user's consultation

## API Endpoints

### Messages API
- `GET /api/messages/[consultationId]` - Fetch messages for a consultation
- `POST /api/messages/send` - Send a new message

### Usage Examples

```javascript
// Fetch messages
const response = await fetch(`/api/messages/${consultationId}`)
const { messages } = await response.json()

// Send message
const response = await fetch('/api/messages/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    consultationId: 'consultation-id',
    content: 'Hello doctor!',
    messageType: 'text'
  })
})
```

## Real-time Subscriptions

The chat uses Supabase real-time to automatically sync messages:

```javascript
// Subscribe to new messages
const channel = supabase
  .channel(`messages-${consultationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public', 
    table: 'messages',
    filter: `consultation_id=eq.${consultationId}`
  }, (payload) => {
    // Handle new message
  })
  .subscribe()
```

## Security

### Row Level Security (RLS)
- Users can only access messages from consultations they're part of
- Clerk JWT is used for authentication in RLS policies
- No direct database access without proper authentication

### Message Validation
- Content is required and trimmed
- Consultation access is verified before sending
- Message types are validated

## Troubleshooting

### Common Issues

1. **Messages not appearing in real-time**
   - Check Supabase environment variables
   - Verify real-time is enabled in Supabase dashboard
   - Check browser console for WebSocket errors

2. **"Not authenticated" errors**
   - Ensure Clerk is properly configured
   - Check that users are logged in
   - Verify JWT tokens are being passed correctly

3. **"Consultation not found" errors**
   - Ensure consultation exists in database
   - Check consultation ID in URL
   - Verify user has access to the consultation

4. **Database connection issues**
   - Check DATABASE_URL environment variable
   - Ensure Supabase database is running
   - Verify connection string format

### Debug Steps

1. **Check Network Tab**: Look for failed API requests
2. **Check Console**: Look for JavaScript errors
3. **Check Supabase Logs**: Monitor database and real-time logs
4. **Test API Endpoints**: Use tools like Postman to test endpoints directly

## Next Steps

The chat consultation system is now fully functional! You can extend it with:

1. **File Attachments**: Implement file upload for images/documents
2. **Message Threading**: Add reply-to functionality
3. **Message Reactions**: Add emoji reactions to messages
4. **Chat History**: Add message search and filtering
5. **Notification System**: Add push notifications for new messages
6. **Voice Messages**: Add voice note functionality

## Architecture Summary

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Chat UI       │◄──►│  useMessages     │◄──►│   Supabase      │
│   Component     │    │  Hook            │    │   Real-time     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   API Routes     │
                       │   /api/messages  │
                       └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Server Actions │
                       │   & Database     │
                       └──────────────────┘
```

The system provides a complete, production-ready chat consultation feature with real-time messaging, authentication, and security!