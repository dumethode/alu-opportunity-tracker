import { CreateApplicationData, CreateApplicationVariables, GetApplicationsData, UpdateApplicationStatusData, UpdateApplicationStatusVariables, DeleteApplicationData, DeleteApplicationVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateApplication(options?: useDataConnectMutationOptions<CreateApplicationData, FirebaseError, CreateApplicationVariables>): UseDataConnectMutationResult<CreateApplicationData, CreateApplicationVariables>;
export function useCreateApplication(dc: DataConnect, options?: useDataConnectMutationOptions<CreateApplicationData, FirebaseError, CreateApplicationVariables>): UseDataConnectMutationResult<CreateApplicationData, CreateApplicationVariables>;

export function useGetApplications(options?: useDataConnectQueryOptions<GetApplicationsData>): UseDataConnectQueryResult<GetApplicationsData, undefined>;
export function useGetApplications(dc: DataConnect, options?: useDataConnectQueryOptions<GetApplicationsData>): UseDataConnectQueryResult<GetApplicationsData, undefined>;

export function useUpdateApplicationStatus(options?: useDataConnectMutationOptions<UpdateApplicationStatusData, FirebaseError, UpdateApplicationStatusVariables>): UseDataConnectMutationResult<UpdateApplicationStatusData, UpdateApplicationStatusVariables>;
export function useUpdateApplicationStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateApplicationStatusData, FirebaseError, UpdateApplicationStatusVariables>): UseDataConnectMutationResult<UpdateApplicationStatusData, UpdateApplicationStatusVariables>;

export function useDeleteApplication(options?: useDataConnectMutationOptions<DeleteApplicationData, FirebaseError, DeleteApplicationVariables>): UseDataConnectMutationResult<DeleteApplicationData, DeleteApplicationVariables>;
export function useDeleteApplication(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteApplicationData, FirebaseError, DeleteApplicationVariables>): UseDataConnectMutationResult<DeleteApplicationData, DeleteApplicationVariables>;
