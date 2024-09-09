<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import dayjs from '@todo/utilities/dayjs';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { formSchema, type FormSchema } from '@todo/api/src/settings/schema';
	import EditTaskDialog from './editTaskDialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
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
	import Icon from '@iconify/svelte';
	export let data: SuperValidated<Infer<FormSchema>>;

	let editingTask: {
		id: string;
		taskName: string;
		startTime: string;
		endTime: string;
	} | null = null;
	let open = false;
	let isSubmitting = false;
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
		isSubmitting = true;
		const taskName = $formData.taskName;
		const startTimeUTC = dayjs($formData.startTime).utc().toISOString();
		const endTimeUTC = dayjs($formData.endTime).utc().toISOString();
		try {
			if (editingTask) {
				await $editTaskMutation.mutateAsync({
					id: editingTask.id,
					taskName,
					startTimeUTC,
					endTimeUTC
				});
			} else {
				await $postTaskMutation.mutateAsync({ taskName, startTimeUTC, endTimeUTC });
			}
			open = false;
			editingTask = null;
		} catch (error) {
			console.error('Error:', error);
		} finally {
			isSubmitting = false;
		}
	};

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
		{#if isSubmitting}<div class="flex justify-center items-center">
				<Button class="mx-auto"><Icon icon="line-md:uploading-loop" /></Button>
			</div>{:else}
			<div class="flex justify-center mt-4">
				<Form.Button class="mx-auto">{m.submit()}</Form.Button>
			</div>
		{/if}
	</form>
</div>

<div class="flex justify-center items-center flex-col">
	{#if $fetchQuery.isPending}
		<Icon icon="svg-spinners:blocks-wave" />
	{:else if $fetchQuery.isError}
		<div class="w-full max-w-md p-4 rounded-xl">
			<p>{m.error()}: {$fetchQuery.error}</p>
		</div>
	{:else}
		<div
			class="w-full p-4 rounded-xl"
			transition:slide={{ delay: 250, duration: 1000, easing: quintOut, axis: 'y' }}
		>
			<Table.Root class="min-w-vh">
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
