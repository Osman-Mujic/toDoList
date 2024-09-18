<script lang="ts">
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DateTimePicker } from '$lib/components/ui/datetimepicker/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	const df = new DateFormatter('en-US', { dateStyle: 'long' });

	let startTime: string | undefined = undefined;
	let endTime: string | undefined = undefined;

	let startHours: string = '';
	let startMinutes: string = '';
	let startCombovalue: string = 'AM';

	let endHours: string = '';
	let endMinutes: string = '';
	let endCombovalue: string = 'PM';

	function handleStartTimeUpdate(dateTime: string) {
		startTime = dateTime;
		console.log('Updated Start Time:', startTime);
	}

	function handleEndTimeUpdate(dateTime: string) {
		endTime = dateTime;
		console.log('Updated End Time:', endTime);
	}
</script>

<div class="flex flex-col gap-4">
	<Popover.Root>
		<Popover.Trigger asChild let:builder>
			<Button
				variant="outline"
				class={cn(
					'w-[280px] justify-start text-left font-normal',
					!startTime && 'text-muted-foreground'
				)}
				builders={[builder]}
			>
				<CalendarIcon class="mr-2 h-4 w-4" />
				{#if startTime}
					{startTime} <!-- Display already formatted start time -->
				{:else}
					Pick a start date
				{/if}
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0">
			<DateTimePicker
				bind:hours={startHours}
				bind:minutes={startMinutes}
				bind:combovalue={startCombovalue}
				onChange={handleStartTimeUpdate}
			/>
		</Popover.Content>
	</Popover.Root>

	<Popover.Root>
		<Popover.Trigger asChild let:builder>
			<Button
				variant="outline"
				class={cn(
					'w-[280px] justify-start text-left font-normal',
					!endTime && 'text-muted-foreground'
				)}
				builders={[builder]}
			>
				<CalendarIcon class="mr-2 h-4 w-4" />
				{#if endTime}
					{endTime} <!-- Display already formatted end time -->
				{:else}
					Pick an end date
				{/if}
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0">
			<DateTimePicker
				bind:hours={endHours}
				bind:minutes={endMinutes}
				bind:combovalue={endCombovalue}
				onChange={handleEndTimeUpdate}
			/>
		</Popover.Content>
	</Popover.Root>
</div>
