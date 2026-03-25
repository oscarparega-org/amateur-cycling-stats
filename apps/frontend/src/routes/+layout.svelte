<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-sonner';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1" />
</svelte:head>

<div class="min-h-screen bg-white">
	<header class="border-b px-4 py-3 text-sm text-muted-foreground">
		ACS — Header placeholder
	</header>
	<Toaster position="top-center" closeButton duration={5000} richColors />
	<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
		{@render children()}
	</main>
</div>
