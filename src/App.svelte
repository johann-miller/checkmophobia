<script>
	import Banner from "./components/Banner.svelte"
	import ChecklistItem from "./components/ChecklistItem.svelte"
	import Ghost from "./components/Ghost.svelte"
	
	let evidence = [
		{title: "EMF 5"},
		{title: "Fingerprints"},
		{title: "Freezing"},
		{title: "Ghost orb"},
		{title: "Spirit box"},
		{title: "Writing"},
		
	]

	let ghosts = [
		{
			name: "Phantom",
			description: "May be summoned by ouji boards",
			strength: "Looking at a phantom will dramatically lower sanity",
			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
			evidence: ["EMF 5", "Ghost orb", "Freezing"],
		},
		{
			name: "Phantom",
			description: "May be summoned by ouji boards",
			strength: "Looking at a phantom will dramatically lower sanity",
			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
			evidence: ["EMF 5", "Ghost orb", "Freezing"],
		},
		{
			name: "Phantom",
			description: "May be summoned by ouji boards",
			strength: "Looking at a phantom will dramatically lower sanity",
			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
			evidence: ["EMF 5", "Ghost orb", "Freezing"],
		},
		{
			name: "Phantom",
			description: "May be summoned by ouji boards",
			strength: "Looking at a phantom will dramatically lower sanity",
			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
			evidence: ["EMF 5", "Ghost orb", "Freezing"],
		},
		{
			name: "Phantom",
			description: "May be summoned by ouji boards",
			strength: "Looking at a phantom will dramatically lower sanity",
			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
			evidence: ["EMF 5", "Ghost orb", "Freezing"],
		},
		{
			name: "Phantom",
			description: "May be summoned by ouji boards",
			strength: "Looking at a phantom will dramatically lower sanity",
			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
			evidence: ["EMF 5", "Ghost orb", "Freezing"],
		},
	]
</script>

<div class="wrapper">
	<Banner/>
	<main>
		<div class="checklists">
			<ul class="evidence">
				<li class="list-title">
					<h2>Evidence</h2>
				</li>
				{#each evidence as {title}}
					<li>
						<ChecklistItem title={title}/>
					</li>
				{/each}
			</ul>
			<ul class="exclude">
				<li class="list-title">
					<h2>Exclude</h2>
				</li>
				{#each evidence as {title}}
					<li>
						<ChecklistItem title={title}/>
					</li>
				{/each}
			</ul>
		</div>
		<div class="ghosts-wrapper">
			<h2 class="ghosts-title">Possible ghosts</h2>
			<ul class="ghosts">
				{#each ghosts as ghost}
					<Ghost ghost={ghost}/>
				{/each}
			</ul>
		</div>
	</main>
</div>

<style>
	main {
		display: flex;
		height: 100%;
		max-height: 100%;
		padding: 0.75rem;
		overflow-y: hidden;
	}

	.checklists {
		display: flex;
		max-height: 100%;
		width: auto;
	}

	.checklists > ul, .ghosts-wrapper {
		padding: 1rem;
		max-height: 100%;
		margin-right: 0.75rem;
		width: auto;
		background: #38383b;
	}

	.ghosts {
		height: 100%;
		overflow-y: scroll;
	}

	.ghosts-wrapper {
		width: 100%;
		overflow-y: hidden;
	}

	.ghosts-title {
		margin-top: 0;
	}


	.list-title {
		text-align: center;
		margin-bottom: 0.75rem;
	}

	.list-title > h2 {
		margin-top: 0.5rem;
		font-size: 1.5rem;
		font-weight: normal;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		justify-content: start;
		max-width: 100vw;
		height: 100vh;
	}
</style>