import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class ParseUUIDCustomPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isUUID(value, '4')) {
      throw new BadRequestException(
        `La valeur ${value} n'est pas un UUID valide. Format attendu: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
      );
    }
    return value;
  }
}