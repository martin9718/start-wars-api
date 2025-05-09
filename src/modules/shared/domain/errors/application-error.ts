export abstract class ApplicationError extends Error {
  constructor(
    public readonly message: string,
    public readonly codeName: string,
    public readonly details: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      errorCodeName: this.codeName,
      message: this.message,
      details: this.details,
      status: this.status,
    };
  }
}
