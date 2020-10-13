import {writable, readable, get} from 'svelte/store'

export const confirmed = writable([])
export const excluded = writable([])
export const ghosts = readable([
    {
        name: "Banshee",
        description: "A banshee",
        evidence: ["EMF 5", "Fingerprints", "Freezing"],
        strength: "Strength",
        weakness: "Weakness"
    },
    {
        name: "Demon",
        description: "A demon",
        evidence: ["Freezing", "Ghost writing", "Spirit box"],
        strength: "Strength",
        weakness: "Weakness"
    },
    {
        name: "Jinn",
        description: "A jinn",
        evidence: ["EMF 5", "Ghost orb", "Spirit box"],
        strength: "Strength",
        weakness: "Weakness"
    },
    {
        name: "Mare",
        description: "A mare",
        evidence: ["Freezing", "Ghost orb", "Spirit box"],
        strength: "Strength",
        weakness: "Weakness"
    },
    {
        name: "Oni",
        description: "An oni ",
        evidence: ["EMF 5", "Spirit box", "Writing"],
        strength: "Strength",
        weakness: "Weakness"
    },
    {
        name: "Phantom",
        description: "A phantom",
        evidence: ["EMF 5", "Freezing", "Ghost orb"],
        strength: "Strength",
        weakness: "Weakness"
    },
    {
        name: "Poltergeist",
        description: "A poltergeist",
        evidence: ["Fingerprints", "Ghost orb", "Spirit box"],
        strength: "Strength",
        weakness: "Weakness"
    },
    {
        name: "Revenant",
        description: "A revenant",
        evidence: ["EMF 5", "Fingerprints", "Writing"],
        strength: "Strength",
        weakness: "Weakness"
    },
    {
        name: "Shade",
        description: "A shade",
        evidence: ["EMF 5", "Ghost orb", "Writing"],
        strength: "Strength",
        weakness: "Weakness"
    },
    {
        name: "Spirit",
        description: "A spirit",
        evidence: ["Fingerprints", "Spirit box", "Writing"],
        strength: "Strength",
        weakness: "Weakness"
    },
    {
        name: "Wraith",
        description: "A wraith",
        evidence: ["Fingerprints", "Freezing", "Spirit box"],
        strength: "Strength",
        weakness: "Weakness"
    },
    {
        name: "Yurei",
        description: "A yurei",
        evidence: ["Freezing", "Ghost orb", "Writing"],
        strength: "Strength",
        weakness: "Weakness"
    },
])
export let possibleGhosts = writable([])

const evidenceList = ["EMF 5", "Fingerprints", "Freezing", "Ghost orb", "Spirit box", "Writing"]

confirmed.subscribe(value => {
    let array = []
    let ghostList = get(ghosts)

    ghostList.forEach(ghost => {
        let evidence = ghost.evidence
        let possible = true

        value.forEach(item => {
            let index = evidence.indexOf(item)

            if (index == -1) {
                possible = false
            }
        })

        if (possible) {
            array.push(ghost)
        }
    })

    possibleGhosts.set(array)
    updateExcluded()
})

function updateExcluded() {
    let array = []
    let possibleEvidence = []
    let ghostList = get(possibleGhosts)

    ghostList.forEach(ghost => {
        ghost.evidence.forEach(evidence => {
            let index = possibleEvidence.indexOf(evidence)

            if (index == -1) {
                possibleEvidence.push(evidence)
            }
        })
    })

    evidenceList.forEach(item => {
        let index = possibleEvidence.indexOf(item)

        if (index == -1) {
            let excludedIndex = array.indexOf(item)

            if (excludedIndex == -1) {
                array.push(item)
            }
        }
    })

    excluded.set(array)
}