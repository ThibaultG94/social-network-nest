import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow]),
    UsersModule // Nécessaire pour vérifier l'existence des utilisateurs
  ],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService] // Permet l'utilisation du service dans d'autres modules
})
export class FollowsModule {}
