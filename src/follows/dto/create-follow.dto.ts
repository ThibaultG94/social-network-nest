import { IsUUID } from 'class-validator';

export class CreateFollowDto {
    @IsUUID('4', {
        message: 'L\'ID de l\'utilisateur à suivre doit être un UUID valide'
    })
    followingId: string;
}