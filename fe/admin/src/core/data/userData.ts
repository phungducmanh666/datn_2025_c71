export interface PermissionData {
  uuid: string;
  name: string;
  description: string;
}

export interface RoleData {
  uuid: string;
  name: string;
  description: string;
}

export interface StaffData {
  uuid: string;
  code: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
}

export interface AccountData {
  username: string;
  password: string;
  status: string;
}

export interface LoginInfo {
  userUUID: string;
  username: string;
  type: string;
  roles: string[];
  permissions: string[];
}

export interface CustomerData {
  uuid: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  phoneNumber: string;
  photoUrl: string;
  email: string;
}
