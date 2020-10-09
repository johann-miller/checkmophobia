<script>
	import Banner from "./components/Banner.svelte"
	import ChecklistItem from "./components/ChecklistItem.svelte"
	
	let evidence = [
		{title: "EMF 5"},
		{title: "Fingerprints"},
		{title: "Freezing"},
		{title: "Ghost orb"},
		{title: "Spirit box"},
		{title: "Writing"},
		
	]

	let ghosts = [
		{name: "Phantom", }
	]
</script>

<div class="wrapper">
	<Banner/>
	<main>
		<div class="checklists">
			<ul class="evidence">
				<li class="list-title">
					<span>Evidence</span>
				</li>
				{#each evidence as {title}}
					<li>
						<ChecklistItem title={title}/>
					</li>
				{/each}
			</ul>
			<ul class="exclude">
				<li class="list-title">
					<span>Exclude</span>
				</li>
				{#each evidence as {title}}
					<li>
						<ChecklistItem title={title}/>
					</li>
				{/each}
			</ul>
		</div>
		<ul class="ghosts">
		</ul>
	</main>
</div>

<style>
	main {
		display: flex;
		height: 100%;
		padding: 0.75rem;
	}

	.checklists {
		display: flex;
		max-height: 100%;
		width: auto;
	}

	.checklists > ul {
		padding: 1rem;
		max-height: 100%;
		margin-right: 0.75rem;
		width: auto;
		background: #38383b;
	}

	.list-title {
		font-size: 1.2rem;
		text-align: center;
		margin-bottom: 0.75rem;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		justify-content: start;
		max-width: 100vw;
		height: 100vh;
	}
</style>