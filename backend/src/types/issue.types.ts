// backend/src/types/issue.types.ts

import { IssueCategory } from '@prisma/client';

export interface CreateIssueDTO { // Data Transfer Object for creating an issue
  title: string;
  description: string;
  category: IssueCategory;
  latitude: number;
  longitude: number;
  images: string[];
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  images: string[];
  createdAt: Date;
  upvoteCount: number;
}