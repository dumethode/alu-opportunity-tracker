import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface ApplicationDocument_Key {
  applicationId: UUIDString;
  documentId: UUIDString;
  __typename?: 'ApplicationDocument_Key';
}

export interface Application_Key {
  id: UUIDString;
  __typename?: 'Application_Key';
}

export interface Contact_Key {
  id: UUIDString;
  __typename?: 'Contact_Key';
}

export interface CreateApplicationData {
  application_insert: Application_Key;
}

export interface CreateApplicationVariables {
  userId: UUIDString;
  applicationType: string;
  createdAt: TimestampString;
  deadline: TimestampString;
  link?: string | null;
  notes?: string | null;
  organizationName?: string | null;
  priority?: string | null;
  status: string;
  title: string;
  updatedAt: TimestampString;
}

export interface DeleteApplicationData {
  application_delete?: Application_Key | null;
}

export interface DeleteApplicationVariables {
  id: UUIDString;
}

export interface Document_Key {
  id: UUIDString;
  __typename?: 'Document_Key';
}

export interface GetApplicationsData {
  applications: ({
    id: UUIDString;
    title: string;
    status: string;
    deadline: TimestampString;
  } & Application_Key)[];
}

export interface UpdateApplicationStatusData {
  application_update?: Application_Key | null;
}

export interface UpdateApplicationStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateApplicationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateApplicationVariables): MutationRef<CreateApplicationData, CreateApplicationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateApplicationVariables): MutationRef<CreateApplicationData, CreateApplicationVariables>;
  operationName: string;
}
export const createApplicationRef: CreateApplicationRef;

export function createApplication(vars: CreateApplicationVariables): MutationPromise<CreateApplicationData, CreateApplicationVariables>;
export function createApplication(dc: DataConnect, vars: CreateApplicationVariables): MutationPromise<CreateApplicationData, CreateApplicationVariables>;

interface GetApplicationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetApplicationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetApplicationsData, undefined>;
  operationName: string;
}
export const getApplicationsRef: GetApplicationsRef;

export function getApplications(): QueryPromise<GetApplicationsData, undefined>;
export function getApplications(dc: DataConnect): QueryPromise<GetApplicationsData, undefined>;

interface UpdateApplicationStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateApplicationStatusVariables): MutationRef<UpdateApplicationStatusData, UpdateApplicationStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateApplicationStatusVariables): MutationRef<UpdateApplicationStatusData, UpdateApplicationStatusVariables>;
  operationName: string;
}
export const updateApplicationStatusRef: UpdateApplicationStatusRef;

export function updateApplicationStatus(vars: UpdateApplicationStatusVariables): MutationPromise<UpdateApplicationStatusData, UpdateApplicationStatusVariables>;
export function updateApplicationStatus(dc: DataConnect, vars: UpdateApplicationStatusVariables): MutationPromise<UpdateApplicationStatusData, UpdateApplicationStatusVariables>;

interface DeleteApplicationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteApplicationVariables): MutationRef<DeleteApplicationData, DeleteApplicationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteApplicationVariables): MutationRef<DeleteApplicationData, DeleteApplicationVariables>;
  operationName: string;
}
export const deleteApplicationRef: DeleteApplicationRef;

export function deleteApplication(vars: DeleteApplicationVariables): MutationPromise<DeleteApplicationData, DeleteApplicationVariables>;
export function deleteApplication(dc: DataConnect, vars: DeleteApplicationVariables): MutationPromise<DeleteApplicationData, DeleteApplicationVariables>;

