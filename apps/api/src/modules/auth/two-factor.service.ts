import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  constructor(private configService: ConfigService) {}

  generateSecret(): string {
    const secret = speakeasy.generateSecret({
      name: this.configService.get('TWO_FA_SERVICE_NAME', 'MovieSite Admin'),
      length: 32,
    });

    return secret.base32;
  }

  async generateQRCode(secret: string, email: string): Promise<string> {
    const serviceName = this.configService.get('TWO_FA_SERVICE_NAME', 'MovieSite Admin');
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: email,
      issuer: serviceName,
    });

    return QRCode.toDataURL(otpauthUrl);
  }

  async verifyToken(secret: string, token: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time windows (60 seconds) for clock drift
    });
  }

  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character backup code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }

    return codes;
  }

  async verifyBackupCode(storedCodes: string[], providedCode: string): Promise<boolean> {
    const normalizedCode = providedCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const index = storedCodes.indexOf(normalizedCode);
    
    if (index > -1) {
      // Remove used backup code
      storedCodes.splice(index, 1);
      return true;
    }

    return false;
  }
}
