<script>
    export let ghost = {}
</script>

<div class="wrapper">
    <h3 class="ghost-name">{ghost.name}</h3>
    <div class="content">
        <ul class="evidence">
            {#each ghost.evidence as item}
                <li>{item}</li>
            {/each}
        </ul>
        <p><strong>Strength:</strong> {ghost.strength}</p>
        <p><strong>Weakness:</strong> {ghost.weakness}</p>
        <p>{ghost.description}</p>
    </div>
</div>

<style>
    strong {
        font-weight: bolder;
    }

    .content {
        padding-left: 1rem;
    }

    .evidence > li {
        border: 2px solid #e4dedd;
        border-radius: 1rem;
        display: inline;
        padding: 0.25rem 0.5rem;
        margin-right: 0.5rem;
    }
    
    .ghost-name {
        margin: 0;
        margin-bottom: 0.75rem;
        font-size: 2rem;
        font-weight: bolder;
    }

    .wrapper {
        border-bottom: 3px solid #2a2a2e;
        padding: 0.5rem;
    }
</style>