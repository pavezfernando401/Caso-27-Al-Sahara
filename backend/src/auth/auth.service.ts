import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, FullRegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      role: 'customer',
    });

    const { password, ...result } = user as any;
    const token = this.generateToken(user);

    return {
      user: result,
      token,
      message: 'Usuario registrado exitosamente',
    };
  }

  async fullRegister(fullRegisterDto: FullRegisterDto) {
    const user = await this.usersService.create({
      ...fullRegisterDto,
      role: 'customer',
      birthdate: new Date(fullRegisterDto.birthdate),
    });

    const { password, ...result } = user as any;
    const token = this.generateToken(user);

    return {
      user: result,
      token,
      message: 'Cliente registrado exitosamente',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password, ...result } = user as any;
    const token = this.generateToken(user);

    return {
      user: result,
      token,
      message: 'Inicio de sesión exitoso',
    };
  }

  private generateToken(user: any) {
    const payload = { 
      email: user.email, 
      sub: user._id.toString(),
      role: user.role 
    };
    return this.jwtService.sign(payload);
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
