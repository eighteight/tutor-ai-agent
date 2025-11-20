# Telegram Bot Setup Guide

## Step 1: Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow prompts:
   - Choose bot name (e.g., "Tutor AI Agent")
   - Choose username (e.g., "tutor_ai_agent_bot")
4. Save the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Send `/setdescription` to add bot description
6. Send `/setabouttext` to add about text
7. Send `/setcommands` and paste:
```
start - Start learning and see available courses
courses - List all available courses
learn - Start learning a course (e.g., /learn variables)
stats - View your learning statistics
reset - Reset your session
help - Show available commands
```

## Step 2: Setup ngrok (Expose n8n to Internet)

1. **Install ngrok** (if not already installed):
```bash
brew install ngrok  # macOS
# OR download from https://ngrok.com/download
```

2. **Start ngrok tunnel** to expose n8n:
```bash
ngrok http 5678
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5678
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`) - you'll need this!

## Step 3: Configure n8n Telegram Workflow

1. Add bot token to `.env` file:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

2. **Create Telegram Workflow in n8n**:
   - Open n8n at http://localhost:5678
   - Create new workflow
   - Add "Telegram" trigger node (from triggers section)
   - Select trigger type: **"on message"**
   - Select your Telegram API credential
   - **Webhook URL field**: This will auto-populate with your n8n URL
   - Click "Get Webhook URL" button if available
   - You should see something like: `http://localhost:5678/webhook/...`
   
3. **Update Webhook URL to use ngrok**:
   - The webhook URL will be auto-generated
   - Note the path (e.g., `/webhook/abc-123-def`)
   - The full webhook URL for Telegram will be: `https://YOUR_NGROK_URL/webhook/abc-123-def`
   - n8n will automatically register this with Telegram when you activate

4. **Add "Code" node** to handle commands:

```javascript
const chatId = $input.first().json.message.chat.id;
const text = $input.first().json.message.text || '';

let message = '';

if (text === '/start') {
  message = '🎓 *Welcome to Tutor AI Agent!*\n\nUse /help to see available commands.';
} else if (text === '/help') {
  message = '*Available Commands:*\n/start - Start\n/courses - List courses\n/learn [course] - Start learning\n/stats - View statistics\n/reset - Reset session';
} else if (text === '/courses') {
  message = 'Fetching courses...';
} else {
  message = `Echo: ${text}`;
}

return { chatId, message };
```

5. **Add "Telegram" node** (Send Message):
   - Add regular Telegram node (not trigger)
   - Operation: "Send Message"
   - Chat ID: `{{ $json.chatId }}`
   - Text: `{{ $json.message }}`
   - Additional Fields → Parse Mode: "Markdown"
   - Select your Telegram API credential

6. **Connect nodes**: Telegram Trigger → Code → Telegram Send

7. **Configure ngrok URL in n8n**:
   - Go to Settings → General
   - Set "Webhook URL" to your ngrok HTTPS URL: `https://abc123.ngrok.io`
   - Save settings
   - Restart n8n or reload the workflow

8. **Activate workflow** - n8n will automatically register the webhook with Telegram

9. **Test**: Send `/start` to your bot in Telegram

## Step 4: Expand with LightRAG Integration

Once the basic bot works, add LightRAG integration:

   a. **Add Switch node** after Telegram Trigger to route commands
   
   b. **Add HTTP Request node** to call LightRAG:


## Troubleshooting

- **"HTTPS URL must be provided for webhook" error**: 
  - The imported workflow uses old node types
  - Create a new workflow manually using "Telegram" node with "Receive" operation
  - This automatically uses Polling mode (no webhook needed)
- **"Credential with ID does not exist" error**: Create Telegram API credential first (see Step 3)
- **Bot not responding**: Check that n8n workflow is activated and using "Receive" operation
- **Token error**: Verify bot token in credential settings
- **LightRAG errors**: Ensure LightRAG server is running on port 8000
- **Ollama errors**: Ensure Ollama is running with required models

## Available Commands

- `/start` - Welcome message and course list
- `/courses` - Show all available courses
- `/learn [course]` - Start learning (e.g., `/learn variables`)
- `/stats` - Show retention history and average
- `/reset` - Clear session and start over
- `/help` - Show command list
