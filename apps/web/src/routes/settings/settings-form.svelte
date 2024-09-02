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
			// Update existing task
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
			// Create new task
			try {
				await $postTaskMutation.mutateAsync({ taskName, startTimeUTC, endTimeUTC });
				editingTask = null;
			} catch (error) {
				console.error('Error:', error);
			}
		}
	};

	const handleDelete = (id: string) => {
		$deleteTaskMutation.mutate(id);
	};
	const handleEditTask = (id: string) => {
		if ($fetchQuery.data) {
			const task = $fetchQuery.data.find((task) => task.id === id);
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

<div class="flex min-h-svh bg-gray-700 justify-center m-auto items-center flex-col">
	<form
		class="w-full max-w-md bg-gray-500 p-6 rounded-xl"
		method="POST"
		use:enhance
		on:submit={onsubmit}
	>
		<Form.Field {form} name="taskName">
			<Form.Control let:attrs>
				<Form.Label>Task Name</Form.Label>
				<Input placeholder="Example: Clean the house" {...attrs} bind:value={$formData.taskName} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="startTime">
			<Form.Control let:attrs>
				<Form.Label>Start Time</Form.Label>
				<Input type="datetime-local" {...attrs} bind:value={$formData.startTime} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="endTime">
			<Form.Control let:attrs>
				<Form.Label>End Time</Form.Label>
				<Input type="datetime-local" {...attrs} bind:value={$formData.endTime} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button>Submit</Form.Button>
	</form>
	{#if $fetchQuery.isPending}
		<div class="w-full max-w-md bg-gray-600 text-white p-4 rounded-xl">
			<p>Loading...</p>
		</div>
	{:else if $fetchQuery.isError}
		<div class="w-full max-w-md bg-gray-600 text-white p-4 rounded-xl">
			<p>Error: {$fetchQuery.error}</p>
		</div>
	{:else}
		<div class="w-full max-w-md bg-gray-600 text-white p-4 rounded-xl">
			{#each $fetchQuery.data as { id, taskName, startTime, endTime }}
				<div class="mb-4e">
					<p><strong>Task Name:</strong> {taskName}</p>
					<p>
						<strong>Start Time (Local):</strong>
						{dayjs(startTime).local().format('YYYY-MM-DD HH:mm')}
					</p>
					<p>
						<strong>End Time (Local):</strong>
						{dayjs(endTime).local().format('YYYY-MM-DD HH:mm')}
					</p>
					<Button on:click={() => handleEditTask(id)}><PenLine /> Edit</Button>
					<Button
						variant="destructive"
						class="hover:animate-pulse"
						on:click={() => handleDelete(id)}
						><Trash2 /> Delete
					</Button>
				</div>
			{/each}
		</div>
	{/if}
</div>
{#if editingTask}
	<EditTaskDialog bind:editingTask bind:open />
{/if}
