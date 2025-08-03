# Decentro Integration Guide

This document explains the Decentro integration for eNACH mandates and virtual accounts in the Sahaayak platform.

## Features Implemented

### 1. Virtual Account Integration (Wallet)
- **Purpose**: Acts as a digital wallet for users
- **API Used**: `/v2/payments/virtual_account/upi`
- **Features**:
  - Create virtual UPI accounts for users
  - Real-time balance checking
  - Transaction history tracking
  - Webhook notifications for credits

### 2. eNACH Mandate Integration (Recurring Payments)
- **Purpose**: Set up automated recurring payments from employers to job seekers
- **API Used**: `/v2/payments/enach/mandate` + `/v2/payments/upi/payout` or `/v2/payments/bank/payout`
- **Flow**: 
  1. **Collection**: Employer Bank → Platform Account (via eNACH mandate)
  2. **Distribution**: Platform Account → Employee Bank (via UPI/Bank payout)
- **Features**:
  - Create eNACH mandates for collecting from employer
  - Automatic payout to employee after collection
  - Support for multiple frequencies (daily, weekly, monthly, etc.)
  - UPI payout with bank transfer fallback
  - Status tracking and updates via webhooks
  - Manual payment execution for active mandates
  - PAN number collection for mandate registration

## API Endpoints

### Wallet Endpoints
- `POST /api/wallet/create-decentro` - Create virtual account
- `GET /api/wallet/decentro-balance` - Get virtual account balance
- `GET /api/wallet/` - Get wallet details (includes Decentro balance)
- `GET /api/wallet/transactions` - Get all transactions (local + Decentro)

### Recurring Payment Endpoints
- `POST /api/recurring-payments` - Create new eNACH mandate
- `GET /api/recurring-payments/employer/:id` - Get employer's recurring payments
- `GET /api/recurring-payments/seeker/:id` - Get seeker's recurring payments
- `GET /api/recurring-payments/:id/mandate-status` - Check mandate status
- `POST /api/recurring-payments/:id/execute-payment` - Execute payment manually

### Webhook Endpoint
- `POST /api/decentro-webhook/status` - Handle Decentro webhooks

## Environment Variables Required

```env
DECENTRO_BASE_URL=https://staging.api.decentro.tech
DECENTRO_CLIENT_ID=your_client_id
DECENTRO_CLIENT_SECRET=your_client_secret
```

## Database Schema Updates

### UserBankDetails Model
- Added `pan` - PAN number for eNACH mandate registration
- Added `account_type` - Account type (SAVINGS/CURRENT)

### User Model
- Added `pan` - PAN number for financial transactions

### RecurringPayment Model
- Added `decentro_reference_id` - Reference ID for mandate
- Added `authentication_url` - URL for mandate authentication
- Updated status enum to include authentication states

### Transaction Model
- Added `description` - Transaction description
- Added `external_transaction_id` - External transaction reference
- Added `source` - Source of transaction (internal, decentro, etc.)

## Frontend Integration

### Wallet Page
- Button to create Decentro virtual account
- Display virtual account UPI ID and reference ID
- Show combined balance (local + Decentro)
- Unified transaction history

### Recurring Payments Setup
- Enhanced UI with status indicators
- Authentication URL handling
- Status checking functionality
- Manual payment execution for active mandates

## API Payload Structure

### eNACH Mandate Creation
```json
{
  "consumer": {
    "name": "Account Holder Name",
    "account_number": "1234567890",
    "account_type": "SAVINGS",
    "reference_number": "unique_reference",
    "bank_code": "HDFC",
    "mobile": "9999999999",
    "email": "user@example.com",
    "bank_id": "HDFC",
    "pan": "ABCDE1234F"
  },
  "reference_id": "unique_reference",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "amount": 1000,
  "amount_rule": "max",
  "category_code": "elec",
  "frequency": "monthly",
  "authentication_mode": "DebitCard"
}
```

## Webhook Handling

The system handles three types of webhooks:

1. **Mandate Status Updates**: Updates recurring payment status
2. **Payment Status Updates**: Tracks individual payment executions
3. **Virtual Account Credits**: Automatically updates wallet balance

## Security Considerations

1. **Webhook Validation**: Implement signature verification (TODO)
2. **IP Whitelisting**: Restrict webhook endpoints to Decentro IPs
3. **Rate Limiting**: Implement rate limiting on API endpoints
4. **Data Encryption**: Sensitive data should be encrypted at rest

## Testing

### Staging Environment
- Use Decentro staging URLs and credentials
- Test mandate creation and authentication flow
- Verify webhook handling with test data

### Production Checklist
- [ ] Update to production Decentro URLs
- [ ] Implement webhook signature verification
- [ ] Set up monitoring and alerting
- [ ] Configure proper error handling and logging
- [ ] Test with real bank accounts (small amounts)

## Error Handling

The integration includes comprehensive error handling:
- API call failures are logged and returned to frontend
- Webhook processing errors don't affect other operations
- Database operations are wrapped in try-catch blocks
- User-friendly error messages in frontend

## Monitoring

Key metrics to monitor:
- Virtual account creation success rate
- Mandate registration success rate
- Webhook processing success rate
- Payment execution success rate
- API response times

## Support

For issues with Decentro integration:
1. Check Decentro API documentation
2. Verify environment variables
3. Check webhook logs
4. Contact Decentro support if needed