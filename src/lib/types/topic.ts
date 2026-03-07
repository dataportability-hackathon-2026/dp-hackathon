export type Topic = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  domain: string | null;
  parentGroup: string | null;
  icon: string | null;
  isCommunity: boolean;
  isFavorite: boolean;
  sourceCount: number;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
};
