export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  plainBody: string;
}

export interface TemplateData {
  [key: string]: any;
}

export interface SystemInfo {
  nodeVersion: string;
  platform: string;
  arch: string;
  cliVersion: string;
  workingDirectory: string;
  timestamp: string;
}