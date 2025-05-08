export class Role {
  private constructor(
    readonly id: number,
    readonly name: string,
  ) {}

  static create(props: { id: number; name: string }): Role {
    return new Role(props.id, props.name);
  }
}
