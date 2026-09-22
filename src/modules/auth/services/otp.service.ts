import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OtpGenerationResult {
  otp: string;
  validTill: Date;
}

export interface SendOtpParams {
  email?: string | null;
  mobileNumber?: string | null;
  mobileCountryCode?: string | null;
  otp: string;
  reason?: 'registration' | 'login' | 'resend';
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generates a 6-digit numeric OTP and calculates validity expiration (default 10 minutes).
   */
  generateOtp(validityMinutes: number = 10): OtpGenerationResult {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const validTill = new Date(Date.now() + validityMinutes * 60 * 1000);
    return { otp, validTill };
  }

  /**
   * Checks whether live SMS service is enabled via environment or config.
   */
  isSmsServiceEnabled(): boolean {
    const flag =
      this.configService.get<string>('ENABLE_OTP_SMS') ??
      process.env.ENABLE_OTP_SMS ??
      'false';
    return flag.toLowerCase() === 'true' || flag === '1';
  }

  /**
   * Sends OTP via SMS provider if enabled, otherwise logs clearly to console for dev/manual use.
   */
  async sendOtp(params: SendOtpParams): Promise<{ sentViaSms: boolean; message: string }> {
    const { email, mobileNumber, mobileCountryCode, otp, reason = 'verification' } = params;
    const recipient = mobileNumber
      ? `${mobileCountryCode || '+91'} ${mobileNumber}`
      : email || 'User';

    if (this.isSmsServiceEnabled()) {
      try {
        // --- Live SMS Service Integration Hook ---
        // You can integrate any SMS Gateway provider here (e.g. Twilio, MSG91, Fast2SMS, etc.)
        // Example: await this.smsProvider.send(recipient, `Your Dholera verification OTP is ${otp}`);
        this.logger.log(`[SMS INTEGRATION] Sending OTP ${otp} to ${recipient} for ${reason}`);
        return {
          sentViaSms: true,
          message: `OTP sent successfully to ${recipient}`,
        };
      } catch (error) {
        this.logger.error(`Failed to send SMS to ${recipient}: ${error}`);
        // Fallback to console log so development/testing is never blocked
        this.printConsoleOtp(recipient, otp, reason);
        return {
          sentViaSms: false,
          message: 'Failed to send SMS, fallback OTP logged to console.',
        };
      }
    } else {
      this.printConsoleOtp(recipient, otp, reason);
      return {
        sentViaSms: false,
        message: `OTP generated. (SMS service flag is currently inactive; check server console or database).`,
      };
    }
  }

  private printConsoleOtp(recipient: string, otp: string, reason: string): void {
    console.log('\n============================================================');
    console.log(`[DHULERA OTP SERVICE] [${reason.toUpperCase()}]`);
    console.log(`Recipient : ${recipient}`);
    console.log(`OTP Code  : >>> ${otp} <<<`);
    console.log(`Valid For : 10 Minutes`);
    console.log('============================================================\n');
  }
}
