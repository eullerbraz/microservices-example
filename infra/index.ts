import * as pulumi from '@pulumi/pulumi';

import { streamingsService } from './src/services/streamings';
import { rabbitMQService } from './src/services/rabbitmq';
import { appLoadBalancer } from './src/loadbalancer';
import { kongService } from './src/services/kong';

// Exportar uma variável no index faz o log ao rodar o pulumi up
export const streamingsId = streamingsService.service.id;
export const rabbitMQId = rabbitMQService.service.id;
export const kongId = kongService.service.id;

// pulumi interpolate espera o serviço está no ar para interpolar a string, no caso aqui apenas após o load balancer estiver no ar ele vai logar a string abaixo
export const rabbitMQAdminURL = pulumi.interpolate`http://${appLoadBalancer.listeners[0].endpoint.hostname}:15672`;
