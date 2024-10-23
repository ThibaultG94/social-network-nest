import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Like } from 'src/likes/entities/like.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @ManyToOne(() => Post, post => post.replies, { nullable: true })
  parentPost: Post;

  @OneToMany(() => Post, post => post.parentPost)
  replies: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isEdited: boolean;

  @OneToMany(() => Like, like => like.post)
  likes: Like[];

  @Column({ default: 'original' })
  type: string;
}
