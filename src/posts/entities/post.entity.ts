import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Like } from '../../likes/entities/like.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @ManyToOne(() => Post, post => post.replies, { nullable: true })
  parentPost: Post | null;

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

  @Column('simple-array', { nullable: true })
  hashtags: string[];

  @Column({ default: 'original' })
  type: string;

  @ManyToOne(() => Post, { nullable: true })
  originalPost: Post | null;
}