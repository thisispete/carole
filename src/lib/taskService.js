import { supabase } from './supabase.js';

// Get all tasks for the current user
export async function getTasks() {
  if (!supabase) {
    return { success: false, error: 'Database not connected', data: [] };
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log('✅ Tasks fetched successfully:', data?.length || 0, 'tasks');
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('❌ Failed to fetch tasks:', err);
    return { success: false, error: 'Failed to fetch tasks', data: [] };
  }
}

// Get top priority tasks (for dashboard)
export async function getTopPriorityTasks(limit = 3) {
  if (!supabase) {
    return { success: false, error: 'Database not connected', data: [] };
  }

  try {
    console.log('🔍 Fetching priority tasks...');
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .neq('status', 'done') // Show all tasks except completed ones
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching priority tasks:', error);
      console.error('Error details:', error.details, error.hint, error.code);
      return { success: false, error: error.message, data: [] };
    }

    console.log('✅ Priority tasks fetched:', data?.length || 0, 'tasks');
    if (data && data.length === 0) {
      console.log('⚠️  No tasks returned - this might be due to Row Level Security (RLS)');
      console.log('💡 Check if you need to disable RLS or authenticate a user');
    }
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('❌ Failed to fetch priority tasks:', err);
    return { success: false, error: 'Failed to fetch priority tasks', data: [] };
  }
}

// Create a new task
export async function createTask(taskData) {
  if (!supabase) {
    return { success: false, error: 'Database not connected' };
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Task created successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Failed to create task:', err);
    return { success: false, error: 'Failed to create task' };
  }
}

// Update a task
export async function updateTask(id, updates) {
  if (!supabase) {
    return { success: false, error: 'Database not connected' };
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Task updated successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Failed to update task:', err);
    return { success: false, error: 'Failed to update task' };
  }
}

// Delete a task
export async function deleteTask(id) {
  if (!supabase) {
    return { success: false, error: 'Database not connected' };
  }

  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Task deleted successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Failed to delete task:', err);
    return { success: false, error: 'Failed to delete task' };
  }
}

// Debug function to see all tasks in database
export async function debugAllTasks() {
  if (!supabase) {
    console.log('❌ Database not connected');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Debug query failed:', error);
      return;
    }

    console.log('🔍 ALL TASKS IN DATABASE:');
    console.table(data);
    console.log('📊 Task count:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('📋 Task statuses:', [...new Set(data.map(t => t.status))]);
      console.log('🎯 Priority range:', Math.min(...data.map(t => t.priority)), 'to', Math.max(...data.map(t => t.priority)));
    }
  } catch (err) {
    console.error('❌ Debug failed:', err);
  }
} 