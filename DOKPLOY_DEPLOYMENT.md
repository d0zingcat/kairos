# GitHub image publishing and Dokploy deployment

The production source branch is `main`. Workflow
`.github/workflows/ci-docker-ghcr.yml` publishes the Linux AMD64 image
`ghcr.io/d0zingcat/kairos:latest` and a full Git SHA tag.
Pull requests validate builds without publishing or deploying.

## Deployment configuration

Configure these GitHub Actions repository secrets through a secure channel:

- `DOKPLOY_DEPLOY_URL`: this application's own Dokploy deployment webhook.
- `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET`: Cloudflare Access
  service credentials for the Dokploy endpoint.

The repository variable `DOKPLOY_AUTO_DEPLOY` defaults to disabled.
First publish and verify the image, then switch the existing Dokploy
application to Docker source with `ghcr.io/d0zingcat/kairos:latest`.
Preserve its environment variables, mounts, ports, networks, and runtime
settings. Keep Dokploy Auto Deploy enabled in Docker mode because that setting
also controls the deployment webhook. Remove old direct Git push hooks for
this application if present.

Enable automatic updates by setting `DOKPLOY_AUTO_DEPLOY=true`. A successful
production image publication then notifies Dokploy. Build failures do not
trigger deployment, HTTP redirects are rejected, and notifications are not
automatically retried after an ambiguous response. Workflow runs are
serialized to avoid overlapping publications and notifications.

## Verification and rollback

Verify the Dokploy deployment record, image revision, and application health;
a successful webhook response only confirms request acceptance.
Images record `org.opencontainers.image.revision` and include a
`sha-<full Git SHA>` tag. For rollback, disable `DOKPLOY_AUTO_DEPLOY`,
select the previous successful SHA tag or recorded digest in Dokploy, and
redeploy. Keep the original local image and application source settings until
the initial migration is verified.
