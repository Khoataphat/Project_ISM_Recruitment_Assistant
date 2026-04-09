import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(64, { message: 'Email không được quá 64 ký tự' })
  email: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(255, { message: 'Mật khẩu không được quá 255 ký tự' })
  password: string;

  @IsString({ message: 'Họ tên phải là chuỗi' })
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  @MaxLength(128, { message: 'Họ tên không được quá 128 ký tự' })
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  address?: string;
}
  