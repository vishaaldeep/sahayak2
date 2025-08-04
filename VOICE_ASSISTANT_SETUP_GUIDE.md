# Voice Assistant Setup Guide - Sahayak Platform

## 🎯 **Overview**

This guide will help you set up the Voice Assistant feature in your Sahayak platform. The implementation uses Retell AI's voice technology to provide natural voice interactions for users.

## 📋 **Prerequisites**

### **1. Retell AI Account**
- Sign up at [Retell AI](https://retellai.com)
- Create a new agent or use an existing one
- Get your API key and Agent ID

### **2. Environment Setup**
- Node.js (v14 or higher)
- npm or yarn package manager
- Modern web browser with microphone support

## 🔧 **Backend Setup (backend_new)**

### **Step 1: Environment Configuration**

Add the following to your `.env` file:
```env
# Retell AI Configuration
RETELL_API_KEY=your_retell_api_key_here
RETELL_AGENT_ID=your_agent_id_here
```

### **Step 2: Install Dependencies**

The `retell-sdk` is already included in package.json. If you need to install it manually:
```bash
cd backend_new
npm install retell-sdk
```

### **Step 3: Verify Backend Implementation**

The following files have been created/updated:

#### **Files Created:**
- `controller/retellController.js` - Handles Retell API integration
- `routes/retellRoutes.js` - API routes for voice assistant
- `scripts/testVoiceAssistant.js` - Test script for verification

#### **Files Updated:**
- `index.js` - Added retell routes registration
- `package.json` - Added test script

### **Step 4: Test Backend Implementation**

Run the test script to verify everything is working:
```bash
cd backend_new
npm run test-voice
```

Expected output:
```
🎤 TESTING VOICE ASSISTANT IMPLEMENTATION
==================================================
📋 Test 1: Environment Configuration
✅ RETELL_API_KEY is configured
✅ RETELL_AGENT_ID is configured

📋 Test 2: Server Connectivity
✅ Backend server is running

📋 Test 3: Retell Auth Endpoint (General Context)
✅ Retell auth endpoint working with general context
   Call ID: call_12345...
   Access Token: sk_live_12345...

📋 Test 4: Retell Auth Endpoint (Jobs Context)
✅ Retell auth endpoint working with jobs context

📋 Test 5: Error Handling
✅ Error handling working correctly

📋 Test 6: Route Registration
✅ Retell routes are properly registered

📊 TEST SUMMARY
==================================================
Tests Passed: 6/6
Success Rate: 100%

🎉 ALL TESTS PASSED!
✅ Voice Assistant backend is properly configured
✅ Ready for frontend integration
```

## 🎨 **Frontend Setup (frontend_new)**

### **Step 1: Install Dependencies**

The `retell-client-js-sdk` has been added to package.json. Install it:
```bash
cd frontend_new
npm install retell-client-js-sdk
```

### **Step 2: Verify Frontend Implementation**

#### **Files Created:**
- `src/components/VoiceAssistant.jsx` - Voice assistant component
- `VOICE_ASSISTANT_IMPLEMENTATION.md` - Detailed documentation

#### **Files Updated:**
- `src/components/JobsPage.jsx` - Integrated voice assistant
- `package.json` - Added retell-client-js-sdk dependency

### **Step 3: Start Frontend Development Server**

```bash
cd frontend_new
npm start
```

### **Step 4: Test Voice Assistant**

1. **Navigate to Jobs Page**: Go to the jobs section
2. **Look for Voice Button**: You should see a blue microphone button in the bottom-right corner
3. **Grant Permissions**: Click the button and grant microphone permissions when prompted
4. **Test Voice Interaction**: The button should turn red and show "Voice Assistant Active"

## 🎤 **Usage Instructions**

### **For Users**

#### **Starting Voice Assistant:**
1. Click the blue microphone button in the bottom-right corner
2. Grant microphone permissions if prompted
3. Wait for the "Voice Assistant Active" status
4. Start speaking naturally

#### **Stopping Voice Assistant:**
1. Click the red microphone button
2. The conversation will end immediately

#### **Visual Indicators:**
- **Blue Button**: Ready to start
- **Red Button with Pulse**: Active conversation
- **Spinning Loader**: Connecting
- **Green Ping Dot**: Active status indicator
- **Tooltip**: Shows current status

### **For Developers**

#### **Adding Voice Assistant to Other Pages:**
```javascript
import VoiceAssistant from './VoiceAssistant';

const YourPage = () => {
  return (
    <div>
      {/* Your page content */}
      
      {/* Add voice assistant with appropriate context */}
      <VoiceAssistant context="your-page-context" />
    </div>
  );
};
```

#### **Available Contexts:**
- `general` - General platform assistance
- `jobs` - Job-specific assistance
- `profile` - Profile management
- `payments` - Financial assistance
- `assessments` - Skill assessments

## 🔧 **Configuration Options**

### **Backend Configuration**

#### **Custom Agent Configuration:**
```javascript
// In retellController.js
const agentConfig = {
  agent_id: process.env.RETELL_AGENT_ID,
  metadata: {
    context,
    user_id: req.user?.id, // Add user context
    user_role: req.user?.role,
    timestamp: new Date().toISOString()
  }
};
```

#### **Environment Variables:**
```env
# Required
RETELL_API_KEY=your_api_key
RETELL_AGENT_ID=your_agent_id

# Optional
RETELL_BASE_URL=https://api.retellai.com  # Custom base URL
```

### **Frontend Configuration**

#### **Custom Styling:**
```javascript
<VoiceAssistant 
  context="jobs"
  className="custom-voice-assistant"
  position="bottom-left"  // Custom positioning
  theme="dark"           // Custom theme
/>
```

#### **Custom Behavior:**
```javascript
const VoiceAssistant = ({ 
  context = 'general',
  autoStart = false,
  showTooltip = true,
  onCallStart = () => {},
  onCallEnd = () => {}
}) => {
  // Component implementation
};
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. "Failed to start voice assistant"**
**Causes:**
- Missing or invalid RETELL_API_KEY
- Backend server not running
- Network connectivity issues

**Solutions:**
```bash
# Check environment variables
echo $RETELL_API_KEY

# Test backend connectivity
curl http://localhost:5000/api/retell/auth -X POST

# Check server logs
npm run dev  # In backend_new directory
```

#### **2. "No audio detected"**
**Causes:**
- Microphone permissions not granted
- Browser audio settings
- Hardware issues

**Solutions:**
- Grant microphone permissions in browser
- Check browser audio settings
- Test microphone with other applications
- Try different browser

#### **3. "Connection timeout"**
**Causes:**
- Slow internet connection
- Retell service issues
- Firewall blocking connections

**Solutions:**
- Check internet connectivity
- Verify Retell service status
- Check firewall settings
- Try different network

### **Debug Commands**

#### **Backend Debugging:**
```bash
# Test voice assistant
npm run test-voice

# Check server status
curl http://localhost:5000/

# View server logs
npm run dev
```

#### **Frontend Debugging:**
```javascript
// Add to browser console
localStorage.setItem('debug', 'retell:*');

// Check component state
console.log('Voice Assistant State:', {
  isCalling,
  isLoading,
  retellClient
});
```

## 📊 **Monitoring and Analytics**

### **Backend Monitoring**

#### **Log Analysis:**
```bash
# View voice assistant logs
grep "Retell" logs/app.log

# Monitor API calls
grep "Creating Retell call" logs/app.log
```

#### **Metrics Tracking:**
```javascript
// Add to retellController.js
const metrics = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  averageCallDuration: 0
};
```

### **Frontend Monitoring**

#### **Usage Analytics:**
```javascript
// Track voice assistant usage
const trackVoiceUsage = (action, context) => {
  analytics.track('voice_assistant', {
    action,
    context,
    timestamp: new Date().toISOString()
  });
};
```

## 🚀 **Advanced Features**

### **1. Multi-Language Support**

#### **Backend:**
```javascript
const agentConfig = {
  agent_id: getAgentIdForLanguage(req.body.language),
  metadata: {
    language: req.body.language || 'en',
    context
  }
};
```

#### **Frontend:**
```javascript
<VoiceAssistant 
  context="jobs"
  language={currentLanguage}
/>
```

### **2. User Authentication Integration**

```javascript
// Add user context to voice calls
const agentConfig = {
  agent_id: process.env.RETELL_AGENT_ID,
  metadata: {
    context,
    user_id: req.user?.id,
    user_role: req.user?.role,
    user_name: req.user?.name
  }
};
```

### **3. Custom Voice Commands**

Configure your Retell agent to handle specific commands:
- "Find construction jobs near me"
- "Check my application status"
- "Update my profile"
- "Show my earnings"

## 📈 **Performance Optimization**

### **Frontend Optimizations**

#### **Lazy Loading:**
```javascript
const VoiceAssistant = React.lazy(() => import('./VoiceAssistant'));

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <VoiceAssistant context="jobs" />
</Suspense>
```

#### **Memory Management:**
```javascript
useEffect(() => {
  return () => {
    // Cleanup on unmount
    if (retellClient && isCalling) {
      retellClient.stopCall();
    }
  };
}, [retellClient, isCalling]);
```

### **Backend Optimizations**

#### **Connection Pooling:**
```javascript
// Reuse Retell client instance
const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY,
  maxRetries: 3,
  timeout: 30000
});
```

## 🔐 **Security Best Practices**

### **API Key Security**
- Store API keys in environment variables
- Never commit API keys to version control
- Use different keys for development/production
- Rotate keys regularly

### **Access Control**
```javascript
// Add authentication middleware
router.post('/auth', authenticateUser, handleRetellAuth);

// Validate user permissions
const handleRetellAuth = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // ... rest of implementation
};
```

### **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const voiceLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many voice requests, please try again later'
});

router.post('/auth', voiceLimit, handleRetellAuth);
```

## ✅ **Deployment Checklist**

### **Pre-Deployment**
- [ ] Environment variables configured
- [ ] API keys secured
- [ ] Tests passing
- [ ] Error handling implemented
- [ ] Logging configured

### **Production Deployment**
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Monitoring setup
- [ ] Backup procedures
- [ ] Documentation updated

### **Post-Deployment**
- [ ] Functionality tested
- [ ] Performance monitored
- [ ] User feedback collected
- [ ] Analytics configured
- [ ] Support documentation ready

## 🎉 **Success Metrics**

### **Technical Metrics**
- API response time < 2 seconds
- Voice connection success rate > 95%
- Error rate < 5%
- User satisfaction > 4.0/5.0

### **Business Metrics**
- Increased user engagement
- Improved accessibility scores
- Reduced support tickets
- Higher user retention

## 📞 **Support and Resources**

### **Documentation**
- [Retell AI Documentation](https://docs.retellai.com)
- [Voice Assistant Implementation Guide](./VOICE_ASSISTANT_IMPLEMENTATION.md)
- [API Reference](./API_REFERENCE.md)

### **Community**
- [Retell AI Discord](https://discord.gg/retellai)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/retell-ai)

### **Support Contacts**
- Technical Support: tech-support@sahayak.com
- API Issues: api-support@sahayak.com
- General Questions: help@sahayak.com

---

## 🎯 **Quick Start Summary**

1. **Add environment variables** to `.env` file
2. **Run backend test**: `npm run test-voice`
3. **Install frontend dependencies**: `npm install`
4. **Start development servers**: Backend and frontend
5. **Test voice functionality** on JobsPage
6. **Grant microphone permissions** when prompted
7. **Enjoy voice-powered interactions!** 🎤

**Your voice assistant is now ready to enhance the user experience on the Sahayak platform!** ✨