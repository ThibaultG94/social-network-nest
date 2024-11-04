import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: Omit<User, 'password'> = {
    id: '1',
    email: 'test@test.com',
    username: 'test',
    bio: null,
    isVerified: false,
    role: 'user',
    profilePicture: null,
    dateOfBirth: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    lastLogin: null,
    posts: [],
    following: [],
    followers: [],
    likes: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            validateUser: jest.fn(),
            findOneByEmail: jest.fn(),
            updateLastLogin: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException when credentials are invalid', async () => {
      jest.spyOn(usersService, 'validateUser').mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token and user when credentials are valid', async () => {
      jest.spyOn(usersService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(usersService, 'updateLastLogin').mockResolvedValue();
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock.jwt.token');

      const result = await authService.login({
        email: 'test@test.com',
        password: 'correct',
      });

      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.user).toEqual(mockUser);
      expect(usersService.validateUser).toHaveBeenCalledWith('test@test.com', 'correct');
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@test.com',
      password: 'Test123!',
      username: 'test',
    };

    it('should successfully register a new user', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await authService.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      const userId = '1';
      const token = 'mock.jwt.token';

      const result = await authService.logout(userId, token);

      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });
  });

  describe('refreshToken', () => {
    it('should return a new access token', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new.jwt.token');

      const result = await authService.refreshToken(mockUser.id);

      expect(result.access_token).toBe('new.jwt.token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });
});