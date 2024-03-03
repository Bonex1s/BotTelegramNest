import * as fs from 'fs';
import * as csvParser from 'csv-parser';

export class DataParserService {
  private readonly data: Map<string, [string, string]> = new Map();
  private models: string[] = [];
  constructor() {
    this.csvParser();
  }

  private csvParser() {
    fs.createReadStream('assets/modelPhone.csv')
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
}
