<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Input } from '$lib/components/ui/input';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { cn } from '$lib/utils.js';
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
	import { DateTimePicker } from '$lib/components/ui/datetimepicker/index.js';
	import { parseDate, type DateValue } from '@internationalized/date';
	import { DateFormatter, getLocalTimeZone } from '@internationalized/date';
	export let data: SuperValidated<Infer<FormSchema>>;

	let tempStartTime: DateValue | undefined = undefined;
	let tempEndTime: DateValue | undefined = undefined;
	let tempStartHour: string;
	let tempStartMinute: string;
	let tempStartAmPm: string;
	let tempEndHour: string;
	let tempEndMinute: string;
	let tempEndAmPm: string;
	let editingTask: {
		id: string;
		taskName: string;
		startTime: DateValue | undefined;
		endTime: DateValue | undefined;
		startHour: string;
		startMinute: string;
		startAmPm: string;
		endHour: string;
		endMinute: string;
		endAmPm: string;
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
		const startHour = tempStartHour || '00';
		const startMinute = tempStartMinute || '00';
		const startAmPm = tempStartAmPm || 'AM';
		const endHour = tempEndHour || '00';
		const endMinute = tempEndMinute || '00';
		const endAmPm = tempEndAmPm || 'AM';

		const startTimeString = dayjs(
			`${tempStartTime} ${startHour}:${startMinute} ${startAmPm}`,
			'YYYY-MM-DD hh:mm A'
		).format('YYYY-MM-DD HH:mm');

		const endTimeString = dayjs(
			`${tempEndTime} ${endHour}:${endMinute} ${endAmPm}`,
			'YYYY-MM-DD hh:mm A'
		).format('YYYY-MM-DD HH:mm');
		const startTime = dayjs(startTimeString, 'YYYY-MM-DD hh:mm A');
		const endTime = dayjs(endTimeString, 'YYYY-MM-DD hh:mm A');

		if (endTime.isBefore(startTime)) {
			console.log("End time can't be before start time");
			isSubmitting = false;
			return;
		}

		const startTimeUTC = startTime.utc().toISOString();
		const endTimeUTC = endTime.utc().toISOString();
		$formData.startTime = startTimeUTC;
		$formData.endTime = endTimeUTC;
		console.log($formData);
		console.log('Start time: ', startTimeUTC);
		console.log('End time: ', endTimeUTC);

		try {
			if (editingTask) {
				await $editTaskMutation.mutateAsync({
					id: editingTask.id,
					taskName,
					startTimeUTC,
					endTimeUTC
				});
			} else {
				await $postTaskMutation.mutateAsync({
					taskName,
					startTimeUTC,
					endTimeUTC
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
	const handleDelete = (id: string) => {
		$deleteTaskMutation.mutate(id);
	};
	const handleEditTask = (id: string) => {
		if ($fetchQuery.data) {
			const task = $fetchQuery.data.find((task: any) => task.id === id);
			if (task) {
				editingTask = {
					...task,
					startTime: parseDate(task.startTime),
					endTime: parseDate(task.endTime),
					startHour: dayjs(task.startTime).format('hh'),
					startMinute: dayjs(task.startTime).format('mm'),
					startAmPm: dayjs(task.startTime).format('A'),
					endHour: dayjs(task.endTime).format('hh'),
					endMinute: dayjs(task.endTime).format('mm'),
					endAmPm: dayjs(task.endTime).format('A')
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
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});
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

		<Popover.Root>
			<Popover.Trigger asChild let:builder>
				<Button
					variant="outline"
					class={cn(
						'w-33 mt-3 justify-start text-left font-normal',
						!tempStartTime && 'text-muted-foreground'
					)}
					builders={[builder]}
				>
					<CalendarIcon class="mr-2 h-4 w-4" />
					{#if tempStartTime}{df.format(tempStartTime.toDate(getLocalTimeZone()))}
						{tempStartHour}:{tempStartMinute}
						{tempStartAmPm}
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
							bind:value={tempStartTime}
							bind:hours={tempStartHour}
							bind:minutes={tempStartMinute}
							bind:combovalue={tempStartAmPm}
						/>
					</Form.Control>
					<Form.FieldErrors class="mt-1 text-red-600" />
				</Form.Field>
			</Popover.Content>
		</Popover.Root>
		<br />
		<!-- End Time Field with Custom DateTimePicker -->
		<Popover.Root>
			<Popover.Trigger asChild let:builder>
				<Button
					variant="outline"
					class={cn(
						' mt-3 justify-start text-left font-normal',
						!tempEndTime && 'text-muted-foreground'
					)}
					builders={[builder]}
				>
					<CalendarIcon class="mr-2 h-4 w-4" />
					{#if tempEndTime}
						{df.format(tempEndTime.toDate(getLocalTimeZone()))}
						{tempEndHour}:{tempEndMinute}
						{tempEndAmPm}
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
							bind:value={tempEndTime}
							bind:hours={tempEndHour}
							bind:minutes={tempEndMinute}
							bind:combovalue={tempEndAmPm}
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</Popover.Content>
		</Popover.Root>

		<!-- {#if isSubmitting}
			<div class="flex justify-center items-center">
				<Button class="mx-auto"><Icon icon="line-md:uploading-loop" /></Button>
			</div>
		{:else} -->
		<div class="flex justify-center mt-4">
			<Form.Button class="mx-auto">{m.submit()}</Form.Button>
		</div>
		<!-- {/if} -->
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
{#if editingTask}
	<EditTaskDialog bind:editingTask bind:open />
{/if}
