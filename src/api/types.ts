// Only the fields the tests use.

export interface Page<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
  next_page: string | null;
  previous_page: string | null;
}

export interface Resource {
  id: string;
  title: string;
  format: string;
  url: string;
}

export interface Dataset {
  id: string;
  slug: string;
  title: string;
  description: string;
  license: string | null;
  tags: string[];
  organization: { id: string; name: string; slug: string } | null;
  owner: { id: string } | null;
  resources: Resource[]; // v1 only, v2 returns a link instead
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  metrics: { datasets: number };
}

export interface Site {
  metrics: { datasets: number; organizations: number };
}
