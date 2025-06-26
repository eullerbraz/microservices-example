import * as awsx from '@pulumi/awsx';

export const cluster = new awsx.classic.ecs.Cluster(
  'microservices-example-cluster'
);
