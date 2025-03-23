declare module 'pdf-parse' {
  function parse(dataBuffer: Buffer | Uint8Array, options?: {
    pagerender?: (pageData: any) => Promise<string>;
    max?: number;
    version?: string;
  }): Promise<{
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }>;

  export = parse;
}