# Block Databricks Integration Guide

**Status: ✅ WORKING** - Successfully integrated with PAT authentication

This guide documents the successful integration of Carole with Block's internal Databricks platform using Personal Access Token (PAT) authentication.

## 🎯 Current Status

- ✅ **Authentication Working**: PAT token authentication successfully implemented
- ✅ **Real AI Responses**: Claude 3.5 Sonnet, GPT-4o, and Llama 3.1 405B working
- ✅ **Production Ready**: Both development and production modes functional
- ✅ **Multi-Model Support**: Real-time model switching implemented

## 🔐 Authentication Setup

### Step 1: Get Your Personal Access Token

1. **Access Block Databricks**: Navigate to `https://block-lakehouse-production.cloud.databricks.com`
2. **Log in** with your Block SSO credentials
3. **Generate PAT Token**:
   - Click your username (top right) → **Settings**
   - Click **Developer**
   - Next to **Access tokens**, click **Manage**
   - Click **Generate new token**
   - **Comment**: "Carole AI Assistant Local Development"
   - **Lifetime**: 90 days (or your preference)
   - **Copy the token** - save it securely!

### Step 2: Configure Environment

Add to your `.env.local`:

```bash
# Databricks PAT Authentication
VITE_DATABRICKS_TOKEN=dapi-your-actual-token-here
VITE_DATABRICKS_ENV=production
VITE_DATABRICKS_HOST=https://block-lakehouse-production.cloud.databricks.com
```

## 🏗️ Technical Implementation

### Service Architecture

The `DatabricksService` class handles:

- **PAT Authentication**: Bearer token in Authorization header
- **Multi-Model Support**: Claude 3.5 Sonnet, GPT-4o, Llama 3.1 405B
- **Environment Switching**: Development (simulated) vs Production (real API calls)
- **Error Handling**: Comprehensive error messaging and logging
- **Type Safety**: Full TypeScript interfaces

### API Endpoints Used

```typescript
// Connection Test
GET /api/databricks/api/2.0/clusters/list
Authorization: Bearer {PAT_TOKEN}

// Model Listing
GET /api/databricks/api/2.0/serving-endpoints
Authorization: Bearer {PAT_TOKEN}

// AI Chat
POST /api/databricks/serving-endpoints/{model}/invocations
Authorization: Bearer {PAT_TOKEN}
Content-Type: application/json
```

### Proxy Configuration

The Vite proxy routes requests seamlessly:

```javascript
// vite.config.js
'/api/databricks': {
  target: 'https://block-lakehouse-production.cloud.databricks.com',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/databricks/, ''),
}
```

## 🚀 Features Working

### Real AI Chat

- **Claude 3.5 Sonnet**: Most capable model for complex reasoning
- **GPT-4o**: OpenAI's multimodal model
- **Llama 3.1 405B**: Meta's largest open model
- **Real-time switching** between models

### Context-Aware Responses

- AI has access to user's actual task data
- Natural language task creation
- Priority suggestions based on real tasks
- Conversation context maintained

### Production Features

- **Connection status**: Visual indicators for connectivity
- **Error handling**: User-friendly error messages
- **Loading states**: Proper loading indicators
- **Model selection**: Dropdown UI for model switching

## 🔧 Development vs Production

### Development Mode

```bash
VITE_DATABRICKS_ENV=development
```

- Simulated AI responses for testing
- No PAT token required
- Faster development iteration

### Production Mode

```bash
VITE_DATABRICKS_ENV=production
VITE_DATABRICKS_TOKEN=your-pat-token
```

- Real API calls to Block Databricks
- Actual AI model responses
- Full feature functionality

## 🎯 Usage Examples

### Chat Interface

```
User: "What should I work on today?"
AI: *Analyzes your actual tasks and provides prioritized recommendations*

User: "Create a task to review the quarterly budget"
AI: *Creates actual database task with appropriate priority and tags*
```

### Model Switching

- Select different models from dropdown
- Each model provides different response styles
- Real-time switching without losing context

## 🐛 Troubleshooting

### Common Issues

**401 Unauthorized Error:**

- Check PAT token is valid and not expired
- Ensure token has proper workspace permissions
- Verify token is correctly set in environment variables

**Missing Models:**

- Confirm serving endpoints are available in your workspace
- Check model names match exactly
- Verify workspace has access to required models

**Connection Timeouts:**

- Check Block network connectivity
- Verify proxy configuration
- Ensure PAT has proper permissions

### Debug Steps

1. **Check Console Logs**: Look for detailed error messages
2. **Verify Environment**: Ensure all variables are set correctly
3. **Test Connection**: Use browser network tab to inspect API calls
4. **Token Validation**: Test PAT directly with Databricks CLI if available

## 🎉 Success Metrics

- ✅ **Authentication**: PAT token authentication working
- ✅ **API Calls**: All endpoints responding correctly
- ✅ **Model Access**: All 3 models (Claude, GPT-4o, Llama) accessible
- ✅ **Real Responses**: Actual AI responses from Block platform
- ✅ **Context Integration**: AI aware of user's task data
- ✅ **Production Ready**: Suitable for internal Block usage

## 📚 References

- **Block Databricks**: `https://block-lakehouse-production.cloud.databricks.com`
- **Databricks API Docs**: Standard Databricks REST API documentation
- **PAT Authentication**: Databricks Personal Access Token documentation
- **Anthropic Case Study**: Block's usage of Claude in Databricks

---

**Last Updated**: December 20, 2024  
**Status**: Production Ready ✅
