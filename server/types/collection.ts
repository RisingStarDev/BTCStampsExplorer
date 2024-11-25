interface CollectionRow {
  collection_id: string;
  collection_name: string;
  collection_description: string;
  creators: string[];
  stamp_count: number;
  total_editions: number;
  stamp_numbers: number[];
}

interface CollectionQueryParams {
  limit?: number;
  page?: number;
  creator?: string;
}

interface PaginatedCollectionResponseBody {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  last_block: number;
  data: CollectionRow[];
} 