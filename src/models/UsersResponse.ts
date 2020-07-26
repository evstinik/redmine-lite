import { CustomField } from "./CustomField";

export interface User {
  id: number;
  login: string;
  firstname: string;
  lastname: string;
  created_on: Date;
  last_login_on: Date;
  api_key: string;
  custom_fields: CustomField[];
}

export interface UsersResponse {
  user: User;
}