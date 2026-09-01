export interface VirusScanResult {
  clean: boolean;
  provider: string;
  signature?: string;
  scannedAt: string;
}

export interface VirusScanProvider {
  scan(buffer: Buffer, fileName: string): Promise<VirusScanResult>;
}

export const VIRUS_SCAN_PROVIDER = "VIRUS_SCAN_PROVIDER";

export class MockVirusScanProvider implements VirusScanProvider {
  async scan(buffer: Buffer, fileName: string): Promise<VirusScanResult> {
    return {
      clean: buffer.length > 0 && !fileName.toLowerCase().includes("eicar"),
      provider: "mock",
      signature: `mock:${buffer.length}`,
      scannedAt: new Date().toISOString()
    };
  }
}
