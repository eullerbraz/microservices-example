import * as awsx from '@pulumi/awsx';
import { cluster } from './cluster';

// HTTP e HTTP's
export const appLoadBalancer = new awsx.classic.lb.ApplicationLoadBalancer(
  'app-lb',
  { securityGroups: cluster.securityGroups }
);

// Para comunicação com rabbitmq é necessário um network lb, para fazer balanceamento de carga com outros protocolos que não HTTP
export const networkLoadBalancer = new awsx.classic.lb.NetworkLoadBalancer(
  'app-lb',
  { subnets: cluster.vpc.publicSubnetIds }
);
