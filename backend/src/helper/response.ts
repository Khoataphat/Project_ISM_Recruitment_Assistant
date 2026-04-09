import { ErrorCustom } from "./index";

export class Pagination {
  constructor(
    public total: number,
    public page: number,
    public limit: number
  ) {}
}

export class ResponseCustom {
  constructor(
    public data: any,
    public error: ErrorCustom | null,
    public pagination: Pagination | null
  ) {
    this.data = data;
    this.error = error;
    this.pagination = pagination;
  }
}

export const responses = {
  created: (data: any) => new ResponseCustom(data, null, null),
};
