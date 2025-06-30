declare namespace Express {
  interface Request {
    company: Company;
    companyId: string;
    frontendBaseUrl: string;
  }
}
