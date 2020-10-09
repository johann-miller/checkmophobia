<script>
    import {evidence} from "../stores/stores.js"
    export let title = "Title"

    let selected = false

    function toggle() {
        selected = !selected

        // Add evidence if toggled on, remove if toggled off
        if (selected = true) {
            evidence.update(value => value)
            console.log(evidence.value)
        } else {
            evidence.update(value => {
                let index = value.indexOf(title)
                if (index > -1) {
                    evidence.splice(index,1)
                }
            })
        }

        //evidence.subscribe(value => console.log(value))
    }
</script>

<button class="wrapper" class:selected on:click={() => toggle()}>
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

    .selected {
        filter: invert(71%) sepia(77%) saturate(5163%) hue-rotate(83deg) brightness(124%) contrast(117%);
    }

    .title {
        font-weight: bold;
    }
</style>