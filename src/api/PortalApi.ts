import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import type { Dataset, Organization, Page, Site } from './types';

type ListParams = {
  q?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  tag?: string;
  organization?: string;
  format?: string;
};

// Read-only client for the data.gov.rs API. The website uses v2 search, so v2 is the reference.
// Methods ending in Raw return the response itself, for status code checks.
export class PortalApi {
  constructor(private readonly request: APIRequestContext) {}

  listDatasetsRaw(params: ListParams = {}) {
    return this.request.get('/api/1/datasets/', { params: toQuery(params) });
  }

  async listDatasets(params: ListParams = {}) {
    return this.json<Page<Dataset>>(await this.listDatasetsRaw(params));
  }

  async searchDatasetsV2(params: ListParams = {}) {
    return this.json<Page<Dataset>>(await this.request.get('/api/2/datasets/search/', { params: toQuery(params) }));
  }

  getDatasetRaw(slugOrId: string) {
    return this.request.get(`/api/1/datasets/${encodeURIComponent(slugOrId)}/`);
  }

  async getDataset(slugOrId: string) {
    return this.json<Dataset>(await this.getDatasetRaw(slugOrId));
  }

  async getPage<T>(url: string) {
    return this.json<Page<T>>(await this.request.get(url));
  }

  getOrganizationRaw(slug: string) {
    return this.request.get(`/api/1/organizations/${encodeURIComponent(slug)}/`);
  }

  async getOrganization(slug: string) {
    return this.json<Organization>(await this.getOrganizationRaw(slug));
  }

  async listOrganizations(pageSize = 1) {
    return this.json<Page<Organization>>(
      await this.request.get('/api/1/organizations/', { params: { page_size: pageSize } }),
    );
  }

  async getSite() {
    return this.json<Site>(await this.request.get('/api/1/site/'));
  }

  swaggerRaw() {
    return this.request.get('/api/1/swagger.json');
  }

  private async json<T>(response: APIResponse): Promise<T> {
    await expect(response, response.url()).toBeOK();
    return (await response.json()) as T;
  }
}

function toQuery({ q, sort, page, pageSize, tag, organization, format }: ListParams) {
  const query: Record<string, string | number> = {};
  if (q !== undefined) query.q = q;
  if (sort !== undefined) query.sort = sort;
  if (page !== undefined) query.page = page;
  if (pageSize !== undefined) query.page_size = pageSize;
  if (tag !== undefined) query.tag = tag;
  if (organization !== undefined) query.organization = organization;
  if (format !== undefined) query.format = format;
  return query;
}
