import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "src/posts/entities/post.entity";
import { Follow } from "src/follows/entities/follow.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    bio: string;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ default: 'user' })
    role: string;

    @Column({ nullable: true })
    profilePicture: string;

    @Column({ type: 'date', nullable: true })
    dateOfBirth: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    lastLogin: Date;

    @OneToMany(() => Post, post => post.author)
    posts: Post[];

    @OneToMany(() => Follow, follow => follow.follower)
    following: Follow[];

    @OneToMany(() => Follow, follow => follow.following)
    followers: Follow[];
}
