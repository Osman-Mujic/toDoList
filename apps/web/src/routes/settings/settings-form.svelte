<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Input } from '$lib/components/ui/input';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { cn } from '$lib/utils.js';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import dayjs from '@todo/utilities/dayjs';
	import { formSchema, type FormSchema } from '@todo/api/src/settings/schema';
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
	import { DateTimePicker } from '$lib/components/ui/datetimepicker/index.js';
	import { DateFormatter, getLocalTimeZone } from '@internationalized/date';
	export let data: SuperValidated<Infer<FormSchema>>;

	// Time management variables
	let startTime: string | undefined = undefined;
	let endTime: string | undefined = undefined;

	let tempStartHour: string = '00';
	let tempStartMinute: string = '00';
	let tempStartAmPm: string = 'AM';

	let tempEndHour: string = '00';
	let tempEndMinute: string = '00';
	let tempEndAmPm: string = 'AM';

	let editingTask: {
		id: string;
		taskName: string;
		startTime: string;
		endTime: string;
		startHour: string;
		startMinute: string;
		startAmPm: string;
		endHour: string;
		endMinute: string;
		endAmPm: string;
	} | null = null;

	let open = false;
	let isSubmitting = false;

	// Set up form validation and mutations
	const queryClient = useQueryClient();
	const form = superForm(data, {
		validators: zodClient(formSchema)
	});
	const { form: formData, enhance } = form;

	let fetchQuery = fetchTasks();
	let postTaskMutation = createPostTaskMutation(queryClient);
	let deleteTaskMutation = createDeleteTaskMutation(queryClient);
	let editTaskMutation = createEditTaskMutation(queryClient);

	// Handle form submission
	const onsubmit = async (event: Event) => {
		event.preventDefault();
		isSubmitting = true;

		const taskName = $formData.taskName;

		if (!startTime || !endTime) {
			console.error('Start time or end time not selected.');
			isSubmitting = false;
			return;
		}

		const startTimeObj = dayjs(startTime, 'YYYY-MM-DD HH:mm:ss');
		const endTimeObj = dayjs(endTime, 'YYYY-MM-DD HH:mm:ss');

		if (endTimeObj.isBefore(startTimeObj)) {
			console.log("End time can't be before start time");
			isSubmitting = false;
			return;
		}

		$formData.startTime = startTimeObj.utc().toISOString();
		$formData.endTime = endTimeObj.utc().toISOString();

		try {
			if (editingTask) {
				await $editTaskMutation.mutateAsync({
					id: editingTask.id,
					taskName,
					startTimeUTC: $formData.startTime,
					endTimeUTC: $formData.endTime
				});
			} else {
				await $postTaskMutation.mutateAsync({
					taskName,
					startTimeUTC: $formData.startTime,
					endTimeUTC: $formData.endTime
				});
			}

			open = false;
			editingTask = null;
		} catch (error) {
			console.error('Error:', error);
		} finally {
			isSubmitting = false;
		}
	};

	// Handle task deletion
	const handleDelete = (id: string) => {
		$deleteTaskMutation.mutate(id);
	};

	// Handle task edit
	const handleEditTask = (id: string) => {
		if ($fetchQuery.data) {
			const task = $fetchQuery.data.find((task: any) => task.id === id);
			if (task) {
				editingTask = {
					...task,
					startTime: dayjs(task.startTime).format('YYYY-MM-DDTHH:mm:ssZ'),
					endTime: dayjs(task.endTime).format('YYYY-MM-DDTHH:mm:ssZ'),
					startHour: dayjs(task.startTime).format('hh'),
					startMinute: dayjs(task.startTime).format('mm'),
					startAmPm: dayjs(task.startTime).format('A'),
					endHour: dayjs(task.endTime).format('hh'),
					endMinute: dayjs(task.endTime).format('mm'),
					endAmPm: dayjs(task.endTime).format('A')
				};
				open = true;
			}
		}
	};

	// Handle start and end time updates
	function handleStartTimeChange(formattedStartTime: string) {
		startTime = formattedStartTime;
		console.log('Start Time Updated:', startTime);
	}

	function handleEndTimeChange(formattedEndTime: string) {
		endTime = formattedEndTime;
		console.log('End Time Updated:', endTime);
	}
</script>

<!-- Form -->
<div class="flex justify-center items-center flex-col">
	<form
		class="w-full max-w-md p-6 rounded-xl"
		method="POST"
		use:enhance
		action="?/submit"
		on:submit={onsubmit}
	>
		<!-- Task Name -->
		<Form.Field {form} name="taskName">
			<Form.Control let:attrs>
				<Form.Label>{m.task_name()}</Form.Label>
				<Input placeholder="Example: Clean the house" {...attrs} bind:value={$formData.taskName} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Start Time Picker -->
		<Popover.Root>
			<Popover.Trigger asChild let:builder>
				<Button
					variant="outline"
					class={cn(
						'w-33 mt-3 justify-start text-left font-normal',
						!startTime && 'text-muted-foreground'
					)}
					builders={[builder]}
				>
					<CalendarIcon class="mr-2 h-4 w-4" />
					{#if startTime}
						{dayjs(startTime).format('YYYY-MM-DD HH:mm A')}
					{:else}
						Pick the starting time of your task
					{/if}
				</Button>
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0">
				<Form.Field {form} name="startTime">
					<Form.Control let:attrs>
						<Form.Label>{m.start_time()}</Form.Label>
						<DateTimePicker
							bind:hours={tempStartHour}
							bind:minutes={tempStartMinute}
							bind:combovalue={tempStartAmPm}
							onChange={handleStartTimeChange}
						/>
					</Form.Control>
					<Form.FieldErrors class="mt-1 text-red-600" />
				</Form.Field>
			</Popover.Content>
		</Popover.Root>

		<!-- End Time Picker -->
		<Popover.Root>
			<Popover.Trigger asChild let:builder>
				<Button
					variant="outline"
					class={cn(
						' mt-3 justify-start text-left font-normal',
						!endTime && 'text-muted-foreground'
					)}
					builders={[builder]}
				>
					<CalendarIcon class="mr-2 h-4 w-4" />
					{#if endTime}
						{dayjs(endTime).format('YYYY-MM-DD HH:mm A')}
					{:else}
						Pick the ending time of your task
					{/if}
				</Button>
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0">
				<Form.Field {form} name="endTime">
					<Form.Control let:attrs>
						<Form.Label>{m.end_time()}</Form.Label>
						<DateTimePicker
							bind:hours={tempEndHour}
							bind:minutes={tempEndMinute}
							bind:combovalue={tempEndAmPm}
							onChange={handleEndTimeChange}
						/>
					</Form.Control>
					<Form.FieldErrors class="mt-1 text-red-600" />
				</Form.Field>
			</Popover.Content>
		</Popover.Root>

		<!-- Submit Button -->
		<div class="flex justify-center mt-4">
			<Form.Button class="mx-auto">{m.submit()}</Form.Button>
		</div>
	</form>
</div>

<!-- Task Table -->
<div class="flex justify-center items-center flex-col">
	{#if $fetchQuery.isPending}
		<Icon icon="svg-spinners:blocks-wave" />
	{:else if $fetchQuery.isError}
		<div class="w-full max-w-md p-4 rounded-xl">
			<p>{m.error()}: {$fetchQuery.error}</p>
		</div>
	{:else}
		<div class="w-full p-4 rounded-xl">
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
