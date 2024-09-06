<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import dayjs from '@todo/utilities/dayjs';
	import Button from '$lib/components/ui/button/button.svelte';
	import { PenLine, Trash2 } from 'lucide-svelte';
	import { formSchema, type FormSchema } from '@todo/api/src/settings/schema';
	import EditTaskDialog from './editTaskDialog.svelte';
	import {
		fetchTasks,
		createPostTaskMutation,
		createDeleteTaskMutation,
		createEditTaskMutation
	} from '$lib/taskService';
	import { useQueryClient } from '@tanstack/svelte-query';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as m from '$lib/paraglide/messages';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	export let data: SuperValidated<Infer<FormSchema>>;

	let editingTask: {
		id: string;
		taskName: string;
		startTime: string;
		endTime: string;
	} | null = null;
	let open = false;
	const queryClient = useQueryClient();

	const form = superForm(data, {
		validators: zodClient(formSchema)
	});
	const { form: formData, enhance } = form;

	let fetchQuery = fetchTasks();
	let postTaskMutation = createPostTaskMutation(queryClient);
	let deleteTaskMutation = createDeleteTaskMutation(queryClient);
	let editTaskMutation = createEditTaskMutation(queryClient);

	const onsubmit = async (event: Event) => {
		event.preventDefault();
		const taskName = $formData.taskName;
		const startTimeUTC = dayjs($formData.startTime).utc().toISOString();
		const endTimeUTC = dayjs($formData.endTime).utc().toISOString();
		if (editingTask) {
			try {
				await $editTaskMutation.mutateAsync({
					id: editingTask.id,
					taskName,
					startTimeUTC,
					endTimeUTC
				});
				editingTask = null;
			} catch (error) {
				console.error('Error updating task:', error);
			}
		} else {
			try {
				await $postTaskMutation.mutateAsync({ taskName, startTimeUTC, endTimeUTC });
				editingTask = null;
			} catch (error) {
				console.error('Error:', error);
			}
		}
	};

	async function handleLogout() {
		localStorage.clear();
	}

	const handleDelete = (id: string) => {
		$deleteTaskMutation.mutate(id);
	};
	const handleEditTask = (id: string) => {
		if ($fetchQuery.data) {
			const task = $fetchQuery.data.find((task: any) => task.id === id);
			if (task) {
				editingTask = {
					...task,
					startTime: dayjs(task.startTime).format('YYYY-MM-DDTHH:mm'),
					endTime: dayjs(task.endTime).format('YYYY-MM-DDTHH:mm')
				};
				open = true;
			} else {
				console.log('No task found');
				editingTask = null;
				open = false;
			}
		} else {
			console.error('No data available to edit');
		}
	};

	$: if (!open) {
		editingTask = null;
		queryClient.invalidateQueries({ queryKey: ['tasks'] });
	}
</script>

<div class="flex justify-center items-center flex-col">
	<form
		class="w-full max-w-md p-6 rounded-xl"
		method="POST"
		use:enhance
		action="?/submit"
		on:submit={onsubmit}
	>
		<Form.Field {form} name="taskName">
			<Form.Control let:attrs>
				<Form.Label>{m.task_name()}</Form.Label>
				<Input placeholder="Example: Clean the house" {...attrs} bind:value={$formData.taskName} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="startTime">
			<Form.Control let:attrs>
				<Form.Label>{m.start_time()}</Form.Label>
				<Input type="datetime-local" {...attrs} bind:value={$formData.startTime} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="endTime">
			<Form.Control let:attrs>
				<Form.Label>{m.end_time()}</Form.Label>
				<Input type="datetime-local" {...attrs} bind:value={$formData.endTime} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<div class="flex justify-center mt-4">
			<Form.Button class="mx-auto">{m.submit()}</Form.Button>
		</div>
	</form>
</div>
<div class="flex justify-center items-center flex-col">
	{#if $fetchQuery.isPending}
		<div class="w-full max-w-md p-4 rounded-xl">
			<p>{m.loading()}</p>
		</div>
	{:else if $fetchQuery.isError}
		<div class="w-full max-w-md p-4 rounded-xl">
			<p>{m.error()}: {$fetchQuery.error}</p>
		</div>
	{:else}
		<div class="w-full p-4 rounded-xl">
			<Table.Root class="min-w-vh ">
				<Table.Caption>{m.your_tasks()}</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.Head>{m.task_name()}</Table.Head>
						<Table.Head>{m.start_time()}</Table.Head>
						<Table.Head>{m.end_time()}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each $fetchQuery.data as { id, taskName, startTime, endTime }}
						<Table.Row>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									<Table.Cell>{taskName}</Table.Cell>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content>
									<DropdownMenu.Group>
										<DropdownMenu.Label>{m.change()}</DropdownMenu.Label>
										<DropdownMenu.Separator />
										<DropdownMenu.Item on:click={() => handleEditTask(id)}
											>{m.edit()}</DropdownMenu.Item
										>
										<DropdownMenu.Item on:click={() => handleDelete(id)}
											>{m.remove()}</DropdownMenu.Item
										>
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
							<Table.Cell>{dayjs(startTime).local().format('YYYY-MM-DD HH:mm')}</Table.Cell>
							<Table.Cell>{dayjs(endTime).local().format('YYYY-MM-DD HH:mm')}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
{#if editingTask}
	<EditTaskDialog bind:editingTask bind:open />
{/if}
