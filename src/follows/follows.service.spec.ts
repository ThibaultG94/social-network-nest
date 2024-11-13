import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowsService } from './follows.service';
import { Follow } from './entities/follow.entity';
import { UsersService } from '../users/users.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('FollowsService', () => {
  let service: FollowsService;
  let followRepository: Repository<Follow>;
  let usersService: UsersService;

  const mockFollowRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        {
          provide: getRepositoryToken(Follow),
          useValue: mockFollowRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
    followRepository = module.get<Repository<Follow>>(getRepositoryToken(Follow));
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user1';
    const followingId = 'user2';

    it('should create a new follow relationship', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: followingId });
      mockFollowRepository.findOne.mockResolvedValue(null);
      mockFollowRepository.create.mockReturnValue({ id: 'follow1' });
      mockFollowRepository.save.mockResolvedValue({ id: 'follow1' });

      const result = await service.create(userId, { followingId });

      expect(result).toEqual({ id: 'follow1' });
      expect(mockFollowRepository.create).toHaveBeenCalled();
      expect(mockFollowRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to self-follow', async () => {
      await expect(service.create(userId, { followingId: userId }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when follow relationship already exists', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: followingId });
      mockFollowRepository.findOne.mockResolvedValue({ id: 'existingFollow' });

      await expect(service.create(userId, { followingId }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a follow relationship', async () => {
      const follow = { id: 'follow1' };
      mockFollowRepository.findOne.mockResolvedValue(follow);
      mockFollowRepository.remove.mockResolvedValue(follow);

      const result = await service.remove('user1', 'user2');

      expect(result).toEqual({ message: 'Désabonnement effectué avec succès' });
      expect(mockFollowRepository.remove).toHaveBeenCalledWith(follow);
    });

    it('should throw NotFoundException when follow relationship does not exist', async () => {
      mockFollowRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('user1', 'user2'))
        .rejects.toThrow(NotFoundException);
    });
  });
});