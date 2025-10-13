import { ConvexHttpClient } from 'convex/browser';

export type ConvexHttpClientFactory = (convexUrl: string) => ConvexHttpClient;

export const createConvexHttpClient: ConvexHttpClientFactory = (convexUrl) =>
  new ConvexHttpClient(convexUrl);
