import * as awsx from '@pulumi/awsx';
import * as pulumi from '@pulumi/pulumi';

import { cluster } from '../cluster';
import { streamingsDockerImage } from '../images/streamings';
import { amqpListener } from './rabbitmq';
import { appLoadBalancer } from '../loadbalancer';

export const streamingsTargetGroup = appLoadBalancer.createTargetGroup(
  'streamings-target',
  {
    port: 3334,
    protocol: 'HTTP',
    healthCheck: { path: '/health', protocol: 'HTTP' },
  }
);

export const streamingsHTTPListener = appLoadBalancer.createListener(
  'streamings-listener',
  { port: 3334, protocol: 'HTTP', targetGroup: streamingsTargetGroup }
);

export const streamingsService = new awsx.classic.ecs.FargateService(
  'fargate-streamings',
  {
    cluster,
    desiredCount: 1,
    waitForSteadyState: false,
    taskDefinitionArgs: {
      container: {
        image: streamingsDockerImage.ref,
        cpu: 256,
        memory: 512,
        portMappings: [streamingsHTTPListener],
        environment: [
          {
            name: 'BROKER_URL',
            value: pulumi.interpolate`amqp://admin:admin@${amqpListener.endpoint.hostname}:${amqpListener.endpoint.port}`,
          },
          {
            name: 'DATABASE_URL',
            // O correto aqui seria utilizar o AWS Secret Manager ou o Pulumi Secret para esconder essas variáveis de ambiente
            value:
              'postgresql://streamings_owner:npg_SgHcvlDTr74o@ep-spring-surf-a45rygpj.us-east-1.aws.neon.tech/streamings?sslmode=require&channel_binding=require',
          },
          {
            name: 'OTEL_TRACES_EXPORTER',
            value: 'otlp',
          },
          {
            name: 'OTEL_EXPORTER_OTLP_ENDPOINT',
            value: 'https://otlp-gateway-prod-sa-east-1.grafana.net/otlp',
          },
          {
            name: 'OTEL_EXPORTER_OTLP_HEADERS',
            value:
              'Authorization=Basic MTMwMDY1ODpnbGNfZXlKdklqb2lNVFEyT0Rjek15SXNJbTRpT2lKdGFXTnliM056WlhKMmFXTnZjeTFsZUdGdGNHeHZJaXdpYXlJNklrbGFPRVkwVFc4MlExQXhlbGd6U0hJeE1qWkxOR2RrT1NJc0ltMGlPbnNpY2lJNkluQnliMlF0YzJFdFpXRnpkQzB4SW4xOQ==',
          },
          {
            name: 'OTEL_SERVICE_NAME',
            value: 'streamings',
          },
          {
            name: 'OTEL_RESOURCE_ATTRIBUTES',
            value:
              'service.name=streamings,service.namespace=microservices-example,deployment.environment=production',
          },
          {
            name: 'OTEL_NODE_RESOURCE_DETECTORS',
            value: 'env,host,os',
          },
          {
            name: 'OTEL_NODE_ENABLED_INSTRUMENTATIONS',
            value: 'http,fastify,pg,amqplib',
          },
        ],
      },
    },
  }
);
