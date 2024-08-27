import { Injectable, BadRequestException } from '@nestjs/common';
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecaptchaService {
  createAssessment(recaptchaToken: string, recaptchaAction: string) {
    throw new Error('Method not implemented.');
  }
  private client: RecaptchaEnterpriseServiceClient;
  private projectID: string;

  constructor(private configService: ConfigService) {
    this.client = new RecaptchaEnterpriseServiceClient();
    this.projectID = this.configService.get<string>('GOOGLE_CLOUD_PROJECT_ID');
  }

  async verifyToken(token: string, action: string): Promise<number> {
    const siteKey = this.configService.get<string>('RECAPTCHA_SITE_KEY');

    const request = {
      parent: this.client.projectPath(this.projectID),
      assessment: {
        event: {
          siteKey,
          token,
        },
      },
    };

    const [response] = await this.client.createAssessment(request);

    // Validate the token
    if (!response.tokenProperties.valid) {
      throw new BadRequestException(`Invalid token: ${response.tokenProperties.invalidReason}`);
    }

    // Ensure the action matches
    if (response.tokenProperties.action !== action) {
      throw new BadRequestException(
        `Action mismatch: expected ${action}, but got ${response.tokenProperties.action}`,
      );
    }

    return response.riskAnalysis.score;
  }
}
