import { json } from "@sveltejs/kit";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "$lib/taskService.js";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  try {
    const result = await getTasks();
    return json(result);
  } catch (error) {
    console.error("API Error:", error);
    return json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const taskData = await request.json();
    const result = await createTask(taskData);
    return json(result);
  } catch (error) {
    console.error("API Error:", error);
    return json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const { id, ...updates } = await request.json();
    const result = await updateTask(id, updates);
    return json(result);
  } catch (error) {
    console.error("API Error:", error);
    return json(
      { success: false, error: "Failed to update task" },
      { status: 500 }
    );
  }
};

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const { id } = await request.json();
    const result = await deleteTask(id);
    return json(result);
  } catch (error) {
    console.error("API Error:", error);
    return json(
      { success: false, error: "Failed to delete task" },
      { status: 500 }
    );
  }
};
