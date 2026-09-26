import { HttpClient, requestProvider } from './http-transport';

export type DarajaTokenResponse = { access_token: string; expires_in?: string | number };

export async function getDarajaAccessToken(
  client: HttpClient,
  config: { oauthUrl: string; consumerKey: string; consumerSecret: string },
): Promise<DarajaTokenResponse> {
  if (!config.oauthUrl || !config.consumerKey || !config.consumerSecret) throw new Error('Daraja OAuth configuration is incomplete');
  const encoded = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
  const result = await requestProvider<DarajaTokenResponse>(client, {
    method: 'GET',
    url: config.oauthUrl,
    headers: { Authorization: `Basic ${encoded}`, Accept: 'application/json' },
  });
  if (!result.access_token) throw new Error('Daraja OAuth response did not contain an access token');
  return result;
}
