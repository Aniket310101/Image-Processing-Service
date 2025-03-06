import { Container } from 'inversify';
import BaseDatastore from './datastore/base-datastore';
import { CommonTypes } from './common.types';
import { IBullQueueProvider, ICloudinaryProvider } from './common.interfaces';
import BullQueueProvider from './providers/bull-queue.provider';
import CloudinaryProvider from './providers/cloudinary.provider';

export default class CommonBootrapper {
  public static async initialize(container: Container) {
    new BaseDatastore().initializeDB();
    this.registerDependencies(container);
    this.initializeQueue(container);
    this.initializeCloudinary(container);
  }

  private static registerDependencies(container: Container) {
    container.bind<IBullQueueProvider>(CommonTypes.BullQueueProvider).to(BullQueueProvider).inSingletonScope();
    container.bind<ICloudinaryProvider>(CommonTypes.CloudinaryProvider).to(CloudinaryProvider).inSingletonScope();
  }

  private static initializeQueue(container: Container) {
    const queueProvider = container.get<IBullQueueProvider>(CommonTypes.BullQueueProvider);
    queueProvider.initializeQueue();
  }

  private static initializeCloudinary(container: Container) {
    const cloudinaryProvider = container.get<ICloudinaryProvider>(CommonTypes.CloudinaryProvider);
    cloudinaryProvider.initializeCloudinary();
  }
}   