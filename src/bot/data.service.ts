import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import * as cheerio from 'cheerio';

export class DataParserService {
  private readonly data: Map<string, [string, string]> = new Map();
  private models: string[] = [];
  constructor() {
    this.csvParser();
  }

  private csvParser() {
    fs.createReadStream('assets/modelData.csv')
      .pipe(csvParser({ separator: ';' }))
      .on('data', (row) => {
        const model = row['Модель'];
        this.data.set(model, [row['Чохли'], row['Скло']]);
        this.models.push(model);
      })
      .on('end', () => {
        console.log('CSV файл успішно оброблено');
      });
  }

  public getModels(): string[] {
    return this.models;
  }

  public getModelAccessories(model: string) {
    const modelData = this.data.get(model);
    return modelData
      ? { case: modelData[0], screenProtector: modelData[1] }
      : null;
  }
  public async pageLoad(url: string) {
    const res = await fetch(url);
    const data = await res.text();
    return data;
  }

  public async elements(url: string) {
    const pageData = await this.pageLoad(url);
    const $ = cheerio.load(pageData);
    const priceElement = $('.h2.m-0.text-nowrap.product-price-new');
    const namePhoneElement = $('h1.cat-title span');
    const priceDollarElement = $('.product-price-currency');

    const price = priceElement.text().trim();
    const nameModel = namePhoneElement.text().trim();
    const priceDollar = priceDollarElement.text().trim();

    return { price, nameModel, priceDollar };
  }
}
