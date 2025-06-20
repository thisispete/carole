<h1>Task Browser</h1>
<p>Manage and organize all your tasks</p>

<div class="task-filters">
	<h2>Quick Filters</h2>
	<div class="filter-buttons">
		<button class="filter-btn active">All Tasks</button>
		<button class="filter-btn">Website Project</button>
		<button class="filter-btn">House Tasks</button>
		<button class="filter-btn">Work Tasks</button>
	</div>
</div>

<div class="task-list">
	<h2>All Tasks</h2>
	<div class="task-grid">
		<div class="task-card">
			<h3>Build landing page</h3>
			<p>Create responsive landing page for new website</p>
			<div class="task-meta">
				<span class="priority high">High Priority</span>
				<span class="status">In Progress</span>
			</div>
		</div>
		
		<div class="task-card">
			<h3>Get pet insurance</h3>
			<p>Research and purchase pet insurance for dog</p>
			<div class="task-meta">
				<span class="priority medium">Medium Priority</span>
				<span class="status">Not Started</span>
			</div>
		</div>
		
		<div class="task-card">
			<h3>Paint house exterior</h3>
			<p>Get quotes and schedule house painting</p>
			<div class="task-meta">
				<span class="priority low">Low Priority</span>
				<span class="status">Not Started</span>
			</div>
		</div>
	</div>
</div>

<div class="add-task">
	<button class="add-btn">+ Add New Task</button>
</div>

<nav>
	<a href="/">← Back to Dashboard</a>
	<a href="/analytics">Analytics</a>
</nav>

<style>
	.task-filters {
		margin: 2rem 0;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 8px;
	}
	
	.filter-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	
	.filter-btn {
		padding: 0.5rem 1rem;
		border: 1px solid #ccc;
		background: white;
		border-radius: 4px;
		cursor: pointer;
	}
	
	.filter-btn.active {
		background: #007acc;
		color: white;
		border-color: #007acc;
	}
	
	.task-list {
		margin: 2rem 0;
	}
	
	.task-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}
	
	.task-card {
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		background: white;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}
	
	.task-card h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
	}
	
	.task-card p {
		margin: 0 0 1rem 0;
		color: #666;
	}
	
	.task-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	
	.priority {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: bold;
	}
	
	.priority.high {
		background: #ffe6e6;
		color: #cc0000;
	}
	
	.priority.medium {
		background: #fff3e0;
		color: #e65100;
	}
	
	.priority.low {
		background: #e8f5e8;
		color: #2e7d32;
	}
	
	.status {
		padding: 0.25rem 0.5rem;
		background: #f0f0f0;
		border-radius: 4px;
		font-size: 0.8rem;
	}
	
	.add-task {
		margin: 2rem 0;
		text-align: center;
	}
	
	.add-btn {
		padding: 1rem 2rem;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1.1rem;
		cursor: pointer;
	}
	
	.add-btn:hover {
		background: #218838;
	}
	
	nav {
		margin-top: 2rem;
		display: flex;
		gap: 1rem;
	}
	
	nav a {
		padding: 0.5rem 1rem;
		background: #f0f0f0;
		text-decoration: none;
		border-radius: 4px;
		color: #333;
	}
	
	nav a:hover {
		background: #e0e0e0;
	}
</style>