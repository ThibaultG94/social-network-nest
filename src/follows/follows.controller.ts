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
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  async create(@Req() req: RequestWithUser, @Body() createFollowDto: CreateFollowDto) {
    return await this.followsService.create(req.user.sub, createFollowDto);
  }

  @Get('following')
  async findFollowing(@Req() req: RequestWithUser) {
    return await this.followsService.findAll(req.user.sub);
  }

  @Get('followers')
  async findFollowers(@Req() req: RequestWithUser) {
    return await this.followsService.findFollowers(req.user.sub);
  }

  @Get('stats')
  async getStats(@Req() req: RequestWithUser) {
    return await this.followsService.getFollowStats(req.user.sub);
  }

  @Get('check/:userId')
  async checkFollowing(
    @Req() req: RequestWithUser,
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    return {
      isFollowing: await this.followsService.isFollowing(req.user.sub, userId)
    };
  }

  @Delete(':userId')
  async remove(
    @Req() req: RequestWithUser,
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    return await this.followsService.remove(req.user.sub, userId);
  }
}