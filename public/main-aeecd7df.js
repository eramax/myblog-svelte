
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
}
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
function validate_store(store, name) {
    if (store != null && typeof store.subscribe !== 'function') {
        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
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
function set_input_value(input, value) {
    if (value != null || input.value) {
        input.value = value;
    }
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
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
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
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

function handle_promise(promise, info) {
    const token = info.token = {};
    function update(type, index, key, value) {
        if (info.token !== token)
            return;
        info.resolved = value;
        let child_ctx = info.ctx;
        if (key !== undefined) {
            child_ctx = child_ctx.slice();
            child_ctx[key] = value;
        }
        const block = type && (info.current = type)(child_ctx);
        let needs_flush = false;
        if (info.block) {
            if (info.blocks) {
                info.blocks.forEach((block, i) => {
                    if (i !== index && block) {
                        group_outros();
                        transition_out(block, 1, 1, () => {
                            info.blocks[i] = null;
                        });
                        check_outros();
                    }
                });
            }
            else {
                info.block.d(1);
            }
            block.c();
            transition_in(block, 1);
            block.m(info.mount(), info.anchor);
            needs_flush = true;
        }
        info.block = block;
        if (info.blocks)
            info.blocks[index] = block;
        if (needs_flush) {
            flush();
        }
    }
    if (is_promise(promise)) {
        const current_component = get_current_component();
        promise.then(value => {
            set_current_component(current_component);
            update(info.then, 1, info.value, value);
            set_current_component(null);
        }, error => {
            set_current_component(current_component);
            update(info.catch, 2, info.error, error);
            set_current_component(null);
        });
        // if we previously had a then/catch block, destroy it
        if (info.current !== info.pending) {
            update(info.pending, 0);
            return true;
        }
    }
    else {
        if (info.current !== info.then) {
            update(info.then, 1, info.value, promise);
            return true;
        }
        info.resolved = promise;
    }
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}
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
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
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
    $set() {
        // overridden by instance, if it has props
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
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
    if (text.data === data)
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

/* node_modules/svelte-loadable/Loadable.svelte generated by Svelte v3.21.0 */
const get_default_slot_changes = dirty => ({ component: dirty & /*component*/ 1 });
const get_default_slot_context = ctx => ({ component: /*component*/ ctx[0] });
const get_success_slot_changes = dirty => ({ component: dirty & /*component*/ 1 });
const get_success_slot_context = ctx => ({ component: /*component*/ ctx[0] });
const get_loading_slot_changes = dirty => ({ component: dirty & /*component*/ 1 });
const get_loading_slot_context = ctx => ({ component: /*component*/ ctx[0] });
const get_timeout_slot_changes = dirty => ({ component: dirty & /*component*/ 1 });
const get_timeout_slot_context = ctx => ({ component: /*component*/ ctx[0] });

const get_error_slot_changes = dirty => ({
	error: dirty & /*error*/ 2,
	component: dirty & /*component*/ 1
});

const get_error_slot_context = ctx => ({
	error: /*error*/ ctx[1],
	component: /*component*/ ctx[0]
});

// (148:35) 
function create_if_block_3(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_4, create_if_block_5, create_else_block];
	const if_blocks = [];

	function select_block_type_1(ctx, dirty) {
		if (/*slots*/ ctx[4] && /*slots*/ ctx[4].success) return 0;
		if (/*slots*/ ctx[4] && /*slots*/ ctx[4].default) return 1;
		return 2;
	}

	current_block_type_index = select_block_type_1(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if_block.p(ctx, dirty);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3.name,
		type: "if",
		source: "(148:35) ",
		ctx
	});

	return block;
}

// (146:35) 
function create_if_block_2(ctx) {
	let current;
	const loading_slot_template = /*$$slots*/ ctx[16].loading;
	const loading_slot = create_slot(loading_slot_template, ctx, /*$$scope*/ ctx[15], get_loading_slot_context);

	const block = {
		c: function create() {
			if (loading_slot) loading_slot.c();
		},
		m: function mount(target, anchor) {
			if (loading_slot) {
				loading_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (loading_slot) {
				if (loading_slot.p && dirty & /*$$scope, component*/ 32769) {
					loading_slot.p(get_slot_context(loading_slot_template, ctx, /*$$scope*/ ctx[15], get_loading_slot_context), get_slot_changes(loading_slot_template, /*$$scope*/ ctx[15], dirty, get_loading_slot_changes));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(loading_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(loading_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (loading_slot) loading_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2.name,
		type: "if",
		source: "(146:35) ",
		ctx
	});

	return block;
}

// (144:35) 
function create_if_block_1(ctx) {
	let current;
	const timeout_slot_template = /*$$slots*/ ctx[16].timeout;
	const timeout_slot = create_slot(timeout_slot_template, ctx, /*$$scope*/ ctx[15], get_timeout_slot_context);

	const block = {
		c: function create() {
			if (timeout_slot) timeout_slot.c();
		},
		m: function mount(target, anchor) {
			if (timeout_slot) {
				timeout_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (timeout_slot) {
				if (timeout_slot.p && dirty & /*$$scope, component*/ 32769) {
					timeout_slot.p(get_slot_context(timeout_slot_template, ctx, /*$$scope*/ ctx[15], get_timeout_slot_context), get_slot_changes(timeout_slot_template, /*$$scope*/ ctx[15], dirty, get_timeout_slot_changes));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(timeout_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(timeout_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (timeout_slot) timeout_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(144:35) ",
		ctx
	});

	return block;
}

// (142:0) {#if state === STATES.ERROR}
function create_if_block(ctx) {
	let current;
	const error_slot_template = /*$$slots*/ ctx[16].error;
	const error_slot = create_slot(error_slot_template, ctx, /*$$scope*/ ctx[15], get_error_slot_context);

	const block = {
		c: function create() {
			if (error_slot) error_slot.c();
		},
		m: function mount(target, anchor) {
			if (error_slot) {
				error_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (error_slot) {
				if (error_slot.p && dirty & /*$$scope, error, component*/ 32771) {
					error_slot.p(get_slot_context(error_slot_template, ctx, /*$$scope*/ ctx[15], get_error_slot_context), get_slot_changes(error_slot_template, /*$$scope*/ ctx[15], dirty, get_error_slot_changes));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(error_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(error_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (error_slot) error_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(142:0) {#if state === STATES.ERROR}",
		ctx
	});

	return block;
}

// (153:2) {:else}
function create_else_block(ctx) {
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*componentProps*/ ctx[3]];
	var switch_value = /*component*/ ctx[0];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return {
			props: switch_instance_props,
			$$inline: true
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props());
	}

	const block = {
		c: function create() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert_dev(target, switch_instance_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = (dirty & /*componentProps*/ 8)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*componentProps*/ ctx[3])])
			: {};

			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(153:2) {:else}",
		ctx
	});

	return block;
}

// (151:35) 
function create_if_block_5(ctx) {
	let current;
	const default_slot_template = /*$$slots*/ ctx[16].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], get_default_slot_context);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, component*/ 32769) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[15], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, get_default_slot_changes));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_5.name,
		type: "if",
		source: "(151:35) ",
		ctx
	});

	return block;
}

// (149:2) {#if slots && slots.success}
function create_if_block_4(ctx) {
	let current;
	const success_slot_template = /*$$slots*/ ctx[16].success;
	const success_slot = create_slot(success_slot_template, ctx, /*$$scope*/ ctx[15], get_success_slot_context);

	const block = {
		c: function create() {
			if (success_slot) success_slot.c();
		},
		m: function mount(target, anchor) {
			if (success_slot) {
				success_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (success_slot) {
				if (success_slot.p && dirty & /*$$scope, component*/ 32769) {
					success_slot.p(get_slot_context(success_slot_template, ctx, /*$$scope*/ ctx[15], get_success_slot_context), get_slot_changes(success_slot_template, /*$$scope*/ ctx[15], dirty, get_success_slot_changes));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(success_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(success_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (success_slot) success_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_4.name,
		type: "if",
		source: "(149:2) {#if slots && slots.success}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_if_block_3];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*state*/ ctx[2] === STATES.ERROR) return 0;
		if (/*state*/ ctx[2] === STATES.TIMEOUT) return 1;
		if (/*state*/ ctx[2] === STATES.LOADING) return 2;
		if (/*state*/ ctx[2] === STATES.SUCCESS) return 3;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(target, anchor);
			}

			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				} else {
					if_block = null;
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d(detaching);
			}

			if (detaching) detach_dev(if_block_anchor);
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

const ALL_LOADERS = new Map();
const LOADED = new Map();

const STATES = Object.freeze({
	INITIALIZED: 0,
	LOADING: 1,
	SUCCESS: 2,
	ERROR: 3,
	TIMEOUT: 4
});

function findByResolved(resolved) {
	for (let [loader, r] of ALL_LOADERS) {
		if (r === resolved) return loader;
	}

	return null;
}

function register(loadable) {
	const resolved = loadable.resolve();
	const loader = findByResolved(resolved);
	if (loader) return loader;
	ALL_LOADERS.set(loadable.loader, resolved);
	return loadable.loader;
}

function preloadAll() {
	return Promise.all(Array.from(ALL_LOADERS.keys()).filter(loader => !LOADED.has(loader)).map(async loader => load(loader))).then(() => {
		/** If new loaders have been registered by loaded components, load them next. */
		if (ALL_LOADERS.size > LOADED.size) {
			return preloadAll();
		}
	});
}

async function load(loader) {
	const componentModule = await loader();
	const component = componentModule.default || componentModule;
	LOADED.set(loader, component);
	return component;
}

let loadComponent = load;

function instance($$self, $$props, $$invalidate) {
	let { delay = 200 } = $$props;
	let { timeout = null } = $$props;
	let { loader = null } = $$props;
	let { unloader = false } = $$props;
	let { component = null } = $$props;
	let { error = null } = $$props;
	let load_timer = null;
	let timeout_timer = null;
	let state = STATES.INITIALIZED;
	let componentProps;
	let slots = $$props.$$slots;
	const capture = getContext("svelte-loadable-capture");

	if (typeof capture === "function" && ALL_LOADERS.has(loader)) {
		capture(loader);
	}

	function clearTimers() {
		clearTimeout(load_timer);
		clearTimeout(timeout_timer);
	}

	async function load() {
		clearTimers();

		if (typeof loader !== "function") {
			return;
		}

		$$invalidate(1, error = null);
		$$invalidate(0, component = null);

		if (delay > 0) {
			$$invalidate(2, state = STATES.INITIALIZED);

			load_timer = setTimeout(
				() => {
					$$invalidate(2, state = STATES.LOADING);
				},
				parseFloat(delay)
			);
		} else {
			$$invalidate(2, state = STATES.LOADING);
		}

		if (timeout) {
			timeout_timer = setTimeout(
				() => {
					$$invalidate(2, state = STATES.TIMEOUT);
				},
				parseFloat(timeout)
			);
		}

		try {
			$$invalidate(0, component = await loadComponent(loader));
			$$invalidate(2, state = STATES.SUCCESS);
		} catch(e) {
			$$invalidate(2, state = STATES.ERROR);
			$$invalidate(1, error = e);

			if (slots == null || slots.error == null) {
				throw e;
			}
		}

		clearTimers();
	}

	if (LOADED.has(loader)) {
		state = STATES.SUCCESS;
		component = LOADED.get(loader);
	} else {
		onMount(() => {
			load();

			if (unloader) {
				return () => {
					LOADED.delete(loader);

					if (typeof unloader === "function") {
						unloader();
					}
				};
			}
		});
	}

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Loadable", $$slots, ['error','timeout','loading','success','default']);

	$$self.$set = $$new_props => {
		$$invalidate(14, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("delay" in $$new_props) $$invalidate(5, delay = $$new_props.delay);
		if ("timeout" in $$new_props) $$invalidate(6, timeout = $$new_props.timeout);
		if ("loader" in $$new_props) $$invalidate(7, loader = $$new_props.loader);
		if ("unloader" in $$new_props) $$invalidate(8, unloader = $$new_props.unloader);
		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
		if ("error" in $$new_props) $$invalidate(1, error = $$new_props.error);
		if ("$$scope" in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({
		ALL_LOADERS,
		LOADED,
		STATES,
		findByResolved,
		register,
		preloadAll,
		load,
		loadComponent,
		onMount,
		getContext,
		delay,
		timeout,
		loader,
		unloader,
		component,
		error,
		load_timer,
		timeout_timer,
		state,
		componentProps,
		slots,
		capture,
		clearTimers,
		load
	});

	$$self.$inject_state = $$new_props => {
		$$invalidate(14, $$props = assign(assign({}, $$props), $$new_props));
		if ("delay" in $$props) $$invalidate(5, delay = $$new_props.delay);
		if ("timeout" in $$props) $$invalidate(6, timeout = $$new_props.timeout);
		if ("loader" in $$props) $$invalidate(7, loader = $$new_props.loader);
		if ("unloader" in $$props) $$invalidate(8, unloader = $$new_props.unloader);
		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
		if ("error" in $$props) $$invalidate(1, error = $$new_props.error);
		if ("load_timer" in $$props) load_timer = $$new_props.load_timer;
		if ("timeout_timer" in $$props) timeout_timer = $$new_props.timeout_timer;
		if ("state" in $$props) $$invalidate(2, state = $$new_props.state);
		if ("componentProps" in $$props) $$invalidate(3, componentProps = $$new_props.componentProps);
		if ("slots" in $$props) $$invalidate(4, slots = $$new_props.slots);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		 {
			let { delay, timeout, loader, component, error, ...rest } = $$props;
			$$invalidate(3, componentProps = rest);
		}
	};

	$$props = exclude_internal_props($$props);

	return [
		component,
		error,
		state,
		componentProps,
		slots,
		delay,
		timeout,
		loader,
		unloader,
		load,
		load_timer,
		timeout_timer,
		capture,
		clearTimers,
		$$props,
		$$scope,
		$$slots
	];
}

class Loadable extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance, create_fragment, safe_not_equal, {
			delay: 5,
			timeout: 6,
			loader: 7,
			unloader: 8,
			component: 0,
			error: 1,
			load: 9
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Loadable",
			options,
			id: create_fragment.name
		});
	}

	get delay() {
		throw new Error("<Loadable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set delay(value) {
		throw new Error("<Loadable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get timeout() {
		throw new Error("<Loadable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set timeout(value) {
		throw new Error("<Loadable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get loader() {
		throw new Error("<Loadable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set loader(value) {
		throw new Error("<Loadable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get unloader() {
		throw new Error("<Loadable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set unloader(value) {
		throw new Error("<Loadable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get component() {
		throw new Error("<Loadable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set component(value) {
		throw new Error("<Loadable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get error() {
		throw new Error("<Loadable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set error(value) {
		throw new Error("<Loadable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get load() {
		return this.$$.ctx[9];
	}

	set load(value) {
		throw new Error("<Loadable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe,
    };
}
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
function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single
        ? [stores]
        : stores;
    const auto = fn.length < 2;
    return readable(initial_value, (set) => {
        let inited = false;
        const values = [];
        let pending = 0;
        let cleanup = noop;
        const sync = () => {
            if (pending) {
                return;
            }
            cleanup();
            const result = fn(single ? values[0] : values, set);
            if (auto) {
                set(result);
            }
            else {
                cleanup = is_function(result) ? result : noop;
            }
        };
        const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
                sync();
            }
        }, () => {
            pending |= (1 << i);
        }));
        inited = true;
        sync();
        return function stop() {
            run_all(unsubscribers);
            cleanup();
        };
    });
}

const LOCATION = {};
const ROUTER = {};

/**
 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
 *
 * https://github.com/reach/router/blob/master/LICENSE
 * */

function getLocation(source) {
  return {
    ...source.location,
    state: source.history.state,
    key: (source.history.state && source.history.state.key) || "initial"
  };
}

function createHistory(source, options) {
  const listeners = [];
  let location = getLocation(source);

  return {
    get location() {
      return location;
    },

    listen(listener) {
      listeners.push(listener);

      const popstateListener = () => {
        location = getLocation(source);
        listener({ location, action: "POP" });
      };

      source.addEventListener("popstate", popstateListener);

      return () => {
        source.removeEventListener("popstate", popstateListener);

        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);
      };
    },

    navigate(to, { state, replace = false } = {}) {
      state = { ...state, key: Date.now() + "" };
      // try...catch iOS Safari limits to 100 pushState calls
      try {
        if (replace) {
          source.history.replaceState(state, null, to);
        } else {
          source.history.pushState(state, null, to);
        }
      } catch (e) {
        source.location[replace ? "replace" : "assign"](to);
      }

      location = getLocation(source);
      listeners.forEach(listener => listener({ location, action: "PUSH" }));
    }
  };
}

// Stores history entries in memory for testing or other platforms like Native
function createMemorySource(initialPathname = "/") {
  let index = 0;
  const stack = [{ pathname: initialPathname, search: "" }];
  const states = [];

  return {
    get location() {
      return stack[index];
    },
    addEventListener(name, fn) {},
    removeEventListener(name, fn) {},
    history: {
      get entries() {
        return stack;
      },
      get index() {
        return index;
      },
      get state() {
        return states[index];
      },
      pushState(state, _, uri) {
        const [pathname, search = ""] = uri.split("?");
        index++;
        stack.push({ pathname, search });
        states.push(state);
      },
      replaceState(state, _, uri) {
        const [pathname, search = ""] = uri.split("?");
        stack[index] = { pathname, search };
        states[index] = state;
      }
    }
  };
}

// Global history uses window.history as the source if available,
// otherwise a memory history
const canUseDOM = Boolean(
  typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
);
const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
const { navigate } = globalHistory;

/**
 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
 *
 * https://github.com/reach/router/blob/master/LICENSE
 * */

const paramRe = /^:(.+)/;

const SEGMENT_POINTS = 4;
const STATIC_POINTS = 3;
const DYNAMIC_POINTS = 2;
const SPLAT_PENALTY = 1;
const ROOT_POINTS = 1;

/**
 * Check if `segment` is a root segment
 * @param {string} segment
 * @return {boolean}
 */
function isRootSegment(segment) {
  return segment === "";
}

/**
 * Check if `segment` is a dynamic segment
 * @param {string} segment
 * @return {boolean}
 */
function isDynamic(segment) {
  return paramRe.test(segment);
}

/**
 * Check if `segment` is a splat
 * @param {string} segment
 * @return {boolean}
 */
function isSplat(segment) {
  return segment[0] === "*";
}

/**
 * Split up the URI into segments delimited by `/`
 * @param {string} uri
 * @return {string[]}
 */
function segmentize(uri) {
  return (
    uri
      // Strip starting/ending `/`
      .replace(/(^\/+|\/+$)/g, "")
      .split("/")
  );
}

/**
 * Strip `str` of potential start and end `/`
 * @param {string} str
 * @return {string}
 */
function stripSlashes(str) {
  return str.replace(/(^\/+|\/+$)/g, "");
}

/**
 * Score a route depending on how its individual segments look
 * @param {object} route
 * @param {number} index
 * @return {object}
 */
function rankRoute(route, index) {
  const score = route.default
    ? 0
    : segmentize(route.path).reduce((score, segment) => {
        score += SEGMENT_POINTS;

        if (isRootSegment(segment)) {
          score += ROOT_POINTS;
        } else if (isDynamic(segment)) {
          score += DYNAMIC_POINTS;
        } else if (isSplat(segment)) {
          score -= SEGMENT_POINTS + SPLAT_PENALTY;
        } else {
          score += STATIC_POINTS;
        }

        return score;
      }, 0);

  return { route, score, index };
}

/**
 * Give a score to all routes and sort them on that
 * @param {object[]} routes
 * @return {object[]}
 */
function rankRoutes(routes) {
  return (
    routes
      .map(rankRoute)
      // If two routes have the exact same score, we go by index instead
      .sort((a, b) =>
        a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
      )
  );
}

/**
 * Ranks and picks the best route to match. Each segment gets the highest
 * amount of points, then the type of segment gets an additional amount of
 * points where
 *
 *  static > dynamic > splat > root
 *
 * This way we don't have to worry about the order of our routes, let the
 * computers do it.
 *
 * A route looks like this
 *
 *  { path, default, value }
 *
 * And a returned match looks like:
 *
 *  { route, params, uri }
 *
 * @param {object[]} routes
 * @param {string} uri
 * @return {?object}
 */
function pick(routes, uri) {
  let match;
  let default_;

  const [uriPathname] = uri.split("?");
  const uriSegments = segmentize(uriPathname);
  const isRootUri = uriSegments[0] === "";
  const ranked = rankRoutes(routes);

  for (let i = 0, l = ranked.length; i < l; i++) {
    const route = ranked[i].route;
    let missed = false;

    if (route.default) {
      default_ = {
        route,
        params: {},
        uri
      };
      continue;
    }

    const routeSegments = segmentize(route.path);
    const params = {};
    const max = Math.max(uriSegments.length, routeSegments.length);
    let index = 0;

    for (; index < max; index++) {
      const routeSegment = routeSegments[index];
      const uriSegment = uriSegments[index];

      if (routeSegment !== undefined && isSplat(routeSegment)) {
        // Hit a splat, just grab the rest, and return a match
        // uri:   /files/documents/work
        // route: /files/* or /files/*splatname
        const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

        params[splatName] = uriSegments
          .slice(index)
          .map(decodeURIComponent)
          .join("/");
        break;
      }

      if (uriSegment === undefined) {
        // URI is shorter than the route, no match
        // uri:   /users
        // route: /users/:userId
        missed = true;
        break;
      }

      let dynamicMatch = paramRe.exec(routeSegment);

      if (dynamicMatch && !isRootUri) {
        const value = decodeURIComponent(uriSegment);
        params[dynamicMatch[1]] = value;
      } else if (routeSegment !== uriSegment) {
        // Current segments don't match, not dynamic, not splat, so no match
        // uri:   /users/123/settings
        // route: /users/:id/profile
        missed = true;
        break;
      }
    }

    if (!missed) {
      match = {
        route,
        params,
        uri: "/" + uriSegments.slice(0, index).join("/")
      };
      break;
    }
  }

  return match || default_ || null;
}

/**
 * Check if the `path` matches the `uri`.
 * @param {string} path
 * @param {string} uri
 * @return {?object}
 */
function match(route, uri) {
  return pick([route], uri);
}

/**
 * Combines the `basepath` and the `path` into one path.
 * @param {string} basepath
 * @param {string} path
 */
function combinePaths(basepath, path) {
  return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
}

/**
 * Decides whether a given `event` should result in a navigation or not.
 * @param {object} event
 */
function shouldNavigate(event) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
  );
}

function hostMatches(anchor) {
  const host = location.host;
  return (
    anchor.host == host ||
    // svelte seems to kill anchor.host value in ie11, so fall back to checking href
    anchor.href.indexOf(`https://${host}`) === 0 ||
    anchor.href.indexOf(`http://${host}`) === 0
  )
}

/* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.21.0 */

function create_fragment$1(ctx) {
	let current;
	const default_slot_template = /*$$slots*/ ctx[16].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 32768) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[15], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
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
	let $base;
	let $location;
	let $routes;
	let { basepath = "/" } = $$props;
	let { url = null } = $$props;
	const locationContext = getContext(LOCATION);
	const routerContext = getContext(ROUTER);
	const routes = writable([]);
	validate_store(routes, "routes");
	component_subscribe($$self, routes, value => $$invalidate(8, $routes = value));
	const activeRoute = writable(null);
	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

	// If locationContext is not set, this is the topmost Router in the tree.
	// If the `url` prop is given we force the location to it.
	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

	validate_store(location, "location");
	component_subscribe($$self, location, value => $$invalidate(7, $location = value));

	// If routerContext is set, the routerBase of the parent Router
	// will be the base for this Router's descendants.
	// If routerContext is not set, the path and resolved uri will both
	// have the value of the basepath prop.
	const base = routerContext
	? routerContext.routerBase
	: writable({ path: basepath, uri: basepath });

	validate_store(base, "base");
	component_subscribe($$self, base, value => $$invalidate(6, $base = value));

	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
		// If there is no activeRoute, the routerBase will be identical to the base.
		if (activeRoute === null) {
			return base;
		}

		const { path: basepath } = base;
		const { route, uri } = activeRoute;

		// Remove the potential /* or /*splatname from
		// the end of the child Routes relative paths.
		const path = route.default
		? basepath
		: route.path.replace(/\*.*$/, "");

		return { path, uri };
	});

	function registerRoute(route) {
		const { path: basepath } = $base;
		let { path } = route;

		// We store the original path in the _path property so we can reuse
		// it when the basepath changes. The only thing that matters is that
		// the route reference is intact, so mutation is fine.
		route._path = path;

		route.path = combinePaths(basepath, path);

		if (typeof window === "undefined") {
			// In SSR we should set the activeRoute immediately if it is a match.
			// If there are more Routes being registered after a match is found,
			// we just skip them.
			if (hasActiveRoute) {
				return;
			}

			const matchingRoute = match(route, $location.pathname);

			if (matchingRoute) {
				activeRoute.set(matchingRoute);
				hasActiveRoute = true;
			}
		} else {
			routes.update(rs => {
				rs.push(route);
				return rs;
			});
		}
	}

	function unregisterRoute(route) {
		routes.update(rs => {
			const index = rs.indexOf(route);
			rs.splice(index, 1);
			return rs;
		});
	}

	if (!locationContext) {
		// The topmost Router in the tree is responsible for updating
		// the location store and supplying it through context.
		onMount(() => {
			const unlisten = globalHistory.listen(history => {
				location.set(history.location);
			});

			return unlisten;
		});

		setContext(LOCATION, location);
	}

	setContext(ROUTER, {
		activeRoute,
		base,
		routerBase,
		registerRoute,
		unregisterRoute
	});

	const writable_props = ["basepath", "url"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Router", $$slots, ['default']);

	$$self.$set = $$props => {
		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
		if ("url" in $$props) $$invalidate(4, url = $$props.url);
		if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		getContext,
		setContext,
		onMount,
		writable,
		derived,
		LOCATION,
		ROUTER,
		globalHistory,
		pick,
		match,
		stripSlashes,
		combinePaths,
		basepath,
		url,
		locationContext,
		routerContext,
		routes,
		activeRoute,
		hasActiveRoute,
		location,
		base,
		routerBase,
		registerRoute,
		unregisterRoute,
		$base,
		$location,
		$routes
	});

	$$self.$inject_state = $$props => {
		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
		if ("url" in $$props) $$invalidate(4, url = $$props.url);
		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$base*/ 64) {
			// This reactive statement will update all the Routes' path when
			// the basepath changes.
			 {
				const { path: basepath } = $base;

				routes.update(rs => {
					rs.forEach(r => r.path = combinePaths(basepath, r._path));
					return rs;
				});
			}
		}

		if ($$self.$$.dirty & /*$routes, $location*/ 384) {
			// This reactive statement will be run when the Router is created
			// when there are no Routes and then again the following tick, so it
			// will not find an active Route in SSR and in the browser it will only
			// pick an active Route after all Routes have been registered.
			 {
				const bestMatch = pick($routes, $location.pathname);
				activeRoute.set(bestMatch);
			}
		}
	};

	return [
		routes,
		location,
		base,
		basepath,
		url,
		hasActiveRoute,
		$base,
		$location,
		$routes,
		locationContext,
		routerContext,
		activeRoute,
		routerBase,
		registerRoute,
		unregisterRoute,
		$$scope,
		$$slots
	];
}

class Router extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { basepath: 3, url: 4 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Router",
			options,
			id: create_fragment$1.name
		});
	}

	get basepath() {
		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set basepath(value) {
		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get url() {
		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set url(value) {
		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.21.0 */

const get_default_slot_changes$1 = dirty => ({
	params: dirty & /*routeParams*/ 2,
	location: dirty & /*$location*/ 16
});

const get_default_slot_context$1 = ctx => ({
	params: /*routeParams*/ ctx[1],
	location: /*$location*/ ctx[4]
});

// (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
function create_if_block$1(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_1$1, create_else_block$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*component*/ ctx[0] !== null) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
		ctx
	});

	return block;
}

// (43:2) {:else}
function create_else_block$1(ctx) {
	let current;
	const default_slot_template = /*$$slots*/ ctx[13].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context$1);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 4114) {
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context$1), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, get_default_slot_changes$1));
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$1.name,
		type: "else",
		source: "(43:2) {:else}",
		ctx
	});

	return block;
}

// (41:2) {#if component !== null}
function create_if_block_1$1(ctx) {
	let switch_instance_anchor;
	let current;

	const switch_instance_spread_levels = [
		{ location: /*$location*/ ctx[4] },
		/*routeParams*/ ctx[1],
		/*routeProps*/ ctx[2]
	];

	var switch_value = /*component*/ ctx[0];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return {
			props: switch_instance_props,
			$$inline: true
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props());
	}

	const block = {
		c: function create() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert_dev(target, switch_instance_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
			? get_spread_update(switch_instance_spread_levels, [
					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
				])
			: {};

			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$1.name,
		type: "if",
		source: "(41:2) {#if component !== null}",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block$1(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*$activeRoute*/ 8) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
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
	let $activeRoute;
	let $location;
	let { path = "" } = $$props;
	let { component = null } = $$props;
	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
	validate_store(activeRoute, "activeRoute");
	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
	const location = getContext(LOCATION);
	validate_store(location, "location");
	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

	const route = {
		path,
		// If no path prop is given, this Route will act as the default Route
		// that is rendered if no other Route in the Router is a match.
		default: path === ""
	};

	let routeParams = {};
	let routeProps = {};
	registerRoute(route);

	// There is no need to unregister Routes in SSR since it will all be
	// thrown away anyway.
	if (typeof window !== "undefined") {
		onDestroy(() => {
			unregisterRoute(route);
		});
	}

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Route", $$slots, ['default']);

	$$self.$set = $$new_props => {
		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({
		getContext,
		onDestroy,
		ROUTER,
		LOCATION,
		path,
		component,
		registerRoute,
		unregisterRoute,
		activeRoute,
		location,
		route,
		routeParams,
		routeProps,
		$activeRoute,
		$location
	});

	$$self.$inject_state = $$new_props => {
		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
			 if ($activeRoute && $activeRoute.route === route) {
				$$invalidate(1, routeParams = $activeRoute.params);
			}
		}

		 {
			const { path, component, ...rest } = $$props;
			$$invalidate(2, routeProps = rest);
		}
	};

	$$props = exclude_internal_props($$props);

	return [
		component,
		routeParams,
		routeProps,
		$activeRoute,
		$location,
		activeRoute,
		location,
		route,
		path,
		registerRoute,
		unregisterRoute,
		$$props,
		$$scope,
		$$slots
	];
}

class Route extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { path: 8, component: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Route",
			options,
			id: create_fragment$2.name
		});
	}

	get path() {
		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set path(value) {
		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get component() {
		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set component(value) {
		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/**
 * A link action that can be added to <a href=""> tags rather
 * than using the <Link> component.
 *
 * Example:
 * ```html
 * <a href="/post/{postId}" use:link>{post.title}</a>
 * ```
 */
function link(node) {
  function onClick(event) {
    const anchor = event.currentTarget;

    if (
      anchor.target === "" &&
      hostMatches(anchor) &&
      shouldNavigate(event)
    ) {
      event.preventDefault();
      navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
    }
  }

  node.addEventListener("click", onClick);

  return {
    destroy() {
      node.removeEventListener("click", onClick);
    }
  };
}

/* src/CatList.svelte generated by Svelte v3.21.0 */

const file = "src/CatList.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[4] = list[i];
	return child_ctx;
}

// (17:4) {#each categories as cat}
function create_each_block(ctx) {
	let article;
	let t0_value = /*cat*/ ctx[4].name + "";
	let t0;
	let t1;
	let article_class_value;
	let dispose;

	function click_handler(...args) {
		return /*click_handler*/ ctx[3](/*cat*/ ctx[4], ...args);
	}

	const block = {
		c: function create() {
			article = element("article");
			t0 = text(t0_value);
			t1 = space();

			attr_dev(article, "class", article_class_value = "w3-col w3-button w3-left-align w3-bar-item  " + (/*selectedCategory*/ ctx[2] == /*cat*/ ctx[4].id
			? "w3-deep-orange"
			: ""));

			add_location(article, file, 17, 6, 382);
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, article, anchor);
			append_dev(article, t0);
			append_dev(article, t1);
			if (remount) dispose();
			dispose = listen_dev(article, "click", click_handler, false, false, false);
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*categories*/ 1 && t0_value !== (t0_value = /*cat*/ ctx[4].name + "")) set_data_dev(t0, t0_value);

			if (dirty & /*selectedCategory, categories*/ 5 && article_class_value !== (article_class_value = "w3-col w3-button w3-left-align w3-bar-item  " + (/*selectedCategory*/ ctx[2] == /*cat*/ ctx[4].id
			? "w3-deep-orange"
			: ""))) {
				attr_dev(article, "class", article_class_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(article);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(17:4) {#each categories as cat}",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let nav;
	let img;
	let img_src_value;
	let t0;
	let a;
	let h4;
	let t2;
	let div;
	let each_value = /*categories*/ ctx[0];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			nav = element("nav");
			img = element("img");
			t0 = space();
			a = element("a");
			h4 = element("h4");
			h4.textContent = "AHMED ESSAM";
			t2 = space();
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr_dev(img, "class", "w3-col w3-circle");
			attr_dev(img, "alt", "Ahmed Essam");
			if (img.src !== (img_src_value = "./assets/icons/me2.webp")) attr_dev(img, "src", img_src_value);
			add_location(img, file, 7, 2, 161);
			attr_dev(h4, "class", "brand ");
			add_location(h4, file, 12, 4, 278);
			attr_dev(a, "href", "/admin");
			add_location(a, file, 11, 2, 256);
			attr_dev(div, "class", "w3-row ");
			add_location(div, file, 15, 2, 324);
			attr_dev(nav, "class", "fullhight navlist catList w3-col s4 m5 l4 ");
			add_location(nav, file, 6, 0, 102);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, nav, anchor);
			append_dev(nav, img);
			append_dev(nav, t0);
			append_dev(nav, a);
			append_dev(a, h4);
			append_dev(nav, t2);
			append_dev(nav, div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*selectedCategory, categories, select*/ 7) {
				each_value = /*categories*/ ctx[0];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(nav);
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
	let { categories = [] } = $$props;
	let { select } = $$props;
	let { selectedCategory } = $$props;
	const writable_props = ["categories", "select", "selectedCategory"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CatList> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("CatList", $$slots, []);
	const click_handler = cat => select(cat.id);

	$$self.$set = $$props => {
		if ("categories" in $$props) $$invalidate(0, categories = $$props.categories);
		if ("select" in $$props) $$invalidate(1, select = $$props.select);
		if ("selectedCategory" in $$props) $$invalidate(2, selectedCategory = $$props.selectedCategory);
	};

	$$self.$capture_state = () => ({ categories, select, selectedCategory });

	$$self.$inject_state = $$props => {
		if ("categories" in $$props) $$invalidate(0, categories = $$props.categories);
		if ("select" in $$props) $$invalidate(1, select = $$props.select);
		if ("selectedCategory" in $$props) $$invalidate(2, selectedCategory = $$props.selectedCategory);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [categories, select, selectedCategory, click_handler];
}

class CatList extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
			categories: 0,
			select: 1,
			selectedCategory: 2
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "CatList",
			options,
			id: create_fragment$3.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*select*/ ctx[1] === undefined && !("select" in props)) {
			console.warn("<CatList> was created without expected prop 'select'");
		}

		if (/*selectedCategory*/ ctx[2] === undefined && !("selectedCategory" in props)) {
			console.warn("<CatList> was created without expected prop 'selectedCategory'");
		}
	}

	get categories() {
		throw new Error("<CatList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set categories(value) {
		throw new Error("<CatList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get select() {
		throw new Error("<CatList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set select(value) {
		throw new Error("<CatList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get selectedCategory() {
		throw new Error("<CatList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set selectedCategory(value) {
		throw new Error("<CatList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/PostList.svelte generated by Svelte v3.21.0 */
const file$1 = "src/PostList.svelte";

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[3] = list[i];
	return child_ctx;
}

// (10:4) {#if post[3].includes(selectedCategory)}
function create_if_block$2(ctx) {
	let a;
	let img;
	let img_src_value;
	let t0;
	let div;
	let b;
	let t1_value = /*post*/ ctx[3][1] + "";
	let t1;
	let t2;
	let small;
	let t3_value = new Date(/*post*/ ctx[3][2] * 1000).toDateString() + "";
	let t3;
	let t4;
	let a_href_value;
	let a_class_value;
	let link_action;
	let dispose;

	const block = {
		c: function create() {
			a = element("a");
			img = element("img");
			t0 = space();
			div = element("div");
			b = element("b");
			t1 = text(t1_value);
			t2 = space();
			small = element("small");
			t3 = text(t3_value);
			t4 = space();
			attr_dev(img, "class", "w3-col");
			if (img.src !== (img_src_value = "/assets/icons/post.png")) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", "post");
			set_style(img, "width", "40px");
			set_style(img, "padding-right", "5px");
			add_location(img, file$1, 15, 8, 439);
			attr_dev(b, "class", "w3-row");
			add_location(b, file$1, 22, 10, 621);
			add_location(small, file$1, 24, 10, 664);
			attr_dev(div, "class", "w3-rest");
			add_location(div, file$1, 21, 8, 589);
			attr_dev(a, "href", a_href_value = "/" + /*post*/ ctx[3][0]);

			attr_dev(a, "class", a_class_value = "w3-border-bottom w3-padding-small " + (/*selectedPost*/ ctx[1] == /*post*/ ctx[3][0]
			? "w3-blue-grey"
			: ""));

			add_location(a, file$1, 10, 6, 277);
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, a, anchor);
			append_dev(a, img);
			append_dev(a, t0);
			append_dev(a, div);
			append_dev(div, b);
			append_dev(b, t1);
			append_dev(div, t2);
			append_dev(div, small);
			append_dev(small, t3);
			append_dev(a, t4);
			if (remount) dispose();
			dispose = action_destroyer(link_action = link.call(null, a));
		},
		p: function update(ctx, dirty) {
			if (dirty & /*posts*/ 1 && t1_value !== (t1_value = /*post*/ ctx[3][1] + "")) set_data_dev(t1, t1_value);
			if (dirty & /*posts*/ 1 && t3_value !== (t3_value = new Date(/*post*/ ctx[3][2] * 1000).toDateString() + "")) set_data_dev(t3, t3_value);

			if (dirty & /*posts*/ 1 && a_href_value !== (a_href_value = "/" + /*post*/ ctx[3][0])) {
				attr_dev(a, "href", a_href_value);
			}

			if (dirty & /*selectedPost, posts*/ 3 && a_class_value !== (a_class_value = "w3-border-bottom w3-padding-small " + (/*selectedPost*/ ctx[1] == /*post*/ ctx[3][0]
			? "w3-blue-grey"
			: ""))) {
				attr_dev(a, "class", a_class_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(a);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$2.name,
		type: "if",
		source: "(10:4) {#if post[3].includes(selectedCategory)}",
		ctx
	});

	return block;
}

// (9:2) {#each posts as post}
function create_each_block$1(ctx) {
	let show_if = /*post*/ ctx[3][3].includes(/*selectedCategory*/ ctx[2]);
	let if_block_anchor;
	let if_block = show_if && create_if_block$2(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*posts, selectedCategory*/ 5) show_if = /*post*/ ctx[3][3].includes(/*selectedCategory*/ ctx[2]);

			if (show_if) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$1.name,
		type: "each",
		source: "(9:2) {#each posts as post}",
		ctx
	});

	return block;
}

function create_fragment$4(ctx) {
	let nav;
	let each_value = /*posts*/ ctx[0];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			nav = element("nav");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr_dev(nav, "class", "fullhight navlist postList w3-col s8 m7 l8 ");
			add_location(nav, file$1, 7, 0, 144);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, nav, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(nav, null);
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*posts, selectedPost, Date, selectedCategory*/ 7) {
				each_value = /*posts*/ ctx[0];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(nav, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(nav);
			destroy_each(each_blocks, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$4.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	let { posts = [] } = $$props;
	let { selectedPost } = $$props;
	let { selectedCategory } = $$props;
	const writable_props = ["posts", "selectedPost", "selectedCategory"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PostList> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("PostList", $$slots, []);

	$$self.$set = $$props => {
		if ("posts" in $$props) $$invalidate(0, posts = $$props.posts);
		if ("selectedPost" in $$props) $$invalidate(1, selectedPost = $$props.selectedPost);
		if ("selectedCategory" in $$props) $$invalidate(2, selectedCategory = $$props.selectedCategory);
	};

	$$self.$capture_state = () => ({
		link,
		posts,
		selectedPost,
		selectedCategory
	});

	$$self.$inject_state = $$props => {
		if ("posts" in $$props) $$invalidate(0, posts = $$props.posts);
		if ("selectedPost" in $$props) $$invalidate(1, selectedPost = $$props.selectedPost);
		if ("selectedCategory" in $$props) $$invalidate(2, selectedCategory = $$props.selectedCategory);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [posts, selectedPost, selectedCategory];
}

class PostList extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
			posts: 0,
			selectedPost: 1,
			selectedCategory: 2
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "PostList",
			options,
			id: create_fragment$4.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*selectedPost*/ ctx[1] === undefined && !("selectedPost" in props)) {
			console.warn("<PostList> was created without expected prop 'selectedPost'");
		}

		if (/*selectedCategory*/ ctx[2] === undefined && !("selectedCategory" in props)) {
			console.warn("<PostList> was created without expected prop 'selectedCategory'");
		}
	}

	get posts() {
		throw new Error("<PostList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set posts(value) {
		throw new Error("<PostList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get selectedPost() {
		throw new Error("<PostList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set selectedPost(value) {
		throw new Error("<PostList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get selectedCategory() {
		throw new Error("<PostList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set selectedCategory(value) {
		throw new Error("<PostList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/Sidebar.svelte generated by Svelte v3.21.0 */
const file$2 = "src/Sidebar.svelte";

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[7] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[10] = list[i];
	return child_ctx;
}

// (31:6) {#each categories as cat}
function create_each_block_1(ctx) {
	let article;
	let t0_value = /*cat*/ ctx[10].name + "";
	let t0;
	let t1;
	let article_class_value;
	let dispose;

	function click_handler_1(...args) {
		return /*click_handler_1*/ ctx[6](/*cat*/ ctx[10], ...args);
	}

	const block = {
		c: function create() {
			article = element("article");
			t0 = text(t0_value);
			t1 = space();

			attr_dev(article, "class", article_class_value = "w3-col w3-button w3-left-align w3-bar-item  " + (/*selectedCategory*/ ctx[4] == /*cat*/ ctx[10].id
			? "w3-deep-orange"
			: ""));

			add_location(article, file$2, 31, 8, 906);
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, article, anchor);
			append_dev(article, t0);
			append_dev(article, t1);
			if (remount) dispose();
			dispose = listen_dev(article, "click", click_handler_1, false, false, false);
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*categories*/ 2 && t0_value !== (t0_value = /*cat*/ ctx[10].name + "")) set_data_dev(t0, t0_value);

			if (dirty & /*selectedCategory, categories*/ 18 && article_class_value !== (article_class_value = "w3-col w3-button w3-left-align w3-bar-item  " + (/*selectedCategory*/ ctx[4] == /*cat*/ ctx[10].id
			? "w3-deep-orange"
			: ""))) {
				attr_dev(article, "class", article_class_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(article);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block_1.name,
		type: "each",
		source: "(31:6) {#each categories as cat}",
		ctx
	});

	return block;
}

// (43:6) {#if post[3].includes(selectedCategory)}
function create_if_block$3(ctx) {
	let a;
	let img;
	let img_src_value;
	let t0;
	let div;
	let b;
	let t1_value = /*post*/ ctx[7][1] + "";
	let t1;
	let t2;
	let small;
	let t3_value = new Date(/*post*/ ctx[7][2] * 1000).toDateString() + "";
	let t3;
	let t4;
	let a_href_value;
	let a_class_value;
	let link_action;
	let dispose;

	const block = {
		c: function create() {
			a = element("a");
			img = element("img");
			t0 = space();
			div = element("div");
			b = element("b");
			t1 = text(t1_value);
			t2 = space();
			small = element("small");
			t3 = text(t3_value);
			t4 = space();
			attr_dev(img, "class", "w3-col");
			if (img.src !== (img_src_value = "/assets/icons/post.png")) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", "post");
			set_style(img, "width", "40px");
			set_style(img, "padding-right", "5px");
			add_location(img, file$2, 48, 10, 1485);
			attr_dev(b, "class", "w3-row");
			add_location(b, file$2, 55, 12, 1679);
			add_location(small, file$2, 57, 12, 1724);
			attr_dev(div, "class", "w3-rest");
			add_location(div, file$2, 54, 10, 1645);
			attr_dev(a, "href", a_href_value = "/" + /*post*/ ctx[7][0]);

			attr_dev(a, "class", a_class_value = "w3-border-bottom w3-padding-small " + (/*selectedPost*/ ctx[3] == /*post*/ ctx[7][0]
			? "w3-blue-grey"
			: ""));

			add_location(a, file$2, 43, 8, 1315);
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, a, anchor);
			append_dev(a, img);
			append_dev(a, t0);
			append_dev(a, div);
			append_dev(div, b);
			append_dev(b, t1);
			append_dev(div, t2);
			append_dev(div, small);
			append_dev(small, t3);
			append_dev(a, t4);
			if (remount) dispose();
			dispose = action_destroyer(link_action = link.call(null, a));
		},
		p: function update(ctx, dirty) {
			if (dirty & /*posts*/ 4 && t1_value !== (t1_value = /*post*/ ctx[7][1] + "")) set_data_dev(t1, t1_value);
			if (dirty & /*posts*/ 4 && t3_value !== (t3_value = new Date(/*post*/ ctx[7][2] * 1000).toDateString() + "")) set_data_dev(t3, t3_value);

			if (dirty & /*posts*/ 4 && a_href_value !== (a_href_value = "/" + /*post*/ ctx[7][0])) {
				attr_dev(a, "href", a_href_value);
			}

			if (dirty & /*selectedPost, posts*/ 12 && a_class_value !== (a_class_value = "w3-border-bottom w3-padding-small " + (/*selectedPost*/ ctx[3] == /*post*/ ctx[7][0]
			? "w3-blue-grey"
			: ""))) {
				attr_dev(a, "class", a_class_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(a);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$3.name,
		type: "if",
		source: "(43:6) {#if post[3].includes(selectedCategory)}",
		ctx
	});

	return block;
}

// (42:4) {#each posts as post}
function create_each_block$2(ctx) {
	let show_if = /*post*/ ctx[7][3].includes(/*selectedCategory*/ ctx[4]);
	let if_block_anchor;
	let if_block = show_if && create_if_block$3(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*posts, selectedCategory*/ 20) show_if = /*post*/ ctx[7][3].includes(/*selectedCategory*/ ctx[4]);

			if (show_if) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$2.name,
		type: "each",
		source: "(42:4) {#each posts as post}",
		ctx
	});

	return block;
}

function create_fragment$5(ctx) {
	let button;
	let img0;
	let img0_src_value;
	let t0;
	let nav;
	let section0;
	let img1;
	let img1_src_value;
	let t1;
	let a;
	let h4;
	let t3;
	let div;
	let t4;
	let section1;
	let nav_class_value;
	let dispose;
	let each_value_1 = /*categories*/ ctx[1];
	validate_each_argument(each_value_1);
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	let each_value = /*posts*/ ctx[2];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			button = element("button");
			img0 = element("img");
			t0 = space();
			nav = element("nav");
			section0 = element("section");
			img1 = element("img");
			t1 = space();
			a = element("a");
			h4 = element("h4");
			h4.textContent = "AHMED ESSAM";
			t3 = space();
			div = element("div");

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t4 = space();
			section1 = element("section");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			if (img0.src !== (img0_src_value = "./assets/icons/menu.webp")) attr_dev(img0, "src", img0_src_value);
			attr_dev(img0, "alt", "sidebar");
			add_location(img0, file$2, 16, 2, 463);
			attr_dev(button, "class", "w3-button w3-hide-medium w3-hide-large w3-display-topright");
			add_location(button, file$2, 13, 0, 335);
			attr_dev(img1, "class", "w3-col w3-circle");
			attr_dev(img1, "alt", "Ahmed Essam");
			if (img1.src !== (img1_src_value = "./assets/icons/me2.webp")) attr_dev(img1, "src", img1_src_value);
			add_location(img1, file$2, 21, 4, 667);
			attr_dev(h4, "class", "brand ");
			add_location(h4, file$2, 26, 6, 794);
			attr_dev(a, "href", "/admin");
			add_location(a, file$2, 25, 4, 770);
			attr_dev(div, "class", "w3-row ");
			add_location(div, file$2, 29, 4, 844);
			attr_dev(section0, "class", "fullhight navlist catList w3-col s4 m5 l4 ");
			add_location(section0, file$2, 20, 2, 602);
			attr_dev(section1, "class", "fullhight navlist postList w3-col s8 m7 l8 ");
			add_location(section1, file$2, 40, 2, 1172);
			attr_dev(nav, "class", nav_class_value = "w3-col s12 m6 l5 " + (/*hideSidebar*/ ctx[0] ? "w3-hide-small" : ""));
			add_location(nav, file$2, 19, 0, 527);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, button, anchor);
			append_dev(button, img0);
			insert_dev(target, t0, anchor);
			insert_dev(target, nav, anchor);
			append_dev(nav, section0);
			append_dev(section0, img1);
			append_dev(section0, t1);
			append_dev(section0, a);
			append_dev(a, h4);
			append_dev(section0, t3);
			append_dev(section0, div);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(div, null);
			}

			append_dev(nav, t4);
			append_dev(nav, section1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(section1, null);
			}

			if (remount) dispose();
			dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*selectedCategory, categories*/ 18) {
				each_value_1 = /*categories*/ ctx[1];
				validate_each_argument(each_value_1);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_1(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(div, null);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_1.length;
			}

			if (dirty & /*posts, selectedPost, Date, selectedCategory*/ 28) {
				each_value = /*posts*/ ctx[2];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(section1, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty & /*hideSidebar*/ 1 && nav_class_value !== (nav_class_value = "w3-col s12 m6 l5 " + (/*hideSidebar*/ ctx[0] ? "w3-hide-small" : ""))) {
				attr_dev(nav, "class", nav_class_value);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(nav);
			destroy_each(each_blocks_1, detaching);
			destroy_each(each_blocks, detaching);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$5.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$5($$self, $$props, $$invalidate) {
	let { hideSidebar = false } = $$props;
	let { categories = [] } = $$props;
	let { posts = [] } = $$props;
	let { selectedPost } = $$props;
	let selectedCategory = 0;
	const writable_props = ["hideSidebar", "categories", "posts", "selectedPost"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sidebar> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Sidebar", $$slots, []);
	const click_handler = () => $$invalidate(0, hideSidebar = !hideSidebar);
	const click_handler_1 = cat => $$invalidate(4, selectedCategory = cat.id);

	$$self.$set = $$props => {
		if ("hideSidebar" in $$props) $$invalidate(0, hideSidebar = $$props.hideSidebar);
		if ("categories" in $$props) $$invalidate(1, categories = $$props.categories);
		if ("posts" in $$props) $$invalidate(2, posts = $$props.posts);
		if ("selectedPost" in $$props) $$invalidate(3, selectedPost = $$props.selectedPost);
	};

	$$self.$capture_state = () => ({
		CatList,
		PostList,
		link,
		hideSidebar,
		categories,
		posts,
		selectedPost,
		selectedCategory
	});

	$$self.$inject_state = $$props => {
		if ("hideSidebar" in $$props) $$invalidate(0, hideSidebar = $$props.hideSidebar);
		if ("categories" in $$props) $$invalidate(1, categories = $$props.categories);
		if ("posts" in $$props) $$invalidate(2, posts = $$props.posts);
		if ("selectedPost" in $$props) $$invalidate(3, selectedPost = $$props.selectedPost);
		if ("selectedCategory" in $$props) $$invalidate(4, selectedCategory = $$props.selectedCategory);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*selectedPost*/ 8) {
			 if (selectedPost) $$invalidate(0, hideSidebar = true);
		}
	};

	return [
		hideSidebar,
		categories,
		posts,
		selectedPost,
		selectedCategory,
		click_handler,
		click_handler_1
	];
}

class Sidebar extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
			hideSidebar: 0,
			categories: 1,
			posts: 2,
			selectedPost: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Sidebar",
			options,
			id: create_fragment$5.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*selectedPost*/ ctx[3] === undefined && !("selectedPost" in props)) {
			console.warn("<Sidebar> was created without expected prop 'selectedPost'");
		}
	}

	get hideSidebar() {
		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set hideSidebar(value) {
		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get categories() {
		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set categories(value) {
		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get posts() {
		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set posts(value) {
		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get selectedPost() {
		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set selectedPost(value) {
		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const getFilename = (path) => path.replace(/^.*[\\\/]/, '').toLowerCase();

function httpGet(path) {
    return req(path);
}

async function req(path, method = 'GET', data) {
    const res = await fetch(path, {
        method,
        credentials: 'same-origin',
        body: data && JSON.stringify(data)
    });
    return await res.json();
}

const getBlob = async(url) => {
    const res = await fetch(url);
    return await res.blob();
};

const toDataURL = (url) =>
    fetch(url).then((response) => response.blob()).then(
        (blob) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        })
    );

/* src/Post.svelte generated by Svelte v3.21.0 */

const { console: console_1 } = globals;
const file$3 = "src/Post.svelte";

// (19:0) {:else}
function create_else_block$2(ctx) {
	let await_block_anchor;
	let promise_1;

	let info = {
		ctx,
		current: null,
		token: null,
		pending: create_pending_block,
		then: create_then_block,
		catch: create_catch_block,
		value: 3
	};

	handle_promise(promise_1 = /*promise*/ ctx[0], info);

	const block = {
		c: function create() {
			await_block_anchor = empty();
			info.block.c();
		},
		m: function mount(target, anchor) {
			insert_dev(target, await_block_anchor, anchor);
			info.block.m(target, info.anchor = anchor);
			info.mount = () => await_block_anchor.parentNode;
			info.anchor = await_block_anchor;
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			info.ctx = ctx;

			if (dirty & /*promise*/ 1 && promise_1 !== (promise_1 = /*promise*/ ctx[0]) && handle_promise(promise_1, info)) ; else {
				const child_ctx = ctx.slice();
				child_ctx[3] = info.resolved;
				info.block.p(child_ctx, dirty);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(await_block_anchor);
			info.block.d(detaching);
			info.token = null;
			info = null;
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$2.name,
		type: "else",
		source: "(19:0) {:else}",
		ctx
	});

	return block;
}

// (17:0) {#if !promise}
function create_if_block$4(ctx) {
	let h3;

	const block = {
		c: function create() {
			h3 = element("h3");
			h3.textContent = "Please select a post";
			add_location(h3, file$3, 17, 2, 337);
		},
		m: function mount(target, anchor) {
			insert_dev(target, h3, anchor);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(h3);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$4.name,
		type: "if",
		source: "(17:0) {#if !promise}",
		ctx
	});

	return block;
}

// (1:0) <script>   import { onMount }
function create_catch_block(ctx) {
	const block = { c: noop, m: noop, p: noop, d: noop };

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_catch_block.name,
		type: "catch",
		source: "(1:0) <script>   import { onMount }",
		ctx
	});

	return block;
}

// (20:28)      <article class=" w3-container">       <header class="w3-border-bottom">         <h2>           <b>{post.title}
function create_then_block(ctx) {
	let article;
	let header;
	let h2;
	let b;
	let t0_value = /*post*/ ctx[3].title + "";
	let t0;
	let t1;
	let span;
	let t2_value = new Date(/*post*/ ctx[3].date * 1000).toDateString() + "";
	let t2;
	let t3;
	let section;
	let raw_value = /*post*/ ctx[3].content + "";

	const block = {
		c: function create() {
			article = element("article");
			header = element("header");
			h2 = element("h2");
			b = element("b");
			t0 = text(t0_value);
			t1 = space();
			span = element("span");
			t2 = text(t2_value);
			t3 = space();
			section = element("section");
			add_location(b, file$3, 23, 10, 503);
			add_location(h2, file$3, 22, 8, 488);
			add_location(span, file$3, 25, 8, 545);
			attr_dev(header, "class", "w3-border-bottom");
			add_location(header, file$3, 21, 6, 446);
			attr_dev(section, "class", "w3-content");
			add_location(section, file$3, 27, 6, 624);
			attr_dev(article, "class", " w3-container");
			add_location(article, file$3, 20, 4, 408);
		},
		m: function mount(target, anchor) {
			insert_dev(target, article, anchor);
			append_dev(article, header);
			append_dev(header, h2);
			append_dev(h2, b);
			append_dev(b, t0);
			append_dev(header, t1);
			append_dev(header, span);
			append_dev(span, t2);
			append_dev(article, t3);
			append_dev(article, section);
			section.innerHTML = raw_value;
		},
		p: function update(ctx, dirty) {
			if (dirty & /*promise*/ 1 && t0_value !== (t0_value = /*post*/ ctx[3].title + "")) set_data_dev(t0, t0_value);
			if (dirty & /*promise*/ 1 && t2_value !== (t2_value = new Date(/*post*/ ctx[3].date * 1000).toDateString() + "")) set_data_dev(t2, t2_value);
			if (dirty & /*promise*/ 1 && raw_value !== (raw_value = /*post*/ ctx[3].content + "")) section.innerHTML = raw_value;		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(article);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_then_block.name,
		type: "then",
		source: "(20:28)      <article class=\\\" w3-container\\\">       <header class=\\\"w3-border-bottom\\\">         <h2>           <b>{post.title}",
		ctx
	});

	return block;
}

// (1:0) <script>   import { onMount }
function create_pending_block(ctx) {
	const block = { c: noop, m: noop, p: noop, d: noop };

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_pending_block.name,
		type: "pending",
		source: "(1:0) <script>   import { onMount }",
		ctx
	});

	return block;
}

function create_fragment$6(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (!/*promise*/ ctx[0]) return create_if_block$4;
		return create_else_block$2;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$6.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$6($$self, $$props, $$invalidate) {
	let { slug } = $$props;
	let { updateMe } = $$props;
	let promise = undefined;
	const writable_props = ["slug", "updateMe"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Post> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Post", $$slots, []);

	$$self.$set = $$props => {
		if ("slug" in $$props) $$invalidate(1, slug = $$props.slug);
		if ("updateMe" in $$props) $$invalidate(2, updateMe = $$props.updateMe);
	};

	$$self.$capture_state = () => ({
		onMount,
		httpGet,
		slug,
		updateMe,
		promise
	});

	$$self.$inject_state = $$props => {
		if ("slug" in $$props) $$invalidate(1, slug = $$props.slug);
		if ("updateMe" in $$props) $$invalidate(2, updateMe = $$props.updateMe);
		if ("promise" in $$props) $$invalidate(0, promise = $$props.promise);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*slug, updateMe*/ 6) {
			 {
				console.log(slug);

				if (slug && slug != "/") {
					updateMe(slug);
					$$invalidate(0, promise = httpGet("assets/posts/" + slug + ".json"));
				}
			}
		}
	};

	return [promise, slug, updateMe];
}

class Post extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$6, create_fragment$6, safe_not_equal, { slug: 1, updateMe: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Post",
			options,
			id: create_fragment$6.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*slug*/ ctx[1] === undefined && !("slug" in props)) {
			console_1.warn("<Post> was created without expected prop 'slug'");
		}

		if (/*updateMe*/ ctx[2] === undefined && !("updateMe" in props)) {
			console_1.warn("<Post> was created without expected prop 'updateMe'");
		}
	}

	get slug() {
		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set slug(value) {
		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get updateMe() {
		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set updateMe(value) {
		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/App.svelte generated by Svelte v3.21.0 */

const { console: console_1$1 } = globals;
const file$4 = "src/App.svelte";

// (37:10) <div slot="loading">
function create_loading_slot(ctx) {
	let div;

	const block = {
		c: function create() {
			div = element("div");
			div.textContent = "Loading...";
			attr_dev(div, "slot", "loading");
			add_location(div, file$4, 36, 10, 1021);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_loading_slot.name,
		type: "slot",
		source: "(37:10) <div slot=\\\"loading\\\">",
		ctx
	});

	return block;
}

// (35:6) <Route path="/admin">
function create_default_slot_3(ctx) {
	let current;

	const loadable = new Loadable({
			props: {
				loader: AdminLoader,
				$$slots: { loading: [create_loading_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(loadable.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(loadable, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const loadable_changes = {};

			if (dirty & /*$$scope*/ 64) {
				loadable_changes.$$scope = { dirty, ctx };
			}

			loadable.$set(loadable_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(loadable.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(loadable.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(loadable, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_3.name,
		type: "slot",
		source: "(35:6) <Route path=\\\"/admin\\\">",
		ctx
	});

	return block;
}

// (40:6) <Route path="/">
function create_default_slot_2(ctx) {
	let current;

	const post = new Post({
			props: { slug: "/", updateMe: /*func*/ ctx[3] },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(post.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(post, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(post.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(post.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(post, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_2.name,
		type: "slot",
		source: "(40:6) <Route path=\\\"/\\\">",
		ctx
	});

	return block;
}

// (43:6) <Route path="/:slug" let:params>
function create_default_slot_1(ctx) {
	let current;

	const post = new Post({
			props: {
				slug: /*params*/ ctx[5].slug,
				updateMe: /*func_1*/ ctx[4]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(post.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(post, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const post_changes = {};
			if (dirty & /*params*/ 32) post_changes.slug = /*params*/ ctx[5].slug;
			if (dirty & /*selectedPost*/ 4) post_changes.updateMe = /*func_1*/ ctx[4];
			post.$set(post_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(post.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(post.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(post, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1.name,
		type: "slot",
		source: "(43:6) <Route path=\\\"/:slug\\\" let:params>",
		ctx
	});

	return block;
}

// (31:0) <Router>
function create_default_slot(ctx) {
	let div;
	let t0;
	let main;
	let t1;
	let t2;
	let current;

	const sidebar = new Sidebar({
			props: {
				categories: /*categories*/ ctx[0],
				posts: /*posts*/ ctx[1],
				selectedPost: /*selectedPost*/ ctx[2]
			},
			$$inline: true
		});

	const route0 = new Route({
			props: {
				path: "/admin",
				$$slots: { default: [create_default_slot_3] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const route1 = new Route({
			props: {
				path: "/",
				$$slots: { default: [create_default_slot_2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const route2 = new Route({
			props: {
				path: "/:slug",
				$$slots: {
					default: [
						create_default_slot_1,
						({ params }) => ({ 5: params }),
						({ params }) => params ? 32 : 0
					]
				},
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			div = element("div");
			create_component(sidebar.$$.fragment);
			t0 = space();
			main = element("main");
			create_component(route0.$$.fragment);
			t1 = space();
			create_component(route1.$$.fragment);
			t2 = space();
			create_component(route2.$$.fragment);
			attr_dev(main, "class", "fullhight w3-col s12 m6 l7");
			add_location(main, file$4, 33, 4, 901);
			attr_dev(div, "class", "w3-row w3-theme wapper");
			add_location(div, file$4, 31, 2, 808);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(sidebar, div, null);
			append_dev(div, t0);
			append_dev(div, main);
			mount_component(route0, main, null);
			append_dev(main, t1);
			mount_component(route1, main, null);
			append_dev(main, t2);
			mount_component(route2, main, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			const sidebar_changes = {};
			if (dirty & /*categories*/ 1) sidebar_changes.categories = /*categories*/ ctx[0];
			if (dirty & /*posts*/ 2) sidebar_changes.posts = /*posts*/ ctx[1];
			if (dirty & /*selectedPost*/ 4) sidebar_changes.selectedPost = /*selectedPost*/ ctx[2];
			sidebar.$set(sidebar_changes);
			const route0_changes = {};

			if (dirty & /*$$scope*/ 64) {
				route0_changes.$$scope = { dirty, ctx };
			}

			route0.$set(route0_changes);
			const route1_changes = {};

			if (dirty & /*$$scope*/ 64) {
				route1_changes.$$scope = { dirty, ctx };
			}

			route1.$set(route1_changes);
			const route2_changes = {};

			if (dirty & /*$$scope, params, selectedPost*/ 100) {
				route2_changes.$$scope = { dirty, ctx };
			}

			route2.$set(route2_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(sidebar.$$.fragment, local);
			transition_in(route0.$$.fragment, local);
			transition_in(route1.$$.fragment, local);
			transition_in(route2.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(sidebar.$$.fragment, local);
			transition_out(route0.$$.fragment, local);
			transition_out(route1.$$.fragment, local);
			transition_out(route2.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(sidebar);
			destroy_component(route0);
			destroy_component(route1);
			destroy_component(route2);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(31:0) <Router>",
		ctx
	});

	return block;
}

function create_fragment$7(ctx) {
	let current;

	const router = new Router({
			props: {
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(router.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(router, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const router_changes = {};

			if (dirty & /*$$scope, selectedPost, categories, posts*/ 71) {
				router_changes.$$scope = { dirty, ctx };
			}

			router.$set(router_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(router.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(router.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(router, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$7.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

const AdminLoader = register({
	loader: () => import('./Admin-b60acd90.js'),
	resolve: () => require.resolve("./Admin.svelte")
});

function instance$7($$self, $$props, $$invalidate) {
	let categories = [];
	let posts = [];
	let selectedPost = "";

	onMount(async function () {
		const data = await httpGet("/assets/index.json");
		$$invalidate(0, categories = data.cats);
		$$invalidate(1, posts = data.posts);
	});

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("App", $$slots, []);
	const func = x => console.log();
	const func_1 = x => $$invalidate(2, selectedPost = x);

	$$self.$capture_state = () => ({
		register,
		AdminLoader,
		Route,
		Router,
		Loadable,
		Sidebar,
		Post,
		onMount,
		httpGet,
		categories,
		posts,
		selectedPost
	});

	$$self.$inject_state = $$props => {
		if ("categories" in $$props) $$invalidate(0, categories = $$props.categories);
		if ("posts" in $$props) $$invalidate(1, posts = $$props.posts);
		if ("selectedPost" in $$props) $$invalidate(2, selectedPost = $$props.selectedPost);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [categories, posts, selectedPost, func, func_1];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment$7.name
		});
	}
}

var app = new App({
	target: document.body
});

export { SvelteComponentDev as S, app as a, getBlob as b, globals as c, dispatch_dev as d, element as e, space as f, getFilename as g, add_location as h, init as i, attr_dev as j, insert_dev as k, append_dev as l, set_input_value as m, listen_dev as n, onMount as o, prevent_default as p, noop as q, run_all as r, safe_not_equal as s, toDataURL as t, detach_dev as u, validate_slots as v, binding_callbacks as w };
//# sourceMappingURL=main-aeecd7df.js.map
