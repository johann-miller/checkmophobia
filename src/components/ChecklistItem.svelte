<script>
    export let title = "Title";
</script>

<button class="wrapper">
    <img src="/images/dummy-icon.svg" alt="ghost" class="icon">
    <span class="title">{title}</span>
</button>

<style>
    .icon {
        width: 100%;
        max-height: 4.5rem;
        margin-bottom: 0.2rem;
    }
    
    .wrapper {
        color: inherit;
        background: none;
        border: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 0.25rem;
        height: 6.5rem;
        width: 6.5rem;
        transition: filter 0.1s ease-in-out;
        transition: opacity 0.1s ease-in-out;
    }

    .wrapper:hover {
        opacity: 0.7;
    }

    .title {
        font-weight: bold;
    }
</style>