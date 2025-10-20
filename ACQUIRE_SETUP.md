# Acquisition Form Setup Guide

## Environment Variables Configuration

To enable the acquisition form email functionality, you need to create a `.env.local` file in your project root with the following variables:

```env
# Email Configuration for Acquisition Form
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
# Note: Emails are automatically sent to both this email and Info@artwings.art
CLIENT_EMAIL=client@artwings.com
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password as `SMTP_PASS`

## Alternative Email Services

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## Testing

1. Start your development server: `npm run dev`
2. Navigate to any artwork page
3. Click the "Acquire" button
4. Fill out and submit the form
5. Check your configured email for the inquiry

## Features

- ✅ Responsive dialog form
- ✅ Form validation
- ✅ Email template with artwork details
- ✅ Buyer information collection
- ✅ Success/error feedback
- ✅ Mobile-friendly design
- ✅ Multiple recipient support (sends to both configured email and Info@artwings.art)

## Form Fields

- **Full Name** (required)
- **Email Address** (required)
- **Phone Number** (optional)
- **Country** (required)
- **City** (required)
- **Message** (optional)

The email will include all form data plus the artwork title and artist name.
