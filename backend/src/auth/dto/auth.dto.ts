import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula y un dígito',
  })
  password: string;

  @IsString()
  name: string;

  @IsString()
  address?: string;

  @IsString()
  phone?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class FullRegisterDto extends RegisterDto {
  @IsString()
  rut: string;

  @IsString()
  birthdate: string;

  @IsString()
  gender: string;
}
