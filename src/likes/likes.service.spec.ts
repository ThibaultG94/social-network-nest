import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikesService } from './likes.service';
import { Like } from './entities/like.entity';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('LikesService', () => {
  let service: LikesService;
  let likeRepository: Repository<Like>;
  let postsService: PostsService;

  const mockLikeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
  };

  const mockPostsService = {
    findOne: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: getRepositoryToken(Like),
          useValue: mockLikeRepository,
        },
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    likeRepository = module.get<Repository<Like>>(getRepositoryToken(Like));
    postsService = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user1';
    const postId = 'post1';

    it('should create a new like', async () => {
      mockPostsService.findOne.mockResolvedValue({ id: postId });
      mockLikeRepository.findOne.mockResolvedValue(null);
      mockLikeRepository.create.mockReturnValue({ id: 'like1' });
      mockLikeRepository.save.mockResolvedValue({ id: 'like1' });

      const result = await service.create(userId, { postId });

      expect(result).toEqual({ id: 'like1' });
      expect(mockLikeRepository.create).toHaveBeenCalled();
      expect(mockLikeRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when post does not exist', async () => {
      mockPostsService.findOne.mockResolvedValue(null);

      await expect(service.create(userId, { postId }))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when like already exists', async () => {
      mockPostsService.findOne.mockResolvedValue({ id: postId });
      mockLikeRepository.findOne.mockResolvedValue({ id: 'existingLike' });

      await expect(service.create(userId, { postId }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a like', async () => {
      const like = { id: 'like1' };
      mockLikeRepository.findOne.mockResolvedValue(like);
      mockLikeRepository.remove.mockResolvedValue(like);

      const result = await service.remove('user1', 'post1');

      expect(result).toEqual({ message: 'Like supprimé avec succès' });
      expect(mockLikeRepository.remove).toHaveBeenCalledWith(like);
    });

    it('should throw NotFoundException when like does not exist', async () => {
      mockLikeRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('user1', 'post1'))
        .rejects.toThrow(NotFoundException);
    });
  });
});