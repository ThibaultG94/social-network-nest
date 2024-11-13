import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { UsersService } from '../users/users.service';
import { CreateFollowDto } from './dto/create-follow.dto';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: string, createFollowDto: CreateFollowDto) {
    // Vérifier que l'utilisateur ne tente pas de se suivre lui-même
    if (userId === createFollowDto.followingId) {
      throw new BadRequestException('Vous ne pouvez pas vous suivre vous-même');
    }

    // Vérifier que l'utilisateur à suivre existe
    const userToFollow = await this.usersService.findOne(createFollowDto.followingId);
    if (!userToFollow) {
      throw new NotFoundException(`L'utilisateur avec l'ID ${createFollowDto.followingId} n'existe pas`);
    }

    // Vérifier si la relation existe déjà
    const existingFollow = await this.followRepository.findOne({
      where: {
        follower: { id: userId },
        following: { id: createFollowDto.followingId },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Vous suivez déjà cet utilisateur');
    }

    // Créer la relation
    const follow = this.followRepository.create({
      follower: { id: userId },
      following: { id: createFollowDto.followingId },
    });

    return await this.followRepository.save(follow);
  }

  async findAll(userId: string) {
    return await this.followRepository.find({
      where: { follower: { id: userId } },
      relations: ['following'],
      select: {
        following: {
          id: true,
          username: true,
          profilePicture: true,
          bio: true,
        },
      },
    });
  }

  async findFollowers(userId: string) {
    return await this.followRepository.find({
      where: { following: { id: userId } },
      relations: ['follower'],
      select: {
        follower: {
          id: true,
          username: true,
          profilePicture: true,
          bio: true,
        },
      },
    });
  }

  async remove(userId: string, followingId: string) {
    const follow = await this.followRepository.findOne({
      where: {
        follower: { id: userId },
        following: { id: followingId },
      },
    });

    if (!follow) {
      throw new NotFoundException('Relation de suivi non trouvée');
    }

    await this.followRepository.remove(follow);
    return { message: 'Désabonnement effectué avec succès' };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    return !!follow;
  }

  async getFollowStats(userId: string) {
    const followersCount = await this.followRepository.count({
      where: { following: { id: userId } },
    });

    const followingCount = await this.followRepository.count({
      where: { follower: { id: userId } },
    });

    return {
      followersCount,
      followingCount,
    };
  }
}