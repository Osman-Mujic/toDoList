<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { loginSchema, type Loginschema } from '../../../../api/src/settings/schema';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages';
	export let data: SuperValidated<Infer<Loginschema>>;

	const form = superForm(data, {
		validators: zodClient(loginSchema)
	});
	const { form: formData, enhance } = form;
</script>

<div class="flex min-h-screen">
	<div
		class="w-9/12 hidden lg:block bg-cover bg-origin-border bg-gradient-to-br from-white to-black rounded-3xl"
	></div>

	<div class="w-full md:w-1/2 flex min-h-svh justify-center m-auto items-center flex-col">
		<form class="w-full max-w-md p-6" method="POST">
			<h1 class="text-3xl font-bold text-center">{m.login()}</h1>
			<Form.Field {form} name="username">
				<Form.Control let:attrs>
					<Form.Label>{m.username()}</Form.Label>
					<Input {...attrs} bind:value={$formData.username} />
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
			<Form.Button>{m.login()}</Form.Button>
			<Button class="float-right" on:click={() => (window.location.href = '/registration')}
				>{m.register()}</Button
			>
		</form>
	</div>
</div>
