import { jwtUtils } from '../lib/jwtUtils';

export async function getUserProps(context: {
  query?: Record<string, unknown>;
  encryptedData?: string;
}) {
  // Data is transmitted as tokens through encryption
  const payloadToken = Array.isArray(context.query?.payloadToken)
    ? context.query.payloadToken[0]
    : context.query?.payloadToken;

  // Determine if it is a token and decrypt it

  if (payloadToken) {
    const data = jwtUtils.verifyPayloadToken(payloadToken);
    return { props: { data } };
  }

  return { props: {} };
}
