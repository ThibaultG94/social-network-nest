import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  Body, 
  UseGuards, 
  Req,
  ParseUUIDPipe 
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  async create(@Req() req: RequestWithUser, @Body() createLikeDto: CreateLikeDto) {
    return await this.likesService.create(req.user.sub, createLikeDto);
  }

  @Delete(':postId')
  async remove(
    @Req() req: RequestWithUser,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return await this.likesService.remove(req.user.sub, postId);
  }

  @Get('check/:postId')
  async hasLiked(
    @Req() req: RequestWithUser,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return {
      hasLiked: await this.likesService.hasLiked(req.user.sub, postId),
    };
  }

  @Get('post/:postId')
  async getPostLikes(@Param('postId', ParseUUIDPipe) postId: string) {
    return await this.likesService.getPostLikes(postId);
  }

  @Get('post/:postId/count')
  async getLikeCount(@Param('postId', ParseUUIDPipe) postId: string) {
    return {
      count: await this.likesService.getLikeCount(postId),
    };
  }

  @Get('user/me')
  async getMyLikes(@Req() req: RequestWithUser) {
    return await this.likesService.getUserLikes(req.user.sub);
  }

  @Get('user/:userId')
  async getUserLikes(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.likesService.getUserLikes(userId);
  }
}