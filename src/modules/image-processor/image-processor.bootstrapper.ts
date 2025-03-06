import { Container } from 'inversify';
import { ImageProcessorTypes } from './image-processor.types';
import ImageProcessorService from './services/image-processor.service';
import { ICsvHelper, IImageProcessingWorker, IImageProcessorService, IProcessingRequestRepository, IProductRepository } from './image-processor.interfaces';
import { CsvHelper } from './helpers/csv.helper';
import ProcessingRequestRepository from './repositories/processing-request.repository';
import ProductRepository from './repositories/product.repository';
import ImageProcessingWorker from './workers/image-processing.worker';
import { IBullQueueProvider } from '../../common/common.interfaces';
import { CommonTypes } from '../../common/common.types';

export default class ImageProcessorBootstrapper {
  public static initialize(container: Container) {
    this.registerDependencies(container);
    this.initializeWorkers(container);
  }

  private static registerDependencies(container: Container) {
    container
      .bind<IImageProcessorService>(
        ImageProcessorTypes.ImageProcessorService,
      )
      .to(ImageProcessorService);

    container
      .bind<IImageProcessingWorker>(
        ImageProcessorTypes.ImageProcessingWorker,
      )
      .to(ImageProcessingWorker);

    container
      .bind<IProcessingRequestRepository>(
        ImageProcessorTypes.ProcessingRequestRepository,
      )
      .to(ProcessingRequestRepository);

    container
      .bind<IProductRepository>(
        ImageProcessorTypes.ProductRepository,
      )
      .to(ProductRepository);

    container
      .bind<ICsvHelper>(
        ImageProcessorTypes.CsvHelper,
      )
      .to(CsvHelper);
  }

  private static async initializeWorkers(container: Container) {
    const queue = container.get<IBullQueueProvider>(CommonTypes.BullQueueProvider).getQueue();
    const imageProcessingWorker = container.get<IImageProcessingWorker>(ImageProcessorTypes.ImageProcessingWorker);
    queue.process('image-processor', async (job) => {
        await imageProcessingWorker.processJobs(job);
    });
  }
}
