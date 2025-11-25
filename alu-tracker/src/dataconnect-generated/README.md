# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetApplications*](#getapplications)
- [**Mutations**](#mutations)
  - [*CreateApplication*](#createapplication)
  - [*UpdateApplicationStatus*](#updateapplicationstatus)
  - [*DeleteApplication*](#deleteapplication)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetApplications
You can execute the `GetApplications` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getApplications(): QueryPromise<GetApplicationsData, undefined>;

interface GetApplicationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetApplicationsData, undefined>;
}
export const getApplicationsRef: GetApplicationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getApplications(dc: DataConnect): QueryPromise<GetApplicationsData, undefined>;

interface GetApplicationsRef {
  ...
  (dc: DataConnect): QueryRef<GetApplicationsData, undefined>;
}
export const getApplicationsRef: GetApplicationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getApplicationsRef:
```typescript
const name = getApplicationsRef.operationName;
console.log(name);
```

### Variables
The `GetApplications` query has no variables.
### Return Type
Recall that executing the `GetApplications` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetApplicationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetApplicationsData {
  applications: ({
    id: UUIDString;
    title: string;
    status: string;
    deadline: TimestampString;
  } & Application_Key)[];
}
```
### Using `GetApplications`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getApplications } from '@dataconnect/generated';


// Call the `getApplications()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getApplications();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getApplications(dataConnect);

console.log(data.applications);

// Or, you can use the `Promise` API.
getApplications().then((response) => {
  const data = response.data;
  console.log(data.applications);
});
```

### Using `GetApplications`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getApplicationsRef } from '@dataconnect/generated';


// Call the `getApplicationsRef()` function to get a reference to the query.
const ref = getApplicationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getApplicationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.applications);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.applications);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateApplication
You can execute the `CreateApplication` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createApplication(vars: CreateApplicationVariables): MutationPromise<CreateApplicationData, CreateApplicationVariables>;

interface CreateApplicationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateApplicationVariables): MutationRef<CreateApplicationData, CreateApplicationVariables>;
}
export const createApplicationRef: CreateApplicationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createApplication(dc: DataConnect, vars: CreateApplicationVariables): MutationPromise<CreateApplicationData, CreateApplicationVariables>;

interface CreateApplicationRef {
  ...
  (dc: DataConnect, vars: CreateApplicationVariables): MutationRef<CreateApplicationData, CreateApplicationVariables>;
}
export const createApplicationRef: CreateApplicationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createApplicationRef:
```typescript
const name = createApplicationRef.operationName;
console.log(name);
```

### Variables
The `CreateApplication` mutation requires an argument of type `CreateApplicationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateApplication` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateApplicationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateApplicationData {
  application_insert: Application_Key;
}
```
### Using `CreateApplication`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createApplication, CreateApplicationVariables } from '@dataconnect/generated';

// The `CreateApplication` mutation requires an argument of type `CreateApplicationVariables`:
const createApplicationVars: CreateApplicationVariables = {
  userId: ..., 
  applicationType: ..., 
  createdAt: ..., 
  deadline: ..., 
  link: ..., // optional
  notes: ..., // optional
  organizationName: ..., // optional
  priority: ..., // optional
  status: ..., 
  title: ..., 
  updatedAt: ..., 
};

// Call the `createApplication()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createApplication(createApplicationVars);
// Variables can be defined inline as well.
const { data } = await createApplication({ userId: ..., applicationType: ..., createdAt: ..., deadline: ..., link: ..., notes: ..., organizationName: ..., priority: ..., status: ..., title: ..., updatedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createApplication(dataConnect, createApplicationVars);

console.log(data.application_insert);

// Or, you can use the `Promise` API.
createApplication(createApplicationVars).then((response) => {
  const data = response.data;
  console.log(data.application_insert);
});
```

### Using `CreateApplication`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createApplicationRef, CreateApplicationVariables } from '@dataconnect/generated';

// The `CreateApplication` mutation requires an argument of type `CreateApplicationVariables`:
const createApplicationVars: CreateApplicationVariables = {
  userId: ..., 
  applicationType: ..., 
  createdAt: ..., 
  deadline: ..., 
  link: ..., // optional
  notes: ..., // optional
  organizationName: ..., // optional
  priority: ..., // optional
  status: ..., 
  title: ..., 
  updatedAt: ..., 
};

// Call the `createApplicationRef()` function to get a reference to the mutation.
const ref = createApplicationRef(createApplicationVars);
// Variables can be defined inline as well.
const ref = createApplicationRef({ userId: ..., applicationType: ..., createdAt: ..., deadline: ..., link: ..., notes: ..., organizationName: ..., priority: ..., status: ..., title: ..., updatedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createApplicationRef(dataConnect, createApplicationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.application_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.application_insert);
});
```

## UpdateApplicationStatus
You can execute the `UpdateApplicationStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateApplicationStatus(vars: UpdateApplicationStatusVariables): MutationPromise<UpdateApplicationStatusData, UpdateApplicationStatusVariables>;

interface UpdateApplicationStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateApplicationStatusVariables): MutationRef<UpdateApplicationStatusData, UpdateApplicationStatusVariables>;
}
export const updateApplicationStatusRef: UpdateApplicationStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateApplicationStatus(dc: DataConnect, vars: UpdateApplicationStatusVariables): MutationPromise<UpdateApplicationStatusData, UpdateApplicationStatusVariables>;

interface UpdateApplicationStatusRef {
  ...
  (dc: DataConnect, vars: UpdateApplicationStatusVariables): MutationRef<UpdateApplicationStatusData, UpdateApplicationStatusVariables>;
}
export const updateApplicationStatusRef: UpdateApplicationStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateApplicationStatusRef:
```typescript
const name = updateApplicationStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateApplicationStatus` mutation requires an argument of type `UpdateApplicationStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateApplicationStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateApplicationStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateApplicationStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateApplicationStatusData {
  application_update?: Application_Key | null;
}
```
### Using `UpdateApplicationStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateApplicationStatus, UpdateApplicationStatusVariables } from '@dataconnect/generated';

// The `UpdateApplicationStatus` mutation requires an argument of type `UpdateApplicationStatusVariables`:
const updateApplicationStatusVars: UpdateApplicationStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateApplicationStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateApplicationStatus(updateApplicationStatusVars);
// Variables can be defined inline as well.
const { data } = await updateApplicationStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateApplicationStatus(dataConnect, updateApplicationStatusVars);

console.log(data.application_update);

// Or, you can use the `Promise` API.
updateApplicationStatus(updateApplicationStatusVars).then((response) => {
  const data = response.data;
  console.log(data.application_update);
});
```

### Using `UpdateApplicationStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateApplicationStatusRef, UpdateApplicationStatusVariables } from '@dataconnect/generated';

// The `UpdateApplicationStatus` mutation requires an argument of type `UpdateApplicationStatusVariables`:
const updateApplicationStatusVars: UpdateApplicationStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateApplicationStatusRef()` function to get a reference to the mutation.
const ref = updateApplicationStatusRef(updateApplicationStatusVars);
// Variables can be defined inline as well.
const ref = updateApplicationStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateApplicationStatusRef(dataConnect, updateApplicationStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.application_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.application_update);
});
```

## DeleteApplication
You can execute the `DeleteApplication` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteApplication(vars: DeleteApplicationVariables): MutationPromise<DeleteApplicationData, DeleteApplicationVariables>;

interface DeleteApplicationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteApplicationVariables): MutationRef<DeleteApplicationData, DeleteApplicationVariables>;
}
export const deleteApplicationRef: DeleteApplicationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteApplication(dc: DataConnect, vars: DeleteApplicationVariables): MutationPromise<DeleteApplicationData, DeleteApplicationVariables>;

interface DeleteApplicationRef {
  ...
  (dc: DataConnect, vars: DeleteApplicationVariables): MutationRef<DeleteApplicationData, DeleteApplicationVariables>;
}
export const deleteApplicationRef: DeleteApplicationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteApplicationRef:
```typescript
const name = deleteApplicationRef.operationName;
console.log(name);
```

### Variables
The `DeleteApplication` mutation requires an argument of type `DeleteApplicationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteApplicationVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteApplication` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteApplicationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteApplicationData {
  application_delete?: Application_Key | null;
}
```
### Using `DeleteApplication`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteApplication, DeleteApplicationVariables } from '@dataconnect/generated';

// The `DeleteApplication` mutation requires an argument of type `DeleteApplicationVariables`:
const deleteApplicationVars: DeleteApplicationVariables = {
  id: ..., 
};

// Call the `deleteApplication()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteApplication(deleteApplicationVars);
// Variables can be defined inline as well.
const { data } = await deleteApplication({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteApplication(dataConnect, deleteApplicationVars);

console.log(data.application_delete);

// Or, you can use the `Promise` API.
deleteApplication(deleteApplicationVars).then((response) => {
  const data = response.data;
  console.log(data.application_delete);
});
```

### Using `DeleteApplication`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteApplicationRef, DeleteApplicationVariables } from '@dataconnect/generated';

// The `DeleteApplication` mutation requires an argument of type `DeleteApplicationVariables`:
const deleteApplicationVars: DeleteApplicationVariables = {
  id: ..., 
};

// Call the `deleteApplicationRef()` function to get a reference to the mutation.
const ref = deleteApplicationRef(deleteApplicationVars);
// Variables can be defined inline as well.
const ref = deleteApplicationRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteApplicationRef(dataConnect, deleteApplicationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.application_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.application_delete);
});
```

