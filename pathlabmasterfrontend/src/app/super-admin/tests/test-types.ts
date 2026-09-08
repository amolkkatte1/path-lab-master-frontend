export type ApiTest = {
  testId?: number | string;
  testName?: string;
  parameterGroupList?: string | Array<number | string>;
  parameterList?: string | Array<number | string>;
  serviceId?: number | string;
  serviceName?: string;
  serviceShortName?: string;
  serviceGroupId?: number | string;
  serviceGroupName?: string;
  labName?: string;
  labId?: number | string;
  testCharges?: number | string;
  createdBy?: number | string;
  updatedBy?: number | string;
  createdAt?: string;
  updatedAt?: string;
};
