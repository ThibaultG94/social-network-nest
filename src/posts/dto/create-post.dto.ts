import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreatePostDto {
    @IsString()
    @MinLength(1, {
        message: 'Le contenu ne peut pas être vide'
    })
    @MaxLength(500, {
        message: 'Le contenu ne peut pas dépasser 500 caractères'
    })
    content: string;

    @IsUUID('4', {
        message: 'L\'ID du post parent doit être un UUID valide'
    })
    @IsOptional()
    parentPostId?: string;
}
