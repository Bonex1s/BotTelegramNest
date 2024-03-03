import { Injectable } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import { helpcmd, list } from 'src/bot/data/datacmd';
import { DataParserService } from 'src/bot/data.service';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'private.env' });

@Injectable()
export class BotService {
  private readonly bot: Telegraf;

  constructor(private readonly dataService: DataParserService) {
    const token = process.env.TOKEN;
    this.bot = new Telegraf(token);
    this.setupBot();
    this.startPolling();
  }

  private setupBot() {
    this.bot.start((ctx) => ctx.reply('Welcome'));
    this.bot.help((ctx) => {
      const helpersValue = Object.values(helpcmd);
      ctx.reply('Список команд' + ' ' + helpersValue);
    });
    this.bot.hears('hi', (ctx) => ctx.reply('Hey there'));
    this.bot.on('sticker', (ctx) => ctx.reply('ахахаххахахахахахха'));
    this.bot.command('model', async (ctx) => {
      const models = await this.dataService.getModels();
      const buttons = models.sort();
      const keyboard = Markup.keyboard(buttons, { columns: 3 })
        .resize()
        .oneTime();
      ctx.reply('Виберіть модель:', keyboard);
    });
    this.bot.hears('hi', (ctx) => ctx.reply('Hey there'));
    this.bot.hears('Дякую', (ctx) => ctx.reply('Немає за що))'));
    this.bot.hears('Аванс', (ctx) =>
      ctx.reply('Сумарний аванс за місяць: $$$'),
    );
    this.bot.hears('Список', (ctx) => {
      const objValues = Object.values(list);
      ctx.reply('Працівники:' + ' ' + objValues);
    });
    this.bot.on('message', async (ctx) => {
      if ('text' in ctx.message) {
        const model = ctx.message.text.trim();
        const accessories = await this.dataService.getModelAccessories(model);
        if (accessories) {
          ctx.reply(
            `Чохол: ${accessories.case}\n\nСкло: ${accessories.screenProtector}`,
          );
        }
      } else {
        console.log('Біда');
      }
    });
  }

  private startPolling() {
    this.bot.launch().then(() => console.log('Telegram bot started'));
  }
}
