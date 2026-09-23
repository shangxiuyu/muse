import { EnvHttpProxyAgent, setGlobalDispatcher } from 'undici';

let configured = false;
export function configureNetwork(env = process.env) {
  if (configured) return;
  configured = true;
  if (env.HTTP_PROXY || env.HTTPS_PROXY || env.http_proxy || env.https_proxy) {
    setGlobalDispatcher(new EnvHttpProxyAgent({ noProxy: ['localhost', '127.0.0.1', '[::1]', env.NO_PROXY || env.no_proxy || ''].join(',') }));
  }
}
