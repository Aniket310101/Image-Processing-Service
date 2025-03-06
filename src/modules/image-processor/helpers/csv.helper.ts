import { parse } from 'csv-parse';
import { injectable } from 'inversify';
import ErrorHandler from '../../../common/errors/error-handler';
import { ErrorCodeEnums } from '../../../common/errors/error-enums';
import { REQUIRED_COLUMNS, URL_REGEX } from '../utils/image-processor.utils';
import ProductModel from '../models/product.model';

@injectable()
export class CsvHelper {

  async parseCSVBuffer(file: Express.Multer.File): Promise<ProductModel[]> {
    return new Promise((resolve, reject) => {
      const products: ProductModel[] = [];
      const csvErrors: string[] = [];
      let rowNumber = 1;
      parse(file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        on_record: (record, context) => {
          rowNumber = context.records + 1;
          return record;
        },
      })
        .on('data', (row) => {
          try {
            const validatedProduct = this.validateAndTransformRow(row, rowNumber);
            products.push(validatedProduct);
          } catch (error: any) {
            csvErrors.push(`${error.message}`);
          }
        })
        .on('error', (error) => {
            reject(new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, `Error reading excel file! Error: ${error.message}`));
        })
        .on('end', () => {
            if (csvErrors.length > 0) {
                reject(new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, `Errors: ${csvErrors.join(', ')}`));
            }
            if (products.length === 0) {
                reject(new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, 'CSV file contains no valid product data'));
            }
            resolve(products);
        });
    });
  }

  private validateAndTransformRow(row: any, rowNumber: number): ProductModel {
    const serialNumber = row['S. No.'] || row['Serial Number'];
    if (!serialNumber) {
      throw new ErrorHandler(
        ErrorCodeEnums.BAD_REQUEST,
        `Serial Number is required! Row Number: ${rowNumber}`,
      );
    }

    const productName = row['Product Name'];
    if (!productName || productName.trim().length === 0) {
      throw new ErrorHandler(
        ErrorCodeEnums.BAD_REQUEST,
        `Product Name is required and cannot be empty! Row Number: ${rowNumber}`,
      );
    }

    const imageUrlsString = row['Input Image Urls'] || '';
    const imageUrls = imageUrlsString
      .split(',')
      .map((url: string) => url.trim())
      .filter((url: string) => url);

    if (imageUrls.length === 0) {
      throw new ErrorHandler(
        ErrorCodeEnums.BAD_REQUEST,
        `At least one valid Image URL is required! Row Number: ${rowNumber}`,
      );
    }

    for (const url of imageUrls) {
      if (!URL_REGEX.test(url)) {
        throw new ErrorHandler(
          ErrorCodeEnums.BAD_REQUEST,
          `Invalid URL format! Row Number: ${rowNumber}`,
        );
      }
    }

    return {
      serialNumber,
      productName,
      inputImageUrls: imageUrls,
    };
  }
} 