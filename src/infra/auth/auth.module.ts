import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  controllers: [],
  providers: [JwtService],
  exports: [JwtService],
})
export class AuthModule {}
