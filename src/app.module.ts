import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { FollowsModule } from './follows/follows.module';
import { LikesModule } from './likes/likes.module';

@Module({
  imports: [UsersModule, PostsModule, FollowsModule, LikesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
