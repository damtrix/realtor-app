import { UserType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {
    message: 'Phone must be a valid phone number',
  })
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  password: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productKey?: string;
}

export class SigninDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class GenerateProductKeyDto {
  @IsEmail()
  email: string;

  @IsEnum(UserType)
  userType: UserType;
}

export class UserResponseDto {
  id: number;
  name: string;
  phone: string;
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  created_at: Date;

  @Expose({ name: 'createdAt' })
  createdAt() {
    return this.created_at;
  }

  @Exclude()
  updated_at: Date;

  @Expose({ name: 'updatedAt' })
  updatedAt() {
    return this.updated_at;
  }

  @Exclude()
  user_type: UserType;

  @Expose({ name: 'userType' })
  userType() {
    return this.user_type;
  }

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
