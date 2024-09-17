<script lang="ts">
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DateTimePicker } from '$lib/components/ui/datetimepicker/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	const df = new DateFormatter('en-US', { dateStyle: 'long' });

	let startTime: DateValue | undefined = undefined;
	let endTime: DateValue | undefined = undefined;

	let startHours: string = '';
	let startMinutes: string = '';
	let startCombovalue: string = 'AM';

	let endHours: string = '';
	let endMinutes: string = '';
	let endCombovalue: string = 'PM';
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
					{df.format(startTime.toDate(getLocalTimeZone()))}
					{startHours}:{startMinutes}
					{startCombovalue}
				{:else}
					Pick a start date
				{/if}
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0">
			<DateTimePicker
				bind:value={startTime}
				bind:hours={startHours}
				bind:minutes={startMinutes}
				bind:combovalue={startCombovalue}
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
					{df.format(endTime.toDate(getLocalTimeZone()))} {endHours}:{endMinutes} {endCombovalue}
				{:else}
					Pick an end date
				{/if}
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0">
			<DateTimePicker
				bind:value={endTime}
				bind:hours={endHours}
				bind:minutes={endMinutes}
				bind:combovalue={endCombovalue}
			/>
		</Popover.Content>
	</Popover.Root>
</div>
