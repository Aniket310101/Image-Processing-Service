import { v2 as cloudinary } from 'cloudinary';
import ErrorHandler from '../errors/error-handler';
import { ErrorCodeEnums } from '../errors/error-enums';
import { injectable } from 'inversify';
import { ICloudinaryProvider } from '../common.interfaces';

@injectable()
export default class CloudinaryProvider implements ICloudinaryProvider {

    initializeCloudinary() {
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

    async uploadImage(file: Buffer, fileName: string): Promise<string> {
        try {
        const base64File = file.toString('base64');
        const dataUri = `data:image/jpeg;base64,${base64File}`;
        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload(dataUri, {
            public_id: fileName.split('.')[0],
            folder: 'processed-images',
            format: 'jpg',
            }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
            });
        });
        return result.secure_url;
        } catch (error) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, `Failed to upload image! Error: ${error}`);
        }
    }
}