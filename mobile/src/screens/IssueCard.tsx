// mobile/src/components/IssueCard.tsx
/*
 * Compact: 80px height, show only title + icon + upvotes
 * Expanded: 120px height, add description preview + distance
 * Use consistent spacing (8px, 16px multiples)
 * Category icons: Use emoji for MVP (we'll add icon library later)
 */

interface IssueCardProps {
  issue: {
    id: string;
    title: string;
    category: string;
    status: string;
    distance?: number;
    upvoteCount: number;
    images: string[];
  };
  variant?: 'compact' | 'expanded';
  onPress?: () => void;
}