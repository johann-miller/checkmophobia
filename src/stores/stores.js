import {writable, readable} from 'svelte/store'

export const confirmed = writable([])
export const excluded = writable([])
export const ghosts = readable([])
export const possibleGhosts = writable([])