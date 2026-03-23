declare module "google-trends-api" {
  export interface InterestOverTimeOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string | string[];
    hl?: string;
    timezone?: number;
    category?: number;
    granularTimeResolution?: boolean;
  }

  const googleTrends: {
    interestOverTime(opts: InterestOverTimeOptions): Promise<string>;
  };

  export default googleTrends;
}
