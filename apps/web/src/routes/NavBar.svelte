<script>
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import { Button } from '$lib/components/ui/button';
	import { toggleMode } from 'mode-watcher';
	import { quintOut } from 'svelte/easing';
	import { scale, slide } from 'svelte/transition';

	let isNavOpen = false; // Control the dropdown visibility on mobile
	let routes = [
		{ name: 'Home', path: '/settings' },
		{ name: 'Login', path: '/login' },
		{ name: 'Register', path: '/registration' }
	];

	async function handleLogout() {
		localStorage.clear();
	}
</script>

<nav class="flex items-center justify-between p-4">
	<div class="flex items-center space-x-4">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Avatar.Root>
					<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
					<Avatar.Fallback>CN</Avatar.Fallback>
				</Avatar.Root>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Group>
					<DropdownMenu.Label>My Account</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<form method="POST" action="?/logout">
						<DropdownMenu.Item>
							<button on:click={handleLogout} type="submit">Logout</button>
						</DropdownMenu.Item>
					</form>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<div class="hidden md:flex items-center space-x-4">
		{#each routes as route}
			<a href={route.path} class="hover:underline">
				{route.name}
			</a>
		{/each}
		<Button on:click={toggleMode} variant="outline" size="icon">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>

	<div class="md:hidden">
		<Button class="middle" on:click={() => (isNavOpen = !isNavOpen)}>
			{#if isNavOpen}
				<!-- navbar is open -->
				<svg
					transition:slide
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
				>
			{:else}
				<!-- navbar is closed -->
				<svg
					transition:slide
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-menu"
					><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line
						x1="4"
						x2="20"
						y1="18"
						y2="18"
					/></svg
				>
			{/if}
		</Button>
	</div>
</nav>
{#if isNavOpen}
	<div transition:slide class="flex flex-col items-center space-y-4 mt-4 md:hidden">
		{#each routes as route}
			<a href={route.path} class="hover:underline">
				{route.name}
			</a>
		{/each}
		<Button on:click={toggleMode} variant="outline" size="icon">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>
{/if}
