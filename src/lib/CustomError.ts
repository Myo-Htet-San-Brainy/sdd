export class CustomError extends Error {
  status: number;
  body: any; // 👈 Can be any JSON or object

  constructor(message: string, status: number, body?: any) {
    super(message);
    this.name = "CustomError";
    this.status = status;
    this.body = body;
  }
}
