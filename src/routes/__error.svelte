<script context="module">
	export async function load({ error, status }) {
		return { props: { error, status } };
	}
</script>

<script>
	export let error;
	export let status;
</script>

<h1 class="font-bold">Error</h1>
<p>{error}</p>
<p>{status}</p>

