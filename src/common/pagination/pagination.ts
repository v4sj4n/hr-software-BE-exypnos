import { SelectQueryBuilder } from 'typeorm';
import { IPaginationOptions } from './pagination.interface';

export class Pagination<PaginationObject> {
  readonly results: PaginationObject[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;

  constructor(paginationResults: PaginationObject[], total: number, page: number, limit: number) {
    this.results = paginationResults;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}

export async function paginate<T>(query: SelectQueryBuilder<T>, options: IPaginationOptions): Promise<Pagination<T>> {
  const [results, total] = await query
    .skip((options.page - 1) * options.limit)
    .take(options.limit)
    .getManyAndCount();

  return new Pagination<T>(results, total, options.page, options.limit);
}