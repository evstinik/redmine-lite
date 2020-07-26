import { PaginatedList } from "./PaginatedList";

export interface Project {
  id: number;
  name: string;
  identifier: string;
  description: string;
  status: number;
  is_public: boolean;
  inherit_members: boolean;
  created_on: string;
  updated_on: string;
}

export interface ProjectPaginatedList extends PaginatedList {
  projects: Project[]
}
