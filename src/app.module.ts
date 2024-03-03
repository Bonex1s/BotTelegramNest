import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { AppService } from './app.service';

@Module({
  imports: [BotModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
