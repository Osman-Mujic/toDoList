<script lang="ts">
	import { Calendar as CalendarPrimitive } from 'bits-ui';
	import * as Calendar from './index.js';
	import { cn } from '$lib/utils.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	const frameworks = [
		{
			combovalue: 'AM',
			label: 'AM'
		},
		{
			combovalue: 'PM',
			label: 'PM'
		}
	];

	let open = false;
	export let combovalue: string = 'AM';
	export let hours: string = '';
	export let minutes: string = '';

	$: selectedValue = frameworks.find((f) => f.combovalue === combovalue)?.label ?? 'AM';
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	type $$Props = CalendarPrimitive.Props & { hours: string; minutes: string; combovalue: string };
	type $$Events = CalendarPrimitive.Events;

	export let value: $$Props['value'] = undefined;
	export let placeholder: $$Props['placeholder'] = undefined;
	export let weekdayFormat: $$Props['weekdayFormat'] = 'short';

	function handleHoursChange(event: Event) {
		const input = event.target as HTMLInputElement;
		let value = input.value;
		value = value.replace(/[^0-9]/g, '');
		if (value.length > 2) {
			value = value.slice(0, 2);
		}
		const intValue = parseInt(value);
		if (intValue > 12) {
			hours = '12';
		} else if (intValue <= -1 || value === '') {
			hours = '00';
		} else {
			hours = value;
		}
	}

	function handleMinutesChange(event: Event) {
		const input = event.target as HTMLInputElement;
		let value = input.value;
		value = value.replace(/[^0-9]/g, '');
		if (value.length > 2) {
			value = value.slice(0, 2);
		}
		const intValue = parseInt(value);
		if (intValue > 59) {
			minutes = '59';
		} else if (intValue <= -1 || value === '') {
			minutes = '00';
		} else {
			minutes = value;
		}
	}

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<CalendarPrimitive.Root
	bind:value
	bind:placeholder
	{weekdayFormat}
	class={cn('p-3', className)}
	{...$$restProps}
	on:keydown
	let:months
	let:weekdays
>
	<Calendar.Header>
		<Calendar.PrevButton />
		<Calendar.Heading />
		<Calendar.NextButton />
	</Calendar.Header>
	<Calendar.Months>
		{#each months as month}
			<Calendar.Grid>
				<Calendar.GridHead>
					<Calendar.GridRow class="flex">
						{#each weekdays as weekday}
							<Calendar.HeadCell>
								{weekday.slice(0, 2)}
							</Calendar.HeadCell>
						{/each}
					</Calendar.GridRow>
				</Calendar.GridHead>
				<Calendar.GridBody>
					{#each month.weeks as weekDates}
						<Calendar.GridRow class="mt-2 w-full">
							{#each weekDates as date}
								<Calendar.Cell {date}>
									<Calendar.Day {date} month={month.value} />
								</Calendar.Cell>
							{/each}
						</Calendar.GridRow>
					{/each}
				</Calendar.GridBody>
			</Calendar.Grid>
		{/each}
	</Calendar.Months>
	<div class="flex flex-row gap-1 mt-1 justify-center">
		<Input
			placeholder="00"
			class="w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
			type="number"
			bind:value={hours}
			on:input={handleHoursChange}
		/>
		<p class="p-1">:</p>
		<Input
			placeholder="00"
			class="w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
			type="number"
			bind:value={minutes}
			on:input={handleMinutesChange}
		/>
		<Popover.Root bind:open let:ids>
			<Popover.Trigger asChild let:builder>
				<Button
					builders={[builder]}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					class="w-[75px] justify-between"
				>
					{selectedValue}
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</Popover.Trigger>
			<Popover.Content class="w-[75px] p-0">
				<Command.Root>
					<Command.Group>
						{#each frameworks as framework}
							<Command.Item
								value={framework.combovalue}
								onSelect={(currentValue) => {
									combovalue = currentValue;
									closeAndFocusTrigger(ids.trigger);
								}}
							>
								{framework.label}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
	</div>
</CalendarPrimitive.Root>
