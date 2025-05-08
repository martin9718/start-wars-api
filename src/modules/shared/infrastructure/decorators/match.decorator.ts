import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const relatedPropertyName = args.constraints[0] as string;
    const relatedValue = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ] as string;
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    const relatedPropertyName = args.constraints[0] as string;
    return `Field ${args.property} does not match with ${relatedPropertyName}`;
  }
}
