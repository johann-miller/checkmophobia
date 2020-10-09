
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Banner.svelte generated by Svelte v3.29.0 */

    const file = "src/components/Banner.svelte";

    function create_fragment(ctx) {
    	let header;
    	let h1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Checkmophobia";
    			attr_dev(h1, "class", "title svelte-1f2ybds");
    			add_location(h1, file, 1, 4, 13);
    			attr_dev(header, "class", "svelte-1f2ybds");
    			add_location(header, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Banner", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Banner> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Banner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Banner",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let evidence = writable([]);

    /* src/components/ChecklistItem.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/ChecklistItem.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*title*/ ctx[0]);
    			if (img.src !== (img_src_value = "/images/dummy-icon.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "ghost");
    			attr_dev(img, "class", "icon svelte-o1fa9m");
    			add_location(img, file$1, 27, 4, 719);
    			attr_dev(span, "class", "title svelte-o1fa9m");
    			add_location(span, file$1, 28, 4, 783);
    			attr_dev(button, "class", "wrapper svelte-o1fa9m");
    			toggle_class(button, "selected", /*selected*/ ctx[1]);
    			add_location(button, file$1, 26, 0, 649);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img);
    			append_dev(button, t0);
    			append_dev(button, span);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);

    			if (dirty & /*selected*/ 2) {
    				toggle_class(button, "selected", /*selected*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ChecklistItem", slots, []);
    	let { title = "Title" } = $$props;
    	let selected = false;

    	function toggle() {
    		$$invalidate(1, selected = !selected);

    		// Add evidence if toggled on, remove if toggled off
    		if ($$invalidate(1, selected = true)) {
    			evidence.update(value => value);
    			console.log(evidence.value);
    		} else {
    			evidence.update(value => {
    				let index = value.indexOf(title);

    				if (index > -1) {
    					evidence.splice(index, 1);
    				}
    			});
    		}
    	} //evidence.subscribe(value => console.log(value))

    	const writable_props = ["title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<ChecklistItem> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => toggle();

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({ evidence, title, selected, toggle });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, selected, toggle, click_handler];
    }

    class ChecklistItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChecklistItem",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get title() {
    		throw new Error("<ChecklistItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ChecklistItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Ghost.svelte generated by Svelte v3.29.0 */

    const file$2 = "src/components/Ghost.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:12) {#each ghost.evidence as item}
    function create_each_block(ctx) {
    	let li;
    	let t_value = /*item*/ ctx[1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-1brd7zb");
    			add_location(li, file$2, 9, 16, 228);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ghost*/ 1 && t_value !== (t_value = /*item*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:12) {#each ghost.evidence as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let h3;
    	let t0_value = /*ghost*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let div0;
    	let ul;
    	let t2;
    	let p0;
    	let strong0;
    	let t4;
    	let t5_value = /*ghost*/ ctx[0].strength + "";
    	let t5;
    	let t6;
    	let p1;
    	let strong1;
    	let t8;
    	let t9_value = /*ghost*/ ctx[0].weakness + "";
    	let t9;
    	let t10;
    	let p2;
    	let t11_value = /*ghost*/ ctx[0].description + "";
    	let t11;
    	let each_value = /*ghost*/ ctx[0].evidence;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Strength:";
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Weakness:";
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = space();
    			p2 = element("p");
    			t11 = text(t11_value);
    			attr_dev(h3, "class", "ghost-name svelte-1brd7zb");
    			add_location(h3, file$2, 5, 4, 72);
    			attr_dev(ul, "class", "evidence svelte-1brd7zb");
    			add_location(ul, file$2, 7, 8, 147);
    			attr_dev(strong0, "class", "svelte-1brd7zb");
    			add_location(strong0, file$2, 12, 11, 289);
    			add_location(p0, file$2, 12, 8, 286);
    			attr_dev(strong1, "class", "svelte-1brd7zb");
    			add_location(strong1, file$2, 13, 11, 348);
    			add_location(p1, file$2, 13, 8, 345);
    			add_location(p2, file$2, 14, 8, 404);
    			attr_dev(div0, "class", "content svelte-1brd7zb");
    			add_location(div0, file$2, 6, 4, 117);
    			attr_dev(div1, "class", "wrapper svelte-1brd7zb");
    			add_location(div1, file$2, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(div0, t6);
    			append_dev(div0, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(div0, t10);
    			append_dev(div0, p2);
    			append_dev(p2, t11);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ghost*/ 1 && t0_value !== (t0_value = /*ghost*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*ghost*/ 1) {
    				each_value = /*ghost*/ ctx[0].evidence;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*ghost*/ 1 && t5_value !== (t5_value = /*ghost*/ ctx[0].strength + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*ghost*/ 1 && t9_value !== (t9_value = /*ghost*/ ctx[0].weakness + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*ghost*/ 1 && t11_value !== (t11_value = /*ghost*/ ctx[0].description + "")) set_data_dev(t11, t11_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Ghost", slots, []);
    	let { ghost = {} } = $$props;
    	const writable_props = ["ghost"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ghost> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("ghost" in $$props) $$invalidate(0, ghost = $$props.ghost);
    	};

    	$$self.$capture_state = () => ({ ghost });

    	$$self.$inject_state = $$props => {
    		if ("ghost" in $$props) $$invalidate(0, ghost = $$props.ghost);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ghost];
    }

    class Ghost extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { ghost: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ghost",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get ghost() {
    		throw new Error("<Ghost>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ghost(value) {
    		throw new Error("<Ghost>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.0 */
    const file$3 = "src/App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i].title;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i].title;
    	return child_ctx;
    }

    // (70:4) {#each evidence as {title}}
    function create_each_block_2(ctx) {
    	let li;
    	let checklistitem;
    	let t;
    	let current;

    	checklistitem = new ChecklistItem({
    			props: { title: /*title*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(checklistitem.$$.fragment);
    			t = space();
    			add_location(li, file$3, 70, 5, 2231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(checklistitem, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checklistitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checklistitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(checklistitem);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(70:4) {#each evidence as {title}}",
    		ctx
    	});

    	return block;
    }

    // (80:4) {#each evidence as {title}}
    function create_each_block_1(ctx) {
    	let li;
    	let checklistitem;
    	let t;
    	let current;

    	checklistitem = new ChecklistItem({
    			props: { title: /*title*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(checklistitem.$$.fragment);
    			t = space();
    			add_location(li, file$3, 80, 5, 2426);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(checklistitem, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checklistitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checklistitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(checklistitem);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(80:4) {#each evidence as {title}}",
    		ctx
    	});

    	return block;
    }

    // (90:4) {#each ghosts as ghost}
    function create_each_block$1(ctx) {
    	let ghost;
    	let current;

    	ghost = new Ghost({
    			props: { ghost: /*ghost*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ghost.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ghost, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ghost.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ghost.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ghost, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(90:4) {#each ghosts as ghost}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let banner;
    	let t0;
    	let main;
    	let div0;
    	let ul0;
    	let li0;
    	let h20;
    	let t2;
    	let t3;
    	let ul1;
    	let li1;
    	let h21;
    	let t5;
    	let t6;
    	let div1;
    	let h22;
    	let t8;
    	let ul2;
    	let current;
    	banner = new Banner({ $$inline: true });
    	let each_value_2 = /*evidence*/ ctx[0];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*evidence*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*ghosts*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			create_component(banner.$$.fragment);
    			t0 = space();
    			main = element("main");
    			div0 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			h20 = element("h2");
    			h20.textContent = "Evidence";
    			t2 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t3 = space();
    			ul1 = element("ul");
    			li1 = element("li");
    			h21 = element("h2");
    			h21.textContent = "Exclude";
    			t5 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t6 = space();
    			div1 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Possible ghosts";
    			t8 = space();
    			ul2 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h20, "class", "svelte-1xa7n74");
    			add_location(h20, file$3, 67, 5, 2166);
    			attr_dev(li0, "class", "list-title svelte-1xa7n74");
    			add_location(li0, file$3, 66, 4, 2137);
    			attr_dev(ul0, "class", "evidence svelte-1xa7n74");
    			add_location(ul0, file$3, 65, 3, 2111);
    			attr_dev(h21, "class", "svelte-1xa7n74");
    			add_location(h21, file$3, 77, 5, 2362);
    			attr_dev(li1, "class", "list-title svelte-1xa7n74");
    			add_location(li1, file$3, 76, 4, 2333);
    			attr_dev(ul1, "class", "exclude svelte-1xa7n74");
    			add_location(ul1, file$3, 75, 3, 2308);
    			attr_dev(div0, "class", "checklists svelte-1xa7n74");
    			add_location(div0, file$3, 64, 2, 2083);
    			attr_dev(h22, "class", "ghosts-title svelte-1xa7n74");
    			add_location(h22, file$3, 87, 3, 2543);
    			attr_dev(ul2, "class", "ghosts svelte-1xa7n74");
    			add_location(ul2, file$3, 88, 3, 2592);
    			attr_dev(div1, "class", "ghosts-wrapper svelte-1xa7n74");
    			add_location(div1, file$3, 86, 2, 2511);
    			attr_dev(main, "class", "svelte-1xa7n74");
    			add_location(main, file$3, 63, 1, 2074);
    			attr_dev(div2, "class", "wrapper svelte-1xa7n74");
    			add_location(div2, file$3, 61, 0, 2040);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(banner, div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, main);
    			append_dev(main, div0);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, h20);
    			append_dev(ul0, t2);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(ul0, null);
    			}

    			append_dev(div0, t3);
    			append_dev(div0, ul1);
    			append_dev(ul1, li1);
    			append_dev(li1, h21);
    			append_dev(ul1, t5);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul1, null);
    			}

    			append_dev(main, t6);
    			append_dev(main, div1);
    			append_dev(div1, h22);
    			append_dev(div1, t8);
    			append_dev(div1, ul2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*evidence*/ 1) {
    				each_value_2 = /*evidence*/ ctx[0];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(ul0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*evidence*/ 1) {
    				each_value_1 = /*evidence*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(ul1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*ghosts*/ 2) {
    				each_value = /*ghosts*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(banner.$$.fragment, local);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(banner.$$.fragment, local);
    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(banner);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	let evidence = [
    		{ title: "EMF 5" },
    		{ title: "Fingerprints" },
    		{ title: "Freezing" },
    		{ title: "Ghost orb" },
    		{ title: "Spirit box" },
    		{ title: "Writing" }
    	];

    	let ghosts = [
    		{
    			name: "Phantom",
    			description: "May be summoned by ouji boards",
    			strength: "Looking at a phantom will dramatically lower sanity",
    			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
    			evidence: ["EMF 5", "Ghost orb", "Freezing"]
    		},
    		{
    			name: "Phantom",
    			description: "May be summoned by ouji boards",
    			strength: "Looking at a phantom will dramatically lower sanity",
    			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
    			evidence: ["EMF 5", "Ghost orb", "Freezing"]
    		},
    		{
    			name: "Phantom",
    			description: "May be summoned by ouji boards",
    			strength: "Looking at a phantom will dramatically lower sanity",
    			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
    			evidence: ["EMF 5", "Ghost orb", "Freezing"]
    		},
    		{
    			name: "Phantom",
    			description: "May be summoned by ouji boards",
    			strength: "Looking at a phantom will dramatically lower sanity",
    			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
    			evidence: ["EMF 5", "Ghost orb", "Freezing"]
    		},
    		{
    			name: "Phantom",
    			description: "May be summoned by ouji boards",
    			strength: "Looking at a phantom will dramatically lower sanity",
    			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
    			evidence: ["EMF 5", "Ghost orb", "Freezing"]
    		},
    		{
    			name: "Phantom",
    			description: "May be summoned by ouji boards",
    			strength: "Looking at a phantom will dramatically lower sanity",
    			weakness: "Taking a photo of a phantom will cause it to temporarily disappear",
    			evidence: ["EMF 5", "Ghost orb", "Freezing"]
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Banner,
    		ChecklistItem,
    		Ghost,
    		evidence,
    		ghosts
    	});

    	$$self.$inject_state = $$props => {
    		if ("evidence" in $$props) $$invalidate(0, evidence = $$props.evidence);
    		if ("ghosts" in $$props) $$invalidate(1, ghosts = $$props.ghosts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [evidence, ghosts];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
