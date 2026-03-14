<script lang="ts">
  import { apiGet } from '$lib/api/client';
  import { RoleTypeEnum } from '@acs/shared';

  interface HealthResponse {
    status: string;
    timestamp: string;
    database: string;
  }

  let health: HealthResponse | null = $state(null);
  let error: string | null = $state(null);
  let sharedPackageWorks = RoleTypeEnum.ADMIN === 'ADMIN';

  async function checkHealth() {
    try {
      error = null;
      health = await apiGet<HealthResponse>('/health');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
      health = null;
    }
  }
</script>

<h1>ACS - Monorepo Health Check</h1>

<section>
  <h2>@acs/shared package</h2>
  <p>Status: {sharedPackageWorks ? '✅ Working' : '❌ Failed'}</p>
  <p>RoleTypeEnum.ADMIN = "{RoleTypeEnum.ADMIN}"</p>
</section>

<section>
  <h2>Backend API</h2>
  <button onclick={checkHealth}>Check Health</button>

  {#if health}
    <pre>{JSON.stringify(health, null, 2)}</pre>
  {/if}

  {#if error}
    <p style="color: red;">{error}</p>
  {/if}
</section>
