import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { DataParserService } from 'src/bot/data.service';

@Module({
  imports: [],
  controllers: [],
  providers: [BotService, DataParserService],
})
export class BotModule {}
