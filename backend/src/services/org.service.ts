// backend/src/services/org.service.ts

import { OrgRepository } from '../repositories/org.repository';
import { IssueCategory } from '@civickit/shared';
import { AppError } from '../utils/errors';

export class OrgService {
  constructor(private orgRepository: OrgRepository) { }

  async findOrgsForIssue(lat: number, lng: number, category: IssueCategory) {
    if (lat === undefined || lng === undefined) {
      throw new AppError('Latitude and longitude are required', 400);
    }
    return this.orgRepository.findOrgsForIssue(lat, lng, category);
  }

  async findIssuesForOrg(organizationId: string) {
    if (!organizationId) {
      throw new AppError('organizationId is required', 400);
    }
    return this.orgRepository.findIssuesForOrg(organizationId);
  }
}
