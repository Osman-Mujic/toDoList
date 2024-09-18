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
	import { DateTimePicker } from '$lib/components/ui/datetimepicker/index.js';
	import { parseDate, type DateValue } from '@internationalized/date';
	import { DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { CalendarIcon } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	export let editingTask: Infer<EditFormSchema>;
	export let open: boolean = false;

	// Initialize the form
	const editForm = superForm(editingTask, { SPA: true, validators: zodClient(editFormSchema) });
	const { form: editFormData, enhance: editEnhance } = editForm;

	// Date and Time variables
	let startTime: string | undefined = dayjs(editingTask.startTime).format('YYYY-MM-DD HH:mm:ss');
	let endTime: string | undefined = dayjs(editingTask.endTime).format('YYYY-MM-DD HH:mm:ss');

	let tempStartHour: string = dayjs(editingTask.startTime).format('hh');
	let tempStartMinute: string = dayjs(editingTask.startTime).format('mm');
	let tempStartAmPm: string = dayjs(editingTask.startTime).format('A');

	let tempEndHour: string = dayjs(editingTask.endTime).format('hh');
	let tempEndMinute: string = dayjs(editingTask.endTime).format('mm');
	let tempEndAmPm: string = dayjs(editingTask.endTime).format('A');

	// Formatters for date display
	const df = new DateFormatter('en-US', { dateStyle: 'long' });

	// Handle form submission
	const editData = async (event: Event) => {
		event.preventDefault();

		if (!startTime || !endTime) {
			console.error('Start time or end time not selected.');
			return;
		}

		const startTimeObj = dayjs(startTime, 'YYYY-MM-DD HH:mm:ss');
		const endTimeObj = dayjs(endTime, 'YYYY-MM-DD HH:mm:ss');

		const payload = {
			taskName: $editFormData.taskName,
			startTime: startTimeObj.utc().toISOString(),
			endTime: endTimeObj.utc().toISOString()
		};

		try {
			const response = await client.tasks[':id'].$put({
				param: { id: editingTask.id },
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

	// Handle start and end time changes
	function handleStartTimeChange(formattedStartTime: string) {
		startTime = formattedStartTime;
		console.log('Start Time Updated:', startTime);
	}

	function handleEndTimeChange(formattedEndTime: string) {
		endTime = formattedEndTime;
		console.log('End Time Updated:', endTime);
	}
</script>

<!-- Dialog for editing task -->
<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px] p-4 rounded-xl">
		<Dialog.Header>
			<Dialog.Title>{m.edit_task()}</Dialog.Title>
			<Dialog.Description>{m.make_changes_to_task()}</Dialog.Description>
		</Dialog.Header>
		{#if editingTask}
			<form
				class="w-full max-w-md p-2 rounded-xl"
				method="POST"
				use:editEnhance
				on:submit={editData}
			>
				<!-- Task Name -->
				<Form.Field form={editForm} name="taskName">
					<Form.Control let:attrs>
						<Form.Label><strong>{m.task_name()}:</strong></Form.Label>
						<Input {...attrs} bind:value={$editFormData.taskName} />
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
						<Form.Field form={editForm} name="startTime">
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
						<Form.Field form={editForm} name="endTime">
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

				<!-- Buttons for saving changes and canceling -->
				<div class="flex justify-between mt-4">
					<Button type="submit" class="mr-2"><Check />{m.save_changes()}</Button>
					<Button variant="destructive" on:click={() => (open = false)}>
						<PenOff />{m.cancel()}
					</Button>
				</div>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
