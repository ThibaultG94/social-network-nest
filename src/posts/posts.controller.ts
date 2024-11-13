import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  Query,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createPostDto: CreatePostDto
  ) {
    return await this.postsService.create(req.user.sub, createPostDto);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort') sort: 'recent' | 'popular' = 'recent',
  ) {
    return await this.postsService.findAll({
      page,
      limit,
      sort,
    });
  }

  @Get('feed')
  async getFeed(
    @Req() req: RequestWithUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.postsService.getPersonalizedFeed(req.user.sub, {
      page,
      limit,
    });
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('tags', new ParseArrayPipe({ optional: true })) tags: string[],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.postsService.search(query, tags, { page, limit });
  }

  @Get('hashtag/:tag')
  async getByHashtag(
    @Param('tag') tag: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.postsService.findByHashtag(tag, { page, limit });
  }

  @Get('user/:userId')
  async getUserPosts(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.postsService.findUserPosts(userId, { page, limit });
  }

  @Get('replies/:postId')
  async getReplies(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.postsService.findReplies(postId, { page, limit });
  }

  @Get('trending')
  async getTrending(
    @Query('timeframe', new DefaultValuePipe('24h')) timeframe: '24h' | '7d' | '30d',
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.postsService.getTrendingPosts(timeframe, limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.postsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto
  ) {
    return await this.postsService.update(id, req.user.sub, updatePostDto);
  }

  @Delete(':id')
  async remove(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.postsService.remove(id, req.user.sub);
  }

  @Post(':id/share')
  async sharePost(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('content') content?: string,
  ) {
    return await this.postsService.sharePost(req.user.sub, id, content);
  }
}