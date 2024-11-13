import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    // Vérifier si c'est une réponse à un post existant
    if (createPostDto.parentPostId) {
      const parentPost = await this.postRepository.findOne({
        where: { id: createPostDto.parentPostId }
      });

      if (!parentPost) {
        throw new NotFoundException(`Le post parent avec l'ID ${createPostDto.parentPostId} n'existe pas`);
      }
    }

    const post = this.postRepository.create({
      ...createPostDto,
      author: { id: userId },
      parentPost: createPostDto.parentPostId ? { id: createPostDto.parentPostId } : null
    });

    return await this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return await this.postRepository.find({
      relations: ['author', 'likes'],
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'likes', 'parentPost']
    });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} non trouvé`);
    }

    return post;
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author']
    });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} non trouvé`);
    }

    // Vérifier que l'utilisateur est l'auteur du post
    if (post.author.id !== userId) {
      throw new BadRequestException('Vous ne pouvez pas modifier un post dont vous n\'êtes pas l\'auteur');
    }

    // Mise à jour du post
    await this.postRepository.update(id, {
      ...updatePostDto,
      isEdited: true
    });

    return await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'likes']
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author']
    });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} non trouvé`);
    }

    // Vérifier que l'utilisateur est l'auteur du post
    if (post.author.id !== userId) {
      throw new BadRequestException('Vous ne pouvez pas supprimer un post dont vous n\'êtes pas l\'auteur');
    }

    await this.postRepository.remove(post);
  }

  async findUserPosts(userId: string): Promise<Post[]> {
    return await this.postRepository.find({
      where: { author: { id: userId } },
      relations: ['likes'],
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findReplies(postId: string): Promise<Post[]> {
    return await this.postRepository.find({
      where: { parentPost: { id: postId } },
      relations: ['author', 'likes'],
      order: {
        createdAt: 'ASC'
      }
    });
  }
}