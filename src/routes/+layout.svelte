<script>
	import '../app.css';
</script>

<main>
	<slot />
</main>

<style>
	main {
		padding: 1rem;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		box-sizing: border-box;
		font-family: system-ui, -apple-system, sans-serif;
	}
</style>