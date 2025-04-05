// Using fake email handling instead of actual SendGrid integration

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/**
 * Fake send email function that logs the email details and always returns success
 * Now supports sending to multiple recipients
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Default from email if not provided
    const from = options.from || 'noreply@videotimeline.com';
    
    // Handle single recipient or multiple recipients
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
    // Log the email details instead of actually sending
    console.log('============ MOCK EMAIL SENT ============');
    console.log(`From: ${from}`);
    console.log(`To: ${recipients.join(', ')}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Text: ${options.text || 'No text content'}`);
    console.log(`HTML: ${options.html ? 'HTML content available' : 'No HTML content'}`);
    console.log('=========================================');
    
    // Always return success for fake sending
    return true;
  } catch (error) {
    console.error('Error in fake email sending:', error);
    return false;
  }
}

/**
 * Generate an email with a video clip sharing link
 */
export function generateShareEmailHtml(
  clipUrl: string, 
  clipDate: string, 
  clipTime: string, 
  message?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #555555; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FBBC05; padding: 15px; border-radius: 5px; }
        .content { padding: 20px 0; }
        .footer { font-size: 12px; color: #BCBBBB; margin-top: 30px; }
        .button { display: inline-block; background-color: #FBBC05; color: #000000; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; color: #000000;">Video Clip Shared With You</h1>
        </div>
        <div class="content">
          <p>Someone has shared a video clip with you from our Video Timeline Portal.</p>
          
          <p><strong>Clip Details:</strong><br>
          Date: ${clipDate}<br>
          Time: ${clipTime}</p>
          
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          
          <p style="margin: 25px 0;">
            <a href="${clipUrl}" class="button">View Video Clip</a>
          </p>
          
          <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
            ${clipUrl}
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate a simple text message for SMS sharing
 */
export function generateShareTextMessage(
  clipUrl: string, 
  clipDate: string, 
  clipTime: string, 
  message?: string
): string {
  return `Video clip shared with you from Video Timeline Portal
Date: ${clipDate}
Time: ${clipTime}
${message ? `Message: ${message}\n` : ''}
View here: ${clipUrl}`;
}