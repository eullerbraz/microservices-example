import * as awsx from '@pulumi/awsx';
import * as pulumi from '@pulumi/pulumi';

import { cluster } from '../cluster';
import { appLoadBalancer, networkLoadBalancer } from '../loadbalancer';
import { kongDockerImage } from '../images/kong';
import { streamingsHTTPListener } from './streamings';

export const proxyTargetGroup = appLoadBalancer.createTargetGroup(
  'proxy-target',
  {
    port: 8000,
    protocol: 'HTTP',
    healthCheck: { path: '/streamings/health', protocol: 'HTTP' },
  }
);

const proxyListener = appLoadBalancer.createListener('proxy-listener', {
  port: 80,
  protocol: 'HTTP',
  targetGroup: proxyTargetGroup,
});

export const adminTargetGroup = appLoadBalancer.createTargetGroup(
  'admin-target',
  {
    port: 8002,
    protocol: 'HTTP',
    healthCheck: { path: '/', protocol: 'HTTP' },
  }
);

const adminListener = appLoadBalancer.createListener('admin-listener', {
  port: 8002,
  protocol: 'HTTP',
  targetGroup: adminTargetGroup,
});

export const adminAPITargetGroup = appLoadBalancer.createTargetGroup(
  'admin-api-target',
  {
    port: 8001,
    protocol: 'HTTP',
    healthCheck: { path: '/', protocol: 'HTTP' },
  }
);

const adminAPIListener = appLoadBalancer.createListener('admin-api-listener', {
  port: 8001,
  protocol: 'HTTP',
  targetGroup: adminAPITargetGroup,
});

export const kongService = new awsx.classic.ecs.FargateService('fargate-kong', {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: kongDockerImage.ref,
      cpu: 256,
      memory: 512,
      portMappings: [proxyListener, adminListener, adminAPIListener],
      environment: [
        { name: 'KONG_DATABASE', value: 'off' },
        {
          name: 'STREAMINGS_SERVICE_URL',
          value: pulumi.interpolate`http://${streamingsHTTPListener.endpoint.hostname}:${streamingsHTTPListener.endpoint.port}`,
        },
        { name: 'KONG_ADMIN_LISTEN', value: '0.0.0.0:8001' },
      ],
    },
  },
});
