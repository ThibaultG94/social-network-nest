import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { Like } from './entities/like.entity';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like]),
    PostsModule, // Pour vérifier l'existence des posts
    UsersModule, // Pour vérifier l'existence des utilisateurs
  ],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService], // Pour pouvoir utiliser le service dans d'autres modules
})
export class LikesModule {}