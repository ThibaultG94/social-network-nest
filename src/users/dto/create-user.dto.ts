import { IsDate, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-zA-Z0-9_-]*$/, {
        message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, underscores et tirets'
    })
    username: string;

    @IsEmail()
    @MaxLength(254)
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Adresse email invalide'
    })
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(80)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/, {
        message: 'Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial'
    })
    password: string;

    @IsString()
    @IsOptional()
    @MaxLength(160)
    bio?: string;

    @IsDate()
    @IsOptional()
    dateOfBirth?: Date;
}
