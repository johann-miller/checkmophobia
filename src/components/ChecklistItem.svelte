<script>
    import {confirmed, excluded, ghosts, possibleGhosts} from "../stores/stores.js"
    export let title = "Title"
    export let exclude = false
    let list
    let active = true
    let selected = false
    let disabled = false
    let oppositeSelected = false
    let listFull = false

    // If this component is an "exclude" button, set the list to manipulate to the excluded evidence,
    // else set it to the evidence list
    if (exclude) {
        list = excluded
    } else {
        list = confirmed
    }

    // Disability logic
    confirmed.subscribe(value => {
        listFull = (value.length >= 3)

        if (exclude) {
            if (isOppositeSelected(value)) {
                disabled = true
            } else {
                disabled = false
            }
        } else {
            if (listFull && !selected) {
                disabled = true
            } else {
                if (!oppositeSelected) {
                    disabled = false
                }
            }
        }
    })

    excluded.subscribe(value => {
        if (!exclude) {
            if (isOppositeSelected(value)) {
                disabled = true
            } else {
                if (!listFull) {
                    disabled = false
                }
            }
        }
    })

    // Check if the opposite evidence/exclude button is selected
    function isOppositeSelected(value) {
        let index
        index = value.indexOf(title)
        
        if (index > -1) {
            oppositeSelected = true
        } else {
            oppositeSelected = false
        }

        return oppositeSelected
    }

    // Call when the button is pressed
    function toggle() {
        selected = !selected

        let array = $list

        // Add evidence if toggled on, remove if toggled off
        if (selected) {
            array.push(title)
            list.set(array)
        } else {
            let index = array.indexOf(title)

            if (index > -1) {
                array.splice(index, 1)
                list.set(array)
            }
        }
    }
</script>

<button
    class="wrapper"
    class:selected-confirmed={selected && !exclude}
    class:selected-excluded={selected && exclude}
    on:click={() => toggle()}
    {disabled}>

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
        transition: filter 0.2s ease-in-out;
        transition: opacity 0.2s ease-in-out;
    }

    .wrapper:active {
        background: none;
        opacity: 0.5;
    }

    .wrapper:hover {
        opacity: 0.7;
    }

    .wrapper:disabled {
        opacity: 0.3;
        filter: none;
    }

    .selected-confirmed {
        filter: invert(71%) sepia(77%) saturate(5163%) hue-rotate(83deg) brightness(124%) contrast(117%);
    }

    .selected-excluded {
        filter: invert(7%) sepia(93%) saturate(5899%) hue-rotate(11deg) brightness(104%) contrast(115%);
    }

    .title {
        font-weight: bold;
    }
</style>