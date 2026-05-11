import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../../generated/prisma';
import { LoginDto, RegisterDto, SocialLoginDto } from './dto/auth.dto';

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  middleName: true,
  avatar: true,
  role: true,
  isVerified: true,
  preferredLanguage: true,
  referredBy: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone number is required');
    }

    if (dto.email) {
      const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (exists) throw new ConflictException('Email is already registered');
    }

    if (dto.phone) {
      const exists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (exists) throw new ConflictException('Phone number is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        coinWallet: { create: {} },
      },
      select: USER_PUBLIC_SELECT,
    });

    return this.generateTokens(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { phone: dto.identifier }],
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.passwordHash) throw new UnauthorizedException('This account uses social login');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.role);
  }

  async socialLogin(dto: SocialLoginDto) {
    const existing = await this.prisma.socialAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: dto.provider,
          providerUserId: dto.providerUserId,
        },
      },
      include: { user: true },
    });

    if (existing) {
      return this.generateTokens(existing.user.id, existing.user.role);
    }

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        avatar: dto.avatar,
        socialAccounts: {
          create: {
            provider: dto.provider,
            providerUserId: dto.providerUserId,
            accessToken: dto.accessToken,
          },
        },
        coinWallet: { create: {} },
      },
    });

    return this.generateTokens(user.id, user.role);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_PUBLIC_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<{ userId: string }>(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) throw new UnauthorizedException('User not found');

      const accessToken = this.jwtService.sign(
        { userId: user.id, role: user.role },
        {
          secret: this.config.get<string>('JWT_SECRET'),
          expiresIn: this.config.get('JWT_EXPIRES_IN', '1d') as unknown as number,
        },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async generateTokens(userId: string, role: UserRole) {
    const secret = this.config.get<string>('JWT_SECRET');
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '1d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ userId, role }, { secret, expiresIn: expiresIn as unknown as number }),
      this.jwtService.signAsync({ userId }, { secret, expiresIn: '7d' as unknown as number }),
    ]);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_PUBLIC_SELECT,
    });

    return { accessToken, refreshToken, user };
  }
}
