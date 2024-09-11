<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { registerSchema, type RegisterSchema } from '@todo/api/src/settings/schema';
	import Button from '$lib/components/ui/button/button.svelte';
	import { client } from '$lib/client';
	import { onMount } from 'svelte';
	import { disableScrollHandling, goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';

	export let data: SuperValidated<Infer<RegisterSchema>>;

	const form = superForm(data, {
		validators: zodClient(registerSchema)
	});
	const { form: formData, enhance } = form;
</script>

<div class="flex min-h-screen">
	<div
		class="w-9/12 hidden lg:block bg-cover bg-origin-border bg-gradient-to-br from-white to-black rounded-3xl"
	></div>

	<div class="w-full md:w-1/2 flex min-h-svh justify-center m-auto items-center flex-col">
		<form class="w-full max-w-md p-6" method="POST" use:enhance>
			<h1 class="text-3xl font-bold text-center">{m.register()}</h1>
			<Form.Field {form} name="username">
				<Form.Control let:attrs>
					<Form.Label>{m.username()}</Form.Label>
					<Input
						placeholder="{m.example()}:Osman Mujic"
						{...attrs}
						bind:value={$formData.username}
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control let:attrs>
					<Form.Label>{m.password()}</Form.Label>
					<Input type="password" {...attrs} bind:value={$formData.password} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="confirmPassword">
				<Form.Control let:attrs>
					<Form.Label>{m.confirm_password()}</Form.Label>
					<Input type="password" {...attrs} bind:value={$formData.confirmPassword} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button class="w-full mt-5">{m.register()}</Form.Button>
			<div>
				<Button
					variant="secondary"
					class="w-full mt-5"
					on:click={() => (window.location.href = '/login')}>{m.sign_in()}</Button
				>
			</div>
		</form>
	</div>
</div>
