import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    private readonly postsService: PostsService,
  ) {}

  async create(userId: string, createLikeDto: CreateLikeDto) {
    // Vérifier que le post existe
    const post = await this.postsService.findOne(createLikeDto.postId);
    if (!post) {
      throw new NotFoundException(`Le post avec l'ID ${createLikeDto.postId} n'existe pas`);
    }

    // Vérifier si le like existe déjà
    const existingLike = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: createLikeDto.postId },
      },
    });

    if (existingLike) {
      throw new ConflictException('Vous avez déjà liké ce post');
    }

    // Créer le like
    const like = this.likeRepository.create({
      user: { id: userId },
      post: { id: createLikeDto.postId },
    });

    return await this.likeRepository.save(like);
  }

  async remove(userId: string, postId: string) {
    const like = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    if (!like) {
      throw new NotFoundException('Like non trouvé');
    }

    await this.likeRepository.remove(like);
    return { message: 'Like supprimé avec succès' };
  }

  async hasLiked(userId: string, postId: string): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    return !!like;
  }

  async getPostLikes(postId: string) {
    return await this.likeRepository.find({
      where: { post: { id: postId } },
      relations: ['user'],
      select: {
        id: true,
        createdAt: true,
        user: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
    });
  }

  async getLikeCount(postId: string): Promise<number> {
    return await this.likeRepository.count({
      where: { post: { id: postId } },
    });
  }

  async getUserLikes(userId: string) {
    return await this.likeRepository.find({
      where: { user: { id: userId } },
      relations: ['post'],
      select: {
        id: true,
        createdAt: true,
        post: {
          id: true,
          content: true,
          createdAt: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}