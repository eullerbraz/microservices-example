import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as docker from '@pulumi/docker-build';

const streamingsECRRepository = new awsx.ecr.Repository('streamings-ecr', {
  forceDelete: true,
});

const streamingsECRToken = aws.ecr.getAuthorizationTokenOutput({
  registryId: streamingsECRRepository.repository.registryId,
});

export const streamingsDockerImage = new docker.Image('streamings-image', {
  tags: [
    pulumi.interpolate`${streamingsECRRepository.repository.repositoryUrl}:latest`,
  ],
  context: { location: '../app-streamings' },
  push: true,
  platforms: ['linux/amd64'],
  registries: [
    {
      address: streamingsECRRepository.repository.repositoryUrl,
      username: streamingsECRToken.userName,
      password: streamingsECRToken.password,
    },
  ],
});
