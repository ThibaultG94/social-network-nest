import { IsUUID } from 'class-validator';

export class CreateLikeDto {
    @IsUUID('4', {
        message: 'L\'ID du post doit être un UUID valide'
    })
    postId: string;
}