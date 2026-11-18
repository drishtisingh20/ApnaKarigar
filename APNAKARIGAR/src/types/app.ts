export type Language = 'hi' | 'en';
export type Role = 'artisan' | 'buyer';
export type RequirementCategory = 'funding' | 'materials' | 'tools' | 'market';

export type Requirement = {
  category: RequirementCategory;
  title: string;
  titleHi: string;
  detail: string;
  detailHi: string;
  amount?: string;
};

export type Work = {
  id: string;
  artisanId: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  image: string;
  /** Filled in by the server so cards need no extra lookup. */
  artisanName?: string;
  createdAt?: string;
};

export type Artisan = {
  id: string;
  name: string;
  craft: string;
  craftHi: string;
  village: string;
  villageHi: string;
  bio: string;
  bioHi: string;
  avatar: string;
  cover: string;
  requirement: Requirement;
  workIds: string[];
};
