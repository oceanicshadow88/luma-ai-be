import { jwtUtils } from '../lib/jwtUtils';

export async function getUserProps(context: { query: Record<string, unknown> }) {
  const { userData } = context.query;

  if (typeof userData === 'string') {
    const user = jwtUtils.verifyTempDataToken(userData);
    return { props: { user } };
  }

  return { props: {} };
}
