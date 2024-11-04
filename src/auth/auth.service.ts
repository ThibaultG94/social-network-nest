import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly blacklistedTokens: Set<string> = new Set();
  private readonly resetTokens = new Map<string, { email: string; expires: Date }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Mise à jour de la dernière connexion via la nouvelle méthode dédiée
    await this.usersService.updateLastLogin(user.id);

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user,
    };
  }

  async logout(userId: string, token: string) {
    // Ajouter le token à la liste noire
    this.blacklistedTokens.add(token);
    
    // Nettoyer périodiquement les tokens expirés de la liste noire
    this.cleanupBlacklistedTokens();
    
    return { message: 'Déconnexion réussie' };
  }

  private cleanupBlacklistedTokens() {
    for (const token of this.blacklistedTokens) {
      try {
        // Vérifier si le token est expiré
        this.jwtService.verify(token);
      } catch (error) {
        // Si le token est expiré, le supprimer de la liste noire
        this.blacklistedTokens.delete(token);
      }
    }
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findOne(userId);
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Pour des raisons de sécurité, on renvoie le même message même si l'email n'existe pas
      return { message: 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé.' };
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    this.resetTokens.set(token, { email, expires });

    // TODO: Envoyer l'email avec le token
    return { 
      message: 'Email de réinitialisation envoyé',
      token // À retirer en production
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetData = this.resetTokens.get(token);
    if (!resetData) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    if (new Date() > resetData.expires) {
      this.resetTokens.delete(token);
      throw new BadRequestException('Token expiré');
    }

    const user = await this.usersService.findOneByEmail(resetData.email);
    await this.usersService.update(user.id, { password: newPassword });

    this.resetTokens.delete(token);
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}