import { client } from '$lib/client';
import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import dayjs from '@todo/utilities/dayjs';
import type { QueryClient } from '@tanstack/svelte-query';

export const fetchTasks = () => {
	return createQuery({
		queryKey: ['tasks'],
		queryFn: async () => {
			try {
				const response = await client.tasks.$get();
				if (!response.ok) throw new Error('Failed to fetch tasks');
				const responseData = await response.json();
				return responseData;
			} catch (error) {
				console.error('Error fetching tasks:', error);
				throw error;
			}
		}
	});
};

export const createPostTaskMutation = (queryClient: QueryClient) => {
	return createMutation({
		mutationFn: async ({
			taskName,
			startTimeUTC,
			endTimeUTC
		}: {
			taskName: string;
			startTimeUTC: string;
			endTimeUTC: string;
		}) => {
			const response = await client.tasks.$post({
				json: {
					taskName,
					startTime: startTimeUTC,
					endTime: endTimeUTC
				}
			});
			if (!response.ok) throw new Error('Failed to submit data');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] });
		},
		onError: (error) => {
			console.error('Error:', error);
		}
	});
};

export const createDeleteTaskMutation = (queryClient: QueryClient) => {
	return createMutation({
		mutationFn: async (id: string) => {
			const response = await client.tasks[':id'].$delete({
				param: { id }
			});
			if (!response.ok) throw new Error('Failed to delete task');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'all' });
			console.log('Task deleted successfully');
		},
		onError: (error) => {
			console.error('Error deleting task:', error);
		}
	});
};

export const createEditTaskMutation = (queryClient: QueryClient) => {
	return createMutation({
		mutationFn: async ({
			id,
			taskName,
			startTimeUTC,
			endTimeUTC
		}: {
			id: string;
			taskName: string;
			startTimeUTC: string;
			endTimeUTC: string;
		}) => {
			const response = await client.tasks[':id'].$put({
				param: { id },
				json: {
					taskName,
					startTime: startTimeUTC,
					endTime: endTimeUTC
				}
			});
			if (!response.ok) throw new Error('Failed to update task');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] });
			console.log('Task updated successfully');
		},
		onError: (error) => {
			console.error('Error updating task:', error);
		}
	});
};
