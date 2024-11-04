import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      // Vérifier si l'email ou le username existe déjà
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username }
        ]
      })

      if (existingUser) {
        throw new ConflictException(
          'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà'
        );
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Créer le nouvel utilisateur
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword
      });

      // Sauvegarder l'utilisateur
      const savedUser = await this.userRepository.save(newUser);

      // Ne pas renvoyer le mot de passe
      const { password, ...result } = savedUser;
      return result;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Erreur lors de la création de l\'utilisateur');
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    try {
      const users = await this.userRepository.find({
        select: [
          'id', 
          'username', 
          'email', 
          'bio', 
          'isVerified',
          'role',
          'profilePicture',
          'dateOfBirth',
          'createdAt',
          'updatedAt',
          'isActive',
          'lastLogin'
        ]
      });
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la récupération des utilisateurs');
    }
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: [
          'id', 
          'username', 
          'email', 
          'bio', 
          'isVerified',
          'role',
          'profilePicture',
          'dateOfBirth',
          'createdAt',
          'updatedAt',
          'isActive',
          'lastLogin'
        ]
      });

      if (!user) throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erreur lors de la récupération de l\'utilisateur');
    }
  }

  async findOneByEmail(email: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: [
          'id', 
          'username', 
          'email', 
          'bio', 
          'isVerified',
          'role',
          'profilePicture',
          'dateOfBirth',
          'createdAt',
          'updatedAt',
          'isActive',
          'lastLogin'
        ]
      });

      if (!user) {
        throw new NotFoundException(`Utilisateur avec l'email ${email} non trouvé`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erreur lors de la récupération de l\'utilisateur');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    try {
      // Vérifier si l'utilisateur existe
      const existingUser = await this.userRepository.findOne({ where: { id } });

      if (!existingUser) throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);

      // Si le mot de passe est fourni, le hasher
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      // Vérifier si le nouveau username/email est déjà pris
      if (updateUserDto.email || updateUserDto.username) {
        const duplicateUser = await this.userRepository.findOne({
          where: [
            { email: updateUserDto.email, id: Not(id) },
            { username: updateUserDto.username, id: Not(id) }
          ]
        });

        if (duplicateUser) {
          throw new ConflictException(
            'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà'
          );
        }
      }

      // Mettre à jour l'utilisateur
      await this.userRepository.update(id, updateUserDto);

      // Récupérer l'utilisateur mis à jour
      const updatedUser = await this.userRepository.findOne({
        where: { id },
        select: [
          'id', 
          'username', 
          'email', 
          'bio', 
          'isVerified',
          'role',
          'profilePicture',
          'dateOfBirth',
          'createdAt',
          'updatedAt',
          'isActive',
          'lastLogin'
        ]
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour de l\'utilisateur'
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur lors de la suppression de l\'utilisateur'
      );
    }
  }

  // Méthode utilitaire pour vérifier les identifiants
  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLogin: new Date()
    });
  }
}
