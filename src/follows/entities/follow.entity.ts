import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Follow {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.following)
    follower: User;

    @ManyToOne(() => User, user => user.followers)
    following: User;

    @CreateDateColumn()
    createdAt: Date;
}
