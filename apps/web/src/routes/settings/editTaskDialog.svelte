<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import { type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import dayjs from '@todo/utilities/dayjs';
	import Button from '$lib/components/ui/button/button.svelte';
	import { PenOff, Check } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages';
	import { editFormSchema, type EditFormSchema } from '@todo/api/src/settings/schema';
	import { client } from '$lib/client';
	export let editingTask: Infer<EditFormSchema>;
	export let open: boolean = false;

	const editForm = superForm(editingTask, { SPA: true, validators: zodClient(editFormSchema) });

	const { form: editFormData, enhance: editEnhance } = editForm;

	const editData = async (event: Event) => {
		event.preventDefault();

		const taskName = $editFormData.taskName;
		const startTimeUTC = dayjs($editFormData.startTime).utc().toISOString();
		const endTimeUTC = dayjs($editFormData.endTime).utc().toISOString();

		const payload = {
			taskName,
			startTime: startTimeUTC,
			endTime: endTimeUTC
		};

		if (typeof editingTask.id !== 'string') {
			console.error('Invalid task ID');
			return;
		}

		try {
			const response = await client.tasks[':id'].$put({
				param: {
					id: editingTask.id
				},
				json: payload
			});
			if (!response.ok) {
				throw new Error('Failed to update data');
			}
			open = false;
		} catch (error) {
			console.error('Error:', error);
		}
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]   p-4 rounded-xl">
		<Dialog.Header>
			<Dialog.Title>{m.edit_task()}</Dialog.Title>
			<Dialog.Description>
				{m.make_changes_to_task()}
			</Dialog.Description>
		</Dialog.Header>
		{#if editingTask}
			<form
				class="w-full max-w-md p-2 rounded-xl"
				method="POST"
				use:editEnhance
				on:submit={editData}
			>
				<Form.Field form={editForm} name="taskName">
					<Form.Control let:attrs>
						<Form.Label><strong>{m.task_name()}:</strong></Form.Label>
						<Input {...attrs} bind:value={$editFormData.taskName} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={editForm} name="startTime">
					<Form.Control let:attrs>
						<Form.Label>{m.start_time()}</Form.Label>
						<Input type="datetime-local" {...attrs} bind:value={$editFormData.startTime} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={editForm} name="endTime">
					<Form.Control let:attrs>
						<Form.Label>{m.end_time()}</Form.Label>
						<Input type="datetime-local" {...attrs} bind:value={$editFormData.endTime} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<div class="flex justify-between mt-4">
					<Button type="submit" class="mr-2"><Check />{m.save_changes()}</Button>
					<Button
						variant="destructive"
						on:click={() => {
							open = false;
						}}><PenOff />{m.cancel()}</Button
					>
				</div>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
