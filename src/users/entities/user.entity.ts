import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
}
