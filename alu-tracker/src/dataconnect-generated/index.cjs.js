const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'alu-tracker',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createApplicationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateApplication', inputVars);
}
createApplicationRef.operationName = 'CreateApplication';
exports.createApplicationRef = createApplicationRef;

exports.createApplication = function createApplication(dcOrVars, vars) {
  return executeMutation(createApplicationRef(dcOrVars, vars));
};

const getApplicationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetApplications');
}
getApplicationsRef.operationName = 'GetApplications';
exports.getApplicationsRef = getApplicationsRef;

exports.getApplications = function getApplications(dc) {
  return executeQuery(getApplicationsRef(dc));
};

const updateApplicationStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateApplicationStatus', inputVars);
}
updateApplicationStatusRef.operationName = 'UpdateApplicationStatus';
exports.updateApplicationStatusRef = updateApplicationStatusRef;

exports.updateApplicationStatus = function updateApplicationStatus(dcOrVars, vars) {
  return executeMutation(updateApplicationStatusRef(dcOrVars, vars));
};

const deleteApplicationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteApplication', inputVars);
}
deleteApplicationRef.operationName = 'DeleteApplication';
exports.deleteApplicationRef = deleteApplicationRef;

exports.deleteApplication = function deleteApplication(dcOrVars, vars) {
  return executeMutation(deleteApplicationRef(dcOrVars, vars));
};
