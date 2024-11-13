import { Post } from '../entities/post.entity';

export interface PostSearchResponse {
  items: Post[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  hashtags?: {
    tag: string;
    count: number;
  }[];
}