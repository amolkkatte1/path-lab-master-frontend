export type LabConfiguration = {
  configId: number | string;
  labId: number | string;
  testKeys: Record<string, string[]>;
  reportTopSpace: number;
  reportBottomSpace: number;
  lineSpace: number | null;
  qrCodeHorizantalPosition: number;
  qrCodeVerticalPosition: number;
  columnCount: number;
  testKeyMapping: Record<string, Record<string, string>>;
  createdBy: number | string;
  updatedBy: number | string;
  createdAt: string;
  updatedAt: string;
  qrCodeRequired: boolean;
};

export type LabConfigurationValues = Pick<
  LabConfiguration,
  | "testKeys"
  | "reportTopSpace"
  | "reportBottomSpace"
  | "lineSpace"
  | "qrCodeHorizantalPosition"
  | "qrCodeVerticalPosition"
  | "columnCount"
  | "testKeyMapping"
  | "qrCodeRequired"
>;

export type ConfigurationApiResponse =
  | LabConfiguration
  | {
      status?: string;
      statusCode?: number;
      message?: string;
      data?: LabConfiguration | null;
    };
