'use client';

import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields, magicLinkClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [
    magicLinkClient(),
    inferAdditionalFields({
      user: {
        firstName: { type: 'string', required: false },
        lastName: { type: 'string', required: false },
        roleId: { type: 'string', required: false, input: false },
        status: { type: 'string', required: false, input: false }
      }
    })
  ]
});
