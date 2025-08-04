# Retell 404 Error Troubleshooting Guide

## 🚨 **Issue**: Getting 404 for http://localhost:5000/api/retell/auth

## 🔍 **Diagnostic Steps**

### **Step 1: Check Server Status**
```bash
# Navigate to backend_new directory
cd backend_new

# Check if server is running
curl http://localhost:5000/

# Expected response: "✅ Auth Server Running"
```

### **Step 2: Test Route Registration**
```bash
# Run route registration test
npm run test-routes

# This will check:
# - Server connectivity
# - Route registration
# - Dependencies
# - Environment variables
```

### **Step 3: Test Debug Routes**
```bash
# Test the debug route
curl http://localhost:5000/api/retell/test

# Test GET auth route
curl http://localhost:5000/api/retell/auth

# Test POST auth route
curl -X POST http://localhost:5000/api/retell/auth \
  -H "Content-Type: application/json" \
  -d '{"context": "test"}'
```

## 🔧 **Common Fixes**

### **Fix 1: Restart the Server**
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev

# Look for these messages in the console:
# "🎤 Registering Retell routes at /api/retell"
# "✅ Retell routes registered successfully"
```

### **Fix 2: Check Dependencies**
```bash
# Verify retell-sdk is installed
npm list retell-sdk

# If not installed, install it
npm install retell-sdk
```

### **Fix 3: Environment Variables**
```bash
# Check if .env file exists
ls -la .env

# Check if RETELL_API_KEY is set
echo $RETELL_API_KEY

# If missing, add to .env file:
# RETELL_API_KEY=your_api_key_here
# RETELL_AGENT_ID=your_agent_id_here
```

### **Fix 4: Port Conflicts**
```bash
# Check if port 5000 is in use
netstat -an | grep 5000

# If port is busy, change PORT in .env:
# PORT=5001
```

### **Fix 5: Database Connection Issues**
The routes are registered inside the `connectDB().then()` block. If database connection fails, routes won't be registered.

```bash
# Check MongoDB connection
# Look for this message: "MongoDB connected successfully"
# If not, check your MONGODB_URI in .env
```

## 🛠️ **Manual Verification**

### **Check File Structure**
```
backend_new/
├── controller/
│   └── retellController.js ✅
├── routes/
│   └── retellRoutes.js ✅
├── index.js ✅ (routes registered)
└── package.json ✅ (retell-sdk dependency)
```

### **Verify Route Registration in index.js**
Look for these lines in `backend_new/index.js`:
```javascript
const retellRoutes = require('./routes/retellRoutes'); // ✅
app.use('/api/retell', retellRoutes); // ✅
```

### **Check Controller Export**
In `backend_new/controller/retellController.js`:
```javascript
module.exports = { handleRetellAuth }; // ✅
```

### **Check Route Import**
In `backend_new/routes/retellRoutes.js`:
```javascript
const { handleRetellAuth } = require('../controller/retellController'); // ✅
```

## 🔄 **Step-by-Step Resolution**

### **1. Clean Restart**
```bash
# Stop server
# Clear any cached modules
rm -rf node_modules/.cache

# Restart server
npm run dev
```

### **2. Test Incrementally**
```bash
# Test 1: Server running
curl http://localhost:5000/

# Test 2: Debug route
curl http://localhost:5000/api/retell/test

# Test 3: GET auth route
curl http://localhost:5000/api/retell/auth

# Test 4: POST auth route
curl -X POST http://localhost:5000/api/retell/auth \
  -H "Content-Type: application/json" \
  -d '{"context": "test"}'
```

### **3. Check Server Logs**
When starting the server, you should see:
```
🚀 Server is running on http://localhost:5000
🎤 Registering Retell routes at /api/retell
✅ Retell routes registered successfully
MongoDB connected successfully
```

## 🚨 **Emergency Fix**

If the issue persists, try this emergency fix:

### **Option 1: Move Route Registration Outside DB Block**
```javascript
// In index.js, move retell routes outside connectDB block
app.use('/api/retell', retellRoutes);

connectDB().then(() => {
  // Other routes here
});
```

### **Option 2: Add Route Directly to index.js**
```javascript
// Add directly to index.js for testing
app.post('/api/retell/auth', async (req, res) => {
  res.json({ message: 'Direct route working', timestamp: new Date() });
});
```

## 📊 **Verification Commands**

### **Complete Test Suite**
```bash
# Run all tests
npm run test-routes
npm run test-voice

# Manual curl tests
curl http://localhost:5000/api/retell/test
curl http://localhost:5000/api/retell/auth
curl -X POST http://localhost:5000/api/retell/auth -H "Content-Type: application/json" -d '{"context":"test"}'
```

### **Expected Responses**

#### **GET /api/retell/test**
```json
{
  "message": "Retell routes are working!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "route": "/api/retell/test"
}
```

#### **GET /api/retell/auth**
```json
{
  "message": "Retell auth endpoint is available. Use POST method to create a call.",
  "methods": ["POST"],
  "endpoint": "/api/retell/auth"
}
```

#### **POST /api/retell/auth**
```json
{
  "call_id": "call_12345...",
  "access_token": "sk_live_12345..."
}
```
OR (if API key missing):
```json
{
  "error": "Failed to create Retell call",
  "details": "API key error message"
}
```

## 🎯 **Quick Resolution Checklist**

- [ ] Server is running on port 5000
- [ ] MongoDB is connected
- [ ] retell-sdk is installed
- [ ] RETELL_API_KEY is in .env file
- [ ] Routes are registered (check console logs)
- [ ] No port conflicts
- [ ] No syntax errors in route files
- [ ] Proper file paths and imports

## 📞 **If All Else Fails**

1. **Check the exact error message** in server console
2. **Verify the request URL** is exactly `http://localhost:5000/api/retell/auth`
3. **Try a different port** by changing PORT in .env
4. **Check firewall/antivirus** blocking the connection
5. **Try from a different terminal/browser**

## 🎉 **Success Indicators**

When everything is working, you should see:
- ✅ Server starts without errors
- ✅ Route registration messages in console
- ✅ Debug routes respond correctly
- ✅ POST /api/retell/auth returns call data or proper error
- ✅ Frontend voice assistant connects successfully