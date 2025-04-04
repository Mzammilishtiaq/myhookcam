/**
 * Mock SMS sending functionality
 */

interface SMSOptions {
  to: string;
  body: string;
}

/**
 * Fake send SMS function that logs the SMS details and always returns success
 */
export async function sendSMS(options: SMSOptions): Promise<boolean> {
  try {
    // Log the SMS details instead of actually sending
    console.log('============== MOCK SMS SENT ==============');
    console.log(`To: ${options.to}`);
    console.log(`Body: ${options.body}`);
    console.log('===========================================');
    
    // Always return success for fake sending
    return true;
  } catch (error) {
    console.error('Error in fake SMS sending:', error);
    return false;
  }
}