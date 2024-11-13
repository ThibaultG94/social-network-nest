import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationParams, PaginatedResponse } from '../types/pagination';
import { PostSearchResponse } from './interfaces/post-search-response.interface';
import { FollowsService } from '../follows/follows.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly followsService: FollowsService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    // Extraire les hashtags du contenu
    const hashtags = this.extractHashtags(createPostDto.content);
    
    // Vérifier si c'est une réponse à un post existant
    let parentPost = null;
    if (createPostDto.parentPostId) {
      parentPost = await this.postRepository.findOne({
        where: { id: createPostDto.parentPostId }
      });

      if (!parentPost) {
        throw new NotFoundException(`Le post parent avec l'ID ${createPostDto.parentPostId} n'existe pas`);
      }
    }

    const newPost = this.postRepository.create({
      content: createPostDto.content,
      hashtags,
      author: { id: userId },
      parentPost
    });

    return await this.postRepository.save(newPost);
  }

  async findAll(options: PaginationParams & { sort: 'recent' | 'popular' }): Promise<PaginatedResponse<Post>> {
    const qb = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.likes', 'likes');

    if (options.sort === 'popular') {
      qb.orderBy('COUNT(likes.id)', 'DESC')
        .addOrderBy('post.createdAt', 'DESC')
        .groupBy('post.id, author.id');
    } else {
      qb.orderBy('post.createdAt', 'DESC');
    }

    const [items, totalItems] = await qb
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return this.paginateResponse(items, totalItems, options);
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

  async findUserPosts(userId: string, options: PaginationParams): Promise<PaginatedResponse<Post>> {
    const [items, totalItems] = await this.postRepository.findAndCount({
      where: { author: { id: userId } },
      relations: ['author', 'likes'],
      order: { createdAt: 'DESC' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });

    return this.paginateResponse(items, totalItems, options);
  }

  async findReplies(postId: string, options: PaginationParams): Promise<PaginatedResponse<Post>> {
    const [items, totalItems] = await this.postRepository.findAndCount({
      where: { parentPost: { id: postId } },
      relations: ['author', 'likes'],
      order: { createdAt: 'ASC' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });

    return this.paginateResponse(items, totalItems, options);
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    
    if (post.author.id !== userId) {
      throw new NotFoundException('Vous ne pouvez pas modifier ce post');
    }

    const hashtags = this.extractHashtags(updatePostDto.content);

    await this.postRepository.update(id, {
      content: updatePostDto.content,
      hashtags,
      isEdited: true
    });

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.findOne(id);
    
    if (post.author.id !== userId) {
      throw new NotFoundException('Vous ne pouvez pas supprimer ce post');
    }

    await this.postRepository.remove(post);
  }

  async getPersonalizedFeed(userId: string, options: PaginationParams): Promise<PaginatedResponse<Post>> {
    // Récupérer les IDs des utilisateurs suivis
    const following = await this.followsService.findAll(userId);
    const followingIds = following.map(f => f.following.id);
    followingIds.push(userId); // Inclure ses propres posts

    const qb = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.likes', 'likes')
      .where('author.id IN (:...followingIds)', { followingIds })
      .orderBy('post.createdAt', 'DESC');

    const [items, totalItems] = await qb
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return this.paginateResponse(items, totalItems, options);
  }

  async search(query: string, tags: string[], options: PaginationParams): Promise<PostSearchResponse> {
    const qb = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.likes', 'likes');

    if (query) {
      qb.where('post.content ILIKE :query', { query: `%${query}%` });
    }

    if (tags && tags.length > 0) {
      tags.forEach((tag, index) => {
        qb.andWhere('post.hashtags @> ARRAY[:tag]::varchar[]', { tag });
      });
    }

    const [items, totalItems] = await qb
      .orderBy('post.createdAt', 'DESC')
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    // Récupérer les hashtags populaires liés à cette recherche
    const hashtagQb = this.postRepository.createQueryBuilder('post')
      .select('unnest(post.hashtags)', 'tag')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tag')
      .orderBy('count', 'DESC')
      .limit(10);

    const hashtags = await hashtagQb.getRawMany();

    return {
      ...this.paginateResponse(items, totalItems, options),
      hashtags: hashtags.map(h => ({
        tag: h.tag,
        count: parseInt(h.count, 10)
      }))
    };
  }

  async findByHashtag(tag: string, options: PaginationParams): Promise<PaginatedResponse<Post>> {
    const qb = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.likes', 'likes')
      .where('post.hashtags @> ARRAY[:tag]::varchar[]', { tag })
      .orderBy('post.createdAt', 'DESC');

    const [items, totalItems] = await qb
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return this.paginateResponse(items, totalItems, options);
  }

  async getTrendingPosts(timeframe: '24h' | '7d' | '30d', limit: number): Promise<Post[]> {
    const timeframes = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
    };

    const days = timeframes[timeframe];
    const date = new Date();
    date.setDate(date.getDate() - days);

    const qb = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.likes', 'likes')
      .where('post.createdAt >= :date', { date })
      .groupBy('post.id, author.id')
      .orderBy('COUNT(likes.id)', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .limit(limit);

    return await qb.getMany();
  }

  async sharePost(userId: string, postId: string, content?: string): Promise<Post> {
    const originalPost = await this.findOne(postId);
    if (!originalPost) {
      throw new NotFoundException('Post original non trouvé');
    }

    const newPost = this.postRepository.create({
      content: content || '',
      author: { id: userId },
      originalPost,
      type: 'share'
    });

    return await this.postRepository.save(newPost);
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? [...new Set(matches.map(tag => tag.slice(1)))] : [];
  }

  private paginateResponse<T>(
    items: T[],
    totalItems: number,
    options: PaginationParams
  ): PaginatedResponse<T> {
    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: options.limit,
        totalPages: Math.ceil(totalItems / options.limit),
        currentPage: options.page,
      },
    };
  }
}