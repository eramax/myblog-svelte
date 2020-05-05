
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

function create_fragment(ctx) {
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
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
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
		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Router",
			options,
			id: create_fragment.name
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

const get_default_slot_changes = dirty => ({
	params: dirty & /*routeParams*/ 2,
	location: dirty & /*$location*/ 16
});

const get_default_slot_context = ctx => ({
	params: /*routeParams*/ ctx[1],
	location: /*$location*/ ctx[4]
});

// (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
function create_if_block(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_1, create_else_block];
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
		id: create_if_block.name,
		type: "if",
		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
		ctx
	});

	return block;
}

// (43:2) {:else}
function create_else_block(ctx) {
	let current;
	const default_slot_template = /*$$slots*/ ctx[13].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context);

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
					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, get_default_slot_changes));
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
		id: create_else_block.name,
		type: "else",
		source: "(43:2) {:else}",
		ctx
	});

	return block;
}

// (41:2) {#if component !== null}
function create_if_block_1(ctx) {
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
		id: create_if_block_1.name,
		type: "if",
		source: "(41:2) {#if component !== null}",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

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
					if_block = create_if_block(ctx);
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
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
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
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Route",
			options,
			id: create_fragment$1.name
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

function create_fragment$2(ctx) {
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
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
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

		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
			categories: 0,
			select: 1,
			selectedCategory: 2
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "CatList",
			options,
			id: create_fragment$2.name
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
function create_if_block$1(ctx) {
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
		id: create_if_block$1.name,
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
	let if_block = show_if && create_if_block$1(ctx);

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
					if_block = create_if_block$1(ctx);
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

function create_fragment$3(ctx) {
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
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$3($$self, $$props, $$invalidate) {
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

		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
			posts: 0,
			selectedPost: 1,
			selectedCategory: 2
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "PostList",
			options,
			id: create_fragment$3.name
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
function create_if_block$2(ctx) {
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
		id: create_if_block$2.name,
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
			if (dirty & /*posts, selectedCategory*/ 20) show_if = /*post*/ ctx[7][3].includes(/*selectedCategory*/ ctx[4]);

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
		id: create_each_block$2.name,
		type: "each",
		source: "(42:4) {#each posts as post}",
		ctx
	});

	return block;
}

function create_fragment$4(ctx) {
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
		id: create_fragment$4.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$4($$self, $$props, $$invalidate) {
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

		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
			hideSidebar: 0,
			categories: 1,
			posts: 2,
			selectedPost: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Sidebar",
			options,
			id: create_fragment$4.name
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
function create_else_block$1(ctx) {
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
		id: create_else_block$1.name,
		type: "else",
		source: "(19:0) {:else}",
		ctx
	});

	return block;
}

// (17:0) {#if !promise}
function create_if_block$3(ctx) {
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
		id: create_if_block$3.name,
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

function create_fragment$5(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (!/*promise*/ ctx[0]) return create_if_block$3;
		return create_else_block$1;
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
		id: create_fragment$5.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$5($$self, $$props, $$invalidate) {
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
		init(this, options, instance$5, create_fragment$5, safe_not_equal, { slug: 1, updateMe: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Post",
			options,
			id: create_fragment$5.name
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

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var jodit_min = createCommonjsModule(function (module, exports) {
/*!
 jodit - Jodit is awesome and usefully wysiwyg editor with filebrowser
 Author: Chupurnov <chupurnov@gmail.com> (https://xdsoft.net/)
 Version: v3.3.24
 Url: https://xdsoft.net/jodit/
 License(s): MIT
*/

!function(t,e){module.exports=e();}(window,(function(){return function(t){var e={};function o(i){if(e[i])return e[i].exports;var n=e[i]={i:i,l:!1,exports:{}};return t[i].call(n.exports,n,n.exports,o),n.l=!0,n.exports}return o.m=t,o.c=e,o.d=function(t,e,i){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i});},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0});},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(o.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)o.d(i,n,function(e){return t[e]}.bind(null,n));return i},o.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="/build/",o(o.s=76)}([function(t,e,o){o.r(e),o.d(e,"__extends",(function(){return n})),o.d(e,"__assign",(function(){return r})),o.d(e,"__rest",(function(){return a})),o.d(e,"__decorate",(function(){return s})),o.d(e,"__param",(function(){return l})),o.d(e,"__metadata",(function(){return c})),o.d(e,"__awaiter",(function(){return d})),o.d(e,"__generator",(function(){return u})),o.d(e,"__exportStar",(function(){return f})),o.d(e,"__values",(function(){return p})),o.d(e,"__read",(function(){return h})),o.d(e,"__spread",(function(){return v})),o.d(e,"__spreadArrays",(function(){return m})),o.d(e,"__await",(function(){return g})),o.d(e,"__asyncGenerator",(function(){return b})),o.d(e,"__asyncDelegator",(function(){return y})),o.d(e,"__asyncValues",(function(){return _})),o.d(e,"__makeTemplateObject",(function(){return w})),o.d(e,"__importStar",(function(){return j})),o.d(e,"__importDefault",(function(){return S}));var i=function(t,e){return (i=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var o in e)e.hasOwnProperty(o)&&(t[o]=e[o]);})(t,e)};function n(t,e){function o(){this.constructor=t;}i(t,e),t.prototype=null===e?Object.create(e):(o.prototype=e.prototype,new o);}var r=function(){return (r=Object.assign||function(t){for(var e,o=1,i=arguments.length;i>o;o++)for(var n in e=arguments[o])Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t}).apply(this,arguments)};function a(t,e){var o={};for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&0>e.indexOf(i)&&(o[i]=t[i]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var n=0;for(i=Object.getOwnPropertySymbols(t);i.length>n;n++)0>e.indexOf(i[n])&&Object.prototype.propertyIsEnumerable.call(t,i[n])&&(o[i[n]]=t[i[n]]);}return o}function s(t,e,o,i){var n,r=arguments.length,a=3>r?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,o,i);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(a=(3>r?n(a):r>3?n(e,o,a):n(e,o))||a);return r>3&&a&&Object.defineProperty(e,o,a),a}function l(t,e){return function(o,i){e(o,i,t);}}function c(t,e){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(t,e)}function d(t,e,o,i){return new(o||(o=Promise))((function(n,r){function a(t){try{l(i.next(t));}catch(t){r(t);}}function s(t){try{l(i.throw(t));}catch(t){r(t);}}function l(t){t.done?n(t.value):new o((function(e){e(t.value);})).then(a,s);}l((i=i.apply(t,e||[])).next());}))}function u(t,e){var o,i,n,r,a={label:0,sent:function(){if(1&n[0])throw n[1];return n[1]},trys:[],ops:[]};return r={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(r[Symbol.iterator]=function(){return this}),r;function s(r){return function(s){return function(r){if(o)throw new TypeError("Generator is already executing.");for(;a;)try{if(o=1,i&&(n=2&r[0]?i.return:r[0]?i.throw||((n=i.return)&&n.call(i),0):i.next)&&!(n=n.call(i,r[1])).done)return n;switch(i=0,n&&(r=[2&r[0],n.value]),r[0]){case 0:case 1:n=r;break;case 4:return a.label++,{value:r[1],done:!1};case 5:a.label++,i=r[1],r=[0];continue;case 7:r=a.ops.pop(),a.trys.pop();continue;default:if(!(n=(n=a.trys).length>0&&n[n.length-1])&&(6===r[0]||2===r[0])){a=0;continue}if(3===r[0]&&(!n||r[1]>n[0]&&n[3]>r[1])){a.label=r[1];break}if(6===r[0]&&n[1]>a.label){a.label=n[1],n=r;break}if(n&&n[2]>a.label){a.label=n[2],a.ops.push(r);break}n[2]&&a.ops.pop(),a.trys.pop();continue}r=e.call(t,a);}catch(t){r=[6,t],i=0;}finally{o=n=0;}if(5&r[0])throw r[1];return {value:r[0]?r[1]:void 0,done:!0}}([r,s])}}}function f(t,e){for(var o in t)e.hasOwnProperty(o)||(e[o]=t[o]);}function p(t){var e="function"==typeof Symbol&&t[Symbol.iterator],o=0;return e?e.call(t):{next:function(){return t&&o>=t.length&&(t=void 0),{value:t&&t[o++],done:!t}}}}function h(t,e){var o="function"==typeof Symbol&&t[Symbol.iterator];if(!o)return t;var i,n,r=o.call(t),a=[];try{for(;(void 0===e||e-- >0)&&!(i=r.next()).done;)a.push(i.value);}catch(t){n={error:t};}finally{try{i&&!i.done&&(o=r.return)&&o.call(r);}finally{if(n)throw n.error}}return a}function v(){for(var t=[],e=0;arguments.length>e;e++)t=t.concat(h(arguments[e]));return t}function m(){for(var t=0,e=0,o=arguments.length;o>e;e++)t+=arguments[e].length;var i=Array(t),n=0;for(e=0;o>e;e++)for(var r=arguments[e],a=0,s=r.length;s>a;a++,n++)i[n]=r[a];return i}function g(t){return this instanceof g?(this.v=t,this):new g(t)}function b(t,e,o){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var i,n=o.apply(t,e||[]),r=[];return i={},a("next"),a("throw"),a("return"),i[Symbol.asyncIterator]=function(){return this},i;function a(t){n[t]&&(i[t]=function(e){return new Promise((function(o,i){r.push([t,e,o,i])>1||s(t,e);}))});}function s(t,e){try{(o=n[t](e)).value instanceof g?Promise.resolve(o.value.v).then(l,c):d(r[0][2],o);}catch(t){d(r[0][3],t);}var o;}function l(t){s("next",t);}function c(t){s("throw",t);}function d(t,e){t(e),r.shift(),r.length&&s(r[0][0],r[0][1]);}}function y(t){var e,o;return e={},i("next"),i("throw",(function(t){throw t})),i("return"),e[Symbol.iterator]=function(){return this},e;function i(i,n){e[i]=t[i]?function(e){return (o=!o)?{value:g(t[i](e)),done:"return"===i}:n?n(e):e}:n;}}function _(t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var e,o=t[Symbol.asyncIterator];return o?o.call(t):(t=p(t),e={},i("next"),i("throw"),i("return"),e[Symbol.asyncIterator]=function(){return this},e);function i(o){e[o]=t[o]&&function(e){return new Promise((function(i,n){!function(t,e,o,i){Promise.resolve(i).then((function(e){t({value:e,done:o});}),e);}(i,n,(e=t[o](e)).done,e.value);}))};}}function w(t,e){return Object.defineProperty?Object.defineProperty(t,"raw",{value:e}):t.raw=e,t}function j(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var o in t)Object.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e.default=t,e}function S(t){return t&&t.__esModule?t:{default:t}}},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(2),n=o(3),r=o(8),a=function(){function t(){}return t.detach=function(t){for(;t.firstChild;)t.removeChild(t.firstChild);},t.unwrap=function(e){var o=e.parentNode;if(o){for(;e.firstChild;)o.insertBefore(e.firstChild,e);t.safeRemove(e);}},t.each=function(e,o){var i=e.firstChild;if(i)for(;i;){var n=t.next(i,Boolean,e);if(!1===o(i))return !1;if(i.parentNode&&!t.each(i,o))return !1;i=n;}return !0},t.replace=function(t,e,o,i,r){void 0===i&&(i=!1),void 0===r&&(r=!1);var a=n.isString(e)?o.element(e):e;if(!r)for(;t.firstChild;)a.appendChild(t.firstChild);return i&&Array.from(t.attributes).forEach((function(t){a.setAttribute(t.name,t.value);})),t.parentNode&&t.parentNode.replaceChild(a,t),a},t.isEmptyTextNode=function(e){return t.isText(e)&&(!e.nodeValue||0===e.nodeValue.replace(i.INVISIBLE_SPACE_REG_EXP,"").length)},t.isEmpty=function(e,o){return void 0===o&&(o=/^(img|svg|canvas|input|textarea|form)$/),!e||(t.isText(e)?null===e.nodeValue||0===r.trim(e.nodeValue).length:!o.test(e.nodeName.toLowerCase())&&t.each(e,(function(e){if(t.isText(e)&&null!==e.nodeValue&&0!==r.trim(e.nodeValue).length||t.isElement(e)&&o.test(e.nodeName.toLowerCase()))return !1})))},t.isNode=function(t,e){return !!t&&!("object"!=typeof e||!e||"function"!=typeof e.Node&&"object"!=typeof e.Node)&&t instanceof e.Node},t.isCell=function(e,o){return t.isNode(e,o)&&/^(td|th)$/i.test(e.nodeName)},t.isImage=function(e,o){return t.isNode(e,o)&&/^(img|svg|picture|canvas)$/i.test(e.nodeName)},t.isBlock=function(e,o){return e&&"object"==typeof e&&t.isNode(e,o)&&i.IS_BLOCK.test(e.nodeName)},t.isText=function(t){return Boolean(t&&t.nodeType===Node.TEXT_NODE)},t.isElement=function(t){return Boolean(t&&t.nodeType===Node.ELEMENT_NODE)},t.isHTMLElement=function(e,o){return t.isNode(e,o)&&e instanceof o.HTMLElement},t.isInlineBlock=function(e){return t.isElement(e)&&!/^(BR|HR)$/i.test(e.tagName)&&-1!==["inline","inline-block"].indexOf(n.css(e,"display").toString())},t.canSplitBlock=function(e,o){return e&&e instanceof o.HTMLElement&&t.isBlock(e,o)&&!/^(TD|TH|CAPTION|FORM)$/.test(e.nodeName)&&void 0!==e.style&&!/^(fixed|absolute)/i.test(e.style.position)},t.prev=function(e,o,i,n){return void 0===n&&(n=!0),t.find(e,o,i,!1,"previousSibling",!!n&&"lastChild")},t.next=function(e,o,i,n){return void 0===n&&(n=!0),t.find(e,o,i,void 0,void 0,n?"firstChild":"")},t.prevWithClass=function(e,o){return t.prev(e,(function(e){return t.isElement(e)&&e.classList.contains(o)}),e.parentNode)},t.nextWithClass=function(e,o){return t.next(e,(function(e){return t.isElement(e)&&e.classList.contains(o)}),e.parentNode)},t.find=function(e,o,i,n,r,a){if(void 0===n&&(n=!1),void 0===r&&(r="nextSibling"),void 0===a&&(a="firstChild"),n&&o(e))return e;var s,l=e;do{if(o(s=l[r]))return s||!1;if(a&&s&&s[a]){var c=t.find(s[a],o,s,!0,r,a);if(c)return c}s||(s=l.parentNode),l=s;}while(l&&l!==i);return !1},t.findWithCurrent=function(e,o,i,n,r){void 0===n&&(n="nextSibling"),void 0===r&&(r="firstChild");var a=e;do{if(o(a))return a||!1;if(r&&a&&a[r]){var s=t.findWithCurrent(a[r],o,a,n,r);if(s)return s}for(;a&&!a[n]&&a!==i;)a=a.parentNode;a&&a[n]&&a!==i&&(a=a[n]);}while(a&&a!==i);return !1},t.up=function(t,e,o){var i=t;if(!t)return !1;do{if(e(i))return i;if(i===o||!i.parentNode)break;i=i.parentNode;}while(i&&i!==o);return !1},t.closest=function(e,o,i){var n;return n="function"==typeof o?o:o instanceof RegExp?function(t){return t&&o.test(t.nodeName)}:function(t){return t&&new RegExp("^("+o+")$","i").test(t.nodeName)},t.up(e,n,i)},t.appendChildFirst=function(t,e){var o=t.firstChild;o?t.insertBefore(e,o):t.appendChild(e);},t.after=function(t,e){var o=t.parentNode;o&&(o.lastChild===t?o.appendChild(e):o.insertBefore(e,t.nextSibling));},t.moveContent=function(t,e,o){void 0===o&&(o=!1);var i=(t.ownerDocument||document).createDocumentFragment();Array.from(t.childNodes).forEach((function(t){i.appendChild(t);})),o&&e.firstChild?e.insertBefore(i,e.firstChild):e.appendChild(i);},t.all=function(e,o,i){void 0===i&&(i=!1);var n=e.childNodes?Array.prototype.slice.call(e.childNodes):[];if(o(e))return e;i&&(n=n.reverse()),n.forEach((function(e){t.all(e,o,i);}));},t.safeRemove=function(t){t&&t.parentNode&&t.parentNode.removeChild(t);},t.toggleAttribute=function(t,e,o){!1!==o?t.setAttribute(e,o.toString()):t.removeAttribute(e);},t.hide=function(t){t&&(n.dataBind(t,"__old_display",t.style.display),t.style.display="none");},t.show=function(t){if(t){var e=n.dataBind(t,"__old_display");"none"===t.style.display&&(t.style.display=e||"");}},t.isTag=function(e,o){return t.isElement(e)&&e.tagName.toLowerCase()===o.toLowerCase()},t.wrapInline=function(e,o,i){var n,r=e,a=e,s=i.selection.save(),l=!1;do{l=!1,(n=r.previousSibling)&&!t.isBlock(n,i.editorWindow)&&(l=!0,r=n);}while(l);do{l=!1,(n=a.nextSibling)&&!t.isBlock(n,i.editorWindow)&&(l=!0,a=n);}while(l);var c="string"==typeof o?i.create.inside.element(o):o;r.parentNode&&r.parentNode.insertBefore(c,r);for(var d=r;d&&(d=r.nextSibling,c.appendChild(r),r!==a&&d);)r=d;return i.selection.restore(s),c},t.wrap=function(t,e,o){var i=o.selection.save(),n="string"==typeof e?o.create.inside.element(e):e;return t.parentNode?(t.parentNode.insertBefore(n,t),n.appendChild(t),o.selection.restore(i),n):null},t.findInline=function(e,o,i){var n=e,r=null;do{if(!n)break;if((r=o?n.previousSibling:n.nextSibling)||!n.parentNode||n.parentNode===i||!t.isInlineBlock(n.parentNode))break;n=n.parentNode;}while(!r);for(;r&&t.isInlineBlock(r)&&(o?r.lastChild:r.firstChild);)r=o?r.lastChild:r.firstChild;return r},t.contains=function(t,e){for(;e.parentNode;){if(e.parentNode===t)return !0;e=e.parentNode;}return !1},t.isOrContains=function(e,o,i){return void 0===i&&(i=!1),o&&e&&(e===o&&!i||t.contains(e,o))},t}();e.Dom=a;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.INVISIBLE_SPACE="\ufeff",e.INVISIBLE_SPACE_REG_EXP=/[\uFEFF]/g,e.INVISIBLE_SPACE_REG_EXP_END=/[\uFEFF]+$/g,e.INVISIBLE_SPACE_REG_EXP_START=/^[\uFEFF]+/g,e.SPACE_REG_EXP=/[\s\n\t\r\uFEFF\u200b]+/g,e.SPACE_REG_EXP_START=/^[\s\n\t\r\uFEFF\u200b]+/g,e.SPACE_REG_EXP_END=/[\s\n\t\r\uFEFF\u200b]+$/g,e.IS_BLOCK=/^(PRE|DIV|P|LI|H[1-6]|BLOCKQUOTE|TD|TH|TABLE|BODY|HTML|FIGCAPTION|FIGURE|DT|DD)$/i,e.IS_INLINE=/^(STRONG|SPAN|I|EM|B|SUP|SUB)$/i,e.MAY_BE_REMOVED_WITH_KEY=/^(IMG|BR|IFRAME|SCRIPT|INPUT|TEXTAREA|HR|JODIT|JODIT-MEDIA)$/i,e.KEY_BACKSPACE=8,e.KEY_TAB=9,e.KEY_ENTER=13,e.KEY_ESC=27,e.KEY_LEFT=37,e.KEY_UP=38,e.KEY_RIGHT=39,e.KEY_DOWN=40,e.KEY_DELETE=46,e.KEY_F=70,e.KEY_R=82,e.KEY_H=72,e.KEY_Y=89,e.KEY_V=86,e.KEY_Z=90,e.KEY_F3=114,e.NEARBY=5,e.ACCURACY=10,e.COMMAND_KEYS=[e.KEY_BACKSPACE,e.KEY_DELETE,e.KEY_UP,e.KEY_DOWN,e.KEY_RIGHT,e.KEY_LEFT,e.KEY_ENTER,e.KEY_ESC,e.KEY_F3,e.KEY_TAB],e.BR="br",e.PARAGRAPH="p",e.MODE_WYSIWYG=1,e.MODE_SOURCE=2,e.MODE_SPLIT=3,e.IS_IE="undefined"!=typeof navigator&&(-1!==navigator.userAgent.indexOf("MSIE")||/rv:11.0/i.test(navigator.userAgent)),e.URL_LIST=e.IS_IE?"url":"text/uri-list",e.TEXT_PLAIN=e.IS_IE?"text":"text/plain",e.TEXT_HTML=e.IS_IE?"text":"text/html",e.MARKER_CLASS="jodit_selection_marker",e.EMULATE_DBLCLICK_TIMEOUT=300,e.JODIT_SELECTED_CELL_MARKER="data-jodit-selected-cell",e.INSERT_AS_HTML="insert_as_html",e.INSERT_CLEAR_HTML="insert_clear_html",e.INSERT_AS_TEXT="insert_as_text",e.INSERT_ONLY_TEXT="insert_only_text",e.IS_MAC="undefined"!=typeof window&&/Mac|iPod|iPhone|iPad/.test(window.navigator.platform),e.KEY_ALIASES={add:"+",break:"pause",cmd:"meta",command:"meta",ctl:"control",ctrl:"control",del:"delete",down:"arrowdown",esc:"escape",ins:"insert",left:"arrowleft",mod:e.IS_MAC?"meta":"control",opt:"alt",option:"alt",return:"enter",right:"arrowright",space:" ",spacebar:" ",up:"arrowup",win:"meta",windows:"meta"},e.BASE_PATH=function(){if("undefined"==typeof document)return "";var t=document.currentScript,e=function(t){return t.replace(/\/[^\/]+.js$/,"/")};if(t)return e(t.src);var o=document.querySelectorAll("script[src]");return o&&o.length?e(o[o.length-1].src):window.location.href}();},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);i.__exportStar(o(41),e),i.__exportStar(o(22),e),i.__exportStar(o(43),e),i.__exportStar(o(13),e),i.__exportStar(o(11),e),i.__exportStar(o(98),e),i.__exportStar(o(33),e),i.__exportStar(o(18),e),i.__exportStar(o(19),e),i.__exportStar(o(8),e),i.__exportStar(o(118),e),i.__exportStar(o(119),e),i.__exportStar(o(120),e),i.__exportStar(o(10),e),i.__exportStar(o(55),e),i.__exportStar(o(121),e),i.__exportStar(o(34),e),i.__exportStar(o(25),e),i.__exportStar(o(53),e),i.__exportStar(o(122),e),i.__exportStar(o(31),e),i.__exportStar(o(30),e),i.__exportStar(o(54),e),i.__exportStar(o(56),e),i.__exportStar(o(123),e),i.__exportStar(o(9),e),i.__exportStar(o(32),e),i.__exportStar(o(124),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(2),r=o(17),a=r.Widget.TabsWidget,s=r.Widget.FileSelectorWidget,l=o(1),c=o(3),d=o(6),u=o(13),f=function(){function t(){this.iframe=!1,this.license="",this.preset="custom",this.presets={inline:{inline:!0,toolbar:!1,toolbarInline:!0,popup:{selection:["bold","underline","italic","ul","ol","outdent","indent","\n","fontsize","brush","paragraph","link","align","cut","dots"]},showXPathInStatusbar:!1,showCharsCounter:!1,showWordsCounter:!1,showPlaceholder:!1}},this.ownerDocument="undefined"!=typeof document?document:null,this.ownerWindow="undefined"!=typeof window?window:null,this.zIndex=0,this.readonly=!1,this.disabled=!1,this.activeButtonsInReadOnly=["source","fullsize","print","about","dots","selectall"],this.toolbarButtonSize="middle",this.allowTabNavigation=!1,this.inline=!1,this.theme="default",this.saveModeInStorage=!1,this.saveHeightInStorage=!1,this.spellcheck=!0,this.editorCssClass=!1,this.style=!1,this.triggerChangeEvent=!0,this.width="auto",this.minWidth="200px",this.maxWidth="100%",this.height="auto",this.minHeight=200,this.direction="",this.language="auto",this.debugLanguage=!1,this.i18n=!1,this.tabIndex=-1,this.toolbar=!0,this.showTooltip=!0,this.showTooltipDelay=300,this.useNativeTooltip=!1,this.enter=n.PARAGRAPH,this.enterBlock=n.PARAGRAPH,this.defaultMode=n.MODE_WYSIWYG,this.useSplitMode=!1,this.colors={greyscale:["#000000","#434343","#666666","#999999","#B7B7B7","#CCCCCC","#D9D9D9","#EFEFEF","#F3F3F3","#FFFFFF"],palette:["#980000","#FF0000","#FF9900","#FFFF00","#00F0F0","#00FFFF","#4A86E8","#0000FF","#9900FF","#FF00FF"],full:["#E6B8AF","#F4CCCC","#FCE5CD","#FFF2CC","#D9EAD3","#D0E0E3","#C9DAF8","#CFE2F3","#D9D2E9","#EAD1DC","#DD7E6B","#EA9999","#F9CB9C","#FFE599","#B6D7A8","#A2C4C9","#A4C2F4","#9FC5E8","#B4A7D6","#D5A6BD","#CC4125","#E06666","#F6B26B","#FFD966","#93C47D","#76A5AF","#6D9EEB","#6FA8DC","#8E7CC3","#C27BA0","#A61C00","#CC0000","#E69138","#F1C232","#6AA84F","#45818E","#3C78D8","#3D85C6","#674EA7","#A64D79","#85200C","#990000","#B45F06","#BF9000","#38761D","#134F5C","#1155CC","#0B5394","#351C75","#733554","#5B0F00","#660000","#783F04","#7F6000","#274E13","#0C343D","#1C4587","#073763","#20124D","#4C1130"]},this.colorPickerDefaultTab="background",this.imageDefaultWidth=300,this.removeButtons=[],this.disablePlugins=[],this.extraPlugins=[],this.extraButtons=[],this.createAttributes={},this.sizeLG=900,this.sizeMD=700,this.sizeSM=400,this.buttons=["source","|","bold","strikethrough","underline","italic","eraser","|","superscript","subscript","|","ul","ol","|","outdent","indent","|","font","fontsize","brush","paragraph","|","image","file","video","table","link","|","align","undo","redo","\n","selectall","cut","copy","paste","copyformat","|","hr","symbol","fullsize","print","about"],this.buttonsMD=["source","|","bold","italic","|","ul","ol","eraser","|","font","fontsize","brush","paragraph","|","image","table","link","|","align","|","undo","redo","|","hr","copyformat","fullsize","dots"],this.buttonsSM=["source","|","bold","italic","|","ul","ol","eraser","|","fontsize","brush","paragraph","|","image","table","link","|","align","|","undo","redo","|","copyformat","fullsize","dots"],this.buttonsXS=["bold","image","|","brush","paragraph","eraser","|","align","|","undo","redo","|","dots"],this.events={},this.textIcons=!1,this.showBrowserColorPicker=!1;}return Object.defineProperty(t,"defaultOptions",{get:function(){return t.__defaultOptions||(t.__defaultOptions=new t),t.__defaultOptions},enumerable:!0,configurable:!0}),t}();e.Config=f,e.OptionsDefault=function(t,e){var o=this;void 0===e&&(e=f.defaultOptions);var i=this;if(i.plainOptions=t,void 0!==t&&"object"==typeof t){var n=function(t,r){if("preset"===r&&void 0!==e.presets[t.preset]){var a=e.presets[t.preset];Object.keys(a).forEach(n.bind(o,a));}var s=e[r];i[r]="object"!=typeof s||null===s||["ownerWindow","ownerDocument"].includes(r)||Array.isArray(s)?t[r]:u.extend(!0,{},s,t[r]);};Object.keys(t).forEach(n.bind(this,t));}},f.prototype.controls={print:{exec:function(t){var e=window.open("","PRINT");e&&(t.options.iframe?(t.events.fire("generateDocumentStructure.iframe",e.document,t),e.document.body.innerHTML=t.value):(e.document.write('<!doctype html><html lang="'+c.defaultLanguage(t.options.language)+'"><head><title></title></head><body>'+t.value+"</body></html>"),e.document.close()),e.focus(),e.print(),e.close());},mode:n.MODE_SOURCE+n.MODE_WYSIWYG,tooltip:"Print"},about:{exec:function(t){var e=t.getInstance("Dialog"),o=t.i18n.bind(t);e.setTitle(o("About Jodit")),e.setContent('<div class="jodit_about">\n\t\t\t\t\t<div>'+o("Jodit Editor")+" v."+t.getVersion()+"</div>\n\t\t\t\t\t<div>"+o("License: %s",c.isLicense(t.options.license)?c.normalizeLicense(t.options.license):"MIT")+'</div>\n\t\t\t\t\t<div>\n\t\t\t\t\t\t<a href="https://xdsoft.net/jodit/" target="_blank">http://xdsoft.net/jodit/</a>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div>\n\t\t\t\t\t\t<a href="https://xdsoft.net/jodit/doc/" target="_blank">'+o("Jodit User's Guide")+"</a>\n\t\t\t\t\t\t"+o("contains detailed help for using")+"\n\t\t\t\t\t</div>\n\t\t\t\t\t<div>"+o("Copyright © XDSoft.net - Chupurnov Valeriy. All rights reserved.")+"</div>\n\t\t\t\t</div>"),e.open();},tooltip:"About Jodit",mode:n.MODE_SOURCE+n.MODE_WYSIWYG},hr:{command:"insertHorizontalRule",tags:["hr"],tooltip:"Insert Horizontal Line"},image:{popup:function(t,e,o,n){var r=null;!e||l.Dom.isText(e)||"IMG"!==e.tagName&&!c.$$("img",e).length||(r="IMG"===e.tagName?e:c.$$("img",e)[0]);var a=t.selection.save();return s(t,{filebrowser:function(e){t.selection.restore(a),e.files&&e.files.forEach((function(o){return t.selection.insertImage(e.baseurl+o,null,t.options.imageDefaultWidth)})),n();},upload:!0,url:function(e,o){return i.__awaiter(void 0,void 0,void 0,(function(){var s;return i.__generator(this,(function(i){switch(i.label){case 0:return t.selection.restore(a),(s=r||t.create.inside.element("img")).setAttribute("src",e),s.setAttribute("alt",o),r?[3,2]:[4,t.selection.insertImage(s,null,t.options.imageDefaultWidth)];case 1:i.sent(),i.label=2;case 2:return n(),[2]}}))}))}},r,n)},tags:["img"],tooltip:"Insert Image"},file:{popup:function(t,e,o,i){var n=function(e,o){void 0===o&&(o=""),t.selection.insertNode(t.create.inside.fromHTML('<a href="'+e+'" title="'+o+'">'+(o||e)+"</a>"));},r=null;return e&&(l.Dom.isTag(e,"a")||l.Dom.closest(e,"A",t.editor))&&(r=l.Dom.isTag(e,"a")?e:l.Dom.closest(e,"A",t.editor)),s(t,{filebrowser:function(t){t.files&&t.files.forEach((function(e){return n(t.baseurl+e)})),i();},upload:!0,url:function(t,e){r?(r.setAttribute("href",t),r.setAttribute("title",e)):n(t,e),i();}},r,i,!1)},tags:["a"],tooltip:"Insert file"},video:{popup:function(t,e,o,i){var n=t.create.fromHTML('<form class="jodit_form">\n\t\t\t\t\t<div class="jodit jodit_form_group">\n\t\t\t\t\t\t<input class="jodit_input" required name="code" placeholder="http://" type="url"/>\n\t\t\t\t\t\t<button class="jodit_button" type="submit">'+t.i18n("Insert")+"</button>\n\t\t\t\t\t</div>\n\t\t\t\t</form>"),r=t.create.fromHTML('<form class="jodit_form">\n\t\t\t\t\t\t\t\t\t<div class="jodit_form_group">\n\t\t\t\t\t\t\t\t\t\t<textarea class="jodit_textarea" required name="code" placeholder="'+t.i18n("Embed code")+'"></textarea>\n\t\t\t\t\t\t\t\t\t\t<button class="jodit_button" type="submit">'+t.i18n("Insert")+"</button>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</form>"),s={},l=t.selection.save(),u=function(e){t.selection.restore(l),t.selection.insertHTML(e),i();};return t.options.textIcons?(s[t.i18n("Link")]=n,s[t.i18n("Code")]=r):(s[d.ToolbarIcon.getIcon("link")+"&nbsp;"+t.i18n("Link")]=n,s[d.ToolbarIcon.getIcon("source")+"&nbsp;"+t.i18n("Code")]=r),r.addEventListener("submit",(function(t){return t.preventDefault(),c.trim(c.val(r,"textarea[name=code]"))?(u(c.val(r,"textarea[name=code]")),!1):(r.querySelector("textarea[name=code]").focus(),r.querySelector("textarea[name=code]").classList.add("jodit_error"),!1)})),n.addEventListener("submit",(function(t){return t.preventDefault(),c.isURL(c.val(n,"input[name=code]"))?(u(c.convertMediaURLToVideoEmbed(c.val(n,"input[name=code]"))),!1):(n.querySelector("input[name=code]").focus(),n.querySelector("input[name=code]").classList.add("jodit_error"),!1)})),a(t,s)},tags:["iframe"],tooltip:"Insert youtube/vimeo video"}},e.configFactory=function(t){return new e.OptionsDefault(t)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(7),r=function(t){function e(e){var o=t.call(this,e)||this;return o.destruct=o.destruct.bind(o,e),e.events.on("afterInit",o.afterInit.bind(o,e)).on("beforeDestruct",o.destruct),o}return i.__extends(e,t),e.prototype.init=function(t){},e.prototype.destruct=function(){var e,o;this.isDestructed||(this.setStatus(n.STATUSES.beforeDestruct),null===(o=null===(e=this.jodit)||void 0===e?void 0:e.events)||void 0===o||o.off("beforeDestruct",this.destruct),this.beforeDestruct(this.jodit),t.prototype.destruct.call(this));},e}(n.Component);e.Plugin=r;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(){}return t.get=function(e){return t.icons[e]||t.icons[e.replace(/-/g,"_")]||t.icons[e.toLowerCase()]},t.exists=function(t){return void 0!==this.get(t)},t.getIcon=function(t,e){return void 0===e&&(e="<span></span>"),this.get(t)||e},t.setIcon=function(t,e){this.icons[t.replace("_","-")]=e;},t.icons={},t}();e.ToolbarIcon=i;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(14);e.STATUSES={beforeInit:0,ready:1,beforeDestruct:2,destructed:3};var n=function(){function t(o){this.__componentStatus=e.STATUSES.beforeInit,o&&o instanceof t&&(this.jodit=o,i.isJoditObject(o)&&o.components.add(this));}return Object.defineProperty(t.prototype,"componentStatus",{get:function(){return this.__componentStatus},set:function(t){this.__componentStatus=t;},enumerable:!0,configurable:!0}),t.prototype.setStatus=function(t){this.__componentStatus=t;},Object.defineProperty(t.prototype,"isReady",{get:function(){return this.componentStatus===e.STATUSES.ready},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"isDestructed",{get:function(){return this.componentStatus===e.STATUSES.destructed},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"isInDestruct",{get:function(){return [e.STATUSES.beforeDestruct,e.STATUSES.destructed].includes(this.componentStatus)},enumerable:!0,configurable:!0}),t.prototype.destruct=function(){this.setStatus(e.STATUSES.beforeDestruct),i.isJoditObject(this.jodit)&&this.jodit.components.delete(this),this.jodit&&(this.jodit=void 0),this.setStatus(e.STATUSES.destructed);},t}();e.Component=n;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);i.__exportStar(o(49),e),i.__exportStar(o(50),e),i.__exportStar(o(51),e),i.__exportStar(o(101),e),i.__exportStar(o(102),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(2),n=o(11),r=1;e.$$=function(t,e){var o;if(!/:scope/.test(t)||!i.IS_IE||e&&e.nodeType===Node.DOCUMENT_NODE)o=e.querySelectorAll(t);else {var n=e.id,a=n||"_selector_id_"+(""+Math.random()).slice(2)+ ++r;t=t.replace(/:scope/g,"#"+a),!n&&e.setAttribute("id",a),o=e.parentNode.querySelectorAll(t),n||e.removeAttribute("id");}return [].slice.call(o)},e.getXPathByElement=function(t,o){if(!t||1!==t.nodeType)return "";if(!t.parentNode||o===t)return "";if(t.id)return "//*[@id='"+t.id+"']";var i=[].filter.call(t.parentNode.childNodes,(function(e){return e.nodeName===t.nodeName}));return e.getXPathByElement(t.parentNode,o)+"/"+t.nodeName.toLowerCase()+(i.length>1?"["+(Array.from(i).indexOf(t)+1)+"]":"")},e.refs=function(t){return e.$$("[ref]",t).reduce((function(t,e){var o=e.getAttribute("ref");return o&&n.isString(o)&&(t[o]=e),t}),{})};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(23),n=o(24),r=o(52),a=o(49),s=o(50);e.css=function(t,o,l,c){void 0===c&&(c=!1);var d=/^left|top|bottom|right|width|min|max|height|margin|padding|font-size/i;if(i.isPlainObject(o)||void 0!==l){var u=function(t,o,i){null!=i&&d.test(o)&&n.isNumeric(i.toString())&&(i=parseInt(i.toString(),10)+"px"),void 0!==i&&e.css(t,o,void 0,!0)!==r.normilizeCSSValue(o,i)&&(t.style[o]=i);};if(i.isPlainObject(o))for(var f=Object.keys(o),p=0;f.length>p;p+=1)u(t,a.camelCase(f[p]),o[f[p]]);else u(t,a.camelCase(o),l);return ""}var h=s.fromCamelCase(o),v=t.ownerDocument||document,m=!!v&&(v.defaultView||v.parentWindow),g=t.style[o],b="";return void 0!==g&&""!==g?b=g:m&&!c&&(b=m.getComputedStyle(t).getPropertyValue(h)),d.test(o)&&/^[\-+]?[0-9.]+px$/.test(b.toString())&&(b=parseInt(b.toString(),10)),r.normilizeCSSValue(o,b)},e.clearCenterAlign=function(t){"block"===e.css(t,"display")&&e.css(t,"display",""),"auto"===t.style.marginLeft&&"auto"===t.style.marginRight&&(t.style.marginLeft="",t.style.marginRight="");};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);i.__exportStar(o(90),e),i.__exportStar(o(45),e),i.__exportStar(o(91),e),i.__exportStar(o(92),e),i.__exportStar(o(93),e),i.__exportStar(o(94),e),i.__exportStar(o(14),e),i.__exportStar(o(95),e),i.__exportStar(o(24),e),i.__exportStar(o(23),e),i.__exportStar(o(96),e),i.__exportStar(o(46),e),i.__exportStar(o(47),e),i.__exportStar(o(44),e),i.__exportStar(o(97),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(15);e.Dialog=i.Dialog;var n=o(200);e.Alert=n.Alert;var r=o(73);e.Prompt=r.Prompt;var a=o(74);e.Confirm=a.Confirm;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(30),n=o(31),r=o(32),a=o(23);e.extend=function t(){for(var e=[],o=0;arguments.length>o;o++)e[o]=arguments[o];var s,l,c,d,u,f,p,h=e.length,v=e[0]||{},m=1,g=!1;for("boolean"==typeof v&&(g=v,v=e[m]||{},m+=1),"object"!=typeof v&&"function"===r.type(v)&&(v={}),m===h&&(v=this,m+=1);h>m;m+=1)if(null!=(s=e[m]))for(p=Object.keys(s),f=0;p.length>f;f+=1)c=v[l=p[f]],v!==(d=s[l])&&(g&&d&&(a.isPlainObject(d)&&!(d instanceof i.JoditObject)||Array.isArray(d)&&!(d instanceof n.JoditArray))?(u=Array.isArray(d)?c&&Array.isArray(c)?c:[]:c&&a.isPlainObject(c)?c:{},v[l]=t(g,u,d)):void 0!==d&&(v[l]=d));return v};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.isJoditObject=function(t){return !!(t&&t instanceof Object&&"function"==typeof t.constructor&&(t instanceof i.Jodit||t.isJodit))};var i=o(16);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(3),s=o(35),l=o(1);n.Config.prototype.dialog={extraButtons:[],resizable:!0,draggable:!0,buttons:["dialog.close"],removeButtons:[]},n.Config.prototype.controls.dialog={close:{icon:"cancel",exec:function(t){t.close();}},fullsize:{icon:"fullsize",getLabel:function(t,e,o){if(n.Config.prototype.controls.fullsize&&n.Config.prototype.controls.fullsize.getLabel&&"function"==typeof n.Config.prototype.controls.fullsize.getLabel)return n.Config.prototype.controls.fullsize.getLabel(t,e,o)},exec:function(t){t.toggleFullSize();}}};var c=function(t){function e(e,o){void 0===o&&(o=n.Config.prototype.dialog);var s=t.call(this,e,o)||this;s.offsetX=0,s.offsetY=0,s.destination=document.body,s.destroyAfterClose=!1,s.moved=!1,s.iSetMaximization=!1,s.resizable=!1,s.draggable=!1,s.startX=0,s.startY=0,s.startPoint={x:0,y:0,w:0,h:0},s.lockSelect=function(){s.container.classList.add("jodit_dialog_box-moved");},s.unlockSelect=function(){s.container.classList.remove("jodit_dialog_box-moved");},s.onMouseUp=function(){(s.draggable||s.resizable)&&(s.events.off(s.window,"mousemove",s.onMouseMove),s.draggable=!1,s.resizable=!1,s.unlockSelect(),s.jodit&&s.jodit.events&&s.jodit.events.fire(s,"endResize endMove"));},s.onHeaderMouseDown=function(t){var e=t.target;!s.options.draggable||e&&e.nodeName.match(/^(INPUT|SELECT)$/)||(s.draggable=!0,s.startX=t.clientX,s.startY=t.clientY,s.startPoint.x=a.css(s.dialog,"left"),s.startPoint.y=a.css(s.dialog,"top"),s.setMaxZIndex(),t.preventDefault(),s.lockSelect(),s.events.on(s.window,"mousemove",s.onMouseMove),s.jodit&&s.jodit.events&&s.jodit.events.fire(s,"startMove"));},s.onMouseMove=function(t){s.draggable&&s.options.draggable&&(s.setPosition(s.startPoint.x+t.clientX-s.startX,s.startPoint.y+t.clientY-s.startY),s.jodit&&s.jodit.events&&s.jodit.events.fire(s,"move",t.clientX-s.startX,t.clientY-s.startY),t.stopImmediatePropagation(),t.preventDefault()),s.resizable&&s.options.resizable&&(s.setSize(s.startPoint.w+t.clientX-s.startX,s.startPoint.h+t.clientY-s.startY),s.jodit&&s.jodit.events&&s.jodit.events.fire(s,"resizeDialog",t.clientX-s.startX,t.clientY-s.startY),t.stopImmediatePropagation(),t.preventDefault());},s.onKeyDown=function(t){if(s.isOpened()&&t.which===r.KEY_ESC){var e=s.getMaxZIndexDialog();e?e.close():s.close(),t.stopImmediatePropagation();}},s.onResize=function(){s.options&&s.options.resizable&&!s.moved&&s.isOpened()&&!s.offsetX&&!s.offsetY&&s.setPosition();},s.document=document,s.window=window,s.close=function(t){var e,o,i,n;s.isDestructed||(t&&(t.stopImmediatePropagation(),t.preventDefault()),s.jodit&&s.jodit.events&&s.jodit.events.fire("beforeClose",s),s.container&&s.container.classList&&s.container.classList.remove("active"),s.iSetMaximization&&s.maximization(!1),s.destroyAfterClose&&s.destruct(),null===(o=null===(e=s.jodit)||void 0===e?void 0:e.events)||void 0===o||o.fire(s,"afterClose"),null===(n=null===(i=s.jodit)||void 0===i?void 0:i.events)||void 0===n||n.fire(s.ownerWindow,"jodit_close_dialog"));},a.isJoditObject(e)&&(s.window=e.ownerWindow,s.document=e.ownerDocument,e.events.on("beforeDestruct",(function(){s.destruct();})));var c=s;c.options=i.__assign(i.__assign({},e&&e.options?e.options.dialog:n.Config.prototype.dialog),c.options),l.Dom.safeRemove(c.container),c.container=s.create.fromHTML('<div style="z-index:'+c.options.zIndex+'" class="jodit jodit_dialog_box"><div class="jodit_dialog_overlay"></div><div class="jodit_dialog"><div class="jodit_dialog_header non-selected"><div class="jodit_dialog_header-title"></div><div class="jodit_dialog_header-toolbar"></div></div><div class="jodit_dialog_content"></div><div class="jodit_dialog_footer"></div>'+(c.options.resizable?'<div class="jodit_dialog_resizer"></div>':"")+"</div></div>"),e&&e.options.theme&&c.container.classList.add("jodit_"+(e.options.theme||"default")+"_theme"),e&&e.id&&e.markOwner(c.container),Object.defineProperty(c.container,"__jodit_dialog",{value:c}),c.dialog=c.container.querySelector(".jodit_dialog"),c.resizer=c.container.querySelector(".jodit_dialog_resizer"),c.jodit&&c.jodit.options&&c.jodit.options.textIcons&&c.container.classList.add("jodit_text_icons"),c.dialogbox_header=c.container.querySelector(".jodit_dialog_header>.jodit_dialog_header-title"),c.dialogbox_content=c.container.querySelector(".jodit_dialog_content"),c.dialogbox_footer=c.container.querySelector(".jodit_dialog_footer"),c.dialogbox_toolbar=c.container.querySelector(".jodit_dialog_header>.jodit_dialog_header-toolbar"),c.destination.appendChild(c.container),c.container.addEventListener("close_dialog",c.close),c.toolbar.build(c.options.buttons,c.dialogbox_toolbar),c.events.on(s.window,"mouseup",c.onMouseUp).on(s.window,"keydown",c.onKeyDown).on(s.window,"resize",c.onResize);var u=c.container.querySelector(".jodit_dialog_header");return u&&u.addEventListener("mousedown",c.onHeaderMouseDown.bind(c)),c.options.resizable&&c.resizer.addEventListener("mousedown",c.onResizerMouseDown.bind(c)),d.fullsize(c),s}return i.__extends(e,t),e.prototype.setElements=function(t,e){var o=this,i=[];a.asArray(e).forEach((function(e){if(Array.isArray(e)){var n=o.create.div("jodit_dialog_column");return i.push(n),t.appendChild(n),o.setElements(n,e)}var r="string"==typeof e?o.create.fromHTML(e):e;i.push(r),r.parentNode!==t&&t.appendChild(r);})),Array.from(t.childNodes).forEach((function(e){-1===i.indexOf(e)&&t.removeChild(e);}));},e.prototype.onResizerMouseDown=function(t){this.resizable=!0,this.startX=t.clientX,this.startY=t.clientY,this.startPoint.w=this.dialog.offsetWidth,this.startPoint.h=this.dialog.offsetHeight,this.lockSelect(),this.jodit.events&&this.jodit.events.fire(this,"startResize");},e.prototype.setSize=function(t,e){t&&a.css(this.dialog,"width",t),e&&a.css(this.dialog,"height",e);},e.prototype.setPosition=function(t,e){var o=this.window.innerWidth/2-this.dialog.offsetWidth/2,i=this.window.innerHeight/2-this.dialog.offsetHeight/2;0>o&&(o=0),0>i&&(i=0),void 0!==t&&void 0!==e&&(this.offsetX=t,this.offsetY=e,this.moved=Math.abs(t-o)>100||Math.abs(e-i)>100),this.dialog.style.left=(t||o)+"px",this.dialog.style.top=(e||i)+"px";},e.prototype.setTitle=function(t){this.setElements(this.dialogbox_header,t);},e.prototype.setContent=function(t){this.setElements(this.dialogbox_content,t);},e.prototype.setFooter=function(t){this.setElements(this.dialogbox_footer,t),this.dialog.classList.toggle("with_footer",!!t);},e.prototype.getZIndex=function(){return parseInt(this.container.style.zIndex||"0",10)},e.prototype.getMaxZIndexDialog=function(){var t,e,o=0,i=this;return a.$$(".jodit_dialog_box",this.destination).forEach((function(n){t=n.__jodit_dialog,e=parseInt(a.css(n,"zIndex"),10),t.isOpened()&&!isNaN(e)&&e>o&&(i=t,o=e);})),i},e.prototype.setMaxZIndex=function(){var t=0,e=0;a.$$(".jodit_dialog_box",this.destination).forEach((function(o){e=parseInt(a.css(o,"zIndex"),10),t=Math.max(isNaN(e)?0:e,t);})),this.container.style.zIndex=(t+1).toString();},e.prototype.maximization=function(t){return "boolean"!=typeof t&&(t=!this.container.classList.contains("jodit_dialog_box-fullsize")),this.container.classList.toggle("jodit_dialog_box-fullsize",t),[this.destination,this.destination.parentNode].forEach((function(e){e&&e.classList&&e.classList.toggle("jodit_fullsize_box",t);})),this.iSetMaximization=t,t},e.prototype.open=function(t,e,o,i){this.jodit&&this.jodit.events&&!1===this.jodit.events.fire(this,"beforeOpen")||(this.destroyAfterClose=!0===o,void 0!==e&&this.setTitle(e),t&&this.setContent(t),this.container.classList.add("active"),i&&this.container.classList.add("jodit_modal"),this.setPosition(this.offsetX,this.offsetY),this.setMaxZIndex(),this.options.fullsize&&this.maximization(!0),this.jodit&&this.jodit.events&&this.jodit.events.fire("afterOpen",this));},e.prototype.isOpened=function(){return !this.isDestructed&&this.container&&this.container.classList.contains("active")},e.prototype.destruct=function(){this.isInDestruct||(this.setStatus(u.STATUSES.beforeDestruct),this.events&&this.events.off(this.window,"mousemove",this.onMouseMove).off(this.window,"mouseup",this.onMouseUp).off(this.window,"keydown",this.onKeyDown).off(this.window,"resize",this.onResize),t.prototype.destruct.call(this));},e}(s.ViewWithToolbar);e.Dialog=c;var d=o(67),u=o(7);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(1),s=o(3),l=o(31),c=o(30),d=o(57),u=o(60),f=o(126),p=o(26),h=o(35),v=o(66),m=o(7),g=o(2),Jodit=function(t){function Jodit(e,o){var i,n=t.call(this,void 0,o)||this;n.getEditorText=s.markDeprecated((function(){return n.text}),["getEditorText","text"]),n.__defaultStyleDisplayKey="data-jodit-default-style-display",n.__defaultClassesKey="data-jodit-default-classes",n.commands={},n.__selectionLocked=null,n.__wasReadOnly=!1,n.storage=p.Storage.makeStorage(!0,n.id),n.editorIsActive=!1,n.__mode=r.MODE_WYSIWYG,n.__callChangeCount=0,n.elementToPlace=new Map;try{n.resolveElement(e);}catch(t){throw n.destruct(),t}n.setStatus(m.STATUSES.beforeInit),(null===(i=n.options)||void 0===i?void 0:i.events)&&Object.keys(n.options.events).forEach((function(t){return n.events.on(t,n.options.events[t])})),n.events.on(n.ownerWindow,"resize",(function(){n.events&&n.events.fire("resize");})),n.selection=new u.Select(n),n.initPlugins(),n.events.on("changePlace",(function(){n.setReadOnly(n.options.readonly),n.setDisabled(n.options.disabled);})),n.places.length=0;var a=n.addPlace(e,o);Jodit.instances[n.id]=n;var l=function(){n.events&&n.events.fire("afterInit",n),n.afterInitHook(),n.setStatus(m.STATUSES.ready),n.events.fire("afterConstructor",n);};return s.isPromise(a)?a.finally(l):l(),n}return i.__extends(Jodit,t),Object.defineProperty(Jodit.prototype,"isJodit",{get:function(){return !0},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"text",{get:function(){if(this.editor)return this.editor.innerText||"";var t=this.create.inside.div();return t.innerHTML=this.getElementValue(),t.innerText||""},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"value",{get:function(){return this.getEditorValue()},set:function(t){this.setEditorValue(t);},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"defaultTimeout",{get:function(){return this.options&&this.options.observer?this.options.observer.timeout:Jodit.defaultOptions.observer.timeout},enumerable:!0,configurable:!0}),Jodit.Array=function(t){return new l.JoditArray(t)},Jodit.Object=function(t){return new c.JoditObject(t)},Jodit.fireEach=function(t){for(var e=[],o=1;arguments.length>o;o++)e[o-1]=arguments[o];Object.keys(Jodit.instances).forEach((function(o){var n,r=Jodit.instances[o];!r.isDestructed&&r.events&&(n=r.events).fire.apply(n,i.__spreadArrays([t],e));}));},Jodit.make=function(t,e){return new Jodit(t,e)},Jodit.prototype.setPlaceField=function(t,e){this.currentPlace||(this.currentPlace={},this.places=[this.currentPlace]),this.currentPlace[t]=e;},Object.defineProperty(Jodit.prototype,"element",{get:function(){return this.currentPlace.element},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"editor",{get:function(){return this.currentPlace.editor},set:function(t){this.setPlaceField("editor",t);},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"container",{get:function(){return this.currentPlace.container},set:function(t){this.setPlaceField("container",t);},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"workplace",{get:function(){return this.currentPlace.workplace},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"statusbar",{get:function(){return this.currentPlace.statusbar},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"iframe",{get:function(){return this.currentPlace.iframe},set:function(t){this.setPlaceField("iframe",t);},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"observer",{get:function(){return this.currentPlace.observer},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"editorWindow",{get:function(){return this.currentPlace.editorWindow},set:function(t){this.setPlaceField("editorWindow",t);},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"editorDocument",{get:function(){return this.currentPlace.editorWindow.document},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"options",{get:function(){return this.currentPlace.options},set:function(t){this.setPlaceField("options",t);},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"uploader",{get:function(){return this.getInstance("Uploader")},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"filebrowser",{get:function(){return this.getInstance("FileBrowser")},enumerable:!0,configurable:!0}),Object.defineProperty(Jodit.prototype,"mode",{get:function(){return this.__mode},set:function(t){this.setMode(t);},enumerable:!0,configurable:!0}),Jodit.prototype.getNativeEditorValue=function(){var t;return t=this.events.fire("beforeGetNativeEditorValue"),s.isString(t)?t:this.editor?this.editor.innerHTML:this.getElementValue()},Jodit.prototype.setNativeEditorValue=function(t){this.events.fire("beforeSetNativeEditorValue",t)||this.editor&&(this.editor.innerHTML=t);},Jodit.prototype.getEditorValue=function(t){var e;if(void 0===t&&(t=!0),void 0!==(e=this.events.fire("beforeGetValueFromEditor")))return e;e=this.getNativeEditorValue().replace(r.INVISIBLE_SPACE_REG_EXP,""),t&&(e=e.replace(/<span[^>]+id="jodit_selection_marker_[^>]+><\/span>/g,"")),"<br>"===e&&(e="");var o={value:e};return this.events.fire("afterGetValueFromEditor",o),o.value},Jodit.prototype.setEditorValue=function(t){var e=this.events.fire("beforeSetValueToEditor",t);if(!1!==e)if("string"==typeof e&&(t=e),this.editor){if("string"!=typeof t&&void 0!==t)throw s.error("value must be string");void 0!==t&&this.getNativeEditorValue()!==t&&this.setNativeEditorValue(t);var o=this.getElementValue(),i=this.getEditorValue();if(o!==i&&10>this.__callChangeCount){this.setElementValue(i),this.__callChangeCount+=1;try{this.events.fire("change",i,o),this.events.fire(this.observer,"change",i,o);}finally{this.__callChangeCount=0;}}}else void 0!==t&&this.setElementValue(t);},Jodit.prototype.getElementValue=function(){return void 0!==this.element.value?this.element.value:this.element.innerHTML},Jodit.prototype.setElementValue=function(t){if(!s.isString(t)&&void 0!==t)throw s.error("value must be string");void 0!==t?this.element!==this.container&&(void 0!==this.element.value?this.element.value=t:this.element.innerHTML=t):t=this.getElementValue(),t!==this.getEditorValue()&&this.setEditorValue(t);},Jodit.prototype.registerCommand=function(t,e){var o=t.toLowerCase();if(void 0===this.commands[o]&&(this.commands[o]=[]),this.commands[o].push(e),"function"!=typeof e){var i=this.options.commandToHotkeys[o]||this.options.commandToHotkeys[t]||e.hotkeys;i&&this.registerHotkeyToCommand(i,o);}return this},Jodit.prototype.registerHotkeyToCommand=function(t,e){var o=this,i=s.asArray(t).map(s.normalizeKeyAliases).map((function(t){return t+".hotkey"})).join(" ");this.events.off(i).on(i,(function(){return o.execCommand(e)}));},Jodit.prototype.execCommand=function(t,e,o){if(void 0===e&&(e=!1),void 0===o&&(o=null),!this.options.readonly||"selectall"===t){var i;if(t=t.toLowerCase(),!1!==(i=this.events.fire("beforeCommand",t,e,o))&&(i=this.execCustomCommands(t,e,o)),!1!==i)if(this.selection.focus(),"selectall"===t)this.selection.select(this.editor,!0);else try{i=this.editorDocument.execCommand(t,e,o);}catch(t){}return this.events.fire("afterCommand",t,e,o),this.setEditorValue(),i}},Jodit.prototype.execCustomCommands=function(t,e,o){var i,n;if(void 0===e&&(e=!1),void 0===o&&(o=null),t=t.toLowerCase(),void 0!==this.commands[t]){for(var r,a=0;this.commands[t].length>a;a+=1)void 0!==(n=("function"==typeof(i=this.commands[t][a])?i:i.exec).call(this,t,e,o))&&(r=n);return r}},Jodit.prototype.lock=function(e){return void 0===e&&(e="any"),!!t.prototype.lock.call(this,e)&&(this.__selectionLocked=this.selection.save(),this.editor.classList.add("jodit_disabled"),!0)},Jodit.prototype.unlock=function(){return !!t.prototype.unlock.call(this)&&(this.editor.classList.remove("jodit_disabled"),this.__selectionLocked&&this.selection.restore(this.__selectionLocked),!0)},Jodit.prototype.getMode=function(){return this.mode},Jodit.prototype.isEditorMode=function(){return this.getRealMode()===r.MODE_WYSIWYG},Jodit.prototype.getRealMode=function(){if(this.getMode()!==r.MODE_SPLIT)return this.getMode();var t=this.ownerDocument.activeElement;return t&&(a.Dom.isOrContains(this.editor,t)||a.Dom.isOrContains(this.toolbar.container,t))?r.MODE_WYSIWYG:r.MODE_SOURCE},Jodit.prototype.setMode=function(t){var e=this,o=this.getMode(),i={mode:parseInt(t.toString(),10)},n=["jodit_wysiwyg_mode","jodit_source_mode","jodit_split_mode"];!1!==this.events.fire("beforeSetMode",i)&&(this.__mode=s.inArray(i.mode,[r.MODE_SOURCE,r.MODE_WYSIWYG,r.MODE_SPLIT])?i.mode:r.MODE_WYSIWYG,this.options.saveModeInStorage&&this.storage.set("jodit_default_mode",this.mode),n.forEach((function(t){e.container.classList.remove(t);})),this.container.classList.add(n[this.mode-1]),o!==this.getMode()&&this.events.fire("afterSetMode"));},Jodit.prototype.toggleMode=function(){var t=this.getMode();s.inArray(t+1,[r.MODE_SOURCE,r.MODE_WYSIWYG,this.options.useSplitMode?r.MODE_SPLIT:9])?t+=1:t=r.MODE_WYSIWYG,this.setMode(t);},Jodit.prototype.setDisabled=function(t){this.options.disabled=t;var e=this.__wasReadOnly;this.setReadOnly(t||e),this.__wasReadOnly=e,this.editor&&(this.editor.setAttribute("aria-disabled",t.toString()),this.container.classList.toggle("jodit_disabled",t),this.events.fire("disabled",t));},Jodit.prototype.getDisabled=function(){return this.options.disabled},Jodit.prototype.setReadOnly=function(t){this.__wasReadOnly!==t&&(this.__wasReadOnly=t,this.options.readonly=t,t?this.editor&&this.editor.removeAttribute("contenteditable"):this.editor&&this.editor.setAttribute("contenteditable","true"),this.events&&this.events.fire("readonly",t));},Jodit.prototype.getReadOnly=function(){return this.options.readonly},Jodit.prototype.beforeInitHook=function(){},Jodit.prototype.afterInitHook=function(){},Jodit.prototype.initOptions=function(t){this.options=n.configFactory(t);},Jodit.prototype.initOwners=function(){this.editorWindow=this.options.ownerWindow,this.ownerDocument=this.options.ownerDocument,this.ownerWindow=this.options.ownerWindow;},Jodit.prototype.addPlace=function(t,e){var o=this,i=this.resolveElement(t);this.isReady||(this.id=i.getAttribute("id")||(new Date).getTime().toString(),Jodit.instances[this.id]=this),i.attributes&&Array.from(i.attributes).forEach((function(t){var i=t.name,n=t.value;void 0===Jodit.defaultOptions[i]||e&&void 0!==e[i]||(-1!==["readonly","disabled"].indexOf(i)&&(n=""===n||"true"===n),/^[0-9]+(\.)?([0-9]+)?$/.test(n.toString())&&(n=Number(n)),o.options[i]=n);}));var r=this.create.div("jodit_container");r.classList.add("jodit_container"),r.classList.add("jodit_"+(this.options.theme||"default")+"_theme"),r.setAttribute("contenteditable","false");var a=null;this.options.inline&&(-1===["TEXTAREA","INPUT"].indexOf(i.nodeName)&&(r=i,i.setAttribute(this.__defaultClassesKey,i.className.toString()),a=r.innerHTML,r.innerHTML=""),r.classList.add("jodit_inline"),r.classList.add("jodit_container")),i!==r&&(i.style.display&&i.setAttribute(this.__defaultStyleDisplayKey,i.style.display),i.style.display="none");var l=this.create.div("jodit_workplace",{contenteditable:!1});r.appendChild(l);var c=new f.StatusBar(this,r);i.parentNode&&i!==r&&i.parentNode.insertBefore(r,i);var u=this.create.div("jodit_wysiwyg",{contenteditable:!0,"aria-disabled":!1,tabindex:this.options.tabIndex});l.appendChild(u);var p={editor:u,element:i,container:r,workplace:l,statusbar:c,options:this.isReady?n.configFactory(e):this.options,observer:new d.Observer(this),editorWindow:this.ownerWindow};this.elementToPlace.set(u,p),this.setCurrentPlace(p),this.places.push(p),this.setNativeEditorValue(this.getElementValue());var h=this.initEditor(a),v=this.options,m=function(){v.enableDragAndDropFileToEditor&&v.uploader&&(v.uploader.url||v.uploader.insertImageAsBase64URI)&&o.uploader.bind(o.editor),o.elementToPlace.get(o.editor)||o.elementToPlace.set(o.editor,p),o.events.fire("afterAddPlace",p);};if(s.isPromise(h))return h.then(m);m();},Jodit.prototype.setCurrentPlace=function(t){this.currentPlace!==t&&(this.isEditorMode()||this.setMode(g.MODE_WYSIWYG),this.currentPlace=t,this.buildToolbar(t.container),this.isReady&&this.events.fire("changePlace",t));},Jodit.prototype.initPlugins=function(){this.beforeInitHook(),this.events.fire("beforeInit",this);try{Jodit.plugins.init(this);}catch(t){}},Jodit.prototype.initEditor=function(t){var e=this,o=this.createEditor(),i=function(){if(!e.isInDestruct){e.element!==e.container?e.setElementValue():null!==t&&e.setEditorValue(t);var o=e.options.defaultMode;if(e.options.saveModeInStorage){var i=e.storage.get("jodit_default_mode");"string"==typeof i&&(o=parseInt(i,10));}e.setMode(o),e.options.readonly&&(e.__wasReadOnly=!1,e.setReadOnly(!0)),e.options.disabled&&e.setDisabled(!0);try{e.editorDocument.execCommand("defaultParagraphSeparator",!1,e.options.enter.toLowerCase());}catch(t){}try{e.editorDocument.execCommand("enableObjectResizing",!1,"false");}catch(t){}try{e.editorDocument.execCommand("enableInlineTableEditing",!1,"false");}catch(t){}}};if(s.isPromise(o))return o.then(i);i();},Jodit.prototype.createEditor=function(){var t=this,e=this.editor,o=this.events.fire("createEditor",this),i=function(){if(!t.isInDestruct){(!1===o||s.isPromise(o))&&a.Dom.safeRemove(e),t.options.editorCssClass&&t.editor.classList.add(t.options.editorCssClass),t.options.style&&s.css(t.editor,t.options.style);var i=t.editor;if(t.events.on("synchro",(function(){t.setEditorValue();})).on("focus",(function(){t.editorIsActive=!0;})).on("blur",(function(){return t.editorIsActive=!1})).on(i,"mousedown touchstart focus",(function(){var e=t.elementToPlace.get(i);e&&t.setCurrentPlace(e);})).on(i,"selectionchange selectionstart keydown keyup keypress dblclick mousedown mouseup click copy cut dragstart drop dragover paste resize touchstart touchend focus blur",(function(e){if(!t.options.readonly&&t.events&&t.events.fire){if(!1===t.events.fire(e.type,e))return !1;t.setEditorValue();}})),t.options.spellcheck&&t.editor.setAttribute("spellcheck","true"),t.options.direction){var n="rtl"===t.options.direction.toLowerCase()?"rtl":"ltr";t.editor.style.direction=n,t.container.style.direction=n,t.editor.setAttribute("dir",n),t.container.setAttribute("dir",n),t.toolbar.setDirection(n);}t.options.triggerChangeEvent&&t.events.on("change",t.async.debounce((function(){t.events&&t.events.fire(t.element,"change");}),t.defaultTimeout));}};if(s.isPromise(o))return o.then(i);i();},Jodit.prototype.destruct=function(){var e=this;if(!this.isInDestruct&&(this.setStatus(m.STATUSES.beforeDestruct),this.async.clear(),this.elementToPlace.clear(),!1!==this.events.fire("beforeDestruct")&&this.editor)){var o=this.getEditorValue();this.storage.clear(),delete this.storage,this.buffer.clear(),delete this.buffer,this.commands={},delete this.selection,this.__selectionLocked=null,this.events.off(this.ownerWindow,"resize"),this.events.off(this.ownerWindow),this.events.off(this.ownerDocument),this.events.off(this.ownerDocument.body),this.components.forEach((function(t){s.isDestructable(t)&&!t.isInDestruct&&t.destruct();})),this.components.clear(),this.places.forEach((function(t){var i=t.container,n=t.workplace,r=t.statusbar,s=t.element,l=t.iframe,c=t.editor,d=t.observer;if(s!==i)if(s.hasAttribute(e.__defaultStyleDisplayKey)){var u=s.getAttribute(e.__defaultStyleDisplayKey);u&&(s.style.display=u,s.removeAttribute(e.__defaultStyleDisplayKey));}else s.style.display="";else s.hasAttribute(e.__defaultClassesKey)&&(s.className=s.getAttribute(e.__defaultClassesKey)||"",s.removeAttribute(e.__defaultClassesKey));s.hasAttribute("style")&&!s.getAttribute("style")&&s.removeAttribute("style"),!r.isInDestruct&&r.destruct(),e.events.off(i),e.events.off(s),e.events.off(c),a.Dom.safeRemove(n),a.Dom.safeRemove(c),i!==s&&a.Dom.safeRemove(i),a.Dom.safeRemove(l),i===s&&(s.innerHTML=o),!d.isInDestruct&&d.destruct();})),this.places.length=0,this.currentPlace={},delete Jodit.instances[this.id],t.prototype.destruct.call(this);}},Jodit.plugins=new v.PluginSystem,Jodit.modules={},Jodit.instances={},Jodit.lang={},Jodit}(h.ViewWithToolbar);e.Jodit=Jodit;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i,n=o(1),r=o(3),a=o(6);(i=e.Widget||(e.Widget={})).ColorPickerWidget=function(t,e,o){var i=r.normalizeColor(o),s=t.create.div("jodit_colorpicker"),l=t.options.textIcons?"":a.ToolbarIcon.getIcon("eye"),c=t.options.textIcons?"<span>"+t.i18n("eraser")+"</span>":a.ToolbarIcon.getIcon("eraser"),d=t.options.textIcons?"<span>"+t.i18n("palette")+"</span>":a.ToolbarIcon.getIcon("palette"),u=function(t,e){t.innerHTML=a.ToolbarIcon.getIcon("eye"),t.classList.add("active");var o=r.hexToRgb(e);o&&(t.firstChild.style.fill="rgb("+(255-o.r)+","+(255-o.g)+","+(255-o.b)+")");},f=function(t){var e=[];return r.isPlainObject(t)?Object.keys(t).forEach((function(o){e.push('<div class="jodit_colorpicker_group jodit_colorpicker_group-'+o+'">'),e.push(f(t[o])),e.push("</div>");})):Array.isArray(t)&&t.forEach((function(t){e.push("<a "+(i===t?' class="active" ':"")+' title="'+t+'" style="background-color:'+t+'" data-color="'+t+'" href="javascript:void(0)">'+(i===t?l:"")+"</a>");})),e.join("")};return s.appendChild(t.create.fromHTML("<div>"+f(t.options.colors)+"</div>")),s.appendChild(t.create.fromHTML("<a "+(t.options.textIcons?'class="jodit_text_icon"':"")+' data-color="" href="javascript:void(0)">'+c+"</a>")),t.options.showBrowserColorPicker&&r.hasBrowserColorPicker()&&(s.appendChild(t.create.fromHTML("<span><em "+(t.options.textIcons?'class="jodit_text_icon"':"")+">"+d+'</em><input type="color" value=""/></span>')),t.events.on(s,"change",(function(t){t.stopPropagation();var o=t.target;if(o&&o.tagName&&"INPUT"===o.tagName.toUpperCase()){var i=o.value||"";i&&u(o,i),e&&"function"==typeof e&&e(i),t.preventDefault();}}))),t.events.on(s,"mousedown touchend",(function(o){o.stopPropagation();var i=o.target;if(i&&i.tagName&&"SVG"!==i.tagName.toUpperCase()&&"PATH"!==i.tagName.toUpperCase()||!i.parentNode||(i=n.Dom.closest(i.parentNode,"A",t.editor)),"A"===i.tagName.toUpperCase()){var r=s.querySelector("a.active");r&&(r.classList.remove("active"),r.innerHTML="");var a=i.getAttribute("data-color")||"";a&&u(i,a),e&&"function"==typeof e&&e(a),o.preventDefault();}})),s},i.TabsWidget=function(t,e,o){var i=t.create.div("jodit_tabs"),n=t.create.div("jodit_tabs_wrapper"),a=t.create.div("jodit_tabs_buttons"),s={},l="",c=0;return i.appendChild(a),i.appendChild(n),r.each(e,(function(e,i){var d=t.create.div("jodit_tab"),u=t.create.element("a",{href:"javascript:void(0);"});l||(l=e.toString()),u.innerHTML=/<svg/.test(e.toString())?e:t.i18n(e.toString()),a.appendChild(u),d.appendChild("function"!=typeof i?i:t.create.div("jodit_tab_empty")),n.appendChild(d),t.events.on(u,"mousedown touchend",(function(s){return r.$$("a",a).forEach((function(t){t.classList.remove("active");})),r.$$(".jodit_tab",n).forEach((function(t){t.classList.remove("active");})),u.classList.add("active"),d.classList.add("active"),"function"==typeof i&&i.call(t),s.stopPropagation(),o&&(o.__activeTab=e.toString()),!1})),s[e]={button:u,tab:d},c+=1;})),c?(r.$$("a",a).forEach((function(t){t.style.width=(100/c).toFixed(10)+"%";})),o&&o.__activeTab&&s[o.__activeTab]?(s[o.__activeTab].button.classList.add("active"),s[o.__activeTab].tab.classList.add("active")):(s[l].button.classList.add("active"),s[l].tab.classList.add("active")),i):i},i.FileSelectorWidget=function(t,e,o,s,l){var c;void 0===l&&(l=!0);var d={};if(e.upload&&t.options.uploader&&(t.options.uploader.url||t.options.uploader.insertImageAsBase64URI)){var u=t.create.fromHTML('<div class="jodit_draganddrop_file_box"><strong>'+t.i18n(l?"Drop image":"Drop file")+"</strong><span><br>"+t.i18n("or click")+'</span><input type="file" accept="'+(l?"image/*":"*")+'" tabindex="-1" dir="auto" multiple=""/></div>');t.getInstance("Uploader").bind(u,(function(o){var i=r.isFunction(e.upload)?e.upload:t.options.uploader.defaultHandlerSuccess;"function"==typeof i&&i.call(t,o);}),(function(e){t.events.fire("errorMessage",e.message);})),d[(t.options.textIcons?"":a.ToolbarIcon.getIcon("upload"))+t.i18n("Upload")]=u;}if(e.filebrowser&&(t.options.filebrowser.ajax.url||t.options.filebrowser.items.url)&&(d[(t.options.textIcons?"":a.ToolbarIcon.getIcon("folder"))+t.i18n("Browse")]=function(){s&&s(),e.filebrowser&&t.getInstance("FileBrowser").open(e.filebrowser,l);}),e.url){var f=t.create.fromHTML('<form onsubmit="return false;" class="jodit_form">\n\t\t\t\t\t\t<div class="jodit_form_group">\n\t\t\t\t\t\t\t<input class="jodit_input" type="text" required name="url" placeholder="http://"/>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="jodit_form_group">\n\t\t\t\t\t\t\t<input class="jodit_input" type="text" name="text" placeholder="'+t.i18n("Alternative text")+'"/>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div style="text-align: right"><button class="jodit_button">'+t.i18n("Insert")+"</button></div>\n\t\t\t\t\t</form>"),p=f.querySelector("button"),h=f.querySelector("input[name=url]");c=null,o&&!n.Dom.isText(o)&&(n.Dom.isTag(o,"img")||r.$$("img",o).length)&&(c="IMG"===o.tagName?o:r.$$("img",o)[0],r.val(f,"input[name=url]",c.getAttribute("src")),r.val(f,"input[name=text]",c.getAttribute("alt")),p.textContent=t.i18n("Update")),o&&n.Dom.isTag(o,"a")&&(r.val(f,"input[name=url]",o.getAttribute("href")||""),r.val(f,"input[name=text]",o.getAttribute("title")||""),p.textContent=t.i18n("Update")),f.addEventListener("submit",(function(o){return o.preventDefault(),o.stopPropagation(),r.val(f,"input[name=url]")?("function"==typeof e.url&&e.url.call(t,r.val(f,"input[name=url]"),r.val(f,"input[name=text]")),!1):(h.focus(),h.classList.add("jodit_error"),!1)}),!1),d[(t.options.textIcons?"":a.ToolbarIcon.getIcon("link"))+" URL"]=f;}return i.TabsWidget(t,d)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);i.__exportStar(o(106),e),i.__exportStar(o(107),e),i.__exportStar(o(108),e),i.__exportStar(o(109),e),i.__exportStar(o(110),e),i.__exportStar(o(111),e),i.__exportStar(o(112),e),i.__exportStar(o(52),e),i.__exportStar(o(113),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);i.__exportStar(o(114),e),i.__exportStar(o(115),e),i.__exportStar(o(116),e),i.__exportStar(o(117),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(36),r=o(1),a=o(10),s=o(2),l=o(14),c=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.checkActiveStatus=function(t,o){var i=0,n=0;return Object.keys(t).forEach((function(r){var s=t[r];"function"==typeof s?s(e.jodit,a.css(o,r).toString())&&(i+=1):-1!==s.indexOf(a.css(o,r).toString())&&(i+=1),n+=1;})),n===i},e}return i.__extends(e,t),e.prototype.buttonIsActive=function(e){var o=this,i=t.prototype.buttonIsActive.call(this,e);if(void 0!==i)return i;var n,a,s=!!this.jodit.selection&&this.jodit.selection.current();return !(!s||!((e.control.tags||e.control.options&&e.control.options.tags)&&(n=e.control.tags||e.control.options&&e.control.options.tags,r.Dom.up(s,(function(t){if(t&&-1!==n.indexOf(t.nodeName.toLowerCase()))return !0}),this.jodit.editor))||(e.control.css||e.control.options&&e.control.options.css)&&(a=e.control.css||e.control.options&&e.control.options.css,r.Dom.up(s,(function(t){if(t&&!r.Dom.isText(t))return o.checkActiveStatus(a,t)}),this.jodit.editor))))},e.prototype.buttonIsDisabled=function(e){var o=t.prototype.buttonIsDisabled.call(this,e);if(void 0!==o)return o;var i=void 0===e.control||void 0===e.control.mode?s.MODE_WYSIWYG:e.control.mode;return !(i===s.MODE_SPLIT||i===this.jodit.getRealMode())},e.prototype.getTarget=function(t){return t.target||this.jodit.selection.current()||void 0},e.makeCollection=function(t){var o=l.isJoditObject(t)?new e(t):new n.ToolbarCollection(t);return t.options.textIcons&&o.container.classList.add("jodit_text_icons"),o},e}(n.ToolbarCollection);e.JoditToolbarCollection=c;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(38);e.Ajax=i.Ajax;var n=o(63);e.EventsNative=n.EventsNative;var r=o(7);e.Component=r.Component;var a=o(39);e.ContextMenu=a.ContextMenu;var s=o(12);e.Alert=s.Alert,e.Confirm=s.Confirm,e.Prompt=s.Prompt,e.Dialog=s.Dialog;var l=o(1);e.Dom=l.Dom;var c=o(5);e.Plugin=c.Plugin;var d=o(64);e.Create=d.Create;var u=o(201);e.FileBrowser=u.FileBrowser;var f=o(3);e.Helpers=f;var p=o(207);e.ImageEditor=p.ImageEditor;var h=o(57);e.Observer=h.Observer;var v=o(65);e.ProgressBar=v.ProgressBar;var m=o(60);e.Select=m.Select;var g=o(26);e.Storage=g.Storage;var b=o(58);e.Snapshot=b.Snapshot;var y=o(29);e.Table=y.Table;var _=o(6);e.ToolbarIcon=_.ToolbarIcon;var w=o(20);e.JoditToolbarCollection=w.JoditToolbarCollection;var j=o(36);e.ToolbarCollection=j.ToolbarCollection;var S=o(27);e.ToolbarButton=S.ToolbarButton;var C=o(59);e.Stack=C.Stack;var x=o(17);e.Widget=x.Widget;var k=o(208);e.Uploader=k.Uploader;var E=o(66);e.PluginSystem=E.PluginSystem;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(42);e.asArray=i.asArray;var n=o(87);e.inArray=n.inArray;var r=o(88);e.splitArray=r.splitArray;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(44),n=o(32);e.isPlainObject=function(t){return !("object"!=typeof t||t.nodeType||i.isWindow(t)||t.constructor&&!n.hasOwn.call(t.constructor.prototype,"isPrototypeOf"))};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.isNumeric=function(t){if("string"==typeof t){if(!t.match(/^([+\-])?[0-9]+(\.?)([0-9]+)?(e[0-9]+)?$/))return !1;t=parseFloat(t);}return !isNaN(t)&&isFinite(t)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.each=function(t,e){var o,i,n;if(Array.isArray(t)){for(o=t.length,n=0;o>n;n+=1)if(!1===e.call(t[n],n,t[n]))return !1}else for(i=Object.keys(t),n=0;i.length>n;n+=1)if(!1===e.call(t[i[n]],i[n],t[i[n]]))return !1;return !0};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(8),n=o(61),r=o(62);e.StorageKey="Jodit_";var a=function(){function t(t,o){this.provider=t,this.prefix=e.StorageKey,o&&(this.prefix+=o);}return t.prototype.set=function(t,e){this.provider.set(i.camelCase(this.prefix+t),e);},t.prototype.get=function(t){return this.provider.get(i.camelCase(this.prefix+t))},t.prototype.exists=function(t){return this.provider.exists(i.camelCase(this.prefix+t))},t.prototype.clear=function(){return this.provider.clear()},t.makeStorage=function(o,i){var a;return void 0===o&&(o=!1),o&&n.canUsePersistentStorage()&&(a=new n.LocalStorageProvider(e.StorageKey+i)),a||(a=new r.MemoryStorageProvider),new t(a,i)},t}();e.Storage=a;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(1),r=o(3),a=o(37),s=o(133),l=o(28),c=o(14),d=o(2),u=o(6),f=function(t){function e(e,o,i){var a=t.call(this,e)||this;a.__disabled=!1,a.__actived=!1,a.onMouseDown=function(t){var e,o;if("keydown"!==t.type||t.which===d.KEY_ENTER){if(t.stopImmediatePropagation(),t.preventDefault(),a.disable)return !1;var i=a.control,n=function(){return a.parentToolbar&&a.parentToolbar.getTarget(a)||a.target||!1};if(i.list){var u=new s.PopupList(a.jodit,a.container,a.target);u.open(i),a.jodit.events.fire("closeAllPopups",u.container),a.anchor.setAttribute("aria-expanded","true"),a.jodit.events.on(u,"afterClose",(function(){a.anchor.setAttribute("aria-expanded","false");}));}else if(void 0!==i.exec&&"function"==typeof i.exec)i.exec(a.jodit,n(),i,t,a.container),null===(e=a.jodit)||void 0===e||e.events.fire("synchro"),a.parentToolbar&&a.parentToolbar.immediateCheckActiveButtons(),null===(o=a.jodit)||void 0===o||o.events.fire("closeAllPopups afterExec");else if(void 0!==i.popup&&"function"==typeof i.popup){var f=new l.Popup(a.jodit,a.container,a.target);if(!1!==a.jodit.events.fire(r.camelCase("before-"+i.name+"-OpenPopup"),n(),i,f)){var p=i.popup(a.jodit,n(),i,f.close,a);p&&f.open(p);}a.jodit.events.fire(r.camelCase("after-"+i.name+"-OpenPopup")+" closeAllPopups",f.container);}else (i.command||i.name)&&(c.isJoditObject(a.jodit)?a.jodit.execCommand(i.command||i.name,i.args&&i.args[0]||!1,i.args&&i.args[1]||null):a.jodit.ownerDocument.execCommand(i.command||i.name,i.args&&i.args[0]||!1,i.args&&i.args[1]||null),a.jodit.events.fire("closeAllPopups"));}},a.control=o,a.target=i,a.anchor=a.jodit.create.element("a",{role:"button",href:"javascript:void(0)"});var f="-1";if(a.jodit.options.allowTabNavigation&&(f="0"),a.anchor.setAttribute("tabindex",f),a.container.appendChild(a.anchor),a.jodit.options.showTooltip&&o.tooltip){if(a.jodit.options.useNativeTooltip)a.anchor.setAttribute("title",a.tooltipText);else {var p=a.jodit.options.showTooltipDelay||a.jodit.defaultTimeout,h=0;a.jodit.events.on(a.anchor,"mouseenter",(function(){h=a.jodit.async.setTimeout((function(){var t;return !a.isDisable()&&(null===(t=a.jodit)||void 0===t?void 0:t.events.fire("showTooltip",a.anchor,a.tooltipText))}),{timeout:p,label:"tooltip"});})).on(a.anchor,"mouseleave",(function(){a.jodit.async.clearTimeout(h),a.jodit.events.fire("hideTooltip");}));}a.anchor.setAttribute("aria-label",a.tooltipText);}a.textBox=a.jodit.create.span(),a.anchor.appendChild(a.textBox);var v=o.name.replace(/[^a-zA-Z0-9]/g,"_");if(o.getContent&&"function"==typeof o.getContent){n.Dom.detach(a.container);var m=o.getContent(a.jodit,o,a);a.container.appendChild("string"==typeof m?a.jodit.create.fromHTML(m):m);}else {if(o.list&&a.anchor){var g=a.jodit.create.fromHTML(u.ToolbarIcon.getIcon("dropdown-arrow"));g.classList.add("jodit_with_dropdownlist-trigger"),a.container.classList.add("jodit_with_dropdownlist"),a.anchor.appendChild(g);}a.textBox.appendChild(a.createIcon(v,o));}if(a.container.classList.add("jodit_toolbar_btn-"+v),a.jodit.options.direction){var b=a.jodit.options.direction.toLowerCase();a.container.style.direction="rtl"===b?"rtl":"ltr";}return o.isInput?a.container.classList.add("jodit_toolbar-input"):a.jodit.events.on(a.container,"mousedown touchend keydown",a.onMouseDown).on("click-"+v+"-btn",a.onMouseDown),a}return i.__extends(e,t),Object.defineProperty(e.prototype,"disable",{get:function(){return this.__disabled},set:function(t){this.__disabled=t,this.container.classList.toggle("jodit_disabled",t),t?this.container.hasAttribute("disabled")||this.container.setAttribute("disabled","disabled"):this.container.hasAttribute("disabled")&&this.container.removeAttribute("disabled");},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"active",{get:function(){return this.__actived},set:function(t){this.__actived=t,this.container.classList.toggle("jodit_active",t);},enumerable:!0,configurable:!0}),e.prototype.isDisable=function(){return Boolean(this.parentToolbar&&this.parentToolbar.buttonIsDisabled(this))},e.prototype.isActive=function(){return Boolean(this.parentToolbar&&this.parentToolbar.buttonIsActive(this))},Object.defineProperty(e.prototype,"tooltipText",{get:function(){return this.control.tooltip?this.jodit.i18n(this.control.tooltip)+(this.control.hotkeys?"<br>"+r.asArray(this.control.hotkeys).join(" "):""):""},enumerable:!0,configurable:!0}),e.prototype.focus=function(){this.anchor.focus();},e.prototype.destruct=function(){this.isDestructed||(this.jodit&&this.jodit.events&&this.jodit.events.off(this.anchor)&&this.jodit.events.off(this.container),t.prototype.destruct.call(this));},e}(a.ToolbarElement);e.ToolbarButton=f;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(1),r=o(3),a=o(7),s=o(16),l=function(t){function e(o,i,r,a){void 0===a&&(a="jodit_toolbar_popup");var s=t.call(this,o)||this;return s.target=i,s.current=r,s.className=a,s.throttleCalcPosition=s.jodit.async.throttle(s.calcPosition.bind(s),s.jodit.defaultTimeout),s.isOpened=!1,s.close=function(t){(s.isOpened||s.isDestructed)&&(t&&n.Dom.isOrContains(s.container,t instanceof e?t.target:t)||(s.isOpened=!1,s.jodit.events.off("closeAllPopups",s.close),s.doClose(),n.Dom.safeRemove(s.container),s.jodit.events.fire("removeMarkers"),s.jodit.events.fire(s,"afterClose")));},s.container=s.jodit.create.div(a),s.jodit.events.on(s.container,"mousedown touchstart touchend",(function(t){t.stopPropagation();})).on([s.jodit.ownerWindow,s.jodit.events],"resize",s.throttleCalcPosition).on("afterInsertNode, afterInsertImage",s.close),s}return i.__extends(e,t),e.prototype.calcPosition=function(){if(this.isOpened&&!this.isInDestruct){var t=this.container,e=r.offset(this.jodit.container,this.jodit,this.jodit.ownerDocument,!0),o=r.offset(t,this.jodit,this.jodit.ownerDocument,!0),i=r.css(t,"marginLeft")||0;o.left-=i;var n=i,a="auto";if(n=e.left>o.left?e.left-o.left:e.left+e.width>o.left+o.width?0:-(o.left+o.width-(e.left+e.width)),e.width>o.width||(n=e.left-o.left,a=e.width),n!==i)try{t.style.setProperty("margin-left",n+"px","important");}catch(e){t.style.marginLeft=n+"px";}var s=t.querySelector(".jodit_popup_triangle");s&&(s.style.marginLeft=-n+"px"),r.css(t,"width",a);}},e.prototype.doOpen=function(t){t&&(n.Dom.detach(this.container),this.container.innerHTML='<span class="jodit_popup_triangle"></span>',this.container.appendChild(n.Dom.isNode(t,this.jodit.ownerWindow)?t:this.jodit.create.fromHTML(t.toString())),this.container.style.display="block",this.container.style.removeProperty("marginLeft"));},e.prototype.doClose=function(){},e.prototype.open=function(t,e,o){void 0===o&&(o=!1),s.Jodit.fireEach("beforeOpenPopup closeAllPopups",this,t),o||this.jodit.events.on("closeAllPopups",this.close),this.jodit.markOwner(this.container),this.container.classList.add(this.className+"-open"),this.doOpen(t),this.target.appendChild(this.container),this.jodit.options.textIcons&&this.firstInFocus(),void 0!==e&&this.container.classList.toggle("jodit_right",e),!o&&this.container.parentNode&&this.jodit.events.fire(this.container.parentNode,"afterOpenPopup",this.container),this.isOpened=!0,!o&&this.calcPosition();},e.prototype.firstInFocus=function(){},e.prototype.destruct=function(){this.isDestructed||(this.setStatus(a.STATUSES.beforeDestruct),this.jodit.events.off([this.jodit.ownerWindow,this.jodit.events],"resize",this.throttleCalcPosition),n.Dom.safeRemove(this.container),delete this.container,t.prototype.destruct.call(this));},e}(a.Component);e.Popup=l;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(2),n=o(1),r=o(3),a=function(){function t(){}return t.addSelected=function(t){t.setAttribute(i.JODIT_SELECTED_CELL_MARKER,"1");},t.restoreSelection=function(t){t.removeAttribute(i.JODIT_SELECTED_CELL_MARKER);},t.getAllSelectedCells=function(t){return t?r.$$("td["+i.JODIT_SELECTED_CELL_MARKER+"],th["+i.JODIT_SELECTED_CELL_MARKER+"]",t):[]},t.getRowsCount=function(t){return t.rows.length},t.getColumnsCount=function(e){return t.formalMatrix(e).reduce((function(t,e){return Math.max(t,e.length)}),0)},t.formalMatrix=function(t,e){for(var o=[[]],i=Array.prototype.slice.call(t.rows),n=function(t,i){void 0===o[i]&&(o[i]=[]);for(var n,r,a=t.colSpan,s=t.rowSpan,l=0;o[i][l];)l+=1;for(r=0;s>r;r+=1)for(n=0;a>n;n+=1){if(void 0===o[i+r]&&(o[i+r]=[]),e&&!1===e(t,i+r,l+n,a,s))return !1;o[i+r][l+n]=t;}},r=0,a=void 0;i.length>r;r+=1){var s=Array.prototype.slice.call(i[r].cells);for(a=0;s.length>a;a+=1)if(!1===n(s[a],r))return o}return o},t.formalCoordinate=function(e,o,i){void 0===i&&(i=!1);var n=0,r=0,a=1,s=1;return t.formalMatrix(e,(function(t,e,l,c,d){if(o===t)return n=e,r=l,a=c||1,s=d||1,i&&(r+=(c||1)-1,n+=(d||1)-1),!1})),[n,r,a,s]},t.appendRow=function(e,o,i,n){for(var a=t.getColumnsCount(e),s=n.element("tr"),l=0;a>l;l+=1)s.appendChild(n.element("td"));i&&o&&o.nextSibling?o.parentNode&&o.parentNode.insertBefore(s,o.nextSibling):!i&&o?o.parentNode&&o.parentNode.insertBefore(s,o):(r.$$(":scope>tbody",e)[0]||e).appendChild(s);},t.removeRow=function(e,o){var i,a=t.formalMatrix(e),s=e.rows[o];r.each(a[o],(function(t,r){if(i=!1,0>o-1||a[o-1][t]!==r)if(a[o+1]&&a[o+1][t]===r){if(r.parentNode===s&&r.parentNode.nextSibling){i=!0;for(var l=t+1;a[o+1][l]===r;)l+=1;var c=n.Dom.next(r.parentNode,(function(t){return n.Dom.isTag(t,"tr")}),e);a[o+1][l]?c.insertBefore(r,a[o+1][l]):c.appendChild(r);}}else n.Dom.safeRemove(r);else i=!0;if(i&&(r.parentNode===s||r!==a[o][t-1])){var d=r.rowSpan;d-1>1?r.setAttribute("rowspan",(d-1).toString()):r.removeAttribute("rowspan");}})),n.Dom.safeRemove(s);},t.appendColumn=function(e,o,i,n){var r,a=t.formalMatrix(e);for((void 0===o||0>o)&&(o=t.getColumnsCount(e)-1),r=0;a.length>r;r+=1){var s=n.element("td"),l=a[r][o],c=!1;i?(a[r]&&l&&o+1>=a[r].length||l!==a[r][o+1])&&(l.nextSibling?l.parentNode&&l.parentNode.insertBefore(s,l.nextSibling):l.parentNode&&l.parentNode.appendChild(s),c=!0):(0>o-1||a[r][o]!==a[r][o-1]&&a[r][o].parentNode)&&(l.parentNode&&l.parentNode.insertBefore(s,a[r][o]),c=!0),c||a[r][o].setAttribute("colspan",(parseInt(a[r][o].getAttribute("colspan")||"1",10)+1).toString());}},t.removeColumn=function(e,o){var i,a=t.formalMatrix(e);r.each(a,(function(t,e){var r=e[o];if(i=!1,0>o-1||a[t][o-1]!==r?e.length>o+1&&a[t][o+1]===r?i=!0:n.Dom.safeRemove(r):i=!0,i&&(0>t-1||r!==a[t-1][o])){var s=r.colSpan;s-1>1?r.setAttribute("colspan",(s-1).toString()):r.removeAttribute("colspan");}}));},t.getSelectedBound=function(e,o){var i,n,r,a=[[1/0,1/0],[0,0]],s=t.formalMatrix(e);for(i=0;s.length>i;i+=1)for(n=0;s[i].length>n;n+=1)-1!==o.indexOf(s[i][n])&&(a[0][0]=Math.min(i,a[0][0]),a[0][1]=Math.min(n,a[0][1]),a[1][0]=Math.max(i,a[1][0]),a[1][1]=Math.max(n,a[1][1]));for(i=a[0][0];a[1][0]>=i;i+=1)for(r=1,n=a[0][1];a[1][1]>=n;n+=1){for(;s[i][n-r]&&s[i][n]===s[i][n-r];)a[0][1]=Math.min(n-r,a[0][1]),a[1][1]=Math.max(n-r,a[1][1]),r+=1;for(r=1;s[i][n+r]&&s[i][n]===s[i][n+r];)a[0][1]=Math.min(n+r,a[0][1]),a[1][1]=Math.max(n+r,a[1][1]),r+=1;for(r=1;s[i-r]&&s[i][n]===s[i-r][n];)a[0][0]=Math.min(i-r,a[0][0]),a[1][0]=Math.max(i-r,a[1][0]),r+=1;for(r=1;s[i+r]&&s[i][n]===s[i+r][n];)a[0][0]=Math.min(i+r,a[0][0]),a[1][0]=Math.max(i+r,a[1][0]),r+=1;}return a},t.normalizeTable=function(e){var o,i,n,r,a=[],s=t.formalMatrix(e);for(i=0;s[0].length>i;i+=1){for(n=1e6,r=!1,o=0;s.length>o;o+=1)if(void 0!==s[o][i]){if(2>s[o][i].colSpan){r=!0;break}n=Math.min(n,s[o][i].colSpan);}if(!r)for(o=0;s.length>o;o+=1)void 0!==s[o][i]&&t.__mark(s[o][i],"colspan",s[o][i].colSpan-n+1,a);}for(o=0;s.length>o;o+=1){for(n=1e6,r=!1,i=0;s[o].length>i;i+=1)if(void 0!==s[o][i]){if(2>s[o][i].rowSpan){r=!0;break}n=Math.min(n,s[o][i].rowSpan);}if(!r)for(i=0;s[o].length>i;i+=1)void 0!==s[o][i]&&t.__mark(s[o][i],"rowspan",s[o][i].rowSpan-n+1,a);}for(o=0;s.length>o;o+=1)for(i=0;s[o].length>i;i+=1)void 0!==s[o][i]&&(s[o][i].hasAttribute("rowspan")&&1===s[o][i].rowSpan&&s[o][i].removeAttribute("rowspan"),s[o][i].hasAttribute("colspan")&&1===s[o][i].colSpan&&s[o][i].removeAttribute("colspan"),s[o][i].hasAttribute("class")&&!s[o][i].getAttribute("class")&&s[o][i].removeAttribute("class"));t.__unmark(a);},t.mergeSelected=function(e){var o,a=[],s=t.getSelectedBound(e,t.getAllSelectedCells(e)),l=0,c=null,d=0,u=0,f=0,p=[];s&&(s[0][0]-s[1][0]||s[0][1]-s[1][1])&&(t.formalMatrix(e,(function(e,i,n,h,v){if(!(s[0][0]>i||i>s[1][0]||s[0][1]>n||n>s[1][1])){if((o=e).__i_am_already_was)return;o.__i_am_already_was=!0,i===s[0][0]&&o.style.width&&(l+=o.offsetWidth),""!==r.trim(e.innerHTML.replace(/<br(\/)?>/g,""))&&a.push(e.innerHTML),h>1&&(u+=h-1),v>1&&(f+=v-1),c?t.__mark(o,"remove",1,p):(c=e,d=n);}})),u=s[1][1]-s[0][1]+1,f=s[1][0]-s[0][0]+1,c&&(u>1&&t.__mark(c,"colspan",u,p),f>1&&t.__mark(c,"rowspan",f,p),l&&(t.__mark(c,"width",(l/e.offsetWidth*100).toFixed(i.ACCURACY)+"%",p),d&&t.setColumnWidthByDelta(e,d,0,!0,p)),c.innerHTML=a.join("<br/>"),delete c.__i_am_already_was,t.__unmark(p),t.normalizeTable(e),r.each(Array.from(e.rows),(function(t,e){e.cells.length||n.Dom.safeRemove(e);}))));},t.splitHorizontal=function(e,o){var i,r,a,s,l,c=[];t.getAllSelectedCells(e).forEach((function(d){(r=o.element("td")).appendChild(o.element("br")),a=o.element("tr"),i=t.formalCoordinate(e,d),2>d.rowSpan?(t.formalMatrix(e,(function(e,o,n){i[0]===o&&i[1]!==n&&e!==d&&t.__mark(e,"rowspan",e.rowSpan+1,c);})),n.Dom.after(n.Dom.closest(d,"tr",e),a),a.appendChild(r)):(t.__mark(d,"rowspan",d.rowSpan-1,c),t.formalMatrix(e,(function(t,o,n){o>i[0]&&i[0]+d.rowSpan>o&&i[1]>n&&t.parentNode.rowIndex===o&&(l=t),o>i[0]&&t===d&&(s=e.rows[o]);})),l?n.Dom.after(l,r):s.insertBefore(r,s.firstChild)),d.colSpan>1&&t.__mark(r,"colspan",d.colSpan,c),t.__unmark(c),t.restoreSelection(d);})),this.normalizeTable(e);},t.splitVertical=function(e,o){var r,a,s,l=[];t.getAllSelectedCells(e).forEach((function(c){r=t.formalCoordinate(e,c),2>c.colSpan?t.formalMatrix(e,(function(e,o,i){r[1]===i&&r[0]!==o&&e!==c&&t.__mark(e,"colspan",e.colSpan+1,l);})):t.__mark(c,"colspan",c.colSpan-1,l),(a=o.element("td")).appendChild(o.element("br")),c.rowSpan>1&&t.__mark(a,"rowspan",c.rowSpan,l);var d=c.offsetWidth;n.Dom.after(c,a),t.__mark(c,"width",(100*(s=d/e.offsetWidth/2)).toFixed(i.ACCURACY)+"%",l),t.__mark(a,"width",(100*s).toFixed(i.ACCURACY)+"%",l),t.__unmark(l),t.restoreSelection(c);})),t.normalizeTable(e);},t.setColumnWidthByDelta=function(e,o,n,r,a){var s,l=t.formalMatrix(e);for(s=0;l.length>s;s+=1)t.__mark(l[s][o],"width",((l[s][o].offsetWidth+n)/e.offsetWidth*100).toFixed(i.ACCURACY)+"%",a);r||t.__unmark(a);},t.__mark=function(t,e,o,i){i.push(t),t.__marked_value||(t.__marked_value={}),t.__marked_value[e]=void 0===o?1:o;},t.__unmark=function(t){t.forEach((function(t){t.__marked_value&&(r.each(t.__marked_value,(function(e,o){switch(e){case"remove":n.Dom.safeRemove(t);break;case"rowspan":o>1?t.setAttribute("rowspan",o.toString()):t.removeAttribute("rowspan");break;case"colspan":o>1?t.setAttribute("colspan",o.toString()):t.removeAttribute("colspan");break;case"width":t.style.width=o.toString();}delete t.__marked_value[e];})),delete t.__marked_value);}));},t}();e.Table=a;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(13);e.JoditObject=function(t){i.extend(!0,this,t);};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(13),n=function(){function t(t){var e=this;this.length=0,i.extend(!0,this,t),this.length=t.length;var o=Array.prototype;["map","forEach","reduce","push","pop","shift","unshift","slice","splice"].forEach((function(t){e[t]=o[t];}));}return t.prototype.toString=function(){for(var t=[],e=0;this.length>e;e+=1)t[e]=this[e];return t.toString()},t}();e.JoditArray=n;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i={},n=i.toString;e.hasOwn=i.hasOwnProperty,["Boolean","Number","String","Function","Array","Date","RegExp","Object","Error","Symbol","HTMLDocument","Window","HTMLElement","HTMLBodyElement","Text","DocumentFragment","DOMStringList","HTMLCollection"].forEach((function(t){i["[object "+t+"]"]=t.toLowerCase();})),e.type=function(t){return null===t?"null":"object"==typeof t||"function"==typeof t?i[n.call(t)]||"object":typeof t},e.error=function(t){return new TypeError(t)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);i.__exportStar(o(100),e),i.__exportStar(o(103),e),i.__exportStar(o(104),e),i.__exportStar(o(105),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.defaultLanguage=function(t,e){return void 0===e&&(e="en"),"auto"!==t&&"string"==typeof t?t:document.documentElement&&document.documentElement.lang?document.documentElement.lang:navigator.language?navigator.language.substr(0,2):e};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(127),r=o(20),a=o(22),s=o(7),l=o(1),c=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.__toolbar=r.JoditToolbarCollection.makeCollection(e),e}return i.__extends(e,t),Object.defineProperty(e.prototype,"toolbar",{get:function(){return this.__toolbar},enumerable:!0,configurable:!0}),e.prototype.setPanel=function(t){this.jodit.options.toolbar=t,this.buildToolbar(this.container);},e.prototype.buildToolbar=function(t){if(this.options.toolbar){var e=t.querySelector(".jodit_toolbar_container");e||(e=this.create.div("jodit_toolbar_container"),l.Dom.appendChildFirst(t,e)),(l.Dom.isHTMLElement(this.options.toolbar,this.jodit.ownerWindow)||"string"==typeof this.options.toolbar)&&(e=this.resolveElement(this.options.toolbar)),this.toolbar.build(a.splitArray(this.options.buttons).concat(this.options.extraButtons),e);}},e.prototype.destruct=function(){this.setStatus(s.STATUSES.beforeDestruct),this.toolbar.destruct(),delete this.__toolbar,t.prototype.destruct.call(this);},e}(n.View);e.ViewWithToolbar=c;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(132),r=o(27),a=o(134),s=o(1),l=o(7),c=o(4),d=o(14),u=function(t){function e(e){var o=t.call(this,e)||this;return o.__buttons=[],o.__getControlType=function(t){var e,n=o.jodit.options.controls||c.Config.defaultOptions.controls;if("string"!=typeof t)void 0!==n[(e=i.__assign({name:"empty"},t)).name]&&(e=i.__assign(i.__assign({},n[e.name]),e));else {var r=t.split(/\./),a=n;r.length>1&&void 0!==n[r[0]]&&(a=n[r[0]],t=r[1]),e=void 0!==a[t]?i.__assign({name:t},a[t]):{name:t,command:t,tooltip:t};}return e},o.closeAll=function(){o.jodit&&o.jodit.events&&o.jodit.events.fire("closeAllPopups");},o.initEvents=function(){o.jodit.events.on(o.jodit.ownerWindow,"mousedown touchend",o.closeAll).on(o.listenEvents,o.checkActiveButtons).on("afterSetMode focus",o.immediateCheckActiveButtons);},o.listenEvents="changeStack mousedown mouseup keydown change afterInit readonly afterResize selectionchange changeSelection focus afterSetMode touchstart focus blur",o.immediateCheckActiveButtons=function(){o.isDestructed||o.jodit.isLocked()||(o.__buttons.filter((function(t){return t instanceof r.ToolbarButton})).forEach((function(t){t.disable=t.isDisable(),t.disable||(t.active=t.isActive()),"function"==typeof t.control.getLabel&&t.control.getLabel(o.jodit,t.control,t);})),o.jodit.events&&o.jodit.events.fire("updateToolbar"));},o.checkActiveButtons=o.jodit.async.debounce(o.immediateCheckActiveButtons,o.jodit.defaultTimeout),o.container=o.jodit.create.element("ul"),o.container.classList.add("jodit_toolbar"),o.initEvents(),o}return i.__extends(e,t),e.prototype.getButtonsList=function(){return this.__buttons.map((function(t){return t instanceof r.ToolbarButton?t.control.name:""})).filter((function(t){return ""!==t}))},e.prototype.getParentContainer=function(){return this.__parentContainer},e.prototype.appendChild=function(t){this.__buttons.push(t),this.container.appendChild(t.container);},Object.defineProperty(e.prototype,"firstButton",{get:function(){return this.__buttons[0]},enumerable:!0,configurable:!0}),e.prototype.removeChild=function(t){var e=this.__buttons.indexOf(t);-1!==e&&(this.__buttons.splice(e,1),t.container.parentNode===this.container&&s.Dom.safeRemove(t.container));},e.prototype.applyContainerOptions=function(){this.container.classList.add("jodit_"+(this.jodit.options.theme||"default")+"_theme"),this.jodit.container.classList.toggle("jodit_text_icons",this.jodit.options.textIcons),this.container.classList.toggle("jodit_text_icons",this.jodit.options.textIcons),this.jodit.options.zIndex&&(this.container.style.zIndex=parseInt(this.jodit.options.zIndex.toString(),10).toString());var t=(this.jodit.options.toolbarButtonSize||"middle").toLowerCase();this.container.classList.add("jodit_toolbar_size-"+(-1!==["middle","large","small"].indexOf(t)?t:"middle"));},e.prototype.build=function(t,e,o){var i=this;this.applyContainerOptions(),this.jodit.events.off("rebuildToolbar"),this.jodit.events.on("afterInit rebuildToolbar",(function(){return i.build(t,e,o)})),this.__parentContainer=e;var s=!1;this.clear(),("string"==typeof t?t.split(/[,\s]+/):t).map(this.__getControlType).forEach((function(t){var e=null;if(-1===i.jodit.options.removeButtons.indexOf(t.name)){switch(t.name){case"\n":e=new n.ToolbarBreak(i);break;case"|":s||(s=!0,e=new a.ToolbarSeparator(i));break;default:s=!1,e=new r.ToolbarButton(i,t,o);}e&&i.appendChild(e);}})),this.container.parentNode!==e&&e.appendChild(this.container),this.immediateCheckActiveButtons();},e.prototype.clear=function(){var t=this;i.__spreadArrays(this.__buttons).forEach((function(e){t.removeChild(e),e.destruct();})),this.__buttons.length=0;},e.prototype.buttonIsActive=function(t){return !(d.isJoditObject(this.jodit)&&!this.jodit.editorIsActive)&&("function"==typeof t.control.isActive?t.control.isActive(this.jodit,t.control,t):void 0)},e.prototype.buttonIsDisabled=function(t){return !!this.jodit.options.disabled||!(!this.jodit.options.readonly||this.jodit.options.activeButtonsInReadOnly&&-1!==this.jodit.options.activeButtonsInReadOnly.indexOf(t.control.name))||("function"==typeof t.control.isDisable&&(e=t.control.isDisable(this.jodit,t.control,t)),e);var e;},e.prototype.getTarget=function(t){return t.target},e.prototype.setDirection=function(t){this.container.style.direction=t,this.container.setAttribute("dir",t);},e.prototype.destruct=function(){this.isDestructed||(this.jodit.events.off(this.jodit.ownerWindow,"mousedown touchstart",this.closeAll).off(this.listenEvents,this.checkActiveButtons).off("afterSetMode focus",this.immediateCheckActiveButtons),this.clear(),s.Dom.safeRemove(this.container),delete this.container,t.prototype.destruct.call(this));},e}(l.Component);e.ToolbarCollection=u;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(7),r=o(36),a=o(6),s=o(1),l=o(8),c=function(t){function e(e,o,i){void 0===o&&(o="li"),void 0===i&&(i="jodit_toolbar_btn");var n=this;return e instanceof r.ToolbarCollection?(n=t.call(this,e.jodit)||this).parentToolbar=e:n=t.call(this,e)||this,n.container=n.jodit.create.element(o),n.container.classList.add(i),n}return i.__extends(e,t),e.prototype.focus=function(){this.container.focus();},e.prototype.destruct=function(){this.isInDestruct||(this.setStatus(n.STATUSES.beforeDestruct),s.Dom.safeRemove(this.container),this.parentToolbar=void 0,t.prototype.destruct.call(this));},e.prototype.createIcon=function(t,e){var o=e?e.icon||e.name:t;if(!this.jodit.options.textIcons){var i=this.jodit.events.fire("getIcon",o,e,t),n=void 0;return e&&e.iconURL&&void 0===i?(n=this.jodit.create.element("i")).style.backgroundImage="url("+e.iconURL.replace("{basePath}",this.jodit.basePath)+")":(void 0===i&&(i=a.ToolbarIcon.exists(o)?a.ToolbarIcon.getIcon(o):a.ToolbarIcon.getIcon("empty")),n="string"==typeof i?this.jodit.create.fromHTML(l.trim(i)):i),n.classList.add("jodit_icon","jodit_icon_"+t),n}return this.jodit.create.fromHTML('<span class="jodit_icon">'+this.jodit.i18n(e?e.name:t)+"</span>")},e}(n.Component);e.ToolbarElement=c;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(3),a=o(56);n.Config.prototype.defaultAjaxOptions={dataType:"json",method:"GET",url:"",data:null,contentType:"application/x-www-form-urlencoded; charset=UTF-8",headers:{"X-REQUESTED-WITH":"XMLHttpRequest"},withCredentials:!1,xhr:function(){return new XMLHttpRequest}};var s=function(){function t(t,e){var o=this;this.success_response_codes=[200,201,202],this.resolved=!1,this.activated=!1,this.jodit=t,this.options=r.extend(!0,{},n.Config.prototype.defaultAjaxOptions,e),this.options.xhr&&(this.xhr=this.options.xhr()),t&&t.events&&t.events.on("beforeDestruct",(function(){o.abort();}));}return t.prototype.__buildParams=function(t,e){return this.options.queryBuild&&"function"==typeof this.options.queryBuild?this.options.queryBuild.call(this,t,e):"string"==typeof t||this.jodit.ownerWindow.FormData&&t instanceof this.jodit.ownerWindow.FormData?t:a.buildQuery(t)},t.prototype.abort=function(){try{this.xhr.abort();}catch(t){}return this},t.prototype.send=function(){var t=this;return this.activated=!0,new Promise((function(e,o){var i=function(e){var o=null;if("json"===t.options.dataType&&(o=JSON.parse(e)),!o)throw r.error("No JSON format");return o};t.xhr.onabort=function(){o(r.error(t.xhr.statusText));},t.xhr.onerror=function(){o(r.error(t.xhr.statusText));},t.xhr.ontimeout=function(){o(r.error(t.xhr.statusText));},t.xhr.onload=function(){t.response=t.xhr.responseText,t.status=t.xhr.status,t.resolved=!0,e.call(t.xhr,i(t.response)||{});},t.xhr.onreadystatechange=function(){if(t.xhr.readyState===XMLHttpRequest.DONE){var n=t.xhr.responseText;t.response=n,t.status=t.xhr.status,t.resolved=!0,t.success_response_codes.indexOf(t.xhr.status)>-1?e.call(t.xhr,i(n)):o.call(t.xhr,r.error(t.xhr.statusText||t.jodit.i18n("Connection error!")));}},t.xhr.withCredentials=t.options.withCredentials||!1;var n=t.prepareRequest(),a=n.data;t.xhr.open(n.method,n.url,!0),t.options.contentType&&t.xhr.setRequestHeader&&t.xhr.setRequestHeader("Content-type",t.options.contentType),t.options.headers&&t.xhr.setRequestHeader&&r.each(t.options.headers,(function(e,o){t.xhr.setRequestHeader(e,o);})),setTimeout((function(){t.xhr.send(a?t.__buildParams(a):void 0);}),0);}))},t.prototype.prepareRequest=function(){if(!this.options.url)throw r.error("Need URL for AJAX request");var e=this.options.url,o=this.options.data,n=(this.options.method||"get").toLowerCase();if("get"===n&&o&&r.isPlainObject(o)){var s=e.indexOf("?");if(-1!==s){var l=r.parseQuery(e);e=e.substr(0,s)+"?"+a.buildQuery(i.__assign(i.__assign({},l),o));}else e+="?"+a.buildQuery(this.options.data);}var c={url:e,method:n,data:o};return t.log.splice(100),t.log.push(c),c},t.prototype.destruct=function(){this.activated&&!this.resolved&&(this.abort(),this.resolved=!0);},t.log=[],t}();e.Ajax=s;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(7),r=o(10),a=o(6),s=o(1),l=function(t){function e(e){var o=t.call(this,e)||this;return o.evnts="mousedown jodit_close_dialog scroll",o.hide=function(){s.Dom.safeRemove(o.context),o.jodit.events.off(o.jodit.ownerWindow,o.evnts,o.hide);},o.context=e.create.div("jodit_context_menu"),o.context.classList.add("jodit_context_menu-show"),o}return i.__extends(e,t),e.prototype.show=function(t,e,o,i){var n,l=this,c=this;Array.isArray(o)&&(i&&(this.context.style.zIndex=i.toString()),s.Dom.detach(this.context),o.forEach((function(t){if(t){var e=c.jodit.i18n(t.title||""),o=l.jodit.create.fromHTML('<a title="'+e+'" data-icon="'+t.icon+'"  href="javascript:void(0)">'+(t.icon?a.ToolbarIcon.getIcon(t.icon):"")+"<span></span></a>"),i=o.querySelector("span");o.addEventListener("mousedown",(function(e){var o;return null===(o=t.exec)||void 0===o||o.call(c,e),c.hide(),!1})),i.textContent=e,c.context.appendChild(o);}})),r.css(c.context,{left:t,top:e}),this.jodit.events.on(this.jodit.ownerWindow,this.evnts,c.hide),this.jodit.markOwner(this.context),null===(n=this.jodit)||void 0===n||n.ownerDocument.body.appendChild(this.context));},e.prototype.destruct=function(){this.isInDestruct||(this.setStatus(n.STATUSES.beforeDestruct),s.Dom.safeRemove(this.context),delete this.context,this.jodit.events.off(this.jodit.ownerWindow,this.evnts,this.hide),t.prototype.destruct.call(this));},e}(n.Component);e.ContextMenu=l;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.F_CLASS="jodit_filebrowser",e.ITEM_CLASS=e.F_CLASS+"_files_item",e.ICON_LOADER='<i class="jodit_icon-loader"></i>';},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);i.__exportStar(o(85),e),i.__exportStar(o(86),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.asArray=function(t){return Array.isArray(t)?t:[t]};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),o(0).__exportStar(o(89),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.isWindow=function(t){return null!==t&&t===t.window};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.isFunction=function(t){return "function"==typeof t};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.isURL=function(t){return new RegExp("^(https?:\\/\\/)((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$","i").test(t)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.isValidName=function(t){return !!t.length&&!/[^0-9A-Za-zа-яА-ЯЁё\w\-_\.]/.test(t)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.colorToHex=function(t){if("rgba(0, 0, 0, 0)"===t||""===t)return !1;if(!t)return "#000000";if("#"===t.substr(0,1))return t;var e,o,i,n=/([\s\n\t\r]*?)rgb\((\d+), (\d+), (\d+)\)/.exec(t)||/([\s\n\t\r]*?)rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/.exec(t);if(!n)return "#000000";for(o=parseInt(n[2],10),i=parseInt(n[3],10),e=(parseInt(n[4],10)|i<<8|o<<16).toString(16).toUpperCase();6>e.length;)e="0"+e;return n[1]+"#"+e};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.camelCase=function(t){return t.replace(/([-_])(.)/g,(function(t,e,o){return o.toUpperCase()}))};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.fromCamelCase=function(t){return t.replace(/([A-Z]+)/g,(function(t,e){return "-"+e.toLowerCase()}))};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(2);e.trim=function(t){return t.replace(i.SPACE_REG_EXP_START,"").replace(i.SPACE_REG_EXP_END,"")};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(24);e.normilizeCSSValue=function(t,e){switch(t.toLowerCase()){case"font-weight":switch(e.toString().toLowerCase()){case"bold":return 700;case"normal":return 400;case"heavy":return 900}return i.isNumeric(e)?+e:e}return e};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.completeUrl=function(t){return "file:"===window.location.protocol&&/^\/\//.test(t)&&(t="https:"+t),t};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.parseQuery=function(t){for(var e={},o=t.substr(1).split("&"),i=0;o.length>i;i+=1){var n=o[i].split("=");e[decodeURIComponent(n[0])]=decodeURIComponent(n[1]||"");}return e};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.ctrlKey=function(t){if("undefined"!=typeof navigator&&-1!==navigator.userAgent.indexOf("Mac OS X")){if(t.metaKey&&!t.altKey)return !0}else if(t.ctrlKey&&!t.altKey)return !0;return !1};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(11);e.buildQuery=function(t,o){var n=[],r=encodeURIComponent;for(var a in t)if(t.hasOwnProperty(a)){var s=o?o+"["+a+"]":a,l=t[a];n.push(i.isPlainObject(l)?e.buildQuery(l,s):r(s)+"="+r(l));}return n.join("&")};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(7),a=o(58),s=o(59),l=o(125);n.Config.prototype.observer={timeout:100};var c=function(t){function e(e){var o=t.call(this,e)||this;o.onChangeStack=function(){var t=o.snapshot.make();a.Snapshot.equal(t,o.startValue)||(o.stack.push(new l.Command(o.startValue,t,o)),o.startValue=t,o.changeStack());},o.stack=new s.Stack,o.snapshot=new a.Snapshot(e);var i=e.async.debounce(o.onChangeStack,e.defaultTimeout);return e.events.on("afterAddPlace.observer",(function(){o.isInDestruct||(o.startValue=o.snapshot.make(),e.events.on(e.editor,["changeSelection.observer","selectionstart.observer","selectionchange.observer","mousedown.observer","mouseup.observer","keydown.observer","keyup.observer"].join(" "),(function(){o.startValue.html===o.jodit.getNativeEditorValue()&&(o.startValue=o.snapshot.make());})).on(o,"change.observer",(function(){o.snapshot.isBlocked||i();})));})),o}return i.__extends(e,t),e.prototype.redo=function(){this.stack.redo()&&(this.startValue=this.snapshot.make(),this.changeStack());},e.prototype.undo=function(){this.stack.undo()&&(this.startValue=this.snapshot.make(),this.changeStack());},e.prototype.clear=function(){this.startValue=this.snapshot.make(),this.stack.clear(),this.changeStack();},e.prototype.changeStack=function(){var t;this.jodit&&!this.jodit.isInDestruct&&(null===(t=this.jodit.events)||void 0===t||t.fire("changeStack"));},e.prototype.destruct=function(){this.jodit.events&&this.jodit.events.off(".observer"),this.snapshot.destruct(),delete this.snapshot,delete this.stack,delete this.startValue,t.prototype.destruct.call(this);},e}(r.Component);e.Observer=c;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(7),r=o(1),a=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.isBlocked=!1,e}return i.__extends(e,t),e.equal=function(t,e){return t.html===e.html&&JSON.stringify(t.range)===JSON.stringify(e.range)},e.countNodesBeforeInParent=function(t){if(!t.parentNode)return 0;var e,o=t.parentNode.childNodes,i=0,n=null;for(e=0;o.length>e;e+=1){if(!n||r.Dom.isText(o[e])&&""===o[e].textContent||r.Dom.isText(n)&&r.Dom.isText(o[e])||(i+=1),o[e]===t)return i;n=o[e];}return 0},e.strokeOffset=function(t,e){for(;r.Dom.isText(t);)r.Dom.isText(t=t.previousSibling)&&null!==t.textContent&&(e+=t.textContent.length);return e},e.prototype.calcHierarchyLadder=function(t){var o=[];if(!t||!t.parentNode||!r.Dom.isOrContains(this.jodit.editor,t))return [];for(;t&&t!==this.jodit.editor;)t&&o.push(e.countNodesBeforeInParent(t)),t=t.parentNode;return o.reverse()},e.prototype.getElementByLadder=function(t){var e,o=this.jodit.editor;for(e=0;o&&t.length>e;e+=1)o=o.childNodes[t[e]];return o},e.prototype.make=function(){var t={html:"",range:{startContainer:[],startOffset:0,endContainer:[],endOffset:0}};t.html=this.jodit.getNativeEditorValue();var o=this.jodit.selection.sel;if(o&&o.rangeCount){var i=o.getRangeAt(0),n=this.calcHierarchyLadder(i.startContainer),r=this.calcHierarchyLadder(i.endContainer),a=e.strokeOffset(i.startContainer,i.startOffset),s=e.strokeOffset(i.endContainer,i.endOffset);n.length||i.startContainer===this.jodit.editor||(a=0),r.length||i.endContainer===this.jodit.editor||(s=0),t.range={startContainer:n,startOffset:a,endContainer:r,endOffset:s};}return t},e.prototype.restore=function(t){this.isBlocked=!0,this.jodit.getNativeEditorValue()!==t.html&&this.jodit.setEditorValue(t.html),this.restoreOnlySelection(t),this.isBlocked=!1;},e.prototype.restoreOnlySelection=function(t){try{if(t.range){var e=this.jodit.editorDocument.createRange();e.setStart(this.getElementByLadder(t.range.startContainer),t.range.startOffset),e.setEnd(this.getElementByLadder(t.range.endContainer),t.range.endOffset),this.jodit.selection.selectRange(e);}}catch(t){this.jodit.editor.lastChild&&this.jodit.selection.setCursorAfter(this.jodit.editor.lastChild);}},e.prototype.destruct=function(){this.isBlocked=!1,t.prototype.destruct.call(this);},e}(n.Component);e.Snapshot=a;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(){this.commands=[],this.stackPosition=-1;}return t.prototype.clearRedo=function(){this.commands.length=this.stackPosition+1;},t.prototype.clear=function(){this.commands.length=0,this.stackPosition=-1;},t.prototype.push=function(t){this.clearRedo(),this.commands.push(t),this.stackPosition+=1;},t.prototype.undo=function(){return !!this.canUndo()&&(this.commands[this.stackPosition]&&this.commands[this.stackPosition].undo(),this.stackPosition-=1,!0)},t.prototype.redo=function(){return !!this.canRedo()&&(this.stackPosition+=1,this.commands[this.stackPosition]&&this.commands[this.stackPosition].redo(),!0)},t.prototype.canUndo=function(){return this.stackPosition>=0},t.prototype.canRedo=function(){return this.commands.length-1>this.stackPosition},t}();e.Stack=i;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(2),n=o(2),r=o(1),a=o(10),s=o(18),l=o(9),c=o(11),d=o(25),u=o(8),f=o(3),p=function(){function t(t){var e=this;this.jodit=t,this.isMarker=function(t){return r.Dom.isNode(t,e.win)&&r.Dom.isElement(t)&&r.Dom.isTag(t,"span")&&t.hasAttribute("data-"+i.MARKER_CLASS)},this.focus=function(){var t,o,i,n;if(!e.isFocused()){e.jodit.iframe&&"complete"==e.doc.readyState&&e.jodit.iframe.focus(),e.win.focus(),e.area.focus();var a=e.sel,s=(null===(t=a)||void 0===t?void 0:t.rangeCount)?null===(o=a)||void 0===o?void 0:o.getRangeAt(0):null;if(!s||!r.Dom.isOrContains(e.area,s.startContainer)){var l=e.createRange();l.setStart(e.area,0),l.collapse(!0),e.selectRange(l);}return e.jodit.editorIsActive||null===(n=null===(i=e.jodit)||void 0===i?void 0:i.events)||void 0===n||n.fire("focus"),!0}return !1},this.eachSelection=function(t){var o=e.sel;if(o&&o.rangeCount){var i=o.getRangeAt(0),a=[],s=i.startOffset,l=e.area.childNodes.length,c=i.startContainer===e.area?e.area.childNodes[l>s?s:l-1]:i.startContainer,d=i.endContainer===e.area?e.area.childNodes[i.endOffset-1]:i.endContainer;r.Dom.find(c,(function(t){return !t||t===e.area||r.Dom.isEmptyTextNode(t)||e.isMarker(t)||a.push(t),t===d||t&&t.contains&&t.contains(d)}),e.area,!0,"nextSibling",!1);var u=function(o){if(r.Dom.isOrContains(e.jodit.editor,o,!0)){if(o.nodeName.match(/^(UL|OL)$/))return Array.from(o.childNodes).forEach(u);if(r.Dom.isTag(o,"li"))if(o.firstChild)o=o.firstChild;else {var i=e.jodit.create.inside.text(n.INVISIBLE_SPACE);o.appendChild(i),o=i;}t(o);}};0===a.length&&r.Dom.isEmptyTextNode(c)&&a.push(c),a.forEach(u);}},t.events.on("removeMarkers",(function(){e.removeMarkers();}));}return t.prototype.errorNode=function(t){if(!r.Dom.isNode(t,this.win))throw f.error("Parameter node must be instance of Node")},Object.defineProperty(t.prototype,"area",{get:function(){return this.jodit.editor},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"win",{get:function(){return this.jodit.editorWindow},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"doc",{get:function(){return this.jodit.editorDocument},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"sel",{get:function(){return this.win.getSelection()},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"range",{get:function(){var t=this.sel;return t&&t.rangeCount?t.getRangeAt(0):this.createRange()},enumerable:!0,configurable:!0}),t.prototype.createRange=function(){return this.doc.createRange()},t.prototype.remove=function(){var t=this.sel,e=this.current();if(t&&e)for(var o=0;t.rangeCount>o;o+=1)t.getRangeAt(o).deleteContents(),t.getRangeAt(o).collapse(!0);},t.prototype.removeNode=function(t){if(!r.Dom.isOrContains(this.jodit.editor,t,!0))throw f.error("Selection.removeNode can remove only editor's children");r.Dom.safeRemove(t),this.jodit.events.fire("afterRemoveNode",t);},t.prototype.insertCursorAtPoint=function(t,e){var o=this;this.removeMarkers();try{var i=this.createRange();return function(){if(o.doc.caretPositionFromPoint&&(n=o.doc.caretPositionFromPoint(t,e)))i.setStart(n.offsetNode,n.offset);else if(o.doc.caretRangeFromPoint){var n=o.doc.caretRangeFromPoint(t,e);i.setStart(n.startContainer,n.startOffset);}}(),i.collapse(!0),this.selectRange(i),!0}catch(t){}return !1},t.prototype.removeMarkers=function(){l.$$("span[data-"+i.MARKER_CLASS+"]",this.area).forEach(r.Dom.safeRemove);},t.prototype.marker=function(t,e){void 0===t&&(t=!1);var o=null;e&&(o=e.cloneRange()).collapse(t);var n=this.jodit.create.inside.span();return n.id=i.MARKER_CLASS+"_"+ +new Date+"_"+(""+Math.random()).slice(2),n.style.lineHeight="0",n.style.display="none",n.setAttribute("data-"+i.MARKER_CLASS,t?"start":"end"),n.appendChild(this.jodit.create.inside.text(i.INVISIBLE_SPACE)),o&&r.Dom.isOrContains(this.area,t?o.startContainer:o.endContainer)&&o.insertNode(n),n},t.prototype.restore=function(t){var e=this;if(void 0===t&&(t=[]),Array.isArray(t)){var o=!1;t.forEach((function(t){var i=e.area.querySelector("#"+t.endId),n=e.area.querySelector("#"+t.startId);if(n)if(o=e.createRange(),t.collapsed||!i){var a=n.previousSibling;r.Dom.isText(a)?o.setStart(a,a.nodeValue?a.nodeValue.length:0):o.setStartBefore(n),r.Dom.safeRemove(n),o.collapse(!0);}else o.setStartAfter(n),r.Dom.safeRemove(n),o.setEndBefore(i),r.Dom.safeRemove(i);})),o&&this.selectRange(o);}},t.prototype.save=function(){var t=this.sel;if(!t||!t.rangeCount)return [];var e,o,i,n=[],r=t.rangeCount,a=[];for(e=0;r>e;e+=1)a[e]=t.getRangeAt(e),a[e].collapsed?(o=this.marker(!0,a[e]),n[e]={startId:o.id,collapsed:!0,startMarker:o.outerHTML}):(o=this.marker(!0,a[e]),i=this.marker(!1,a[e]),n[e]={startId:o.id,endId:i.id,collapsed:!1,startMarker:o.outerHTML,endMarker:i.outerHTML});for(t.removeAllRanges(),e=r-1;e>=0;--e){var s=this.doc.getElementById(n[e].startId);if(s)if(n[e].collapsed)a[e].setStartAfter(s),a[e].collapse(!0);else if(a[e].setStartBefore(s),n[e].endId){var l=this.doc.getElementById(n[e].endId);l&&a[e].setEndAfter(l);}try{t.addRange(a[e].cloneRange());}catch(t){}}return n},t.prototype.isCollapsed=function(){for(var t=this.sel,e=0;t&&t.rangeCount>e;e+=1)if(!t.getRangeAt(e).collapsed)return !1;return !0},t.prototype.isFocused=function(){return this.doc.hasFocus&&this.doc.hasFocus()&&this.area===this.doc.activeElement},t.prototype.current=function(t){if(void 0===t&&(t=!0),this.jodit.getRealMode()===i.MODE_WYSIWYG){var e=this.sel;if(e&&e.rangeCount>0){var o=e.getRangeAt(0),n=o.startContainer,a=!1,s=function(t){return a?t.lastChild:t.firstChild};if(!r.Dom.isText(n)){if((n=o.startContainer.childNodes[o.startOffset])||(n=o.startContainer.childNodes[o.startOffset-1],a=!0),n&&e.isCollapsed&&!r.Dom.isText(n))if(!a&&r.Dom.isText(n.previousSibling))n=n.previousSibling;else if(t)for(var l=s(n);l;){if(l&&r.Dom.isText(l)){n=l;break}l=s(l);}if(n&&!e.isCollapsed&&!r.Dom.isText(n)){var c=n,d=n;do{c=c.firstChild,d=d.lastChild;}while(c&&d&&!r.Dom.isText(c));c===d&&c&&r.Dom.isText(c)&&(n=c);}}if(n&&r.Dom.isOrContains(this.area,n))return n}}return !1},t.prototype.insertNode=function(t,e,o){var i;void 0===e&&(e=!0),void 0===o&&(o=!0),this.errorNode(t),!this.isFocused()&&this.jodit.isEditorMode()&&this.focus();var n=this.sel;if(this.isCollapsed()||this.jodit.execCommand("Delete"),n&&n.rangeCount){var a=n.getRangeAt(0);r.Dom.isOrContains(this.area,a.commonAncestorContainer)?/^(BR|HR|IMG|VIDEO)$/i.test(a.startContainer.nodeName)&&a.collapsed?null===(i=a.startContainer.parentNode)||void 0===i||i.insertBefore(t,a.startContainer):(a.deleteContents(),a.insertNode(t)):this.area.appendChild(t);}else this.area.appendChild(t);e&&(t.nodeType===Node.DOCUMENT_FRAGMENT_NODE?t.lastChild&&this.setCursorAfter(t.lastChild):this.setCursorAfter(t)),o&&this.jodit.events&&this.jodit.events.fire("synchro"),this.jodit.events&&this.jodit.events.fire("afterInsertNode",t);},t.prototype.insertHTML=function(t){if(""!==t){var e,o,i=this.jodit.create.inside.div(),n=this.jodit.create.inside.fragment();if(!this.isFocused()&&this.jodit.isEditorMode()&&this.focus(),r.Dom.isNode(t,this.win)?i.appendChild(t):i.innerHTML=t.toString(),(this.jodit.isEditorMode()||!1!==this.jodit.events.fire("insertHTML",i.innerHTML))&&(e=i.lastChild)){for(;i.firstChild;)e=i.firstChild,n.appendChild(i.firstChild);for(this.insertNode(n,!1),e?this.setCursorAfter(e):this.setCursorIn(n),o=this.area.lastChild;r.Dom.isText(o)&&o.previousSibling&&o.nodeValue&&/^\s*$/.test(o.nodeValue);)o=o.previousSibling;e&&(o&&e===o&&r.Dom.isElement(e)&&this.area.appendChild(this.jodit.create.inside.element("br")),this.setCursorAfter(e));}}},t.prototype.insertImage=function(t,e,o){var i="string"==typeof t?this.jodit.create.inside.element("img"):t;if("string"==typeof t&&i.setAttribute("src",t),null!==o){var n=o.toString();n&&"auto"!==n&&0>String(n).indexOf("px")&&0>String(n).indexOf("%")&&(n+="px"),a.css(i,"width",n);}e&&"object"==typeof e&&a.css(i,e);var r=function(){(i.offsetHeight>i.naturalHeight||i.offsetWidth>i.naturalWidth)&&(i.style.width="",i.style.height=""),i.removeEventListener("load",r);};i.addEventListener("load",r),i.complete&&r();var s=this.insertNode(i);return this.jodit.events.fire("afterInsertImage",i),s},t.prototype.setCursorAfter=function(t){var e=this;if(this.errorNode(t),!r.Dom.up(t,(function(t){return t===e.area||t&&t.parentNode===e.area}),this.area))throw f.error("Node element must be in editor");var o=this.createRange(),n=!1;return r.Dom.isText(t)?o.setEnd(t,null!==t.nodeValue?t.nodeValue.length:0):(n=this.jodit.create.inside.text(i.INVISIBLE_SPACE),o.setStartAfter(t),o.insertNode(n),o.selectNode(n)),o.collapse(!1),this.selectRange(o),n},t.prototype.cursorInTheEdge=function(t,e){var o,i=!t,a=null===(o=this.sel)||void 0===o?void 0:o.getRangeAt(0),s=this.current(!1);if(!a||!s||!r.Dom.isOrContains(e,s,!0))return null;var l=t?a.startContainer:a.endContainer,c=t?a.startOffset:a.endOffset,d=function(t){return t&&!r.Dom.isTag(t,"br")&&!r.Dom.isEmptyTextNode(t)};if(r.Dom.isText(l)){var u=l.nodeValue||"";if(i&&u.replace(n.INVISIBLE_SPACE_REG_EXP_END,"").length>c)return !1;var f=n.INVISIBLE_SPACE_REG_EXP_START.exec(u);if(t&&(f&&c>f[0].length||!f&&c>0))return !1}else {var p=Array.from(l.childNodes);if(i){if(p.slice(c).some(d))return !1}else if(p.slice(0,c).some(d))return !1}return !(t?r.Dom.prev(s,d,e):r.Dom.next(s,d,e))},t.prototype.cursorOnTheLeft=function(t){return this.cursorInTheEdge(!0,t)},t.prototype.cursorOnTheRight=function(t){return this.cursorInTheEdge(!1,t)},t.prototype.setCursorBefore=function(t){var e=this;if(this.errorNode(t),!r.Dom.up(t,(function(t){return t===e.area||t&&t.parentNode===e.area}),this.area))throw f.error("Node element must be in editor");var o=this.createRange(),n=!1;return r.Dom.isText(t)?o.setStart(t,null!==t.nodeValue?t.nodeValue.length:0):(n=this.jodit.create.inside.text(i.INVISIBLE_SPACE),o.setStartBefore(t),o.collapse(!0),o.insertNode(n),o.selectNode(n)),o.collapse(!0),this.selectRange(o),n},t.prototype.setCursorIn=function(t,e){var o=this;if(void 0===e&&(e=!1),this.errorNode(t),!r.Dom.up(t,(function(t){return t===o.area||t&&t.parentNode===o.area}),this.area))throw f.error("Node element must be in editor");var n=this.createRange(),a=t,s=t;do{if(r.Dom.isText(a))break;s=a,a=e?a.firstChild:a.lastChild;}while(a);if(!a){var l=this.jodit.create.inside.text(i.INVISIBLE_SPACE);/^(img|br|input)$/i.test(s.nodeName)?a=s:(s.appendChild(l),s=l);}return n.selectNodeContents(a||s),n.collapse(e),this.selectRange(n),s},t.prototype.selectRange=function(t){var e=this.sel;e&&(e.removeAllRanges(),e.addRange(t)),this.jodit.events.fire("changeSelection");},t.prototype.select=function(t,e){var o=this;if(void 0===e&&(e=!1),this.errorNode(t),!r.Dom.up(t,(function(t){return t===o.area||t&&t.parentNode===o.area}),this.area))throw f.error("Node element must be in editor");var i=this.createRange();i[e?"selectNodeContents":"selectNode"](t),this.selectRange(i);},t.prototype.getHTML=function(){var t=this.sel;if(t&&t.rangeCount>0){var e=t.getRangeAt(0).cloneContents(),o=this.jodit.create.inside.div();return o.appendChild(e),o.innerHTML}return ""},t.prototype.wrapInTag=function(t){var e=this;l.$$("*[style*=font-size]",this.area).forEach((function(t){t.style&&t.style.fontSize&&t.setAttribute("data-font-size",t.style.fontSize.toString());})),this.doc.execCommand("fontsize",!1,"7"),l.$$("*[data-font-size]",this.area).forEach((function(t){var e=t.getAttribute("data-font-size");t.style&&e&&(t.style.fontSize=e,t.removeAttribute("data-font-size"));}));var o=[];return l.$$('font[size="7"]',this.area).forEach((function(i){try{c.isFunction(t)?t(i):o.push(r.Dom.replace(i,t,e.jodit.create.inside));}finally{i.parentNode&&r.Dom.unwrap(i);}})),o},t.prototype.applyCSS=function(t,e,o){var n=this;void 0===e&&(e="span");var l,f=function(t){return null!==t&&!r.Dom.isEmptyTextNode(t)&&!n.isMarker(t)},p=function(t){return !!t&&(RegExp("^"+t.nodeName+"$","i").test(e)||!(!o||!function(t){return !r.Dom.isTag(t,"font")&&r.Dom.isElement(t)&&(c.isPlainObject(o)&&d.each(o,(function(e,o){var i=a.css(t,e,void 0,!0);return null!==i&&""!==i&&-1!==o.indexOf(i.toString().toLowerCase())}))||"function"==typeof o&&o(n.jodit,t))}(t)))&&f(t)},h=function(e){p(e)&&("SPAN"===e.nodeName&&t&&Object.keys(t).forEach((function(o){0===l||a.css(e,o)===s.normilizeCSSValue(o,t[o])?(a.css(e,o,""),void 0===l&&(l=0)):(a.css(e,o,t[o]),void 0===l&&(l=1));})),r.Dom.isBlock(e,n.win)||e.getAttribute("style")&&"SPAN"===e.nodeName||(r.Dom.unwrap(e),void 0===l&&(l=0)));};if(this.isCollapsed()){var v=!1;if(this.current()&&r.Dom.closest(this.current(),e,this.area)){v=!0;var m=r.Dom.closest(this.current(),e,this.area);m&&this.setCursorAfter(m);}if("SPAN"===e.toUpperCase()||!v){var g=this.jodit.create.inside.element(e);return g.appendChild(this.jodit.create.inside.text(i.INVISIBLE_SPACE)),this.insertNode(g,!1,!1),"SPAN"===e.toUpperCase()&&t&&a.css(g,t),void this.setCursorIn(g)}}var b=this.save();s.normalizeNode(this.area.firstChild),this.wrapInTag((function(o){if(r.Dom.next(o,f,o.parentNode)||r.Dom.prev(o,f,o.parentNode)||!p(o.parentNode)||o.parentNode===n.area||r.Dom.isBlock(o.parentNode,n.win)&&!i.IS_BLOCK.test(e))if(!o.firstChild||r.Dom.next(o.firstChild,f,o)||r.Dom.prev(o.firstChild,f,o)||!p(o.firstChild)){if(r.Dom.closest(o,p,n.area)){var s=n.createRange(),c=r.Dom.closest(o,p,n.area);s.setStartBefore(c),s.setEndBefore(o);var d=s.extractContents();d.textContent&&u.trim(d.textContent).length||!d.firstChild||r.Dom.unwrap(d.firstChild),c.parentNode&&c.parentNode.insertBefore(d,c),s.setStartAfter(o),s.setEndAfter(c);var v=s.extractContents();return v.textContent&&u.trim(v.textContent).length||!v.firstChild||r.Dom.unwrap(v.firstChild),r.Dom.after(c,v),void h(c)}var m,g=[];o.firstChild&&r.Dom.find(o.firstChild,(function(t){return t&&p(t)?(void 0===m&&(m=!0),g.push(t)):void 0===m&&(m=!1),!1}),o,!0),g.forEach(r.Dom.unwrap),m||(void 0===l&&(l=1),1===l&&a.css(r.Dom.replace(o,e,n.jodit.create.inside),t&&"SPAN"===e.toUpperCase()?t:{}));}else h(o.firstChild);else h(o.parentNode);})),this.restore(b);},t.prototype.splitSelection=function(t){if(!this.isCollapsed())return null;var e=this.createRange(),o=this.range;e.setStartBefore(t);var i=this.cursorOnTheRight(t),n=this.cursorOnTheLeft(t),a=null;if(i||n){a=this.jodit.create.inside.element("br"),o.insertNode(a);var s=function(t,e){for(var o=e(t);o;){var i=e(o);if(!o||!r.Dom.isTag(o,"br")&&!r.Dom.isEmptyTextNode(o))break;r.Dom.safeRemove(o),o=i;}};s(a,(function(t){return t.nextSibling})),s(a,(function(t){return t.previousSibling})),i?(e.setEndBefore(a),o.setEndBefore(a)):(e.setEndAfter(a),o.setEndAfter(a));}else e.setEnd(o.startContainer,o.startOffset);var l=e.extractContents();if(t.parentNode)try{if(t.parentNode.insertBefore(l,t),i&&a&&a.parentNode){var c=this.createRange();c.setStartBefore(a),this.selectRange(c);}}catch(t){}return t.previousElementSibling},t}();e.Select=p;},function(t,e,o){var i;Object.defineProperty(e,"__esModule",{value:!0}),e.canUsePersistentStorage=function(){return void 0===i&&(i=function(){var t="___Jodit___"+Math.random().toString();try{localStorage.setItem(t,"1");var e="1"===localStorage.getItem(t);return localStorage.removeItem(t),e}catch(t){}return !1}()),i};var n=function(){function t(t){this.rootKey=t;}return t.prototype.set=function(t,e){try{var o=localStorage.getItem(this.rootKey),i=o?JSON.parse(o):{};i[t]=e,localStorage.setItem(this.rootKey,JSON.stringify(i));}catch(t){}},t.prototype.get=function(t){try{var e=localStorage.getItem(this.rootKey),o=e?JSON.parse(e):{};return void 0!==o[t]?o[t]:null}catch(t){}},t.prototype.exists=function(t){return null!==this.get(t)},t.prototype.clear=function(){try{localStorage.removeItem(this.rootKey);}catch(t){}},t}();e.LocalStorageProvider=n;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(){this.data=new Map;}return t.prototype.set=function(t,e){this.data.set(t,e);},t.prototype.get=function(t){return this.data.get(t)},t.prototype.exists=function(t){return this.data.has(t)},t.prototype.clear=function(){this.data.clear();},t}();e.MemoryStorageProvider=i;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(128),r=o(3),a=function(){function t(t){var e=this;this.__key="__JoditEventsNativeNamespaces",this.doc=document,this.__stopped=[],this.prepareEvent=function(t){t.cancelBubble||(t.type.match(/^touch/)&&t.changedTouches&&t.changedTouches.length&&["clientX","clientY","pageX","pageY"].forEach((function(e){Object.defineProperty(t,e,{value:t.changedTouches[0][e],configurable:!0,enumerable:!0});})),t.originalEvent||(t.originalEvent=t),"paste"===t.type&&void 0===t.clipboardData&&e.doc.defaultView.clipboardData&&Object.defineProperty(t,"clipboardData",{get:function(){return e.doc.defaultView.clipboardData},configurable:!0,enumerable:!0}));},this.current=[],this.isDestructed=!1,t&&(this.doc=t),this.__key+=(new Date).getTime();}return t.prototype.eachEvent=function(t,e){var o=this;t.split(/[\s,]+/).forEach((function(t){var i=t.split(".");e.call(o,i[0],i[1]||n.defaultNameSpace);}));},t.prototype.getStore=function(t){if(!t)throw r.error("Need subject");if(void 0===t[this.__key]){var e=new n.EventHandlersStore;Object.defineProperty(t,this.__key,{enumerable:!1,configurable:!0,value:e});}return t[this.__key]},t.prototype.clearStore=function(t){void 0!==t[this.__key]&&delete t[this.__key];},t.prototype.triggerNativeEvent=function(t,e){var o=this.doc.createEvent("HTMLEvents");"string"==typeof e?o.initEvent(e,!0,!0):(o.initEvent(e.type,e.bubbles,e.cancelable),["screenX","screenY","clientX","clientY","target","srcElement","currentTarget","timeStamp","which","keyCode"].forEach((function(t){Object.defineProperty(o,t,{value:e[t],enumerable:!0});})),Object.defineProperty(o,"originalEvent",{value:e,enumerable:!0})),t.dispatchEvent(o);},t.prototype.removeStop=function(t){if(t){var e=this.__stopped.indexOf(t);-1!==e&&this.__stopped.splice(e,1);}},t.prototype.isStopped=function(t){return void 0!==t&&-1!==this.__stopped.indexOf(t)},t.prototype.on=function(t,e,o,i,n){var a=this;void 0===n&&(n=!1);var s="string"==typeof t?this:t,l="string"==typeof e?e:t,c=o;void 0===c&&"function"==typeof e&&(c=e);var d=this.getStore(s);if("string"!=typeof l||""===l)throw r.error("Need events names");if("function"!=typeof c)throw r.error("Need event handler");if(Array.isArray(s))return s.forEach((function(t){a.on(t,l,c,i);})),this;var u="function"==typeof s.addEventListener,f=this,p=function(t){return c&&c.apply(this,arguments)};return u&&(p=function(t){if(f.prepareEvent(t),c&&!1===c.call(this,t))return t.preventDefault(),t.stopImmediatePropagation(),!1},i&&(p=function(t){f.prepareEvent(t);for(var e=t.target;e&&e!==this;){if(e.matches(i))return Object.defineProperty(t,"target",{value:e,configurable:!0,enumerable:!0}),c&&!1===c.call(e,t)?(t.preventDefault(),!1):void 0;e=e.parentNode;}})),this.eachEvent(l,(function(t,e){if(""===t)throw r.error("Need event name");!1===d.indexOf(t,e,c)&&(d.set(t,e,{event:t,originalCallback:c,syntheticCallback:p},n),u&&s.addEventListener(t,p,!1));})),this},t.prototype.off=function(t,e,o){var i=this,r="string"==typeof t?this:t,a="string"==typeof e?e:t,s=this.getStore(r),l=o;if("string"!=typeof a||!a)return s.namespaces().forEach((function(t){i.off(r,"."+t);})),this.clearStore(r),this;void 0===l&&"function"==typeof e&&(l=e);var c="function"==typeof r.removeEventListener,d=function(t){c&&r.removeEventListener(t.event,t.syntheticCallback,!1);},u=function(t,e){if(""!==t){var o=s.get(t,e);if(o&&o.length)if("function"!=typeof l)o.forEach(d),o.length=0;else {var i=s.indexOf(t,e,l);!1!==i&&(d(o[i]),o.splice(i,1));}}else s.events(e).forEach((function(t){""!==t&&u(t,e);}));};return this.eachEvent(a,(function(t,e){e===n.defaultNameSpace?s.namespaces().forEach((function(e){u(t,e);})):u(t,e);})),this},t.prototype.stopPropagation=function(t,e){var o=this,i="string"==typeof t?this:t,a="string"==typeof t?t:e;if("string"!=typeof a)throw r.error("Need event names");var s=this.getStore(i);this.eachEvent(a,(function(t,e){var r=s.get(t,e);r&&o.__stopped.push(r),e===n.defaultNameSpace&&s.namespaces(!0).forEach((function(e){return o.stopPropagation(i,t+"."+e)}));}));},t.prototype.fire=function(t,e){for(var o=this,a=[],s=2;arguments.length>s;s++)a[s-2]=arguments[s];var l,c=void 0,d="string"==typeof t?this:t,u="string"==typeof t?t:e,f="string"==typeof t?i.__spreadArrays([e],a):a,p="function"==typeof d.dispatchEvent;if(!p&&"string"!=typeof u)throw r.error("Need events names");var h=this.getStore(d);return "string"!=typeof u&&p?this.triggerNativeEvent(d,e):this.eachEvent(u,(function(t,e){if(p)o.triggerNativeEvent(d,t);else {var r=h.get(t,e);if(r)try{r.every((function(e){return !o.isStopped(r)&&(o.current.push(t),l=e.syntheticCallback.apply(d,f),o.current.pop(),void 0!==l&&(c=l),!0)}));}finally{o.removeStop(r);}e!==n.defaultNameSpace||p||h.namespaces().filter((function(t){return t!==e})).forEach((function(e){var n=o.fire.apply(o,i.__spreadArrays([d,t+"."+e],f));void 0!==n&&(c=n);}));}})),c},t.prototype.destruct=function(){this.isDestructed&&(this.isDestructed=!0,this.off(this),this.getStore(this).clear(),delete this[this.__key]);},t}();e.EventsNative=a;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(23),n=o(25),r=o(42),a=o(1),s=o(3),l=function(){function t(e,o){void 0===o&&(o=!1),this.jodit=e,this.insideCreator=o,this.applyAttributes=function(t,e){n.each(e,(function(e,o){i.isPlainObject(o)&&"style"===e?s.css(t,o):t.setAttribute(e,o.toString());}));},o||(this.inside=new t(e,!0));}return Object.defineProperty(t.prototype,"doc",{get:function(){return this.insideCreator&&s.isJoditObject(this.jodit)?this.jodit.editorDocument:this.jodit.ownerDocument},enumerable:!0,configurable:!0}),t.prototype.element=function(t,e,o){var n=this,a=this.doc.createElement(t.toLowerCase());if(this.insideCreator){var l=this.jodit.options.createAttributes;if(l&&l[t.toLowerCase()]){var c=l[t.toLowerCase()];s.isFunction(c)?c(a):i.isPlainObject(c)&&this.applyAttributes(a,c);}}return e&&(i.isPlainObject(e)?this.applyAttributes(a,e):o=e),o&&r.asArray(o).forEach((function(t){return a.appendChild("string"==typeof t?n.fromHTML(t):t)})),a},t.prototype.div=function(t,e,o){var i=this.element("div",e,o);return t&&(i.className=t),i},t.prototype.span=function(t,e,o){var i=this.element("span",e,o);return t&&(i.className=t),i},t.prototype.a=function(t,e,o){var i=this.element("a",e,o);return t&&(i.className=t),i},t.prototype.text=function(t){return this.doc.createTextNode(t)},t.prototype.fragment=function(){return this.doc.createDocumentFragment()},t.prototype.fromHTML=function(t,e){var o=this.div();o.innerHTML=t.toString();var i=o.firstChild===o.lastChild&&o.firstChild?o.firstChild:o;if(a.Dom.safeRemove(i),e){var n=s.refs(i);Object.keys(e).forEach((function(t){var o=n[t];o&&!1===e[t]&&a.Dom.hide(o);}));}return i},t}();e.Create=l;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(7),r=o(1),a=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.progressBar=e.jodit.create.div("jodit_progressbar",e.jodit.create.div()),e}return i.__extends(e,t),e.prototype.show=function(){return this.jodit.workplace.appendChild(this.progressBar),this},e.prototype.hide=function(){return r.Dom.safeRemove(this.progressBar),this},e.prototype.progress=function(t){return this.progressBar.style.width=t.toFixed(2)+"%",this},e.prototype.destruct=function(){return this.hide(),t.prototype.destruct.call(this)},e}(n.Component);e.ProgressBar=a;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(3),r=function(){function t(){this.items=new Map;}return t.prototype.add=function(t,e){this.items.set(t.toLowerCase(),e);},t.prototype.get=function(t){return this.items.get(t.toLowerCase())},t.prototype.remove=function(t){this.items.delete(t.toLowerCase());},t.prototype.init=function(e){return i.__awaiter(this,void 0,Promise,(function(){var o,r,a,s,l,c,d,u,f=this;return i.__generator(this,(function(i){switch(i.label){case 0:if(o=e.options.extraPlugins.map((function(t){return n.isString(t)?{name:t.toLowerCase()}:t})),r=n.splitArray(e.options.disablePlugins).map((function(t){return t.toLowerCase()})),a=[],s={},l=[],c={},d=function(o,i){if(!(r.includes(i)||a.includes(i)||s[i])){var n=t.makePluginInstance(e,o);f.initOrWait(e,i,n,a,s),l.push(n),c[i]=n;}},!o||!o.length)return [3,5];i.label=1;case 1:return i.trys.push([1,4,,5]),(u=o.filter((function(t){return !f.items.has(t.name)}))).length?[4,this.load(e,u)]:[3,3];case 2:i.sent(),i.label=3;case 3:return [3,5];case 4:return i.sent(),[3,5];case 5:return e.isInDestruct?[2]:(this.items.forEach(d),this.addListenerOnBeforeDestruct(e,l),e.__plugins=c,[2])}}))}))},t.makePluginInstance=function(t,e){return n.isFunction(e)?new e(t):e},t.prototype.initOrWait=function(e,o,i,r,a){var s=function(o,i){if(i.hasStyle&&t.loadStyle(e,o),n.isInitable(i)){if(i.requires&&i.requires.length&&!i.requires.every((function(t){return r.includes(t)})))return a[o]=i,!1;i.init(e),r.push(o);}else r.push(o);return !0};s(o,i),Object.keys(a).forEach((function(t){a[t]&&s(t,i)&&(a[t]=void 0,delete a[t]);}));},t.prototype.addListenerOnBeforeDestruct=function(t,e){t.events.on("beforeDestruct",(function(){e.forEach((function(e){n.isDestructable(e)&&e.destruct(t);})),e.length=0,delete t.__plugins;}));},t.prototype.load=function(e,o){return Promise.all(o.map((function(o){var i=o.url||t.getFullUrl(e,name,!0);return n.appendScriptAsync(e,i).then((function(t){return {v:t,status:"fulfilled"}}),(function(t){return {e:t,status:"rejected"}}))})))},t.loadStyle=function(e,o){return n.appendStyleAsync(e,t.getFullUrl(e,o,!1))},t.getFullUrl=function(t,e,o){return t.basePath+"plugins/"+e+"/"+e+"."+(o?"js":"css")},t}();e.PluginSystem=r;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(154);e.addNewLine=i.addNewLine;var n=o(155);e.autofocus=n.autofocus;var r=o(156);e.backspace=r.backspace;var a=o(157);e.bold=a.bold;var s=o(158);e.cleanHtml=s.cleanHtml;var l=o(68);e.clipboard=l.clipboard,e.paste=l.paste,e.pasteStorage=l.pasteStorage;var c=o(162);e.color=c.color;var d=o(163);e.DragAndDrop=d.DragAndDrop;var u=o(164);e.DragAndDropElement=u.DragAndDropElement;var f=o(165);e.enter=f.enter;var p=o(166);e.errorMessages=p.errorMessages;var h=o(167);e.font=h.font;var v=o(168);e.formatBlock=v.formatBlock;var m=o(169);e.fullsize=m.fullsize;var g=o(170);e.hotkeys=g.hotkeys;var b=o(171);e.iframe=b.iframe;var y=o(172);e.imageProcessor=y.imageProcessor;var _=o(173);e.imageProperties=_.imageProperties;var w=o(174);e.indent=w.indent;var j=o(175);e.inlinePopup=j.inlinePopup;var S=o(71);e.justify=S.justify;var C=o(176);e.limit=C.limit;var x=o(177);e.link=x.link;var k=o(178);e.media=k.media;var E=o(179);e.mobile=E.mobile;var T=o(180);e.orderedlist=T.orderedlist;var D=o(181);e.placeholder=D.placeholder;var z=o(182);e.redoundo=z.redoundo;var L=o(183);e.resizer=L.resizer;var M=o(184);e.search=M.search;var A=o(185);e.size=A.size;var I=o(186);e.source=I.source;var P=o(193);e.stat=P.stat;var q=o(194);e.sticky=q.sticky;var O=o(195);e.symbols=O.symbols;var R=o(196);e.tableKeyboardNavigation=R.tableKeyboardNavigation;var N=o(197);e.table=N.TableProcessor;var B=o(198);e.tooltip=B.tooltip;var H=o(199);e.xpath=H.xpath;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);i.__exportStar(o(69),e),i.__exportStar(o(70),e),i.__exportStar(o(160),e),o(161);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(2),r=o(33),a=o(70);i.Config.prototype.controls.cut={command:"cut",isDisable:function(t){return t.selection.isCollapsed()},tooltip:"Cut selection"},i.Config.prototype.controls.copy={command:"copy",isDisable:function(t){return t.selection.isCollapsed()},tooltip:"Copy selection"},e.pluginKey="clipboard";var s=function(){function t(){}return t.prototype.init=function(t){t.events.off("copy."+e.pluginKey+" cut."+e.pluginKey).on("copy."+e.pluginKey+" cut."+e.pluginKey,(function(o){var i,s,l=t.selection.getHTML(),c=a.getDataTransfer(o)||a.getDataTransfer(t.editorWindow)||a.getDataTransfer(o.originalEvent);c&&(c.setData(n.TEXT_PLAIN,r.stripTags(l)),c.setData(n.TEXT_HTML,l)),t.buffer.set(e.pluginKey,l),"cut"===o.type&&(t.selection.remove(),t.selection.focus()),o.preventDefault(),null===(s=null===(i=t)||void 0===i?void 0:i.events)||void 0===s||s.fire("afterCopy",l);}));},t.prototype.destruct=function(t){var o,i,n,r;null===(i=null===(o=t)||void 0===o?void 0:o.buffer)||void 0===i||i.set(e.pluginKey,""),null===(r=null===(n=t)||void 0===n?void 0:n.events)||void 0===r||r.off("."+e.pluginKey);},t}();e.clipboard=s;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(12),s=o(3),l=o(1),c=o(159),d=o(69);n.Config.prototype.askBeforePasteHTML=!0,n.Config.prototype.processPasteHTML=!0,n.Config.prototype.askBeforePasteFromWord=!0,n.Config.prototype.processPasteFromWord=!0,n.Config.prototype.nl2brInPlainText=!0,n.Config.prototype.defaultActionOnPaste=r.INSERT_AS_HTML,e.getDataTransfer=function(t){if(t.clipboardData)return t.clipboardData;try{return t.dataTransfer||new DataTransfer}catch(t){return null}},n.Config.prototype.controls.paste={tooltip:"Paste from clipboard",exec:function(t){return i.__awaiter(this,void 0,void 0,(function(){var e,o,n,r,s;return i.__generator(this,(function(i){switch(i.label){case 0:if(t.selection.focus(),e="",(o=!0)&&(e=t.buffer.get(d.pluginKey)||"",o=0===e.length),!o||!navigator.clipboard)return [3,11];i.label=1;case 1:return i.trys.push([1,6,,7]),[4,navigator.clipboard.read()];case 2:return (n=i.sent())&&n.length?[4,n[0].getType("text/plain")]:[3,5];case 3:return r=i.sent(),[4,new Response(r).text()];case 4:e=i.sent(),i.label=5;case 5:return [3,7];case 6:return i.sent(),[3,7];case 7:if(!o)return [3,11];i.label=8;case 8:return i.trys.push([8,10,,11]),[4,navigator.clipboard.readText()];case 9:return e=i.sent(),o=!1,[3,11];case 10:return i.sent(),[3,11];case 11:return o&&(s=t.value,t.editorDocument.execCommand("paste"),o=s!==t.value),e?t.selection.insertHTML(e):o&&a.Alert(t.i18n("Your browser doesn't support direct access to the clipboard."),(function(){t.selection.focus();})),[2]}}))}))}},e.paste=function(t){var o=t.options,i=function(e,o,i,n,r){var s;if(void 0===n&&(n="Clean"),void 0===r&&(r="Insert only Text"),!t.events||!1!==t.events.fire("beforeOpenPasteDialog",e,o,i,n,r)){var l=a.Confirm('<div style="word-break: normal; white-space: normal">'+e+"</div>",o,i);t.markOwner(l.container);var c=l.create.fromHTML('<a href="javascript:void(0)" class="jodit_button jodit_button_primary"><span>'+t.i18n("Keep")+"</span></a>"),d=l.create.fromHTML('<a href="javascript:void(0)" class="jodit_button"><span>'+t.i18n(n)+"</span></a>"),u=l.create.fromHTML('<a href="javascript:void(0)" class="jodit_button"><span>'+t.i18n(r)+"</span></a>"),f=l.create.fromHTML('<a href="javascript:void(0)" class="jodit_button"><span>'+t.i18n("Cancel")+"</span></a>");return t.events.on(c,"click",(function(){l.close(),i&&i(!0);})),t.events.on(d,"click",(function(){l.close(),i&&i(!1);})),t.events.on(u,"click",(function(){l.close(),i&&i(0);})),t.events.on(f,"click",(function(){l.close();})),l.setFooter([c,d,r?u:"",f]),null===(s=t.events)||void 0===s||s.fire("afterOpenPasteDialog",l,e,o,i,n,r),l}},n=function(e,o){if("string"==typeof e)switch(o){case r.INSERT_CLEAR_HTML:e=s.cleanFromWord(e);break;case r.INSERT_ONLY_TEXT:e=s.stripTags(e);break;case r.INSERT_AS_TEXT:e=s.htmlspecialchars(e);}"string"==typeof e&&t.buffer.set(d.pluginKey,e),t.selection.insertHTML(e);},u=function(e,a){var l=t.buffer.get(d.pluginKey);if(s.isHTML(e)&&l!==f(e)){e=f(e);var c=function(o){"drop"===a.type&&t.selection.insertCursorAtPoint(a.clientX,a.clientY),n(e,o),t.setEditorValue();};return o.askBeforePasteHTML?i(t.i18n("Your code is similar to HTML. Keep as HTML?"),t.i18n("Paste as HTML"),(function(t){var e=r.INSERT_AS_HTML;!1===t&&(e=r.INSERT_AS_TEXT),0===t&&(e=r.INSERT_ONLY_TEXT),c(e);}),"Insert as Text"):c(o.defaultActionOnPaste),!1}},f=function(t){var e=t.search(/<!--StartFragment-->/i);-1!==e&&(t=t.substr(e+20));var o=t.search(/<!--EndFragment-->/i);return -1!==o&&(t=t.substr(0,o)),t};t.events.off("paste.paste").on("paste.paste",(function(a){if(!1===function(n){var a=e.getDataTransfer(n);if(a&&n&&a.getData){if(a.getData(r.TEXT_HTML)){var c=function(e){var a=t.buffer.get(d.pluginKey);if(o.processPasteHTML&&s.isHTML(e)&&a!==f(e)){if(o.processPasteFromWord&&s.isHTMLFromWord(e)){var l=function(i){var n;if(i===r.INSERT_AS_HTML&&(e=s.applyStyles(e),o.beautifyHTML)){var a=null===(n=t.events)||void 0===n?void 0:n.fire("beautifyHTML",e);s.isString(a)&&(e=a);}i===r.INSERT_AS_TEXT&&(e=s.cleanFromWord(e)),i===r.INSERT_ONLY_TEXT&&(e=s.stripTags(s.cleanFromWord(e))),t.selection.insertHTML(e),t.setEditorValue();};o.askBeforePasteFromWord?i(t.i18n("The pasted content is coming from a Microsoft Word/Excel document. Do you want to keep the format or clean it up?"),t.i18n("Word Paste Detected"),(function(t){var e=r.INSERT_AS_HTML;!1===t&&(e=r.INSERT_AS_TEXT),0===t&&(e=r.INSERT_ONLY_TEXT),l(e);})):l(o.defaultActionOnPaste);}else u(e,n);return !1}};if(a.types&&-1!==Array.from(a.types).indexOf("text/html")){var p=a.getData(r.TEXT_HTML);return c(p)}if("drop"!==n.type){var h=t.create.div("",{tabindex:-1,contenteditable:!0,style:{left:-9999,top:0,width:0,height:"100%",lineHeight:"140%",overflow:"hidden",position:"fixed",zIndex:2147483647,wordBreak:"break-all"}});t.container.appendChild(h);var v=t.selection.save();h.focus();var m=0,g=function(){l.Dom.safeRemove(h),t.selection&&t.selection.restore(v);},b=function(){if(m+=1,h.childNodes&&h.childNodes.length>0){var e=h.innerHTML;return g(),void(!1!==c(e)&&t.selection.insertHTML(e))}5>m?t.async.setTimeout(b,20):g();};b();}}return a.getData(r.TEXT_PLAIN)?u(a.getData(r.TEXT_PLAIN),n):void 0}}(a)||!1===t.events.fire("beforePaste",a))return a.preventDefault(),!1;var c=e.getDataTransfer(a);if(a&&c){var p=c.types,h="";if(Array.isArray(p)||"domstringlist"===s.type(p))for(var v=0;p.length>v;v+=1)h+=p[v]+";";else h=(p||r.TEXT_PLAIN).toString()+";";var m=/text\/html/i.test(h)?c.getData("text/html"):/text\/rtf/i.test(h)&&s.browser("safari")?c.getData("text/rtf"):/text\/plain/i.test(h)&&!s.browser("mozilla")?c.getData(r.TEXT_PLAIN):/text/i.test(h)&&r.IS_IE?c.getData(r.TEXT_PLAIN):null;if(l.Dom.isNode(m,t.editorWindow)||m&&""!==s.trim(m)){if(m=f(m),t.buffer.get(d.pluginKey)!==m){var g=t.events.fire("processPaste",a,m,h);void 0!==g&&(m=g);}("string"==typeof m||l.Dom.isNode(m,t.editorWindow))&&("drop"===a.type&&t.selection.insertCursorAtPoint(a.clientX,a.clientY),n(m,o.defaultActionOnPaste)),a.preventDefault(),a.stopPropagation();}}return !1!==t.events.fire("afterPaste",a)&&void 0})),o.nl2brInPlainText&&t.events.off("processPaste.paste").on("processPaste.paste",(function(t,e,o){if(o===r.TEXT_PLAIN+";"&&!s.isHTML(e))return c.nl2br(e)}));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(1),r=o(3),a=o(6);i.Config.prototype.controls.align={name:"left",tooltip:"Align",getLabel:function(t,e,o){var i=t.selection.current();if(i){var s=n.Dom.closest(i,(function(e){return n.Dom.isBlock(e,t.editorWindow)}),t.editor)||t.editor,l=r.css(s,"text-align").toString();e.defaultValue&&-1!==e.defaultValue.indexOf(l)&&(l="left"),o&&e.data&&e.data.currentValue!==l&&e.list&&-1!==e.list.indexOf(l)&&(o.textBox.innerHTML=t.options.textIcons?"<span>"+l+"</span>":a.ToolbarIcon.getIcon(l,""),o.textBox.firstChild.classList.add("jodit_icon"),e.data.currentValue=l);}return !1},isActive:function(t,e){var o=t.selection.current();if(o&&e.defaultValue){var i=n.Dom.closest(o,(function(e){return n.Dom.isBlock(e,t.editorWindow)}),t.editor)||t.editor;return -1===e.defaultValue.indexOf(r.css(i,"text-align").toString())}return !1},defaultValue:["left","start","inherit"],data:{currentValue:"left"},list:["center","left","right","justify"]},i.Config.prototype.controls.center={command:"justifyCenter",css:{"text-align":"center"},tooltip:"Align Center"},i.Config.prototype.controls.justify={command:"justifyFull",css:{"text-align":"justify"},tooltip:"Align Justify"},i.Config.prototype.controls.left={command:"justifyLeft",css:{"text-align":"left"},tooltip:"Align Left"},i.Config.prototype.controls.right={command:"justifyRight",css:{"text-align":"right"},tooltip:"Align Right"},e.clearAlign=function(t,e){n.Dom.each(t,(function(t){n.Dom.isHTMLElement(t,e.editorWindow)&&t.style.textAlign&&(t.style.textAlign="",t.style.cssText.trim().length||t.removeAttribute("style"));}));},e.alignElement=function(t,o,i){if(n.Dom.isNode(o,i.editorWindow)&&n.Dom.isElement(o))switch(e.clearAlign(o,i),t.toLowerCase()){case"justifyfull":o.style.textAlign="justify";break;case"justifyright":o.style.textAlign="right";break;case"justifyleft":o.style.textAlign="left";break;case"justifycenter":o.style.textAlign="center";}},e.justify=function(t){var o=function(o){return t.selection.focus(),t.selection.eachSelection((function(i){if(i){var r=n.Dom.up(i,(function(e){return n.Dom.isBlock(e,t.editorWindow)}),t.editor);r||(r=n.Dom.wrapInline(i,t.options.enterBlock,t)),e.alignElement(o,r,t);}})),!1};t.registerCommand("justifyfull",o),t.registerCommand("justifyright",o),t.registerCommand("justifyleft",o),t.registerCommand("justifycenter",o);};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(t,e,o,i){this.jodit=t,this.container=e,this.toWYSIWYG=o,this.fromWYSIWYG=i,this.className="",this.isReady=!1;}return t.prototype.onReady=function(){this.isReady=!0,this.jodit.events.fire(this,"ready");},t.prototype.onReadyAlways=function(t){var e;this.isReady?t():null===(e=this.jodit.events)||void 0===e||e.on(this,"ready",t);},t}();e.SourceEditor=i;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(15),n=o(6);e.Prompt=function(t,e,o,r,a){var s=new i.Dialog,l=s.create.fromHTML('<a href="javascript:void(0)" style="float:right;" class="jodit_button">'+n.ToolbarIcon.getIcon("cancel")+"<span>"+s.i18n("Cancel")+"</span></a>"),c=s.create.fromHTML('<a href="javascript:void(0)" style="float:left;" class="jodit_button">'+n.ToolbarIcon.getIcon("check")+"<span>"+s.i18n("Ok")+"</span></a>"),d=s.create.element("form",{class:"jodit_prompt"}),u=s.create.element("input",{autofocus:!0,class:"jodit_input"}),f=s.create.element("label");"function"==typeof e&&(o=e,e=void 0),r&&u.setAttribute("placeholder",r),f.appendChild(s.create.text(t)),d.appendChild(f),d.appendChild(u),l.addEventListener("click",s.close,!1);var p=function(){o&&"function"==typeof o&&!1===o(u.value)||s.close();};return c.addEventListener("click",p),d.addEventListener("submit",(function(){return p(),!1})),s.setFooter([c,l]),s.open(d,e||"&nbsp;",!0,!0),u.focus(),void 0!==a&&a.length&&(u.value=a,u.select()),s};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(15),n=o(6);e.Confirm=function(t,e,o){var r=new i.Dialog,a=r.create.fromHTML('<form class="jodit_prompt"></form>'),s=r.create.element("label");"function"==typeof e&&(o=e,e=void 0),s.appendChild(r.create.fromHTML(t)),a.appendChild(s);var l=r.create.fromHTML('<a href="javascript:void(0)" style="float:right;" class="jodit_button">'+n.ToolbarIcon.getIcon("cancel")+"<span>"+r.i18n("Cancel")+"</span></a>");l.addEventListener("click",(function(){o&&o(!1),r.close();}));var c=function(){o&&o(!0),r.close();},d=r.create.fromHTML('<a href="javascript:void(0)" style="float:left;" class="jodit_button">'+n.ToolbarIcon.getIcon("check")+"<span>"+r.i18n("Yes")+"</span></a>");return d.addEventListener("click",c),a.addEventListener("submit",(function(){return c(),!1})),r.setFooter([d,l]),r.open(a,e||"&nbsp;",!0,!0),d.focus(),r};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(204),n=o(39);e.makeDataProvider=function(t,e){return new i.default(t,e)},e.makeContextMenu=function(t){return new n.ContextMenu(t)};},function(t,e,o){t.exports=o(77);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),o(78),"undefined"!=typeof window&&o(79);var i=o(16),n=o(135),r=o(2),a=o(21),s=o(67),l=o(209),c=o(4),d=o(6);Object.keys(r).forEach((function(t){i.Jodit[t]=r[t];}));var u=function(t){return "__esModule"!==t};Object.keys(l).filter(u).forEach((function(t){d.ToolbarIcon.setIcon(t.replace("_","-"),l[t]);})),Object.keys(a).filter(u).forEach((function(t){i.Jodit.modules[t]=a[t];})),["Confirm","Alert","Prompt"].forEach((function(t){i.Jodit[t]=a[t];})),Object.keys(s).filter(u).forEach((function(t){i.Jodit.plugins.add(t,s[t]);})),Object.keys(n.default).filter(u).forEach((function(t){i.Jodit.lang[t]=n.default[t];})),i.Jodit.defaultOptions=c.Config.defaultOptions,c.OptionsDefault.prototype=i.Jodit.defaultOptions,e.Jodit=i.Jodit,e.default=i.Jodit;},function(t,e,o){},function(t,e,o){var i;Object.defineProperty(e,"__esModule",{value:!0}),o(80),o(81),(i=Element.prototype).matches||(i.matches=void 0!==i.matchesSelector?i.matchesSelector:function(t){if(!this.ownerDocument)return [];var e=this.ownerDocument.querySelectorAll(t),o=this;return Array.prototype.some.call(e,(function(t){return t===o}))}),Array.from||(Array.from=function(t){return [].slice.call(t)}),Array.prototype.includes||(Array.prototype.includes=function(t){return this.indexOf(t)>-1}),"function"!=typeof Object.assign&&Object.defineProperty(Object,"assign",{value:function(t,e){if(null==t)throw new TypeError("Cannot convert undefined or null to object");for(var o=Object(t),i=1;arguments.length>i;i++){var n=arguments[i];if(null!=n)for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(o[r]=n[r]);}return o},writable:!0,configurable:!0});},function(t,e){"document"in window.self&&("classList"in document.createElement("_")&&(!document.createElementNS||"classList"in document.createElementNS("http://www.w3.org/2000/svg","g"))||function(t){if("Element"in t){var e=t.Element.prototype,o=Object,i=String.prototype.trim||function(){return this.replace(/^\s+|\s+$/g,"")},n=Array.prototype.indexOf||function(t){for(var e=0,o=this.length;o>e;e++)if(e in this&&this[e]===t)return e;return -1},r=function(t,e){this.name=t,this.code=DOMException[t],this.message=e;},a=function(t,e){if(""===e)throw new r("SYNTAX_ERR","An invalid or illegal string was specified");if(/\s/.test(e))throw new r("INVALID_CHARACTER_ERR","String contains an invalid character");return n.call(t,e)},s=function(t){for(var e=i.call(t.getAttribute("class")||""),o=e?e.split(/\s+/):[],n=0,r=o.length;r>n;n++)this.push(o[n]);this._updateClassName=function(){t.setAttribute("class",this.toString());};},l=s.prototype=[],c=function(){return new s(this)};if(r.prototype=Error.prototype,l.item=function(t){return this[t]||null},l.contains=function(t){return -1!==a(this,t+="")},l.add=function(){var t,e=arguments,o=0,i=e.length,n=!1;do{-1===a(this,t=e[o]+"")&&(this.push(t),n=!0);}while(++o<i);n&&this._updateClassName();},l.remove=function(){var t,e,o=arguments,i=0,n=o.length,r=!1;do{for(e=a(this,t=o[i]+"");-1!==e;)this.splice(e,1),r=!0,e=a(this,t);}while(++i<n);r&&this._updateClassName();},l.toggle=function(t,e){var o=this.contains(t+=""),i=o?!0!==e&&"remove":!1!==e&&"add";return i&&this[i](t),!0===e||!1===e?e:!o},l.toString=function(){return this.join(" ")},o.defineProperty){var d={get:c,enumerable:!0,configurable:!0};try{o.defineProperty(e,"classList",d);}catch(t){void 0!==t.number&&-2146823252!==t.number||(d.enumerable=!1,o.defineProperty(e,"classList",d));}}else o.prototype.__defineGetter__&&e.__defineGetter__("classList",c);}}(window.self),function(){var t=document.createElement("_");if(t.classList.add("c1","c2"),!t.classList.contains("c2")){var e=function(t){var e=DOMTokenList.prototype[t];DOMTokenList.prototype[t]=function(t){var o,i=arguments.length;for(o=0;i>o;o++)e.call(this,t=arguments[o]);};};e("add"),e("remove");}if(t.classList.toggle("c3",!1),t.classList.contains("c3")){var o=DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle=function(t,e){return 1 in arguments&&!this.contains(t)==!e?e:o.call(this,t)};}t=null;}());},function(t,e,o){t.exports=o(82).polyfill();},function(t,e,o){(function(e,o){t.exports=function(){function t(t){return "function"==typeof t}var i=Array.isArray?Array.isArray:function(t){return "[object Array]"===Object.prototype.toString.call(t)},n=0,r=void 0,a=void 0,s=function(t,e){h[n]=t,h[n+1]=e,2===(n+=2)&&(a?a(v):_());},l="undefined"!=typeof window?window:void 0,c=l||{},d=c.MutationObserver||c.WebKitMutationObserver,u="undefined"==typeof self&&void 0!==e&&"[object process]"==={}.toString.call(e),f="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel;function p(){var t=setTimeout;return function(){return t(v,1)}}var h=new Array(1e3);function v(){for(var t=0;n>t;t+=2)(0, h[t])(h[t+1]),h[t]=void 0,h[t+1]=void 0;n=0;}var m,g,b,y,_=void 0;function w(t,e){var o=this,i=new this.constructor(C);void 0===i[S]&&O(i);var n=o._state;if(n){var r=arguments[n-1];s((function(){return P(n,i,r,o._result)}));}else A(o,i,t,e);return i}function j(t){if(t&&"object"==typeof t&&t.constructor===this)return t;var e=new this(C);return D(e,t),e}u?_=function(){return e.nextTick(v)}:d?(g=0,b=new d(v),y=document.createTextNode(""),b.observe(y,{characterData:!0}),_=function(){y.data=g=++g%2;}):f?((m=new MessageChannel).port1.onmessage=v,_=function(){return m.port2.postMessage(0)}):_=void 0===l?function(){try{var t=Function("return this")().require("vertx");return void 0!==(r=t.runOnLoop||t.runOnContext)?function(){r(v);}:p()}catch(t){return p()}}():p();var S=Math.random().toString(36).substring(2);function C(){}var x=void 0,k=1,E=2;function T(e,o,i){o.constructor===e.constructor&&i===w&&o.constructor.resolve===j?function(t,e){e._state===k?L(t,e._result):e._state===E?M(t,e._result):A(e,void 0,(function(e){return D(t,e)}),(function(e){return M(t,e)}));}(e,o):void 0===i?L(e,o):t(i)?function(t,e,o){s((function(t){var i=!1,n=function(o,n,r,a){try{o.call(n,(function(o){i||(i=!0,e!==o?D(t,o):L(t,o));}),(function(e){i||(i=!0,M(t,e));}));}catch(t){return t}}(o,e);!i&&n&&(i=!0,M(t,n));}),t);}(e,o,i):L(e,o);}function D(t,e){if(t===e)M(t,new TypeError("You cannot resolve a promise with itself"));else if(n=typeof(i=e),null===i||"object"!==n&&"function"!==n)L(t,e);else {var o=void 0;try{o=e.then;}catch(e){return void M(t,e)}T(t,e,o);}var i,n;}function z(t){t._onerror&&t._onerror(t._result),I(t);}function L(t,e){t._state===x&&(t._result=e,t._state=k,0!==t._subscribers.length&&s(I,t));}function M(t,e){t._state===x&&(t._state=E,t._result=e,s(z,t));}function A(t,e,o,i){var n=t._subscribers,r=n.length;t._onerror=null,n[r]=e,n[r+k]=o,n[r+E]=i,0===r&&t._state&&s(I,t);}function I(t){var e=t._subscribers,o=t._state;if(0!==e.length){for(var i=void 0,n=void 0,r=t._result,a=0;e.length>a;a+=3)n=e[a+o],(i=e[a])?P(o,i,n,r):n(r);t._subscribers.length=0;}}function P(e,o,i,n){var r=t(i),a=void 0,s=void 0,l=!0;if(r){try{a=i(n);}catch(t){l=!1,s=t;}if(o===a)return void M(o,new TypeError("A promises callback cannot return that same promise."))}else a=n;o._state!==x||(r&&l?D(o,a):!1===l?M(o,s):e===k?L(o,a):e===E&&M(o,a));}var q=0;function O(t){t[S]=q++,t._state=void 0,t._result=void 0,t._subscribers=[];}var R=function(){function t(t,e){this._instanceConstructor=t,this.promise=new t(C),this.promise[S]||O(this.promise),i(e)?(this.length=e.length,this._remaining=e.length,this._result=new Array(this.length),0===this.length?L(this.promise,this._result):(this.length=this.length||0,this._enumerate(e),0===this._remaining&&L(this.promise,this._result))):M(this.promise,new Error("Array Methods must be provided an Array"));}return t.prototype._enumerate=function(t){for(var e=0;this._state===x&&t.length>e;e++)this._eachEntry(t[e],e);},t.prototype._eachEntry=function(t,e){var o=this._instanceConstructor,i=o.resolve;if(i===j){var n=void 0,r=void 0,a=!1;try{n=t.then;}catch(t){a=!0,r=t;}if(n===w&&t._state!==x)this._settledAt(t._state,e,t._result);else if("function"!=typeof n)this._remaining--,this._result[e]=t;else if(o===N){var s=new o(C);a?M(s,r):T(s,t,n),this._willSettleAt(s,e);}else this._willSettleAt(new o((function(e){return e(t)})),e);}else this._willSettleAt(i(t),e);},t.prototype._settledAt=function(t,e,o){var i=this.promise;i._state===x&&(this._remaining--,t===E?M(i,o):this._result[e]=o),0===this._remaining&&L(i,this._result);},t.prototype._willSettleAt=function(t,e){var o=this;A(t,void 0,(function(t){return o._settledAt(k,e,t)}),(function(t){return o._settledAt(E,e,t)}));},t}(),N=function(){function e(t){this[S]=q++,this._result=this._state=void 0,this._subscribers=[],C!==t&&("function"!=typeof t&&function(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}(),this instanceof e?function(t,e){try{e((function(e){D(t,e);}),(function(e){M(t,e);}));}catch(e){M(t,e);}}(this,t):function(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}());}return e.prototype.catch=function(t){return this.then(null,t)},e.prototype.finally=function(e){var o=this.constructor;return t(e)?this.then((function(t){return o.resolve(e()).then((function(){return t}))}),(function(t){return o.resolve(e()).then((function(){throw t}))})):this.then(e,e)},e}();return N.prototype.then=w,N.all=function(t){return new R(this,t).promise},N.race=function(t){var e=this;return i(t)?new e((function(o,i){for(var n=t.length,r=0;n>r;r++)e.resolve(t[r]).then(o,i);})):new e((function(t,e){return e(new TypeError("You must pass an array to race."))}))},N.resolve=j,N.reject=function(t){var e=new this(C);return M(e,t),e},N._setScheduler=function(t){a=t;},N._setAsap=function(t){s=t;},N._asap=s,N.polyfill=function(){var t=void 0;if(void 0!==o)t=o;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")();}catch(t){throw new Error("polyfill failed because global object is unavailable in this environment")}var e=t.Promise;if(e){var i=null;try{i=Object.prototype.toString.call(e.resolve());}catch(t){}if("[object Promise]"===i&&!e.cast)return}t.Promise=N;},N.Promise=N,N}();}).call(this,o(83),o(84));},function(t,e){var o,i,n=t.exports={};function r(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}function s(t){if(o===setTimeout)return setTimeout(t,0);if((o===r||!o)&&setTimeout)return o=setTimeout,setTimeout(t,0);try{return o(t,0)}catch(e){try{return o.call(null,t,0)}catch(e){return o.call(this,t,0)}}}!function(){try{o="function"==typeof setTimeout?setTimeout:r;}catch(t){o=r;}try{i="function"==typeof clearTimeout?clearTimeout:a;}catch(t){i=a;}}();var l,c=[],d=!1,u=-1;function f(){d&&l&&(d=!1,l.length?c=l.concat(c):u=-1,c.length&&p());}function p(){if(!d){var t=s(f);d=!0;for(var e=c.length;e;){for(l=c,c=[];++u<e;)l&&l[u].run();u=-1,e=c.length;}l=null,d=!1,function(t){if(i===clearTimeout)return clearTimeout(t);if((i===a||!i)&&clearTimeout)return i=clearTimeout,clearTimeout(t);try{i(t);}catch(e){try{return i.call(null,t)}catch(e){return i.call(this,t)}}}(t);}}function h(t,e){this.fun=t,this.array=e;}function v(){}n.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var o=1;arguments.length>o;o++)e[o-1]=arguments[o];c.push(new h(t,e)),1!==c.length||d||s(p);},h.prototype.run=function(){this.fun.apply(null,this.array);},n.title="browser",n.browser=!0,n.env={},n.argv=[],n.version="",n.versions={},n.on=v,n.addListener=v,n.once=v,n.off=v,n.removeListener=v,n.removeAllListeners=v,n.emit=v,n.prependListener=v,n.prependOnceListener=v,n.listeners=function(t){return []},n.binding=function(t){throw new Error("process.binding is not supported")},n.cwd=function(){return "/"},n.chdir=function(t){throw new Error("process.chdir is not supported")},n.umask=function(){return 0};},function(t,e){var o;o=function(){return this}();try{o=o||new Function("return this")();}catch(t){"object"==typeof window&&(o=window);}t.exports=o;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);e.cns=console,e.markDeprecated=function(t,o,n){return void 0===o&&(o=[""]),void 0===n&&(n=null),function(){for(var r=[],a=0;arguments.length>a;a++)r[a]=arguments[a];return e.cns.warn('Method "'+o[0]+'" deprecated.'+(o[1]?' Use "'+o[1]+'" instead':"")),t.call.apply(t,i.__spreadArrays([n],r))}};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.call=function(t){for(var e=[],o=1;arguments.length>o;o++)e[o-1]=arguments[o];return t.apply(void 0,e)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.inArray=function(t,e){return -1!==e.indexOf(t)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.splitArray=function(t){return "string"==typeof t?t.split(/[,\s]+/):t};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);e.setTimeout=function(t,e){for(var o=[],n=2;arguments.length>n;n++)o[n-2]=arguments[n];return e?window.setTimeout.apply(window,i.__spreadArrays([t,e],o)):(t.call.apply(t,i.__spreadArrays([null],o)),0)},e.clearTimeout=function(t){window.clearTimeout(t);};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.hasBrowserColorPicker=function(){var t=!0;try{var e=document.createElement("input");e.type="color",t="color"===e.type&&"number"!=typeof e.selectionStart;}catch(e){t=!1;}return t};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.isHTML=function(t){return /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/m.test(t)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.isHTMLFromWord=function(t){return -1!==t.search(/<meta.*?Microsoft Excel\s[\d].*?>/)||-1!==t.search(/<meta.*?Microsoft Word\s[\d].*?>/)||-1!==t.search(/style="[^"]*mso-/)&&-1!==t.search(/<font/)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(45);e.isInitable=function(t){return t&&i.isFunction(t.init)},e.isDestructable=function(t){return t&&i.isFunction(t.destruct)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(24);e.isInt=function(t){return "string"==typeof t&&i.isNumeric(t)&&(t=parseFloat(t)),"number"==typeof t&&Number.isFinite(t)&&!(t%1)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.isLicense=function(t){return "string"==typeof t&&32===t.length&&/^[a-z0-9]+$/.test(t)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.isString=function(t){return "string"==typeof t};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.isPromise=function(t){return t&&"function"==typeof t.then};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);i.__exportStar(o(99),e),i.__exportStar(o(48),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.hexToRgb=function(t){t=t.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(function(t,e,o,i){return e+e+o+o+i+i}));var e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?{r:parseInt(e[1],16),g:parseInt(e[2],16),b:parseInt(e[3],16)}:null};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(1),n=o(9),r=o(8);function a(t){return t.replace(/mso-[a-z\-]+:[\s]*[^;]+;/gi,"").replace(/mso-[a-z\-]+:[\s]*[^";]+$/gi,"").replace(/border[a-z\-]*:[\s]*[^;]+;/gi,"").replace(/([0-9.]+)(pt|cm)/gi,(function(t,e,o){switch(o.toLowerCase()){case"pt":return (1.328*parseFloat(e)).toFixed(0)+"px";case"cm":return (.02645833*parseFloat(e)).toFixed(0)+"px"}return t}))}e.applyStyles=function(t){if(-1===t.indexOf("<html "))return t;t=(t=t.substring(t.indexOf("<html "),t.length)).substring(0,t.lastIndexOf("</html>")+"</html>".length);var e=document.createElement("iframe");e.style.display="none",document.body.appendChild(e);var o="",s=[];try{var l=e.contentDocument||(e.contentWindow?e.contentWindow.document:null);if(l){l.open(),l.write(t),l.close(),l.styleSheets.length&&(s=l.styleSheets[l.styleSheets.length-1].cssRules);for(var c=function(t){if(""===s[t].selectorText)return "continue";n.$$(s[t].selectorText,l.body).forEach((function(e){e.style.cssText=a(s[t].style.cssText+";"+e.style.cssText);}));},d=0;s.length>d;d+=1)c(d);i.Dom.each(l.body,(function(t){if(i.Dom.isElement(t)){var e=t,o=e.style.cssText;o&&(e.style.cssText=a(o)),e.hasAttribute("lang")&&e.removeAttribute("lang");}})),o=l.firstChild?r.trim(l.body.innerHTML):"";}}catch(t){}finally{i.Dom.safeRemove(e);}return o&&(t=o),r.trim(t.replace(/<(\/)?(html|colgroup|col|o:p)[^>]*>/g,"").replace(/<!--[^>]*>/g,""))};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.ucfirst=function(t){return t.length?t[0].toUpperCase()+t.substr(1):""};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(34),r=o(3);e.sprintf=function(t,e){if(!e||!e.length)return t;for(var o=/%([sd])/g,i=o.exec(t),n=t,r=0;i&&void 0!==e[r];)n=n.replace(i[0],e[r].toString()),r+=1,i=o.exec(t);return n},e.i18n=function(t,o,s,l){var c,d;void 0===l&&(l=!0);var u,f=Boolean(void 0!==s&&s.debugLanguage),p=function(t){return o&&o.length?e.sprintf(t,o):t},h=n.defaultLanguage(i.Config.defaultOptions.language,i.Config.defaultOptions.language),v=n.defaultLanguage(null===(c=s)||void 0===c?void 0:c.language,h),m=function(e){if(e){if(r.isString(e[t]))return p(e[t]);var o=t.toLowerCase();if(r.isString(e[o]))return p(e[o]);var i=r.ucfirst(t);return r.isString(e[i])?p(e[i]):void 0}};u=void 0!==a.Jodit.lang[v]?a.Jodit.lang[v]:void 0!==a.Jodit.lang[h]?a.Jodit.lang[h]:a.Jodit.lang.en;var g=null===(d=s)||void 0===d?void 0:d.i18n;if(g&&g[v]){var b=m(g[v]);if(b)return b}var y=m(u);if(y)return y;if(a.Jodit.lang.en&&"string"==typeof a.Jodit.lang.en[t]&&a.Jodit.lang.en[t])return p(a.Jodit.lang.en[t]);if(f)return "{"+t+"}";if(!l&&"en"!==v)throw new TypeError('i18n need "'+t+'" in "'+v+'"');return p(t)};var a=o(16);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(1),n=o(8);e.cleanFromWord=function(t){-1!==t.indexOf("<html ")&&(t=(t=t.substring(t.indexOf("<html "),t.length)).substring(0,t.lastIndexOf("</html>")+"</html>".length));var e="";try{var o=document.createElement("div");o.innerHTML=t;var r=[];o.firstChild&&i.Dom.all(o,(function(t){if(t)switch(t.nodeType){case Node.ELEMENT_NODE:switch(t.nodeName){case"STYLE":case"LINK":case"META":r.push(t);break;case"W:SDT":case"W:SDTPR":case"FONT":i.Dom.unwrap(t);break;default:Array.from(t.attributes).forEach((function(e){-1===["src","href","rel","content"].indexOf(e.name.toLowerCase())&&t.removeAttribute(e.name);}));}break;case Node.TEXT_NODE:break;default:r.push(t);}})),r.forEach(i.Dom.safeRemove),e=o.innerHTML;}catch(t){}return e&&(t=e),(t=t.split(/(\n)/).filter(n.trim).join("\n")).replace(/<(\/)?(html|colgroup|col|o:p)[^>]*>/g,"").replace(/<!--[^>]*>/g,"")};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.htmlspecialchars=function(t){var e=document.createElement("div");return e.textContent=t,e.innerHTML};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(11),n=o(9),r=o(8),a=o(1);e.stripTags=function(t,e){void 0===e&&(e=document);var o=e.createElement("div");return i.isString(t)?o.innerHTML=t:o.appendChild(t),n.$$("DIV, P, BR, H1, H2, H3, H4, H5, H6, HR",o).forEach((function(t){var o=t.parentNode;if(o){var i=t.nextSibling;a.Dom.isText(i)&&/^\s/.test(i.nodeValue||"")||i&&o.insertBefore(e.createTextNode(" "),i);}})),r.trim(o.innerText)||""};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(8),n=o(2);e.normalizeKeyAliases=function(t){var e={};return t.replace(/\+\+/g,"+add").split(/[\s]*\+[\s]*/).map((function(t){return i.trim(t.toLowerCase())})).map((function(t){return n.KEY_ALIASES[t]||t})).sort().filter((function(t){return !e[t]&&""!==t&&(e[t]=!0)})).join("+")};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.normalizeLicense=function(t,e){void 0===e&&(e=8);for(var o=[];t.length;)o.push(t.substr(0,e)),t=t.substr(e);return o[1]=o[1].replace(/./g,"*"),o[2]=o[2].replace(/./g,"*"),o.join("-")};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(2),n=o(1);e.normalizeNode=function(t){if(t){if(n.Dom.isText(t)&&null!==t.nodeValue&&t.parentNode)for(;n.Dom.isText(t.nextSibling);)null!==t.nextSibling.nodeValue&&(t.nodeValue+=t.nextSibling.nodeValue),t.nodeValue=t.nodeValue.replace(i.INVISIBLE_SPACE_REG_EXP,""),n.Dom.safeRemove(t.nextSibling);else e.normalizeNode(t.firstChild);e.normalizeNode(t.nextSibling);}};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(8);e.normalizePath=function(){for(var t=[],e=0;arguments.length>e;e++)t[e]=arguments[e];return t.filter((function(t){return i.trim(t).length})).map((function(e,o){return e=e.replace(/([^:])[\\\/]+/g,"$1/"),o&&(e=e.replace(/^\//,"")),o!==t.length-1&&(e=e.replace(/\/$/,"")),e})).join("/")};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.normalizeRelativePath=function(t){return t.split("/").reduce((function(t,e){switch(e){case"":case".":break;case"..":t.pop();break;default:t.push(e);}return t}),[]).join("/")+(t.endsWith("/")?"/":"")};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.normalizeSize=function(t){return /^[0-9]+$/.test(t.toString())?t+"px":t.toString()};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.normalizeURL=function(){for(var t=[],e=0;arguments.length>e;e++)t[e]=arguments[e];return t.filter((function(t){return t.length})).map((function(t){return t.replace(/\/$/,"")})).join("/").replace(/([^:])[\\\/]+/g,"$1/")};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(48),n=o(51);e.normalizeColor=function(t){var e=["#"],o=i.colorToHex(t);if(!o)return !1;if(3===(o=(o=n.trim(o.toUpperCase())).substr(1)).length){for(var r=0;3>r;r+=1)e.push(o[r]),e.push(o[r]);return e.join("")}return o.length>6&&(o=o.substr(0,6)),"#"+o};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.getContentWidth=function(t,e){var o=function(t){return parseInt(t,10)},i=e.getComputedStyle(t);return t.offsetWidth-o(i.getPropertyValue("padding-left")||"0")-o(i.getPropertyValue("padding-right")||"0")};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.innerWidth=function(t,e){var o=e.getComputedStyle(t);return t.clientWidth-(parseFloat(o.paddingLeft||"0")+parseFloat(o.paddingRight||"0"))};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.offset=function(t,o,i,n){var r;void 0===n&&(n=!1);try{r=t.getBoundingClientRect();}catch(t){r={top:0,bottom:0,left:0,right:0,width:0,height:0};}var a,s,l=i.body,c=i.documentElement||{clientTop:0,clientLeft:0,scrollTop:0,scrollLeft:0},d=i.defaultView||i.parentWindow,u=d.pageYOffset||c.scrollTop||l.scrollTop,f=d.pageXOffset||c.scrollLeft||l.scrollLeft,p=c.clientTop||l.clientTop||0,h=c.clientLeft||l.clientLeft||0,v=o.iframe;if(!n&&o&&o.options&&o.options.iframe&&v){var m=e.offset(v,o,o.ownerDocument,!0);a=r.top+m.top,s=r.left+m.left;}else a=r.top+u-p,s=r.left+f-h;return {top:Math.round(a),left:Math.round(s),width:r.width,height:r.height}};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.position=function t(e,o,i){var n;void 0===i&&(i=!1);for(var r=0,a=0,s=e,l=e.ownerDocument||(null===(n=o)||void 0===n?void 0:n.ownerDocument)||document;s;)"BODY"==s.tagName?(r+=s.offsetLeft-(s.scrollLeft||l.documentElement.scrollLeft)+s.clientLeft,a+=s.offsetTop-(s.scrollTop||l.documentElement.scrollTop)+s.clientTop):(r+=s.offsetLeft-s.scrollLeft+s.clientLeft,a+=s.offsetTop-s.scrollTop+s.clientTop),s=s.offsetParent;if(o&&o.iframe&&!i){var c=t(o.iframe,o,!0);r+=c.left,a+=c.top;}return {left:r,top:a,width:e.offsetWidth,height:e.offsetHeight}};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(53),r=o(11),a=new Map,s=function(t){return function(e,o){return i.__awaiter(void 0,void 0,Promise,(function(){var n;return i.__generator(this,(function(i){return a.has(o)?[2,a.get(o)]:(n=t(e,o),a.set(o,n),[2,n])}))}))}};e.appendScript=function(t,e,o){var i=t.create.element("script");return i.type="text/javascript",void 0!==o&&i.addEventListener("load",o),i.src||(i.src=n.completeUrl(e)),t.ownerDocument.body.appendChild(i),{callback:o,element:i}},e.appendScriptAsync=s((function(t,o){return new Promise((function(i,n){e.appendScript(t,o,i).element.addEventListener("error",n);}))})),e.appendStyleAsync=s((function(t,e){return new Promise((function(o,i){var r=t.create.element("link");r.rel="stylesheet",r.media="all",r.crossOrigin="anonymous",r.addEventListener("load",(function(){return o(r)})),r.addEventListener("error",i),r.href=n.completeUrl(e),t.ownerDocument.body.appendChild(r);}))})),e.loadNext=function(t,o,i){return void 0===i&&(i=0),r.isString(o[i])?e.appendScriptAsync(t,o[i]).then((function(){return e.loadNext(t,o,i+1)})):Promise.resolve()};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.browser=function(t){var e=navigator.userAgent.toLowerCase(),o=/(firefox)[\s\/]([\w.]+)/.exec(e)||/(chrome)[\s\/]([\w.]+)/.exec(e)||/(webkit)[\s\/]([\w.]+)/.exec(e)||/(opera)(?:.*version)[\s\/]([\w.]+)/.exec(e)||/(msie)[\s]([\w.]+)/.exec(e)||/(trident)\/([\w.]+)/.exec(e)||0>e.indexOf("compatible")||[];return "version"===t?o[2]:"webkit"===t?"chrome"===o[1]||"webkit"===o[1]:"ff"===t?"firefox"===o[1]:"msie"===t?"trident"===o[1]||"msie"===o[1]:o[1]===t};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(46),n=o(54);e.convertMediaURLToVideoEmbed=function(t,e,o){if(void 0===e&&(e=400),void 0===o&&(o=345),!i.isURL(t))return t;var r=document.createElement("a"),a=/(?:http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(.+)/g;r.href=t,e||(e=400),o||(o=345);var s=r.protocol||"";switch(r.hostname){case"www.vimeo.com":case"vimeo.com":return a.test(t)?t.replace(a,'<iframe width="'+e+'" height="'+o+'" src="'+s+'//player.vimeo.com/video/$1" frameborder="0" allowfullscreen></iframe>'):t;case"youtube.com":case"www.youtube.com":case"youtu.be":case"www.youtu.be":var l=r.search?n.parseQuery(r.search):{v:r.pathname.substr(1)};return l.v?'<iframe width="'+e+'" height="'+o+'" src="'+s+"//www.youtube.com/embed/"+l.v+'" frameborder="0" allowfullscreen></iframe>':t}return t};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.dataBind=function(t,e,o){var i=t.JoditDataBindKey;if(i||(i={},Object.defineProperty(t,"JoditDataBindKey",{enumerable:!1,configurable:!0,value:i})),void 0===o)return i[e];i[e]=o;};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.humanSizeToBytes=function(t){if(/^[0-9.]+$/.test(t.toString()))return parseFloat(t);var e=t.substr(-2,2).toUpperCase(),o=["KB","MB","GB","TB"],i=parseFloat(t.substr(0,t.length-2));return -1!==o.indexOf(e)?i*Math.pow(1024,o.indexOf(e)+1):parseInt(t,10)};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.inView=function(t,e,o){var i=t.getBoundingClientRect(),n=t,r=i.top,a=i.height;do{if(n&&n.parentNode){if((i=(n=n.parentNode).getBoundingClientRect()).bottom<r)return !1;if(i.top>=r+a)return !1}}while(n&&n!==e&&n.parentNode);return (o.documentElement&&o.documentElement.clientHeight||0)>=r},e.scrollIntoView=function(t,o,i){e.inView(t,o,i)||(o.clientHeight!==o.scrollHeight&&(o.scrollTop=t.offsetTop),e.inView(t,o,i)||t.scrollIntoView());};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.val=function(t,e,o){var i=t.querySelector(e);return i?(o&&(i.value=o),i.value):""};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(t,e,o){this.observer=o,this.oldValue=t,this.newValue=e;}return t.prototype.undo=function(){this.observer.snapshot.restore(this.oldValue);},t.prototype.redo=function(){this.observer.snapshot.restore(this.newValue);},t}();e.Command=i;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(7),r=o(1),a=function(t){function e(e,o){var i=t.call(this,e)||this;return i.target=o,i.container=e.create.div("jodit_statusbar"),o.appendChild(i.container),i.hide(),i}return i.__extends(e,t),e.prototype.hide=function(){this.container&&this.container.classList.add("jodit_hidden");},e.prototype.show=function(){this.container&&this.container.classList.remove("jodit_hidden");},e.prototype.getHeight=function(){return this.container.offsetHeight},e.prototype.findEmpty=function(t){void 0===t&&(t=!1);for(var e=this.container.querySelectorAll(".jodit_statusbar_item"+(t?".jodit_statusbar_item-right":"")),o=0;e.length>o;o+=1)if(!e[o].innerHTML.trim().length)return e[o]},e.prototype.append=function(t,e){void 0===e&&(e=!1);var o=this.findEmpty(e)||this.jodit.create.div("jodit_statusbar_item");e&&o.classList.add("jodit_statusbar_item-right"),o.appendChild(t),this.container.appendChild(o),this.show(),this.jodit.events.fire("resize");},e.prototype.destruct=function(){this.setStatus(n.STATUSES.beforeDestruct),r.Dom.safeRemove(this.container),delete this.container,t.prototype.destruct.call(this);},e}(n.Component);e.StatusBar=a;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(63),r=o(129),a=o(130),s=o(3),l=function(t){function e(e,o){var i,r,s,l=t.call(this,e,o)||this;return l.components=new Set,l.version="3.3.24",l.__modulesInstances={},l.buffer=a.Storage.makeStorage(),l.progressbar=new f.ProgressBar(l),l.async=new u.Async,l.getVersion=function(){return l.version},l.id=(null===(i=e)||void 0===i?void 0:i.id)||(new Date).getTime().toString(),l.jodit=e||l,l.events=(null===(r=e)||void 0===r?void 0:r.events)||new n.EventsNative(l.ownerDocument),l.buffer=(null===(s=e)||void 0===s?void 0:s.buffer)||a.Storage.makeStorage(),l}return i.__extends(e,t),e.prototype.markOwner=function(t){t.setAttribute("data-editor_id",this.id);},Object.defineProperty(e.prototype,"basePath",{get:function(){return this.options.basePath?this.options.basePath:d.BASE_PATH},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"defaultTimeout",{get:function(){return 100},enumerable:!0,configurable:!0}),e.prototype.i18n=function(t){for(var e,o,i,n=[],r=1;arguments.length>r;r++)n[r-1]=arguments[r];return s.i18n(t,n,(null===(o=null===(e=this)||void 0===e?void 0:e.jodit)||void 0===o?void 0:o.options)||(null===(i=this)||void 0===i?void 0:i.options))},e.prototype.toggleFullSize=function(e){t.prototype.toggleFullSize.call(this,e),this.events&&this.events.fire("toggleFullSize",e);},e.prototype.getInstance=function(t,e){if("function"!=typeof c.Jodit.modules[t])throw s.error("Need real module name");return void 0===this.__modulesInstances[t]&&(this.__modulesInstances[t]=new c.Jodit.modules[t](this.jodit||this,e)),this.__modulesInstances[t]},e.prototype.initOptions=function(e){t.prototype.initOptions.call(this,i.__assign({extraButtons:[],textIcons:!1,removeButtons:[],zIndex:100002,fullsize:!1,showTooltip:!0,useNativeTooltip:!1,buttons:[],globalFullsize:!0},e));},e.prototype.destruct=function(){this.isDestructed||(this.async&&(this.async.destruct(),delete this.async),this.events&&(this.events.destruct(),delete this.events),t.prototype.destruct.call(this));},e}(r.Panel);e.View=l;var c=o(16),d=o(2),u=o(131),f=o(65);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.defaultNameSpace="JoditEventDefaultNamespace";var i=function(){function t(){this.__store={};}return t.prototype.get=function(t,e){if(void 0!==this.__store[e])return this.__store[e][t]},t.prototype.indexOf=function(t,e,o){var i=this.get(t,e);if(i)for(var n=0;i.length>n;n+=1)if(i[n].originalCallback===o)return n;return !1},t.prototype.namespaces=function(t){void 0===t&&(t=!1);var o=Object.keys(this.__store);return t?o.filter((function(t){return t!==e.defaultNameSpace})):o},t.prototype.events=function(t){return this.__store[t]?Object.keys(this.__store[t]):[]},t.prototype.set=function(t,e,o,i){void 0===i&&(i=!1),void 0===this.__store[e]&&(this.__store[e]={}),void 0===this.__store[e][t]&&(this.__store[e][t]=[]),i?this.__store[e][t].unshift(o):this.__store[e][t].push(o);},t.prototype.clear=function(){delete this.__store,this.__store={};},t}();e.EventHandlersStore=i;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(7),r=o(1),a=o(64),s=o(3),l=function(t){function e(e,o){var i=t.call(this,e)||this;return i.__whoLocked="",i.__isFullSize=!1,i.isLocked=function(){return ""!==i.__whoLocked},i.isLockedNotBy=function(t){return i.isLocked()&&i.__whoLocked!==t},i.isFullSize=function(){return i.__isFullSize},i.initOptions(o),i.initOwners(),e&&e.ownerDocument&&(i.ownerDocument=e.ownerDocument,i.ownerWindow=e.ownerWindow),i.create=new a.Create(i),i.container=i.create.div(),i}return i.__extends(e,t),e.prototype.initOptions=function(t){this.options=i.__assign(i.__assign({},this.options||{}),t);},e.prototype.initOwners=function(){this.ownerDocument=window.document,this.ownerWindow=window;},e.prototype.resolveElement=function(t){var e=t;if("string"==typeof t)try{e=this.ownerDocument.querySelector(t);}catch(e){throw s.error('String "'+t+'" should be valid HTML selector')}if(!e||"object"!=typeof e||!r.Dom.isElement(e)||!e.cloneNode)throw s.error('Element "'+t+'" should be string or HTMLElement instance');return e},e.prototype.lock=function(t){return void 0===t&&(t="any"),!this.isLocked()&&(this.__whoLocked=t,!0)},e.prototype.unlock=function(){return !!this.isLocked()&&(this.__whoLocked="",!0)},e.prototype.toggleFullSize=function(t){void 0===t&&(t=!this.__isFullSize),t!==this.__isFullSize&&(this.__isFullSize=t);},e.prototype.destruct=function(){this.isDestructed||(r.Dom.safeRemove(this.container),t.prototype.destruct.call(this));},e}(n.Component);e.Panel=l;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);i.__exportStar(o(62),e),i.__exportStar(o(61),e),i.__exportStar(o(26),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(43),r=function(){function t(){this.timers=new Map,this.promisesRejections=new Set;}return t.prototype.setTimeout=function(t,e){for(var o=[],r=2;arguments.length>r;r++)o[r-2]=arguments[r];var a={};"number"!=typeof e&&(e=(a=e).timeout||0),a.label&&this.timers.has(a.label)&&(n.clearTimeout(this.timers.get(a.label)),this.timers.delete(a.label));var s=n.setTimeout.apply(void 0,i.__spreadArrays([t,e],o)),l=a.label||s;return this.timers.set(l,s),s},t.prototype.clearTimeout=function(t){n.clearTimeout(t),this.timers.delete(t);},t.prototype.debounce=function(t,e){var o,i=this,r=0;return function(){for(var a=[],s=0;arguments.length>s;s++)a[s]=arguments[s];o=a,e?(n.clearTimeout(r),r=i.setTimeout((function(){return t.apply(void 0,o)}),e),i.timers.set(t,r)):t.apply(void 0,o);}},t.prototype.throttle=function(t,e){var o,i,n,r=this,a=null;return function(){for(var s=[],l=0;arguments.length>l;l++)s[l]=arguments[l];o=!0,n=s,e?a||(i=function(){o?(t.apply(void 0,n),o=!1,a=r.setTimeout(i,e),r.timers.set(i,a)):a=null;})():t.apply(void 0,n);}},t.prototype.promise=function(t){var e=this,o=function(){},i=new Promise((function(i,n){return e.promisesRejections.add(n),o=n,t(i,n)}));return i.finally((function(){e.promisesRejections.delete(o);})),i},t.prototype.promiseState=function(t){var e=this;if(t.status)return t.status;if(!Promise.race)return new Promise((function(o){t.then((function(t){return o("fulfilled"),t}),(function(t){throw o("rejected"),t})),e.setTimeout((function(){o("pending");}),100);}));var o={};return Promise.race([t,o]).then((function(t){return t===o?"pending":"fulfilled"}),(function(){return "rejected"}))},t.prototype.clear=function(){var t=this;this.timers.forEach((function(e){n.clearTimeout(t.timers.get(e));})),this.timers.clear(),this.promisesRejections.forEach((function(t){t();})),this.promisesRejections.clear();},t.prototype.destruct=function(){this.clear();},t}();e.Async=r;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=function(t){function e(e){var o=t.call(this,e)||this;return o.container.classList.add("jodit_toolbar_btn-break"),o}return i.__extends(e,t),e}(o(37).ToolbarElement);e.ToolbarBreak=n;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(3),r=o(27),a=o(28),s=o(20),l=function(t){function e(e,o,i,n){void 0===n&&(n="jodit_toolbar_list");var r=t.call(this,e,o,i,n)||this;return r.target=o,r.current=i,r.className=n,r.defaultControl={template:function(t,e,o){return r.jodit.i18n(o)}},r}return i.__extends(e,t),e.prototype.doClose=function(){this.toolbar&&(this.toolbar.destruct(),delete this.toolbar);},e.prototype.doOpen=function(t){var e=this;this.toolbar=s.JoditToolbarCollection.makeCollection(this.jodit);var o="string"==typeof t.list?t.list.split(/[\s,]+/):t.list;n.each(o,(function(o,n){var a,s=e.jodit.options.controls,l=function(t){return s&&s[t]};"string"==typeof n&&l(n)?a=new r.ToolbarButton(e.toolbar,i.__assign({name:n.toString()},l(n)),e.current):"string"==typeof o&&l(o)&&"object"==typeof n?a=new r.ToolbarButton(e.toolbar,i.__assign(i.__assign({name:o.toString()},l(o)),n),e.current):(a=new r.ToolbarButton(e.toolbar,{name:o.toString(),exec:t.exec,command:t.command,isActive:t.isActiveChild,isDisable:t.isDisableChild,mode:t.mode,args:[t.args&&t.args[0]||o,t.args&&t.args[1]||n]},e.current)).textBox.innerHTML=(t.template||e.defaultControl.template)(e.jodit,o.toString(),n.toString()),e.toolbar.appendChild(a);})),this.container.appendChild(this.toolbar.container),this.container.style.removeProperty("marginLeft"),this.toolbar.checkActiveButtons();},e.prototype.firstInFocus=function(){this.toolbar.firstButton.focus();},e.prototype.destruct=function(){this.isDestructed||(this.doClose(),t.prototype.destruct.call(this));},e}(a.Popup);e.PopupList=l;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=function(t){function e(e){var o=t.call(this,e)||this;return o.container.classList.add("jodit_toolbar_btn-separator"),o}return i.__extends(e,t),e}(o(37).ToolbarElement);e.ToolbarSeparator=n;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(136),n=o(137),r=o(138),a=o(139),s=o(140),l=o(141),c=o(142),d=o(143),u=o(144),f=o(145),p=o(146),h=o(147),v=o(148),m=o(149),g=o(150),b=o(151),y=o(152),_=o(153),w={ar:i.default,cs_cz:n.default,de:r.default,en:a.default,es:s.default,fr:l.default,he:c.default,hu:d.default,id:u.default,it:f.default,ja:p.default,nl:h.default,pl:v.default,pt_br:m.default,ru:g.default,tr:b.default,zh_cn:y.default,zh_tw:_.default},j=function(t){return t.default||t},S={};Array.isArray(j(a.default))&&j(a.default).forEach((function(t,e){S[e]=t;})),Object.keys(w).forEach((function(t){var e=j(w[t]);Array.isArray(e)&&(w[t]={},e.forEach((function(e,o){w[t][S[o]]=e;})));})),e.default=w;},function(t,e){t.exports.default=["إبدأ في الكتابة...","حول جوديت","محرر جوديت","دليل مستخدم جوديت","يحتوي على مساعدة مفصلة للاستخدام","للحصول على معلومات حول الترخيص، يرجى الذهاب لموقعنا:","شراء النسخة الكاملة","حقوق الطبع والنشر © XDSoft.net - Chupurnov Valeriy. كل الحقوق محفوظة.","مِرْساة","فتح في نافذة جديدة","فتح المحرر في الحجم الكامل","مسح التنسيق","ملء اللون أو تعيين لون النص","إعادة","تراجع","عريض","مائل","إدراج قائمة غير مرتبة","إدراج قائمة مرتبة","محاذاة للوسط","محاذاة مثبتة","محاذاة لليسار","محاذاة لليمين","إدراج خط أفقي","إدراج صورة","ادخال الملف","إدراج فيديو يوتيوب/فيميو ","إدراج رابط","حجم الخط","نوع الخط","إدراج كتلة تنسيق","عادي","عنوان 1","عنوان 2","عنوان 3","عنوان 4","إقتباس","كود","إدراج","إدراج جدول","تقليل المسافة البادئة","زيادة المسافة البادئة","تحديد أحرف خاصة","إدراج حرف خاص","تنسيق الرسم","تغيير الوضع","هوامش","أعلى","يمين","أسفل","يسار","الأنماط","الطبقات","محاذاة","اليمين","الوسط","اليسار","--غير مضبوط--","Src","العنوان","العنوان البديل","الرابط","افتح الرابط في نافذة جديدة","الصورة","ملف","متقدم","خصائص الصورة","إلغاء","حسنا","متصفح الملفات","حدث خطأ في تحميل القائمة ","حدث خطأ في تحميل المجلدات","هل أنت واثق؟","أدخل اسم المجلد","إنشاء مجلد","أكتب إسم","إسقاط صورة","إسقاط الملف","أو أنقر","النص البديل","رفع","تصفح","الخلفية","نص","أعلى","الوسط","الأسفل","إدراج عمود قبل","إدراج عمود بعد","إدراج صف أعلى","إدراج صف أسفل","حذف الجدول","حذف الصف","حذف العمود","خلية فارغة","%d حرف","%d كلام","اضرب من خلال","أكد","حرف فوقي","مخطوطة","قطع الاختيار","اختر الكل","استراحة","البحث عن","استبدل ب","يحل محل","معجون","اختر محتوى للصق","مصدر","بالخط العريض","مائل","شغل","صلة","إلغاء","كرر","طاولة","صورة","نظيف","فقرة","حجم الخط","فيديو","الخط","حول المحرر","طباعة","رمز","أكد","شطب","المسافة البادئة","نتوء","ملء الشاشة","الحجم التقليدي","نسخ التنسيق","الخط","قائمة","قائمة مرقمة","قطع","اختر الكل","قانون","فتح الرابط","تعديل الرابط","سمة Nofollow","إزالة الرابط","تحديث","لتحرير","مراجعة","URL","تحرير","محاذاة أفقية","فلتر","عن طريق التغيير","بالاسم","حسب الحجم","إضافة مجلد","إعادة","احتفظ","حفظ باسم","تغيير الحجم","حجم القطع","عرض","ارتفاع","حافظ على النسب","أن","لا","حذف","تميز","تميز %s","محاذاة عمودية","انشق، مزق","اذهب","أضف العمود","اضف سطر","رخصة %s","حذف","انقسام عمودي","تقسيم أفقي","الحدود","يشبه الكود الخاص بك HTML. تبقي كما HTML؟","الصق ك HTML","احتفظ","إدراج كنص","إدراج النص فقط","يمكنك فقط تحرير صورك الخاصة. تحميل هذه الصورة على المضيف؟","تم تحميل الصورة بنجاح على الخادم!","لوحة","لا توجد ملفات في هذا الدليل.","إعادة تسمية","أدخل اسم جديد","معاينة","تحميل","لصق من الحافظة","متصفحك لا يدعم إمكانية الوصول المباشر إلى الحافظة.","نسخ التحديد","نسخ","دائرة نصف قطرها الحدود","عرض كل"];},function(t,e){t.exports.default=["Napiš něco","O Jodit","Editor Jodit","Jodit Uživatelská příručka","obsahuje detailní nápovědu","Pro informace o licenci, prosím, přejděte na naši stránku:","Koupit plnou verzi","Copyright © XDSoft.net - Chupurnov Valeriy. Všechna práva vyhrazena.","Anchor","Otevřít v nové záložce","Otevřít v celoobrazovkovém režimu","Vyčistit formátování","Barva výplně a písma","Vpřed","Zpět","Tučné","Kurzíva","Odrážky","Číslovaný seznam","Zarovnat na střed","Zarovnat do bloku","Zarovnat vlevo","Zarovnat vpravo","Vložit horizontální linku","Vložit obrázek","Vložit soubor","Vložit video (YT/Vimeo)","Vložit odkaz","Velikost písma","Typ písma","Formátovat blok","Normální text","Nadpis 1","Nadpis 2","Nadpis 3","Nadpis 4","Citát","Kód","Vložit","Vložit tabulku","Zmenšit odsazení","Zvětšit odsazení","Vybrat speciální symbol","Vložit speciální symbol","Použít formát","Změnit mód","Okraje","horní","pravý","spodní","levý","Styly","Třídy","Zarovnání","Vpravo","Na střed","Vlevo","--nenastaveno--","src","Titulek","Alternativní text (alt)","Link","Otevřít link v nové záložce","Obrázek","soubor","Rozšířené","Vlastnosti obrázku","Zpět","Ok","Prohlížeč souborů","Chyba při načítání seznamu souborů","Chyba při načítání složek","Jste si jistý(á)?","Název složky","Vytvořit složku","název","Přetáhněte sem obrázek","Přetáhněte sem soubor","nebo klikněte","Alternativní text","Nahrát","Server","Pozadí","Text","Nahoru","Na střed","Dolu","Vložit sloupec před","Vložit sloupec za","Vložit řádek nad","Vložit řádek pod","Vymazat tabulku","Vymazat řádku","Vymazat sloupec","Vyčistit buňku","Znaky: %d","Slova: %d","Přeškrtnuto","Podtrženo","Horní index","Dolní index","Vyjmout označené","Označit vše","Zalomení","Najdi","Nahradit za","Nahradit","Vložit","Vyber obsah pro vložení","HTML","tučně","kurzíva","štětec","odkaz","zpět","vpřed","tabulka","obrázek","guma","odstavec","velikost písma","video","písmo","о editoru","tisk","symbol","podtrženo","přeškrtnuto","zvětšit odsazení","zmenšit odsazení","celoobrazovkový režim","smrsknout","Kopírovat formát","Linka","Odrážka","Číslovaný seznam","Vyjmout","Označit vše","Kód","Otevřít odkaz","Upravit odkaz","Atribut no-follow","Odstranit odkaz","Aktualizovat","Chcete-li upravit","Zobrazit","URL","Editovat","Horizontální zarovnání","Filtr","Dle poslední změny","Dle názvu","Dle velikosti","Přidat složku","Reset","Uložit","Uložit jako...","Změnit rozměr","Ořezat","Šířka","Výška","Ponechat poměr","Ano","Ne","Vyjmout","Označit","Označit %s","Vertikální zarovnání","Rozdělit","Spojit","Přidat sloupec","Přidat řádek","Licence: %s","Vymazat","Rozdělit vertikálně","Rozdělit horizontálně","Okraj","Váš text se podobá HTML. Vložit ho jako HTML?","Vložit jako HTML","Ponechat originál","Vložit jako TEXT","Vložit pouze TEXT","Můžete upravovat pouze své obrázky. Načíst obrázek?","Obrázek byl úspěšně nahrán!","paleta","V tomto adresáři nejsou žádné soubory.","přejmenovat","Zadejte nový název","náhled","Stažení","Vložit ze schránky","Váš prohlížeč nepodporuje přímý přístup do schránky.","Kopírovat výběr","kopírování","Border radius","Zobrazit všechny"];},function(t,e){t.exports.default=["Bitte geben Sie einen Text ein","Über Jodit","Jodit Editor","Das Jodit Benutzerhandbuch","beinhaltet ausführliche Informationen wie Sie den Editor verwenden können.","Für Lizenz-Informationen, besuchen Sie bitte unsere Webseite:","Vollversion kaufen","Copyright © XDSoft.net - Chupurnov Valeriy. Alle Rechte vorbehalten.","Anker","In neuer Registerkarte öffnen","Editor in voller Größe öffnen","Formatierung löschen","Füllfarbe oder Textfarbe ändern","Wiederholen","Rückgängig machen","Fett","Kursiv","Ungeordnete Liste einfügen","Sortierte Liste einfügen","Mittig ausrichten","Blocksatz","Links ausrichten","Rechts ausrichten","Horizontale Linie einfügen","Bild einfügen","Datei einfügen","Youtube/vimeo Video einfügen","Link einfügen","Schriftgröße","Schriftfamilie","Formatblock einfügen","Normal","Überschrift 1","Überschrift 2","Überschrift 3","Überschrift 4","Zitat","Code","Einfügen","Tabelle einfügen","Einzug verkleinern","Einzug vergrößern","Sonderzeichen auswählen","Sonderzeichen einfügen","Format kopieren","Änderungsmodus","Ränder","Oben","Rechts","Unten","Links","CSS Stiel","CSS Klassen","Ausrichten","Rechts","Zentriert","Links","Keine","Pfad","Titel","Alternativer Text","Link","Link in neuem Tab öffnen","Bild","Datei","Fortgeschritten","Bildeigenschaften","Abbrechen","OK","Dateibrowser","Fehler beim Laden der Liste","Fehler beim Laden der Ordner","Sind Sie sicher?","Geben Sie den Verzeichnisnamen ein","Verzeichnis erstellen","Typname","Bild hier hinziehen","Datei löschen","oder hier klicken","Alternativtext","Hochladen","Auswählen","Hintergrund","Text","Oben","Mittig","Unten","Spalte einfügen vor","Spalte einfügen nach","Zeile einfügen oberhalb","Zeile unterhalb einfügen","Tabelle löschen","Zeile löschen","Spalte löschen","Leere Zelle","Zeichen: %d","Wörter: %d","Durchschlagen","Unterstreichen","hochgestellt","Index","Auswahl ausschneid","Wählen Sie Alle aus","Pause","Suche nach","Ersetzen durch","Ersetzen","Einfügen","Wählen Sie Inhalt zum Einfügen","HTML","Fett gedruckt","kursiv","Bürste","Verknüpfung","rückgängig machen","wiederholen","Tabelle","Bild","Radiergummi","Absatz","Schriftgröße","Video","Schriftart","Über","drucken","Symbol","unterstreichen","durchgestrichen","Einzug","Aussenseiter","Vollgröße","schrumpfen","Format kopierenт","die Linie","Liste von","Nummerierte Liste","Schnitt","Wählen Sie Alle aus","Code einbetten","Link öffnen","Link bearbeiten","Nofollow-Attribut","Link entfernen","Aktualisieren","Bearbeiten","Ansehen","URL","Bearbeiten","Horizontale Ausrichtung","filter","Sortieren nach geändert","Nach Name sortieren","Nach Größe sortiert","Ordner hinzufügen","Wiederherstellen","Speichern","Speichern als","Ändern Sie die Größe","Größe anpassen","Breite","Höhe","Halten Sie Proportionen","Ja","Nein","Entfernen","Markieren","Markieren: %s","Vertikale Ausrichtung","Split","Verschmelzen","Spalte hinzufügen","Zeile hinzufügen",null,"Löschen","Split vertikal","Split horizontally","Rand","Es scheint als dass Sie HTML-Text einfügen möchten","Als HTML einfügen?","Original speichern","Als Text einfügen","Nur Text einfügen","Sie können nur Ihre eigenen Bilder bearbeiten. Laden Sie dieses Bild auf dem Host herunter?","Das Bild wurde erfolgreich auf den Server hochgeladen!null","Palette","In diesem Verzeichnis befinden sich keine Dateien.","umbenennen","Geben Sie einen neuen Namen ein","Vorschau","Herunterladen","Aus der Zwischenablage einfügen","Ihr browser unterstützt kein direkter Zugriff auf die Zwischenablage.","Auswahl kopieren","kopieren","Border-radius","Alle anzeigen"];},function(t,e){t.exports.default=["Type something","About Jodit","Jodit Editor","Jodit User's Guide","contains detailed help for using","For information about the license, please go to our website:","Buy full version","Copyright © XDSoft.net - Chupurnov Valeriy. All rights reserved.","Anchor","Open in new tab","Open editor in fullsize","Clear Formatting","Fill color or set the text color","Redo","Undo","Bold","Italic","Insert Unordered List","Insert Ordered List","Align Center","Align Justify","Align Left","Align Right","Insert Horizontal Line","Insert Image","Insert file","Insert youtube/vimeo video","Insert link","Font size","Font family","Insert format block","Normal","Heading 1","Heading 2","Heading 3","Heading 4","Quote","Code","Insert","Insert table","Decrease Indent","Increase Indent","Select Special Character","Insert Special Character","Paint format","Change mode","Margins","top","right","bottom","left","Styles","Classes","Align","Right","Center","Left","--Not Set--","Src","Title","Alternative","Link","Open link in new tab","Image","file","Advanced","Image properties","Cancel","Ok","File Browser","Error on load list","Error on load folders","Are you sure?","Enter Directory name","Create directory","type name","Drop image","Drop file","or click","Alternative text","Upload","Browse","Background","Text","Top","Middle","Bottom","Insert column before","Insert column after","Insert row above","Insert row below","Delete table","Delete row","Delete column","Empty cell","Chars: %d","Words: %d","Strike through","Underline","superscript","subscript","Cut selection","Select all","Break","Search for","Replace with","Replace","Paste","Choose Content to Paste","source","bold","italic","brush","link","undo","redo","table","image","eraser","paragraph","fontsize","video","font","about","print","symbol","underline","strikethrough","indent","outdent","fullsize","shrink","copyformat","hr","ul","ol","cut","selectall","Embed code","Open link","Edit link","No follow","Unlink","Update","pencil","Eye"," URL","Edit","Horizontal align","Filter","Sort by changed","Sort by name","Sort by size","Add folder","Reset","Save","Save as ...","Resize","Crop","Width","Height","Keep Aspect Ratio","Yes","No","Remove","Select","Select %s","Vertical align","Split","Merge","Add column","Add row","License: %s","Delete","Split vertical","Split horizontal","Border","Your code is similar to HTML. Keep as HTML?","Paste as HTML","Keep","Insert as Text","Insert only Text","You can only edit your own images. Download this image on the host?","The image has been successfully uploaded to the host!","palette","There are no files","Rename","Enter new name","preview","download","Paste from clipboard","Your browser doesn't support direct access to the clipboard.","Copy selection","copy","Border radius","Show all"];},function(t,e){t.exports.default=["Escriba algo...","Acerca de Jodit","Jodit Editor","Guía de usuario Jodit","contiene ayuda detallada para el uso.","Para información sobre la licencia, por favor visite nuestro sitio:","Compre la versión completa","Copyright © XDSoft.net - Chupurnov Valeriy. Todos los derechos reservados.","Anclar","Abrir en nueva pestaña","Abrir editor en pantalla completa","Limpiar formato","Color de relleno o de letra","Rehacer","Deshacer","Negrita","Cursiva","Insertar lista no ordenada","Insertar lista ordenada","Alinear Centrado","Alinear Justificado","Alinear Izquierda","Alinear Derecha","Insertar línea horizontal","Insertar imagen","Insertar archivo","Insertar video de Youtube/vimeo","Insertar vínculo","Tamaño de letra","Familia de letra","Insertar bloque","Normal","Encabezado 1","Encabezado 2","Encabezado 3","Encabezado 4","Cita","Código","Insertar","Insertar tabla","Disminuir sangría","Aumentar sangría","Seleccionar caracter especial","Insertar caracter especial","Copiar formato","Cambiar modo","Márgenes","arriba","derecha","abajo","izquierda","Estilos CSS","Clases CSS","Alinear","Derecha","Centrado","Izquierda","--No Establecido--","Fuente","Título","Texto Alternativo","Vínculo","Abrir vínculo en nueva pestaña","Imagen","Archivo","Avanzado","Propiedades de imagen","Cancelar","Aceptar","Buscar archivo","Error al cargar la lista","Error al cargar las carpetas","¿Está seguro?","Entre nombre de carpeta","Crear carpeta","Entre el nombre","Soltar imagen","Soltar archivo","o click","Texto alternativo","Subir","Buscar","Fondo","Texto","Arriba","Centro","Abajo","Insertar columna antes","Interar columna después","Insertar fila arriba","Insertar fila debajo","Borrar tabla","Borrar fila","Borrar columna","Vaciar celda","Caracteres: %d","Palabras: %d","Tachado","Subrayado","superíndice","subíndice","Cortar selección","Seleccionar todo","Pausa","Buscar","Reemplazar con","Reemplazar","Pegar","Seleccionar contenido para pegar","HTML","negrita","cursiva","Brocha","Vínculo","deshacer","rehacer","Tabla","Imagen","Borrar","Párrafo","Tamaño de letra","Video","Letra","Acerca de","Imprimir","Símbolo","subrayar","tachar","sangría","quitar sangría","Tamaño completo","encoger","Copiar formato","línea horizontal","lista sin ordenar","lista ordenada","Cortar","Seleccionar todo","Incluir código","Abrir vínculo","Editar vínculo","No seguir","Desvincular","Actualizar","Para editar","Ver","URL","Editar","Alineación horizontal","filtrar","Ordenar por fecha modificación","Ordenar por nombre","Ordenar por tamaño","Agregar carpeta","Resetear","Guardar","Guardar como...","Redimensionar","Recortar","Ancho","Alto","Mantener relación de aspecto","Si","No","Quitar","Seleccionar","Seleccionar: %s","Alineación vertical","Dividir","Mezclar","Agregar columna","Agregar fila",null,"Borrar","Dividir vertical","Dividir horizontal","Borde","El código es similar a HTML. ¿Mantener como HTML?","Pegar como HTML?","Mantener","Insertar como texto","Insertar solo texto","Solo puedes editar tus propias imágenes. ¿Descargar esta imagen en el servidor?","¡La imagen se ha subido correctamente al servidor!","paleta","No hay archivos en este directorio.","renombrar","Ingresa un nuevo nombre","avance","Descargar","Pegar desde el portapapeles","Su navegador no soporta el acceso directo en el portapapeles.","Selección de copia","copia","Radio frontera","Mostrar todos los"];},function(t,e){t.exports.default=["Ecrivez ici","A propos de Jodit","Editeur Jodit","Guide de l'utilisateur","Aide détaillée à l'utilisation","Consulter la licence sur notre site web:","Acheter la version complète","Copyright © XDSoft.net - Chupurnov Valeriy. Tous droits réservés.","Ancre","Ouvrir dans un nouvel onglet","Ouvrir l'éditeur en pleine page","Supprimer le formattage","Modifier la couleur du fond ou du texte","Refaire","Défaire","Gras","Italique","Liste non ordonnée","Liste ordonnée","Centrer","Justifier","Aligner à gauche ","Aligner à droite","Insérer une ligne horizontale","Insérer une image","Insérer un fichier","Insérer une vidéo","Insérer un lien","Taille des caractères","Famille des caractères","Bloc formatté","Normal","Titre 1","Titre 2","Titre 3","Titre 4","Citation","Code","Insérer","Insérer un tableau","Diminuer le retrait","Retrait plus","Sélectionnez un caractère spécial","Insérer un caractère spécial","Cloner le format","Mode wysiwyg <-> code html","Marges","haut","droite","Bas","gauche","Styles","Classes","Alignement","Droite","Centre","Gauche","--Non disponible--","Source","Titre","Alternative","Lien","Ouvrir le lien dans un nouvel onglet","Image","fichier","Avancé","Propriétés de l'image","Effacer","OK","Explorateur de fichiers","Erreur de liste de chargement","Erreur de dossier de chargement","Etes-vous sûrs ?","Entrer le non de dossier","Créer un dossier","type de fichier","Coller une image","Déposer un fichier","ou cliquer","Texte de remplacemement","Charger","Chercher","Arrière-plan","Texte","Haut","Milieu","Bas","Insérer une colonne avant","Insérer une colonne après","Insérer une ligne en dessus","Insérer une ligne en dessous","Supprimer le tableau","Supprimer la ligne","Supprimer la colonne","Vider la cellule","Symboles: %d","Mots: %d","Frapper à travers","Souligner","exposant","indice","Couper la sélection","Tout sélectionner","Pause","Rechercher","Remplacer par","Remplacer","Coller","Choisissez le contenu à coller","la source","graisseux","italique","verser","lien","abolir","prêt","graphique","Image","la gommen","clause","taille de police","Video","police","à propos de l'éditeur","impression","caractère","souligné","barré","indentation","indifférent","taille réelle","taille conventionnelle","Format de copie","la ligne","Liste des","Liste numérotée","Couper","Sélectionner tout",null,"Ouvrir le lien","Modifier le lien","Attribut Nofollow","Supprimer le lien","Mettre à jour","Pour éditer","Voir","URL",null,"Alignement horizontal","Filtre","Trier par modifié","Trier par nom","Classer par taille","Ajouter le dossier","Restaurer","Sauvegarder","Enregistrer sous","Changer la taille","Taille de garniture","Largeur","Hauteur","Garder les proportions","Oui","Non","Supprimer","Mettre en évidence","Mettre en évidence: %s","Alignement vertical","Split","aller","Ajouter une colonne","Ajouter une rangée",null,"Effacer","Split vertical","Split horizontal",null,"Votre texte que vous essayez de coller est similaire au HTML. Collez-le en HTML?","Coller en HTML?","Sauvegarder l'original","Coller en tant que texte","Coller le texte seulement","Vous ne pouvez éditer que vos propres images. Téléchargez cette image sur l'hôte?","L'image a été téléchargée avec succès sur le serveur!null","Palette","Il n'y a aucun fichier dans ce répertoire.","renommer","Entrez un nouveau nom","Aperçu","Télécharger","Coller à partir du presse-papiers","Votre navigateur ne prend pas en charge l'accès direct à la presse-papiers.","Copier la sélection","copie","Rayon des frontières","Afficher tous les"];},function(t,e){t.exports.default=["הקלד משהו...","About Jodit","Jodit Editor","Jodit User's Guide","contains detailed help for using.","For information about the license, please go to our website:","Buy full version","Copyright © XDSoft.net - Chupurnov Valeriy. All rights reserved.","מקום עיגון","פתח בכרטיסיה חדשה","פתח את העורך בחלון חדש","נקה עיצוב","שנה צבע טקסט או רקע","בצע שוב","בטל","מודגש","נטוי","הכנס רשימת תבליטים","הכנס רשימה ממוספרת","מרכז","ישר ","ישר לשמאל","ישר לימין","הכנס קו אופקי","הכנס תמונה","הכנס קובץ","הכנס סרטון וידאו מYouTube/Vimeo","הכנס קישור","גודל גופן","גופן","מעוצב מראש","רגיל","כותרת 1","כותרת 2","כותרת 3","כותרת 4","ציטוט","קוד","הכנס","הכנס טבלה","הקטן כניסה","הגדל כניסה","בחר תו מיוחד","הכנס תו מיוחד","העתק עיצוב","החלף מצב","ריווח","עליון","ימין","תחתון","שמאל","עיצוב CSS","מחלקת CSS","יישור","ימין","מרכז","שמאל","--לא נקבע--","מקור","כותרת","כיתוב חלופי","קישור","פתח בכרטיסיה חדשה","תמונה","קובץ","מתקדם","מאפייני תמונה","ביטול","אישור","סייר הקבצים","שגיאה  בזמן טעינת רשימה","שגיאה בזמן טעינת תקיות","האם אתה בטוח?","הכנס שם תקיה","צור תקיה","סוג הקובץ","הסר תמונה","הסר קובץ","או לחץ","כיתוב חלופי","העלה","סייר","רקע","טקסט","עליון","מרכז","תחתון","הכנס עמודה לפני","הכנס עמודה אחרי","הכנס שורה מעל","הכנס שורה מתחת","מחק טבלה","מחק שורה","מחק עמודה","רוקן תא","תווים: %d","מילים: %d","קו חוצה","קו תחתון","superscript","subscript","גזור בחירה","בחר הכל","שבירת שורה","חפש","החלף ב","החלף","הדבק","בחר תוכן להדבקה","HTML","מודגש","נטוי","מברשת","קישור","בטל","בצע שוב","טבלה","תמונה","מחק","פסקה","גודל גופן","וידאו","גופן","עלינו","הדפס","תו מיוחד","קו תחתון","קו חוצה","הגדל כניסה","הקטן כניסה","גודל מלא","כווץ","העתק עיצוב","קו אופקי","רשימת תבליטים","רשימה ממוספרת","חתוך","בחר הכל","הוסף קוד","פתח קישור","ערוך קישור","ללא מעקב","בטל קישור","עדכן","כדי לערוך","הצג","כתובת","ערוך","יישור אופקי","סנן","מין לפי שינוי","מיין לפי שם","מיין לפי גודל","הוסף תקייה","אפס","שמור","שמור בשם...","שנה גודל","חתוך","רוחב","גובה","שמור יחס","כן","לא","הסר","בחר","נבחר: %s","יישור אנכי","פיצול","מזג","הוסף עמודה","הוסף שורה",null,"מחק","פיצול אנכי","פיצול אופקי","מסגרת","הקוד דומה לHTML, האם להשאיר כHTML","הדבק כHTML","השאר","הכנס כטקסט","הכנס טקסט בלבד","רק קבצים המשוייכים שלך ניתנים לעריכה. האם להוריד את הקובץ?","התמונה עלתה בהצלחה!","לוח","אין קבצים בספריה זו.","הונגרית","הזן שם חדש","תצוגה מקדימה","הורד","להדביק מהלוח","הדפדפן שלך לא תומך גישה ישירה ללוח.","העתק בחירה","העתק","רדיוס הגבול","הצג את כל"];},function(t,e){t.exports.default=["Írjon be valamit","Joditról","Jodit Editor","Jodit útmutató","további segítséget tartalmaz","További licence információkért látogassa meg a weboldalunkat:","Teljes verzió megvásárlása","Copyright © XDSoft.net - Chupurnov Valeriy. Minden jog fenntartva.","Horgony","Megnyitás új lapon","Megnyitás teljes méretben","Formázás törlése","Háttér/szöveg szín","Újra","Visszavon","Félkövér","Dőlt","Pontozott lista","Számozott lista","Középre zárt","Sorkizárt","Balra zárt","Jobbra zárt","Vízszintes vonal beszúrása","Kép beszúrás","Fájl beszúrás","Youtube videó beszúrása","Link beszúrás","Betűméret","Betűtípus","Formázott blokk beszúrása","Normál","Fejléc 1","Fejléc 2","Fejléc 3","Fejléc 4","Idézet","Kód","Beszúr","Táblázat beszúrása","Behúzás csökkentése","Behúzás növelése","Speciális karakter kiválasztása","Speciális karakter beszúrása","Kép formázása","Nézet váltása","Szegélyek","felső","jobb","alsó","bal","CSS stílusok","CSS osztályok","Igazítás","Jobbra","Középre","Balra","Nincs","Forrás","Cím","Helyettesítő szöveg","Link","Link megnyitása új lapon","Kép","Fájl","Haladó","Kép tulajdonságai","Mégsem","OK","Fájl tallózó","Hiba a lista betöltése közben","Hiba a mappák betöltése közben","Biztosan ezt szeretné?","Írjon be egy mappanevet","Mappa létrehozása","írjon be bevet","Húzza ide a képet","Húzza ide a fájlt","vagy kattintson","Helyettesítő szöveg","Feltölt","Tallóz","Háttér","Szöveg","Fent","Középen","Lent","Oszlop beszúrás elé","Oszlop beszúrás utána","Sor beszúrás fölé","Sor beszúrás alá","Táblázat törlése","Sor törlése","Oszlop törlése","Cella tartalmának törlése","Karakterek száma: %d","Szavak száma: %d","Áthúzott","Aláhúzott","Felső index","Alsó index","Kivágás","Összes kijelölése","Szünet","Keresés","Csere erre","Csere","Beillesztés","Válasszon tartalmat a beillesztéshez","HTML","Félkövér","Dőlt","Ecset","Link","Visszavon","Újra","Táblázat","Kép","Törlés","Paragráfus","Betűméret","Videó","Betű","Rólunk","Nyomtat","Szimbólum","Aláhúzott","Áthúzott","Behúzás","Aussenseiter","Teljes méret","Összenyom","Formátum másolás","Egyenes vonal","Lista","Számozott lista","Kivág","Összes kijelölése","Beágyazott kód","Link megnyitása","Link szerkesztése","Nincs követés","Link leválasztása","Frissít","Szerkesztés","felülvizsgálat","URL","Szerkeszt","Vízszintes igazítás","Szűrő","Rendezés módosítás szerint","Rendezés név szerint","Rendezés méret szerint","Mappa hozzáadás","Visszaállít","Mentés","Mentés másként...","Átméretezés","Kivág","Szélesség","Magasság","Képarány megtartása","Igen","Nem","Eltávolít","Kijelöl","Kijelöl: %s","Függőleges igazítás","Felosztás","Összevonás","Oszlop hozzáadás","Sor hozzáadás",null,"Törlés","Függőleges felosztás","Vízszintes felosztás","Szegély","A beillesztett szöveg HTML-nek tűnik. Megtartsuk HTML-ként?","Beszúrás HTML-ként","Megtartás","Beszúrás szövegként","Csak szöveg beillesztése","Csak a saját képeit tudja szerkeszteni. Letölti ezt a képet?","Kép sikeresen feltöltve!","Palette","Er zijn geen bestanden in deze map.","átnevezés","Adja meg az új nevet","előnézet","Letöltés","Illessze be a vágólap","A böngésző nem támogatja a közvetlen hozzáférést biztosít a vágólapra.","Másolás kiválasztása","másolás","Határ sugár","Összes"];},function(t,e){t.exports.default=["Ketik sesuatu","Tentang Jodit","Editor Jodit","Panduan Pengguna Jodit","mencakup detail bantuan penggunaan","Untuk informasi tentang lisensi, silakan kunjungi website:","Beli versi lengkap","Hak Cipta © XDSoft.net - Chupurnov Valeriy. Hak cipta dilindungi undang-undang.","Tautan","Buka di tab baru","Buka editor dalam ukuran penuh","Hapus Pemformatan","Isi warna atau atur warna teks","Ulangi","Batalkan","Tebal","Miring","Sisipkan Daftar Tidak Berurut","Sisipkan Daftar Berurut","Tengah","Penuh","Kiri","Kanan","Sisipkan Garis Horizontal","Sisipkan Gambar","Sisipkan Berkas","Sisipkan video youtube/vimeo","Sisipkan tautan","Ukuran font","Keluarga font","Sisipkan blok format","Normal","Heading 1","Heading 2","Heading 3","Heading 4","Kutip","Kode","Sisipkan","Sisipkan tabel","Kurangi Indentasi","Tambah Indentasi","Pilih Karakter Spesial","Sisipkan Karakter Spesial","Formar warna","Ubah mode","Batas","atas","kanan","bawah","kiri","Gaya","Class","Rata","Kanan","Tengah","Kiri","--Tidak diset--","Src","Judul","Teks alternatif","Tautan","Buka tautan di tab baru","Gambar","berkas","Lanjutan","Properti gambar","Batal","Ya","Penjelajah Berkas","Error ketika memuat list","Error ketika memuat folder","Apakah Anda yakin?","Masukkan nama Direktori","Buat direktori","ketik nama","Letakkan gambar","Letakkan berkas","atau klik","Teks alternatif","Unggah","Jelajahi","Latar Belakang","Teks","Atas","Tengah","Bawah","Sisipkan kolom sebelumnya","Sisipkan kolom setelahnya","Sisipkan baris di atasnya","Sisipkan baris di bawahnya","Hapus tabel","Hapus baris","Hapus kolom","Kosongkan cell","Karakter: %d","Kata: %d","Coret","Garis Bawah","Superskrip","Subskrip","Potong pilihan","Pilih semua","Berhenti","Mencari","Ganti dengan","Ganti","Paste","Pilih konten untuk dipaste","sumber","tebal","miring","sikat","tautan","batalkan","ulangi","tabel","gambar","penghapus","paragraf","ukuran font","video","font","tentang","cetak","simbol","garis bawah","coret","menjorok ke dalam","menjorok ke luar","ukuran penuh","menyusut","salin format","hr","ul","ol","potong","Pilih semua","Kode embed","Buka tautan","Edit tautan","No follow","Hapus tautan","Perbarui","pensil","Mata","URL","Edit","Perataan horizontal","Filter","Urutkan berdasarkan perubahan","Urutkan berdasarkan nama","Urutkan berdasarkan ukuran","Tambah folder","Reset","Simpan","Simpan sebagai...","Ubah ukuran","Crop","Lebar","Tinggi","Jaga aspek rasio","Ya","Tidak","Copot","Pilih","Pilih %s","Rata vertikal","Bagi","Gabungkan","Tambah kolom","tambah baris","Lisensi: %s","Hapus","Bagi secara vertikal","Bagi secara horizontal","Bingkai","Kode Anda cenderung ke HTML. Biarkan sebagai HTML?","Paste sebagai HTML","Jaga","Sisipkan sebagai teks","Sisipkan hanya teks","Anda hanya dapat mengedit gambar Anda sendiri. Unduh gambar ini di host?","Gambar telah sukses diunggah ke host!","palet","Tidak ada berkas","ganti nama","Masukkan nama baru","pratinjau","Unduh","Paste dari clipboard","Browser anda tidak mendukung akses langsung ke clipboard.","Copy seleksi","copy","Border radius","Tampilkan semua"];},function(t,e){t.exports.default=["Scrivi qualcosa...","A proposito di Jodit","Jodit Editor","Guida utente di Jodit","contiene una guida dettagliata per l'uso.","Per informazioni sulla licenza, si prega di visitare il nostro sito:","Acquista la versione completa","Copyright © XDSoft.net - Chupurnov Valeriy. Alle Rechte vorbehalten.","Ancora","Apri in una nuova scheda","Apri l'editor a schermo intero","Formato chiaro","Riempi colore o lettera","Ripristina","Annulla","Grassetto","Corsivo","Inserisci lista non ordinata","Inserisci l'elenco ordinato","Allinea Centra","Allineare Giustificato","Allinea a Sinistra","Allinea a Destra","Inserisci la linea orizzontale","Inserisci immagine","Inserisci un file","Inserisci video Youtube/Vimeo","Inserisci il link","Dimensione del carattere","Tipo di font","Inserisci blocco","Normale","Heading 1","Heading 2","Heading 3","Heading 4","Citazione","Codice","Inserisci","Inserisci tabella","Riduci il rientro","Aumenta il rientro","Seleziona una funzione speciale","Inserisci un carattere speciale","Copia formato","Cambia modo","Margini","su","destra","giù","sinistra","Stili CSS","Classi CSS","Allinea","Destra","Centro","Sinistra","--Non Impostato--","Fonte","Titolo","Testo Alternativo","Link","Apri il link in una nuova scheda","Immagine","Archivio","Avanzato","Proprietà dell'immagine","Annulla","Accetta","Cerca il file","Errore durante il caricamento dell'elenco","Errore durante il caricamento delle cartelle","Sei sicuro?","Inserisci il nome della cartella","Crea cartella","Entre el nombre","Rilascia l'immagine","Rilascia file","o click","Testo alternativo","Carica","Sfoglia","Sfondo","Testo","Su","Centro","Sotto","Inserisci prima la colonna","Inserisci colonna dopo","Inserisci la riga sopra","Inserisci la riga sotto","Elimina tabella","Elimina riga","Elimina colonna","Cella vuota","Caratteri: %d","Parole: %d","Barrato","Sottolineato","indice","deponente","Taglia la selezione","Seleziona tutto","Pausa","Cerca","Sostituisci con","Sostituisci","Incolla","Seleziona il contenuto da incollare","HTML","Grassetto","Corsivo","Pennello","Link","Annulla","Ripristina","Tabella","Immagine","Gomma","Paragrafo","Dimensione del carattere","Video","Font","Approposito di","Stampa","Simbolo","Sottolineato","Barrato","trattino","annulla rientro","A grandezza normale","comprimere","Copia il formato","linea orizzontale","lista non ordinata","lista ordinata","Taglia","Seleziona tutto","Includi codice","Apri link","Modifica link","Non seguire","Togli link","Aggiornare","Per modificare","Recensione"," URL","Modifica","Allineamento orizzontale","Filtro","Ordina per data di modifica","Ordina per nome","Ordina per dimensione","Aggiungi cartella","Reset","Salva","Salva con nome...","Ridimensiona","Tagliare","Larghezza","Altezza","Mantenere le proporzioni","Si","No","Rimuovere","Seleziona","Seleziona: %s","Allineamento verticala","Dividere","Fondi","Aggiungi colonna","Aggiungi riga",null,"Cancella","Dividere verticalmente","Diviso orizzontale","Bordo","Il codice è simile all'HTML. Mantieni come HTML?","Incolla come HTML?","Mantieni","Inserisci come testo","Inserisci solo il testo","Puoi modificare solo le tue immagini. Scarica questa immagine sul server?","L'immagine è stata caricata con successo sul server!","tavolozza","Non ci sono file in questa directory.","ungherese","Inserisci un nuovo nome","anteprima","Scaricare","Incolla dagli appunti","Il tuo browser non supporta l'accesso diretto agli appunti.","Selezione di copia","copia","Border radius","Mostra tutti"];},function(t,e){t.exports.default=["なにかタイプしてください","Joditについて","Jodit Editor","Jodit ユーザーズ・ガイド","詳しい使い方","ライセンス詳細についてはJodit Webサイトを確認ください：","フルバージョンを購入","Copyright © XDSoft.net - Chupurnov Valeriy. All rights reserved.","Anchor","新しいタブで開く","エディターのサイズ（フル/ノーマル）","書式をクリア","テキストの色","やり直し","元に戻す","太字","斜体","箇条書き","番号付きリスト","中央揃え","両端揃え","左揃え","右揃え","区切り線を挿入","画像を挿入","ファイルを挿入","Youtube/Vimeo 動画","リンクを挿入","フォントサイズ","フォント","テキストのスタイル","指定なし","タイトル1","タイトル2","タイトル3","タイトル4","引用","コード","挿入","表を挿入","インデント減","インデント増","特殊文字を選択","特殊文字を挿入","書式を貼付け","編集モード切替え","マージン","上","右","下","左","スタイル","クラス","配置","右寄せ","中央寄せ","左寄せ","指定なし","ソース","タイトル","代替テキスト","リンク","新しいタブで開く","画像","ファイル","高度な設定","画像のプロパティー","キャンセル","確定","File Browser","Error on load list","Error on load folders","Are you sure?","Enter Directory name","Create directory","type name","ここに画像をドロップ","ここにファイルをドロップ","or クリック","代替テキスト","アップロード","ブラウズ","背景","文字","上","中央","下","左に列を挿入","右に列を挿入","上に行を挿入","下に行を挿入","表を削除","行を削除","列を削除","セルを空にする","文字数: %d","単語数: %d","取り消し線","下線","上付き文字","下付き文字","切り取り","すべて選択","Pause","検索","置換","置換","貼付け","選択した内容を貼付け","source","bold","italic","brush","link","undo","redo","table","image","eraser","paragraph","fontsize","video","font","about","print","symbol","underline","strikethrough","indent","outdent","fullsize","shrink","copyformat","分割線","箇条書き","番号付きリスト","切り取り","すべて選択","埋め込みコード","リンクを開く","リンクを編集","No follow","リンク解除","更新","鉛筆","サイトを確認","URL","編集","水平方向の配置","Filter","Sort by changed","Sort by name","Sort by size","Add folder","リセット","保存","Save as ...","リサイズ","Crop","幅","高さ","縦横比を保持","はい","いいえ","移除","選択","選択: %s","垂直方向の配置","分割","セルの結合","列を追加","行を追加",null,"削除","セルの分割（垂直方向）","セルの分割（水平方向）","境界線","HTMLコードを保持しますか？","HTMLで貼付け","HTMLを保持","HTMLをテキストにする","テキストだけ","You can only edit your own images. Download this image on the host?","The image has been successfully uploaded to the host!","パレット","There are no files","Rename","Enter new name","プレビュー","ダウンロード","貼り付け","お使いのブラウザはクリップボードを使用できません","コピー","copy","角の丸み","全て表示"];},function(t,e){t.exports.default=["Begin met typen..","Over Jodit","Jodit Editor","Jodit gebruikershandleiding","bevat gedetailleerde informatie voor gebruik.","Voor informatie over de licentie, ga naar onze website:","Volledige versie kopen","Copyright © XDSoft.net - Chupurnov Valeriy. Alle rechten voorbehouden.","Anker","Open in nieuwe tab","Editor in volledig scherm openen","Opmaak verwijderen","Vulkleur of tekstkleur aanpassen","Opnieuw","Ongedaan maken","Vet","Cursief","Geordende list invoegen","Ongeordende lijst invoegen","Centreren","Uitlijnen op volledige breedte","Links uitlijnen","Rechts uitlijnen","Horizontale lijn invoegen","Afbeelding invoegen","Bestand invoegen","Youtube/Vimeo video invoegen","Link toevoegen","Tekstgrootte","Lettertype","Format blok invoegen","Normaal","Koptekst 1","Koptekst 2","Koptekst 3","Koptekst 4","Citaat","Code","Invoegen","Tabel invoegen","Inspringing verkleinen","Inspringing vergroten","Symbool selecteren","Symbool invoegen","Opmaak kopieren","Modus veranderen","Marges","Boven","Rechts","Onder","Links","CSS styles","CSS classes","Uitlijning","Rechts","Gecentreerd","Links","--Leeg--","Src","Titel","Alternatieve tekst","Link","Link in nieuwe tab openen","Afbeelding","Bestand","Geavanceerd","Afbeeldingseigenschappen","Annuleren","OK","Bestandsbrowser","Fout bij het laden van de lijst","Fout bij het laden van de mappenlijst","Weet je het zeker?","Geef de map een naam","Map aanmaken","Type naam","Sleep hier een afbeelding naartoe","Sleep hier een bestand naartoe","of klik","Alternatieve tekst","Uploaden","Bladeren","Achtergrond","Tekst","Boven","Midden","Onder","Kolom invoegen (voor)","Kolom invoegen (na)","Rij invoegen (boven)","Rij invoegen (onder)","Tabel verwijderen","Rij verwijderen","Kolom verwijderen","Cel leegmaken","Tekens: %d","Woorden: %d","Doorstrepen","Onderstrepen","Superscript","Subscript","Selectie knippen","Selecteer alles","Enter","Zoek naar","Vervangen door","Vervangen","Plakken","Kies content om te plakken","Broncode","vet","cursief","kwast","link","ongedaan maken","opnieuw","tabel","afbeelding","gum","paragraaf","lettergrootte","video","lettertype","over","afdrukken","symbool","onderstreept","doorgestreept","inspringen","minder inspringen","volledige grootte","kleiner maken","opmaak kopiëren","horizontale lijn","lijst","genummerde lijst","knip","alles selecteren","Embed code","link openen","link aanpassen","niet volgen","link verwijderen","Updaten","Om te bewerken","Recensie"," URL","Bewerken","Horizontaal uitlijnen","Filteren","Sorteren op wijzigingsdatum","Sorteren op naam","Sorteren op grootte","Map toevoegen","Herstellen","Opslaan","Opslaan als ...","Grootte aanpassen","Bijknippen","Breedte","Hoogte","Verhouding behouden","Ja","Nee","Verwijderen","Selecteren","Selecteer: %s","Verticaal uitlijnen","Splitsen","Samenvoegen","Kolom toevoegen","Rij toevoegen",null,"Verwijderen","Verticaal splitsen","Horizontaal splitsen","Rand","Deze code lijkt op HTML. Als HTML behouden?","Invoegen als HTML","Origineel behouden","Als tekst invoegen","Als onopgemaakte tekst invoegen","Je kunt alleen je eigen afbeeldingen aanpassen. Deze afbeelding downloaden?","De afbeelding is succesvol geüploadet!","Palette","Er zijn geen bestanden in deze map.","Hongaars","Voer een nieuwe naam in","voorvertoning","Download","Plakken van klembord","Uw browser ondersteunt geen directe toegang tot het klembord.","Selectie kopiëren","kopiëren","Border radius","Toon alle"];},function(t,e){t.exports.default=["Napisz coś","O Jodit","Edytor Jodit","Instrukcja Jodit","zawiera szczegółowe informacje dotyczące użytkowania.","Odwiedź naszą stronę, aby uzyskać więcej informacji na temat licencji:","Zakup pełnej wersji","Copyright © XDSoft.net - Chupurnov Valeriy. Wszystkie prawa zastrzeżone.","Kotwica","Otwórz w nowej zakładce","Otwórz edytor w pełnym rozmiarze","Wyczyść formatowanie","Kolor wypełnienia lub ustaw kolor tekstu","Ponów","Cofnij","Pogrubienie","Kursywa","Wstaw listę wypunktowaną","Wstaw listę numeryczną","Wyśrodkuj","Wyjustuj","Wyrównaj do lewej","Wyrównaj do prawej","Wstaw linię poziomą","Wstaw grafikę","Wstaw plik","Wstaw film Youtube/vimeo","Wstaw link","Rozmiar tekstu","Krój czcionki","Wstaw formatowanie","Normalne","Nagłówek 1","Nagłówek 2","Nagłówek 3","Nagłówek 4","Cytat","Kod","Wstaw","Wstaw tabelę","Zmniejsz wcięcie","Zwiększ wcięcie","Wybierz znak specjalny","Wstaw znak specjalny","Malarz formatów","Zmień tryb","Marginesy","Górny","Prawy","Dolny","Levy","Style CSS","Klasy CSS","Wyrównanie","Prawa","środek","Lewa","brak","Źródło","Tytuł","Tekst alternatywny","Link","Otwórz w nowej zakładce","Grafika","Plik","Zaawansowane","Właściwości grafiki","Anuluj","OK","Przeglądarka plików","Błąd ładowania listy plików","Błąd ładowania folderów","Czy jesteś pewien?","Wprowadź nazwę folderu","Utwórz folder","wprowadź nazwę","Upuść plik graficzny","Upuść plik","lub kliknij tu","Tekst alternatywny","Wczytaj","Przeglądaj","Tło","Treść","Góra","Środek","Dół","Wstaw kolumnę przed","Wstaw kolumnę po","Wstaw wiersz przed","Wstaw wiersz po","Usuń tabelę","Usuń wiersz","Usuń kolumnę","Wyczyść komórkę","Znaki: %d","Słowa: %d","Przekreślenie","Podkreślenie","indeks górny","index dolny","Wytnij zaznaczenie","Wybierz wszystko","Przerwa","Szukaj","Zamień na","Zamień","Wklej","Wybierz zawartość do wklejenia","HTML","pogrubienie","kursywa","pędzel","link","cofnij","ponów","tabela","grafika","wyczyść","akapit","rozmiar czcionki","wideo","czcionka","O programie","drukuj","symbol","podkreślenie","przekreślenie","wcięcie","wycięcie","pełen rozmiar","przytnij","format kopii","linia pozioma","lista","lista numerowana","wytnij","zaznacz wszystko","Wstaw kod","otwórz link","edytuj link","Atrybut no-follow","Usuń link","Aktualizuj","edytuj","szukaj","URL","Edytuj","Wyrównywanie w poziomie","Filtruj","Sortuj wg zmiany","Sortuj wg nazwy","Sortuj wg rozmiaru","Dodaj folder","wyczyść","zapisz","zapisz jako","Zmień rozmiar","Przytnij","Szerokość","Wysokość","Zachowaj proporcje","Tak","Nie","Usuń","Wybierz","Wybierz: %s","Wyrównywanie w pionie","Podziel","Scal","Dodaj kolumnę","Dodaj wiersz",null,"Usuń","Podziel w pionie","Podziel w poziomie","Obramowanie","Twój kod wygląda jak HTML. Zachować HTML?","Wkleić jako HTML?","Oryginalny tekst","Wstaw jako tekst","Wstaw tylko treść","Możesz edytować tylko swoje grafiki. Czy chcesz pobrać tą grafikę?","Grafika została pomyślnienie dodana na serwer","Paleta","Brak plików.","zmień nazwę","Wprowadź nową nazwę","podgląd","pobierz","Wklej ze schowka","Twoja przeglądarka nie obsługuje schowka","Kopiuj zaznaczenie","kopiuj","Zaokrąglenie krawędzi","Pokaż wszystkie"];},function(t,e){t.exports.default=["Escreva algo...","Sobre o Jodit","Editor Jodit","Guia de usuário Jodit","contém ajuda detalhada para o uso.","Para informação sobre a licença, por favor visite nosso site:","Compre a versão completa","Copyright © XDSoft.net - Chupurnov Valeriy. Todos os direitos reservados.","Link","Abrir em nova aba","Abrir editor em tela cheia","Limpar formatação","Cor de preenchimento ou cor do texto","Refazer","Desfazer","Negrito","Itálico","Inserir lista não ordenada","Inserir lista ordenada","Centralizar","Justificar","Alinhar à Esquerda","Alinhar à Direita","Inserir linha horizontal","Inserir imagem","Inserir arquivo","Inserir vídeo do Youtube/vimeo","Inserir link","Tamanho da letra","Fonte","Inserir bloco","Normal","Cabeçalho 1","Cabeçalho 2","Cabeçalho 3","Cabeçalho 4","Citação","Código","Inserir","Inserir tabela","Diminuir recuo","Aumentar recuo","Selecionar caractere especial","Inserir caractere especial","Copiar formato","Mudar modo","Margens","cima","direta","baixo","esquerda","Estilos CSS","Classes CSS","Alinhamento","Direita","Centro","Esquerda","--Não Estabelecido--","Fonte","Título","Texto Alternativo","Link","Abrir link em nova aba","Imagem","Arquivo","Avançado","Propriedades da imagem","Cancelar","Ok","Procurar arquivo","Erro ao carregar a lista","Erro ao carregar as pastas","Você tem certeza?","Escreva o nome da pasta","Criar pasta","Escreva seu nome","Soltar imagem","Soltar arquivo","ou clique","Texto alternativo","Upload","Explorar","Fundo","Texto","Cima","Meio","Baixo","Inserir coluna antes","Inserir coluna depois","Inserir linha acima","Inserir linha abaixo","Excluir tabela","Excluir linha","Excluir coluna","Limpar célula","Caracteres: %d","Palavras: %d","Tachado","Sublinhar","sobrescrito","subscrito","Cortar seleção","Selecionar tudo","Pausa","Procurar por","Substituir com","Substituir","Colar","Escolher conteúdo para colar","HTML","negrito","itálico","pincel","link","desfazer","refazer","tabela","imagem","apagar","parágrafo","tamanho da letra","vídeo","fonte","Sobre de","Imprimir","Símbolo","sublinhar","tachado","recuar","diminuir recuo","Tamanho completo","diminuir","Copiar formato","linha horizontal","lista não ordenada","lista ordenada","Cortar","Selecionar tudo","Incluir código","Abrir link","Editar link","Não siga","Remover link","Atualizar","Editar","Visualizar","URL","Editar","Alinhamento horizontal","filtrar","Ordenar por modificação","Ordenar por nome","Ordenar por tamanho","Adicionar pasta","Resetar","Salvar","Salvar como...","Redimensionar","Recortar","Largura","Altura","Manter a proporção","Sim","Não","Remover","Selecionar","Selecionar: %s","Alinhamento vertical","Dividir","Mesclar","Adicionar coluna","Adicionar linha",null,"Excluir","Dividir vertical","Dividir horizontal","Borda","Seu código é similar ao HTML. Manter como HTML?","Colar como HTML?","Manter","Inserir como Texto","Inserir somente o Texto","Você só pode editar suas próprias imagens. Baixar essa imagem pro servidor?","A imagem foi enviada com sucesso para o servidor!","Palette","Não há arquivos nesse diretório.","Húngara","Digite um novo nome","preview","Baixar","Colar da área de transferência","O seu navegador não oferece suporte a acesso direto para a área de transferência.","Selecção de cópia","cópia","Border radius","Mostrar todos os"];},function(t,e){t.exports.default=["Напишите что-либо","О Jodit","Редактор Jodit","Jodit Руководство пользователя","содержит детальную информацию по использованию","Для получения сведений о лицензии , пожалуйста, перейдите на наш сайт:","Купить полную версию","Авторские права © XDSoft.net - Чупурнов Валерий. Все права защищены.","Анкор","Открывать ссылку в новой вкладке","Открыть редактор в полном размере","Очистить форматирование","Цвет заливки или цвет текста","Повтор","Отмена","Жирный","Наклонный","Вставка маркированного списка","Вставить нумерованный список","Выровнять по центру","Выровнять по ширине","Выровнять по левому краю","Выровнять по правому краю","Вставить горизонтальную линию","Вставить изображение","Вставить файл","Вставьте видео","Вставить ссылку","Размер шрифта","Шрифт","Вставить блочный элемент","Нормальный текст","Заголовок 1","Заголовок 2","Заголовок 3","Заголовок 4","Цитата","Код","Вставить","Вставить таблицу","Уменьшить отступ","Увеличить отступ","Выберите специальный символ","Вставить специальный символ","Формат краски","Источник","Отступы","сверху","справа","снизу","слева","Стили","Классы","Выравнивание","По правому краю","По центру","По левому краю","--не устанавливать--","src","Заголовок","Альтернативный текст (alt)","Ссылка","Открывать ссылку в новом окне",null,"Файл","Расширенные","Свойства изображения","Отмена","Ок","Браузер файлов","Ошибка при загрузке списка изображений","Ошибка при загрузке списка директорий","Вы уверены?","Введите название директории","Создать директорию","введите название","Перетащите сюда изображение","Перетащите сюда файл","или нажмите","Альтернативный текст","Загрузка","Сервер","Фон","Текст"," К верху","По середине","К низу","Вставить столбец до","Вставить столбец после","Вставить ряд выше","Вставить ряд ниже","Удалить таблицу","Удалять ряд","Удалить столбец","Очистить ячейку","Символов: %d","Слов: %d","Перечеркнуть","Подчеркивание","верхний индекс","индекс","Вырезать","Выделить все","Разделитель","Найти","Заменить на","Заменить","Вставить","Выбрать контент для вставки","HTML","жирный","курсив","заливка","ссылка","отменить","повторить","таблица","Изображение","очистить","параграф","размер шрифта","видео","шрифт","о редакторе","печать","символ","подчеркнутый","перечеркнутый","отступ","выступ","во весь экран","обычный размер","Копировать формат","линия","Список","Нумерованный список","Вырезать","Выделить все","Код","Открыть ссылку","Редактировать ссылку","Атрибут nofollow","Убрать ссылку","Обновить","Редактировать","Просмотр","URL","Редактировать","Горизонтальное выравнивание","Фильтр","По изменению","По имени","По размеру","Добавить папку","Восстановить","Сохранить","Сохранить как","Изменить размер","Обрезать размер","Ширина","Высота","Сохранять пропорции","Да","Нет","Удалить","Выделить","Выделить: %s","Вертикальное выравнивание","Разделить","Объединить в одну","Добавить столбец","Добавить строку","Лицензия: %s","Удалить","Разделить по вертикали","Разделить по горизонтали","Рамка","Ваш текст, который вы пытаетесь вставить похож на HTML. Вставить его как HTML?","Вставить как HTML?","Сохранить оригинал","Вставить как текст","Вставить только текст","Вы можете редактировать только свои собственные изображения. Загрузить это изображение на ваш сервер?","Изображение успешно загружено на сервер!","палитра","В данном каталоге нет файлов","Переименовать","Введите новое имя","Предпросмотр","Скачать","Вставить из буфера обмена","Ваш браузер не поддерживает прямой доступ к буферу обмена.","Скопировать выделенное","копия","Радиус границы","Показать все"];},function(t,e){t.exports.default=["Bir şey yazın.","Jodit Hakkında","Jodit Editor","Jodit Kullanım Kılavuzu","kullanım için detaylı bilgiler içerir","Lisans hakkında bilgi için lütfen web sitemize gidin:","Tam versiyon satın al","Copyright © XDSoft.net - Chupurnov Valeriy. Tüm Hakları Saklıdır","Bağlantı","Yeni sekmede aç","Tam ekran editör","Stili temizle","Dolgu ve yazı rengi seç","İleri Al","Geri Al","Kalın","İtalik","Sırasız Liste Ekle","Sıralı Liste Ekle","Ortala","Kenarlara Yasla","Sola Yasla","Sağa Yasla","Yatay Çizgi Ekle","Resim Ekle","Dosya Ekle","Youtube/vimeo Videosu Ekle","Bağlantı Ekle","Font Boyutu","Font Ailesi","Blok Ekle","Normal","Başlık 1","Başlık 2","Başlık 3","Başlık 4","Alıntı","Code","Ekle","Tablo Ekle","Girintiyi Azalt","Girintiyi Arttır","Özel Karakter Seç","Özel Karakter Ekle","Resim Biçimi","Mod Değiştir","MEsafeler","Üst","Sağ","Alt","Sol","CSS Stilleri","CSS Sınıfları","Hizalama","Sağ","Ortalı","Sol","Belirlenmedi","Kaynak","Başlık","Alternatif Yazı","Link","Bağlantıyı yeni sekmede aç","Resim","Dosya","Gelişmiş","Resim özellikleri","İptal","Tamam","Dosya Gezgini","Liste yüklenirken hata oluştu","Klasörler yüklenirken hata oluştur","Emin misiniz?","Dizin yolu giriniz","Dizin oluştur","Typname","Resim bırak","Dosya bırak","veya tıkla","Alternatif yazı","Yükle","Ekle","Arka plan","Yazı","Üst","Orta","Aşağı","Öncesine kolon ekle","Sonrasına kolon ekle","Üstüne satır ekle","Altına satır ekle","Tabloyu sil","Satır sil","Kolon sil","Hücreyi boşalt","Harfler: %d","Kelimeler: %d","Durchschlagen","Alt çizgi","Üst yazı","Alt yazı","Seçilimi kes","Tümünü seç","Durdur","Ara","Şununla değiştir","Değiştir","Yapıştır","Yapıştırılacak içerik seç","Kaynak","Kalın","italik","Fırça","Bağlantı","Geri al","İleri al","Tablo","Resim","Silgi","Paragraf","Font boyutu","Video","Font","Hakkında","Yazdır","Sembol","Alt çizgi","Üstü çizili","Girinti","Çıkıntı","Tam ekran","Küçült","Kopyalama Biçimi","Ayraç","Sırasız liste","Sıralı liste","Kes","Tümünü seç","Kod ekle","Bağlantıyı aç","Bağlantıyı düzenle","Nofollow özelliği","Bağlantıyı kaldır","Güncelle","Düzenlemek için","Yorumu","URL","Düzenle","Yatay hizalama","Filtre","Değişime göre sırala","İsme göre sırala","Boyuta göre sırala","Klasör ekle","Sıfırla","Kaydet","Farklı kaydet","Boyutlandır","Kırp","Genişlik","Yükseklik","En boy oranını koru","Evet","Hayır","Sil","Seç","Seç: %s","Dikey hizalama","Ayır","Birleştir","Kolon ekle","Satır ekle",null,"Sil","Dikey ayır","Yatay ayır","Kenarlık","Kodunuz HTML koduna benziyor. HTML olarak devam etmek ister misiniz?","HTML olarak yapıştır","Sakla","Yazı olarak ekle","Nur Text einfügen","Sadece kendi resimlerinizi düzenleyebilirsiniz. Bu görseli kendi hostunuza indirmek ister misiniz?","Görsel başarıyla hostunuza yüklendi","Palette","Bu dizinde dosya yok.","Macarca","Yeni isim girin","Ön izleme","İndir","Panodan yapıştır ","Tarayıcınız pano doğrudan erişim desteklemiyor.","Kopya seçimi","kopya","Sınır yarıçapı","Tümünü Göster "];},function(t,e){t.exports.default=["输入一些内容","关于Jodit","Jodit Editor","开发者指南","使用帮助","有关许可证的信息，请访问我们的网站：","购买完整版本","Copyright © XDSoft.net - Chupurnov Valeriy. All rights reserved.","Anchor","在新窗口打开","全屏编辑","清除样式","颜色","重做","撤销","粗体","斜体","符号列表","编号","居中","对齐文本","左对齐","右对齐","分割线","图片","文件","youtube/vimeo 视频","链接","字号","字体","格式块","文本","标题1","标题2","标题3","标题4","引用","代码","插入","表格","减少缩进","增加缩进","选择特殊符号","特殊符号","格式复制","改变模式","外边距（Margins）","top","right","bottom","left","样式","Classes","对齐方式","居右","居中","居左","无","Src","Title","Alternative","Link","在新窗口打开链接","图片","file","高级","图片属性","取消","确定","文件管理","加载list错误","加载folders错误","你确定吗？","输入路径","创建路径","type name","拖动图片到此","拖动文件到此","或点击","Alternative text","上传","浏览","背景色","文字","顶部","中间","底部","在之前插入列","在之后插入列","在之前插入行","在之后插入行","删除表格","删除行","删除列","清除内容","字符数: %d","单词数: %d","删除线","下划线","上标","下标","剪切","全选","Pause","查找","替换为","替换","粘贴","选择内容并粘贴","源码","粗体","斜体","颜色","链接","撤销","重做","表格","图片","橡皮擦","段落","字号","视频","字体","关于","打印","符号","下划线","上出现","增加缩进","减少缩进","全屏","收缩","复制格式","分割线","无序列表","顺序列表","剪切","全选","嵌入代码","打开链接","编辑链接","No follow","Unlink","更新","铅笔","回顧","URL",null,"水平对齐","筛选","修改时间排序","名称排序","大小排序","新建文件夹","重置","保存","保存为","调整大小","Crop","宽","高","保存长宽比","是","不","移除","选择","选择: %s","垂直对齐","拆分","合并","添加列","添加行",null,"删除","垂直拆分","水平拆分","边框","你粘贴的文本是一段html代码，是否保留源格式","html粘贴","保留源格式","把html代码视为普通文本","只保留文本","你只能编辑你自己的图片。Download this image on the host?","图片上传成功","调色板","此目录中沒有文件。","重命名","输入新名称","预览","下载","粘贴从剪贴板","你浏览器不支持直接访问的剪贴板。","复制的选择","复制","边界半径","显示所有"];},function(t,e){t.exports.default=["輸入一些內容","關於Jodit","Jodit Editor","開發者指南","使用幫助","有關許可證的信息，請訪問我們的網站：","購買完整版本","Copyright © XDSoft.net - Chupurnov Valeriy. All rights reserved.","Anchor","在新窗口打開","全屏編輯","清除樣式","顏色","重做","撤銷","粗體","斜體","符號列表","編號","居中","對齊文本","左對齊","右對齊","分割線","圖片","文件","youtube/vimeo 影片","鏈接","字號","字體","格式塊","文本","標題1","標題2","標題3","標題4","引用","代碼","插入","表格","減少縮進","增加縮進","選擇特殊符號","特殊符號","格式複製","改變模式","外邊距（Margins）","top","right","bottom","left","樣式","Classes","對齊方式","居右","居中","居左","無","Src","Title","Alternative","Link","在新窗口打開鏈接","圖片","file","高級","圖片屬性","取消","確定","文件管理","加載list錯誤","加載folders錯誤","你確定嗎？","輸入路徑","創建路徑","type name","拖動圖片到此","拖動文件到此","或點擊","Alternative text","上傳","瀏覽","背景色","文字","頂部","中間","底部","在之前插入列","在之後插入列","在之前插入行","在之後插入行","刪除表格","刪除行","刪除列","清除內容","字符數: %d","單詞數: %d","刪除線","下劃線","上標","下標","剪切","全選","Pause","查找","替換為","替換","黏貼","選擇內容並黏貼","源碼","粗體","斜體","顏色","鏈接","撤銷","重做","表格","圖片","橡皮擦","段落","字號","影片","字體","關於","打印","符號","下劃線","上出現","增加縮進","減少縮進","全屏","收縮","複製格式","分割線","無序列表","順序列表","剪切","全選","嵌入代碼","打開鏈接","編輯鏈接","No follow","Unlink","更新","鉛筆","回顧","URL",null,"水平對齊","篩選","修改時間排序","名稱排序","大小排序","新建文件夾","重置","保存","保存為","調整大小","Crop","寬","高","保存長寬比","是","不","移除","選擇","選擇: %s","垂直對齊","拆分","合併","添加列","添加行",null,"刪除","垂直拆分","水平拆分","邊框","你黏貼的文本是一段html代碼，是否保留源格式","html黏貼","保留源格式","把html代碼視為普通文本","只保留文本","妳只能編輯妳自己的圖片。Download this image on the host?","圖片上傳成功","調色板","此目錄中沒有文件。","重命名","輸入新名稱","預覽","下載","วางจากคลิปบอร์ด","ของเบราว์เซอร์ไม่สนับสนุนโดยตรงเข้าไปยังคลิปบอร์ด","คัดลอกส่วนที่เลือก","คัดลอก","เส้นขอบรัศมี","แสดงทั้งหมด"];},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(1),a=o(19),s=o(6),l=o(5),c=o(41),d=o(3);n.Config.prototype.addNewLine=!0,n.Config.prototype.addNewLineOnDBLClick=!0,n.Config.prototype.addNewLineTagsTriggers=["table","iframe","img","hr","jodit"],n.Config.prototype.addNewLineDeltaShow=20;var u="addnewline",f=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.line=e.jodit.create.fromHTML('<div role="button" tabIndex="-1" title="'+e.jodit.i18n("Break")+'" class="jodit-add-new-line"><span>'+s.ToolbarIcon.getIcon("enter")+"</span></div>"),e.isMatchedTag=new RegExp("^("+e.jodit.options.addNewLineTagsTriggers.join("|")+")$","i"),e.preview=!1,e.lineInFocus=!1,e.isShown=!1,e.hideForce=function(){e.isShown&&(e.isShown=!1,e.jodit.async.clearTimeout(e.timeout),e.lineInFocus=!1,r.Dom.safeRemove(e.line));},e.hide=function(){e.isShown&&!e.lineInFocus&&(e.timeout=e.jodit.async.setTimeout(e.hideForce,{timeout:500,label:"add-new-line-hide"}));},e.canGetFocus=function(t){return null!==t&&r.Dom.isBlock(t,e.jodit.editorWindow)&&!/^(img|table|iframe|hr)$/i.test(t.nodeName)},e.onClickLine=function(t){var o=e.jodit,i=o.create.inside.element(o.options.enter);e.preview&&e.current&&e.current.parentNode?e.current.parentNode.insertBefore(i,e.current):o.editor.appendChild(i),o.selection.setCursorIn(i),d.scrollIntoView(i,o.editor,o.editorDocument),o.events.fire("synchro"),e.hideForce(),t.preventDefault();},e.onDblClickEditor=function(t){var o=e.jodit;if(!o.options.readonly&&o.options.addNewLineOnDBLClick&&t.target===o.editor&&o.selection.isCollapsed()){var i=a.offset(o.editor,o,o.editorDocument),n=t.pageY-o.editorWindow.pageYOffset,r=o.create.inside.element(o.options.enter);Math.abs(n-i.top)<Math.abs(n-(i.height+i.top))&&o.editor.firstChild?o.editor.insertBefore(r,o.editor.firstChild):o.editor.appendChild(r),o.selection.setCursorIn(r),o.setEditorValue(),e.hideForce(),t.preventDefault();}},e.onMouseMove=function(t){var o=e.jodit,i=o.editorDocument.elementFromPoint(t.clientX,t.clientY);if(r.Dom.isHTMLElement(i,o.editorWindow)&&!r.Dom.isOrContains(e.line,i)&&r.Dom.isOrContains(o.editor,i))if(e.isMatchedTag.test(i.nodeName)||(i=r.Dom.closest(i,e.isMatchedTag,o.editor)),i){if(e.isMatchedTag.test(i.nodeName)){var n=r.Dom.up(i,(function(t){return r.Dom.isBlock(t,o.editorWindow)}),o.editor);n&&n!==o.editor&&(i=n);}var s=a.position(i,e.jodit),l=!1,d=t.clientY;e.jodit.iframe&&(d+=a.position(e.jodit.iframe,e.jodit,!0).top);var u=e.jodit.options.addNewLineDeltaShow;Math.abs(d-s.top)>u||(l=s.top,e.preview=!0),Math.abs(d-(s.top+s.height))>u||(l=s.top+s.height,e.preview=!1),!1===l||c.call(e.preview?r.Dom.prev:r.Dom.next,i,e.canGetFocus,o.editor)?(e.current=!1,e.hide()):(e.line.style.top=l+"px",e.current=i,e.show());}else e.hide();},e}return i.__extends(e,t),e.prototype.show=function(){this.isShown||this.jodit.options.readonly||this.jodit.isLocked()||(this.isShown=!0,this.jodit.container.classList.contains("jodit_popup_active")||(this.jodit.async.clearTimeout(this.timeout),this.line.classList.toggle("jodit-add-new-line_after",!this.preview),this.jodit.container.appendChild(this.line),this.line.style.width=this.jodit.editor.clientWidth+"px"));},e.prototype.afterInit=function(t){var e=this;t.options.addNewLine&&(t.events.on(this.line,"mousemove",(function(t){t.stopPropagation();})).on(this.line,"mousedown touchstart",this.onClickLine).on("change",this.hideForce).on(this.line,"mouseenter",(function(){e.jodit.async.clearTimeout(e.timeout),e.lineInFocus=!0;})).on(this.line,"mouseleave",(function(){e.lineInFocus=!1;})).on("changePlace",this.addEventListeners.bind(this)),this.addEventListeners());},e.prototype.addEventListeners=function(){var t=this.jodit;t.events.off(t.editor,"."+u).off(t.container,"."+u).on([t.ownerWindow,t.editorWindow,t.editor],"scroll."+u,this.hideForce).on(t.editor,"dblclick."+u,this.onDblClickEditor).on(t.editor,"click."+u,this.hide).on(t.container,"mouseleave."+u,this.hide).on(t.editor,"mousemove."+u,t.async.debounce(this.onMouseMove,3*t.defaultTimeout));},e.prototype.beforeDestruct=function(){this.jodit.async.clearTimeout(this.timeout),this.jodit.events.off(this.line),this.jodit.events.off("changePlace",this.addEventListeners),r.Dom.safeRemove(this.line),this.jodit.events.off([this.jodit.ownerWindow,this.jodit.editorWindow,this.jodit.editor],"."+u).off(this.jodit.container,"."+u);},e}(l.Plugin);e.addNewLine=f;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(1);i.Config.prototype.autofocus=!1,e.autofocus=function(t){t.events.on("afterInit",(function(){t.options.autofocus&&(t.defaultTimeout?t.async.setTimeout(t.selection.focus,300):t.selection.focus());})),t.events.on("afterInit afterAddPlace",(function(){t.events.off(t.editor,"mousedown.autofocus").on(t.editor,"mousedown.autofocus",(function(e){t.isEditorMode()&&e.target&&n.Dom.isBlock(e.target,t.editorWindow)&&!e.target.childNodes.length&&(t.editor===e.target?t.selection.focus():t.selection.setCursorIn(e.target));}));}));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(2),r=o(2),a=o(1),s=o(3),l=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.potentialRemovable=r.MAY_BE_REMOVED_WITH_KEY,e.isEmpty=function(t){return null===t.nodeName.match(/^(TD|TH|TR|TABLE|LI)$/)&&(!(!a.Dom.isEmpty(t)&&null===t.nodeName.match(e.potentialRemovable))||!(a.Dom.isText(t)&&!a.Dom.isEmptyTextNode(t))&&Array.from(t.childNodes).every(e.isEmpty))},e}return i.__extends(e,t),e.prototype.removeEmptyBlocks=function(t){var e,o=t;s.normalizeNode(t);do{var i=o.innerHTML.replace(n.INVISIBLE_SPACE_REG_EXP,"");if(i.length&&"<br>"!==i||a.Dom.isCell(o,this.jodit.editorWindow)||!o.parentNode||t===this.jodit.editor)break;e=o.parentNode,this.jodit.selection.removeNode(o),o=e;}while(o&&o!==this.jodit.editor)},e.prototype.removeChar=function(t,e,o){var i=null;do{if(a.Dom.isText(t.node)&&s.isString(t.node.nodeValue)){for(var r=t.node.nodeValue,l=e?r.length:0,c=e?-1:1,d=l;l>=0&&r.length>=l&&r[l+(e?-1:0)]===n.INVISIBLE_SPACE;)l+=c;if(l!==d&&(e?r=r.substr(0,l)+r.substr(d):(r=r.substr(0,d)+r.substr(l),l=d),t.node.nodeValue=r),o.setStart(t.node,l),o.collapse(!0),this.jodit.selection.selectRange(o),i=a.Dom.findInline(t.node,e,this.jodit.editor),r.length){var u=!1;if(e?l&&(u=!0):r.length>l&&(u=!0),u)return !0}else o.setStartBefore(t.node),o.collapse(!0),this.jodit.selection.selectRange(o),this.jodit.selection.removeNode(t.node),t.node=i;i&&(a.Dom.isInlineBlock(i)&&(i=e?i.lastChild:i.firstChild),a.Dom.isText(i)&&(t.node=i));}}while(a.Dom.isText(i))},e.prototype.removePotential=function(t){if(t&&this.potentialRemovable.test(t.nodeName))return this.jodit.selection.removeNode(t),!1},e.prototype.removeInline=function(t,e,o){if(t.node){var i=t.node;if(this.removeChar(t,e,o))return !0;if(t.node||(t.node=i.parentNode),t.node===this.jodit.editor)return !1;var n=t.node;if(!1===this.removePotential(n))return !1;for(n&&(n=e?n.previousSibling:n.nextSibling);a.Dom.isText(n)&&n.nodeValue&&n.nodeValue.match(/^[\n\r]+$/);)n=e?n.previousSibling:n.nextSibling;return this.removePotential(n)}},e.prototype.afterInit=function(t){var e=this;t.events.on("afterCommand",(function(t){"delete"===t&&e.afterCommand();})).on("keydown",(function(t){if(t.which===n.KEY_BACKSPACE||t.which===n.KEY_DELETE)return e.onDelete(t.which===n.KEY_BACKSPACE)}));},e.prototype.afterCommand=function(){var t=this.jodit,e=t.selection.current();if(e&&a.Dom.isTag(e.firstChild,"br")&&t.selection.removeNode(e.firstChild),!(s.trim(t.editor.textContent||"")||t.editor.querySelector("img")||e&&a.Dom.closest(e,"table",t.editor))){t.editor.innerHTML="";var o=t.selection.setCursorIn(t.editor);t.selection.removeNode(o);}},e.prototype.onDelete=function(t){var e=this.jodit;if(e.selection.isFocused()||e.selection.focus(),!e.selection.isCollapsed())return e.execCommand("Delete"),!1;var o=e.selection.sel,i=!(!o||!o.rangeCount)&&o.getRangeAt(0);if(!i)return !1;var r=e.create.inside.text(n.INVISIBLE_SPACE),l=e.create.inside.span();try{if(i.insertNode(r),!a.Dom.isOrContains(e.editor,r))return !1;var c=a.Dom.up(r,(function(t){return a.Dom.isBlock(t,e.editorWindow)}),e.editor),d=a.Dom.findInline(r,t,e.editor),u={node:d},f=void 0;if(d?f=this.removeInline(u,t,i):r.parentNode&&(f=this.removeInline({node:t?r.parentNode.previousSibling:r.parentNode.nextSibling},t,i)),void 0!==f)return !!f&&void 0;if(c&&c.nodeName.match(/^(TD)$/))return !1;var p=s.call(t?a.Dom.prev:a.Dom.next,u.node||r,(function(t){return a.Dom.isBlock(t,e.editorWindow)}),e.editor);if(!p&&c&&c.parentNode){p=e.create.inside.element(e.options.enter);for(var h=c;h&&h.parentNode&&h.parentNode!==e.editor;)h=h.parentNode;h.parentNode&&h.parentNode.insertBefore(p,h);}else if(p&&this.isEmpty(p))return e.selection.removeNode(p),!1;if(p){var v=e.selection.setCursorIn(p,!t);e.selection.insertNode(l,!1,!1),a.Dom.isText(v)&&v.nodeValue===n.INVISIBLE_SPACE&&a.Dom.safeRemove(v);}if(c){var m=c.parentNode;if(this.removeEmptyBlocks(c),p&&m&&(c.nodeName===p.nodeName&&m&&p.parentNode&&m!==e.editor&&p.parentNode!==e.editor&&m!==p.parentNode&&m.nodeName===p.parentNode.nodeName&&(c=m,p=p.parentNode),a.Dom.moveContent(c,p,!t),s.normalizeNode(p)),a.Dom.isTag(p,"li")){var g=a.Dom.closest(p,"Ul|OL",e.editor);if(g){var b=g.nextSibling;b&&b.nodeName===g.nodeName&&g!==b&&(a.Dom.moveContent(b,g,!t),e.selection.removeNode(b));}}return this.removeEmptyBlocks(c),!1}}finally{var y=r.parentNode;y&&r.nodeValue===n.INVISIBLE_SPACE&&(a.Dom.safeRemove(r),!y.firstChild&&y.parentNode&&y!==e.editor&&e.selection.removeNode(y)),l&&a.Dom.isOrContains(e.editor,l,!0)&&(v=e.selection.setCursorBefore(l),a.Dom.safeRemove(l),v&&v.parentNode&&(a.Dom.findInline(v,!0,v.parentNode)||a.Dom.findInline(v,!1,v.parentNode))&&a.Dom.safeRemove(v)),e.setEditorValue();}return !1},e.prototype.beforeDestruct=function(t){},e}(o(5).Plugin);e.backspace=l;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4);n.Config.prototype.controls.subscript={tags:["sub"],tooltip:"subscript"},n.Config.prototype.controls.superscript={tags:["sup"],tooltip:"superscript"},n.Config.prototype.controls.bold={tagRegExp:/^(strong|b)$/i,tags:["strong","b"],css:{"font-weight":["bold","700"]},tooltip:"Bold"},n.Config.prototype.controls.italic={tagRegExp:/^(em|i)$/i,tags:["em","i"],css:{"font-style":"italic"},tooltip:"Italic"},n.Config.prototype.controls.underline={tagRegExp:/^(u)$/i,tags:["u"],css:{"text-decoration":"underline"},tooltip:"Underline"},n.Config.prototype.controls.strikethrough={tagRegExp:/^(s)$/i,tags:["s"],css:{"text-decoration":"line-through"},tooltip:"Strike through"},e.bold=function(t){var e=function(e){var o=n.Config.defaultOptions.controls[e],r=i.__assign({},o.css),a={};return Object.keys(r).forEach((function(t){a[t]=Array.isArray(r[t])?r[t][0]:r[t];})),t.selection.applyCSS(a,o.tags?o.tags[0]:void 0,o.css),t.events.fire("synchro"),!1};t.registerCommand("bold",{exec:e,hotkeys:["ctrl+b","cmd+b"]}).registerCommand("italic",{exec:e,hotkeys:["ctrl+i","cmd+i"]}).registerCommand("underline",{exec:e,hotkeys:["ctrl+u","cmd+u"]}).registerCommand("strikethrough",{exec:e});};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(1),s=o(3),l=o(5);n.Config.prototype.cleanHTML={timeout:300,removeEmptyElements:!0,fillEmptyParagraph:!0,replaceNBSP:!0,replaceOldTags:{i:"em",b:"strong"},allowTags:!1,denyTags:!1},n.Config.prototype.controls.eraser={command:"removeFormat",tooltip:"Clear Formatting"};var c=function(t){function e(){var o=null!==t&&t.apply(this,arguments)||this;return o.onChange=function(){if(o.allowEdit()){var t=o.jodit,e=t.selection.current(),i=t.options.cleanHTML.replaceOldTags;if(i&&e){var n=Object.keys(i).join("|");if(t.selection.isCollapsed()){var r=a.Dom.closest(e,n,t.editor);if(r){var s=t.selection.save(),l=i[r.nodeName.toLowerCase()]||i[r.nodeName];a.Dom.replace(r,l,t.create.inside,!0,!1),t.selection.restore(s);}}}var c=null;t.editor.firstChild&&(c=t.editor.firstChild);var d=[],u=o.checkNode(c,e,d);d.forEach(a.Dom.safeRemove),(d.length||u)&&t.events&&t.events.fire("syncho");}},o.checkNode=function(t,e,i){var n=!1;if(!t)return n;if(o.isRemovableNode(t,e))return i.push(t),o.checkNode(t.nextSibling,e,i);if(o.jodit.options.cleanHTML.fillEmptyParagraph&&a.Dom.isBlock(t,o.jodit.editorWindow)&&a.Dom.isEmpty(t,/^(img|svg|canvas|input|textarea|form|br)$/)){var r=o.jodit.create.inside.element("br");t.appendChild(r),n=!0;}var s=o.allowTagsHash;if(s&&!0!==s[t.nodeName]){var l=t.attributes;if(l&&l.length){for(var c=[],d=0;l.length>d;d+=1){var u=s[t.nodeName][l[d].name];(!u||!0!==u&&u!==l[d].value)&&c.push(l[d].name);}c.length&&(n=!0),c.forEach((function(e){t.removeAttribute(e);}));}}return n=o.checkNode(t.firstChild,e,i)||n,o.checkNode(t.nextSibling,e,i)||n},o.allowTagsHash=e.getHash(o.jodit.options.cleanHTML.allowTags),o.denyTagsHash=e.getHash(o.jodit.options.cleanHTML.denyTags),o.onKeyUpCleanUp=function(){var t=o.jodit;if(o.allowEdit()){var e=t.selection.current();if(e){var i=a.Dom.up(e,(function(e){return a.Dom.isBlock(e,t.editorWindow)}),t.editor);i&&a.Dom.all(i,(function(o){o&&a.Dom.isText(o)&&null!==o.nodeValue&&r.INVISIBLE_SPACE_REG_EXP.test(o.nodeValue)&&0!==o.nodeValue.replace(r.INVISIBLE_SPACE_REG_EXP,"").length&&(o.nodeValue=o.nodeValue.replace(r.INVISIBLE_SPACE_REG_EXP,""),o===e&&t.selection.isCollapsed()&&t.selection.setCursorAfter(o));}));}}},o.beforeCommand=function(t){if("removeformat"===t.toLowerCase())return o.onRemoveFormat(),!1},o.afterCommand=function(t){"inserthorizontalrule"!==t.toLowerCase()||o.onInsertHorizontalLine();},o.cleanNode=function(t,e){switch(void 0===e&&(e=!1),t.nodeType){case Node.ELEMENT_NODE:a.Dom.each(t,(function(t){o.cleanNode(t,e);})),a.Dom.isTag(t,"font")?a.Dom.unwrap(t):e||(Array.from(t.attributes).forEach((function(e){-1===["src","href","rel","content"].indexOf(e.name.toLowerCase())&&t.removeAttribute(e.name);})),s.normalizeNode(t));break;case Node.TEXT_NODE:!e&&o.jodit.options.cleanHTML.replaceNBSP&&a.Dom.isText(t)&&null!==t.nodeValue&&t.nodeValue.match(r.SPACE_REG_EXP)&&(t.nodeValue=t.nodeValue.replace(r.INVISIBLE_SPACE_REG_EXP,"").replace(r.SPACE_REG_EXP," "));break;default:a.Dom.safeRemove(t);}},o}return i.__extends(e,t),e.prototype.afterInit=function(t){t.events.off(".cleanHtml").on("change.cleanHtml afterSetMode.cleanHtml afterInit.cleanHtml mousedown.cleanHtml keydown.cleanHtml",t.async.debounce(this.onChange,t.options.cleanHTML.timeout)).on("keyup.cleanHtml",this.onKeyUpCleanUp).on("beforeCommand.cleanHtml",this.beforeCommand).on("afterCommand.cleanHtml",this.afterCommand);},e.prototype.allowEdit=function(){return !(this.jodit.isInDestruct||!this.jodit.isEditorMode()||this.jodit.getReadOnly())},e.getHash=function(t){var e=/([^\[]*)\[([^\]]+)]/,o=/[\s]*,[\s]*/,i=/^(.*)[\s]*=[\s]*(.*)$/,n={};return "string"==typeof t?(t.split(o).map((function(t){t=s.trim(t);var r=e.exec(t),a={};if(r){var l=r[2].split(o);r[1]&&(l.forEach((function(t){t=s.trim(t);var e=i.exec(t);e?a[e[1]]=e[2]:a[t]=!0;})),n[r[1].toUpperCase()]=a);}else n[t.toUpperCase()]=!0;})),n):!!t&&(Object.keys(t).forEach((function(e){n[e.toUpperCase()]=t[e];})),n)},e.prototype.onInsertHorizontalLine=function(){var t=this,e=this.jodit.editor.querySelector("hr[id=null]");if(e){var o=a.Dom.next(e,(function(e){return a.Dom.isBlock(e,t.jodit.editorWindow)}),this.jodit.editor,!1);o||(o=this.jodit.create.inside.element(this.jodit.options.enter))&&a.Dom.after(e,o),this.jodit.selection.setCursorIn(o);}},e.prototype.onRemoveFormat=function(){var t=this,e=this.jodit.selection,o=e.current();if(o){for(var i=function(e){return e&&a.Dom.up(e,a.Dom.isInlineBlock,t.jodit.editor)},n=i(o),s=n;s;)(s=i(s.parentNode))&&(n=s);var l=e.isCollapsed(),c=e.range,d=null;if(l||(d=c.extractContents()),n){var u=this.jodit.create.inside.text(r.INVISIBLE_SPACE);c.insertNode(u);var f=a.Dom.isOrContains(n,u,!0);if(a.Dom.safeRemove(u),c.collapse(!0),f&&n.parentNode&&n.parentNode!==d){var p=this.jodit.selection.splitSelection(n);this.jodit.selection.setCursorAfter(p||n),a.Dom.isEmpty(n)&&a.Dom.safeRemove(n);}}d&&e.insertNode(this.cleanFragment(d));}},e.prototype.cleanFragment=function(t){var e=this;return a.Dom.each(t,(function(t){a.Dom.isElement(t)&&r.IS_INLINE.test(t.nodeName)&&(e.cleanFragment(t),a.Dom.unwrap(t));})),t},e.prototype.isRemovableNode=function(t,o){var i=this,n=this.allowTagsHash;return !(a.Dom.isText(t)||!(n&&!n[t.nodeName]||this.denyTagsHash&&this.denyTagsHash[t.nodeName]))||!(!(o&&a.Dom.isTag(t,"br")&&e.hasNotEmptyTextSibling(t))||e.hasNotEmptyTextSibling(t,!0)||a.Dom.up(t,(function(t){return a.Dom.isBlock(t,i.jodit.editorWindow)}),this.jodit.editor)===a.Dom.up(o,(function(t){return a.Dom.isBlock(t,i.jodit.editorWindow)}),this.jodit.editor))||this.jodit.options.cleanHTML.removeEmptyElements&&!1!==o&&a.Dom.isElement(t)&&null!==t.nodeName.match(r.IS_INLINE)&&!this.jodit.selection.isMarker(t)&&0===s.trim(t.innerHTML).length&&!a.Dom.isOrContains(t,o)},e.hasNotEmptyTextSibling=function(t,e){void 0===e&&(e=!1);for(var o=e?t.nextSibling:t.previousSibling;o;){if(a.Dom.isElement(o)||!a.Dom.isEmptyTextNode(o))return !0;o=e?o.nextSibling:o.previousSibling;}return !1},e.prototype.beforeDestruct=function(t){this.jodit.events.off(".cleanHtml");},e}(l.Plugin);e.cleanHtml=c;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.nl2br=function(t){return t.replace(/([^>])([\n\r]+)/g,"$1<br/>$2")};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(2),r=o(15),a=o(5),s=o(1),l=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.currentIndex=0,e.list=[],e.container=null,e.listBox=null,e.previewBox=null,e.dialog=null,e.paste=function(){if(e.jodit.selection.focus(),e.jodit.selection.insertHTML(e.list[e.currentIndex]),0!==e.currentIndex){var t=e.list[0];e.list[0]=e.list[e.currentIndex],e.list[e.currentIndex]=t;}e.dialog&&e.dialog.close(),e.jodit.setEditorValue();},e.onKeyDown=function(t){var o=e.currentIndex;-1!==[n.KEY_UP,n.KEY_DOWN,n.KEY_ENTER].indexOf(t.which)&&(t.which===n.KEY_UP&&(0===o?o=e.list.length-1:o-=1),t.which===n.KEY_DOWN&&(o===e.list.length-1?o=0:o+=1),t.which!==n.KEY_ENTER?(o!==e.currentIndex&&e.selectIndex(o),t.stopImmediatePropagation(),t.preventDefault()):e.paste());},e.selectIndex=function(t){e.listBox&&Array.from(e.listBox.childNodes).forEach((function(o,i){o.classList.remove("jodit_active"),t===i&&e.previewBox&&(o.classList.add("jodit_active"),e.previewBox.innerHTML=e.list[t],o.focus());})),e.currentIndex=t;},e.showDialog=function(){2>e.list.length||(e.dialog||e.createDialog(),e.listBox&&(e.listBox.innerHTML=""),e.previewBox&&(e.previewBox.innerHTML=""),e.list.forEach((function(t,o){var i=e.jodit.create.element("a");i.textContent=o+1+". "+t.replace(n.SPACE_REG_EXP,""),i.addEventListener("keydown",e.onKeyDown),i.setAttribute("href","javascript:void(0)"),i.setAttribute("data-index",o.toString()),i.setAttribute("tab-index","-1"),e.listBox&&e.listBox.appendChild(i);})),e.dialog&&e.dialog.open(),e.jodit.async.setTimeout((function(){e.selectIndex(0);}),100));},e}return i.__extends(e,t),e.prototype.createDialog=function(){var t=this;this.dialog=new r.Dialog(this.jodit);var e=this.jodit.create.fromHTML('<a href="javascript:void(0)" style="float:right;" class="jodit_button"><span>'+this.jodit.i18n("Paste")+"</span></a>");e.addEventListener("click",this.paste);var o=this.jodit.create.fromHTML('<a href="javascript:void(0)" style="float:right; margin-right: 10px;" class="jodit_button"><span>'+this.jodit.i18n("Cancel")+"</span></a>");o.addEventListener("click",this.dialog.close),this.container=this.jodit.create.div(),this.container.classList.add("jodit_paste_storage"),this.listBox=this.jodit.create.div(),this.previewBox=this.jodit.create.div(),this.container.appendChild(this.listBox),this.container.appendChild(this.previewBox),this.dialog.setTitle(this.jodit.i18n("Choose Content to Paste")),this.dialog.setContent(this.container),this.dialog.setFooter([e,o]),this.jodit.events.on(this.listBox,"click dblclick",(function(e){var o=e.target;return s.Dom.isTag(o,"a")&&o.hasAttribute("data-index")&&t.selectIndex(parseInt(o.getAttribute("data-index")||"0",10)),"dblclick"===e.type&&t.paste(),!1}),"a");},e.prototype.afterInit=function(){var t=this;this.jodit.events.off("afterCopy.paste-storage").on("afterCopy.paste-storage",(function(e){-1!==t.list.indexOf(e)&&t.list.splice(t.list.indexOf(e),1),t.list.unshift(e),t.list.length>5&&(t.list.length=5);})),this.jodit.registerCommand("showPasteStorage",{exec:this.showDialog,hotkeys:["ctrl+shift+v","cmd+shift+v"]});},e.prototype.beforeDestruct=function(){this.dialog&&this.dialog.destruct(),s.Dom.safeRemove(this.previewBox),s.Dom.safeRemove(this.listBox),s.Dom.safeRemove(this.container),this.container=null,this.listBox=null,this.previewBox=null,this.dialog=null,this.list=[];},e}(a.Plugin);e.pasteStorage=l;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(1),r=o(3),a=["fontWeight","fontStyle","fontSize","color","margin","padding","borderWidth","borderStyle","borderColor","borderRadius","backgroundColor","textDecorationLine","fontFamily"],s=function(t,e,o,i){var n=r.css(o,e);return n===i[e]&&(n=o.parentNode&&o!==t.editor&&o.parentNode!==t.editor?s(t,e,o.parentNode,i):void 0),n};i.Config.prototype.controls.copyformat={exec:function(t,e){if(e)if(t.buffer.exists("copyformat"))t.buffer.set("copyformat",!1),t.events.off(t.editor,"mouseup.copyformat");else {var o={},i=n.Dom.up(e,(function(t){return t&&!n.Dom.isText(t)}),t.editor)||t.editor,l=t.create.inside.span();t.editor.appendChild(l),a.forEach((function(t){o[t]=r.css(l,t);})),l!==t.editor&&n.Dom.safeRemove(l);var c=function(t,e,o){var i={};return e&&a.forEach((function(n){i[n]=s(t,n,e,o),n.match(/border(Style|Color)/)&&!i.borderWidth&&(i[n]=void 0);})),i}(t,i,o);t.events.on(t.editor,"mouseup.copyformat",(function(){t.buffer.set("copyformat",!1);var e=t.selection.current();e&&(n.Dom.isTag(e,"img")?r.css(e,c):t.selection.applyCSS(c)),t.events.off(t.editor,"mouseup.copyformat");})),t.buffer.set("copyformat",!0);}},isActive:function(t){return !!t.buffer.get("copyformat")},tooltip:"Paint format"};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(17),r=n.Widget.TabsWidget,a=n.Widget.ColorPickerWidget,s=o(1),l=o(3);i.Config.prototype.controls.brush={isActive:function(t,e,o){if(!o)return !0;var i=t.selection.current(),n=o.container.querySelector("svg");if(n&&n.style.fill&&n.style.removeProperty("fill"),i&&!o.isDisable()){var r=s.Dom.closest(i,(function(e){return s.Dom.isBlock(e,t.editorWindow)||e&&s.Dom.isElement(e)}),t.editor)||t.editor,a=l.css(r,"color").toString(),c=l.css(r,"background-color").toString();if(a!==l.css(t.editor,"color").toString())return n&&(n.style.fill=a),!0;if(c!==l.css(t.editor,"background-color").toString())return n&&(n.style.fill=c),!0}return !1},popup:function(t,e,o,i){var n="",c="",d=null;e&&e!==t.editor&&s.Dom.isNode(e,t.editorWindow)&&s.Dom.isElement(e)&&(n=l.css(e,"color").toString(),c=l.css(e,"background-color").toString(),d=e);var u=a(t,(function(e){d?d.style.backgroundColor=e:t.execCommand("background",!1,e),i();}),c),f=a(t,(function(e){d?d.style.color=e:t.execCommand("forecolor",!1,e),i();}),n);return r(t,"background"===t.options.colorPickerDefaultTab?{Background:u,Text:f}:{Text:f,Background:u},d)},tooltip:"Fill color or set the text color"},e.color=function(t){var e=function(e,o,i){var n=l.normalizeColor(i);switch(e){case"background":t.selection.applyCSS({backgroundColor:n||""});break;case"forecolor":t.selection.applyCSS({color:n||""});}return t.setEditorValue(),!1};t.registerCommand("forecolor",e).registerCommand("background",e);};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(2),r=o(1),a=o(3),s=o(5),l=o(68),c=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.isFragmentFromEditor=!1,e.isCopyMode=!1,e.startDragPoint={x:0,y:0},e.draggable=null,e.bufferRange=null,e.onDragEnd=function(){e.draggable&&(r.Dom.safeRemove(e.draggable),e.draggable=null),e.isCopyMode=!1;},e.onDrag=function(t){e.draggable&&(e.draggable.parentNode||e.jodit.ownerDocument.body.appendChild(e.draggable),e.jodit.events.fire("hidePopup"),a.css(e.draggable,{left:t.clientX+20,top:t.clientY+20}),e.jodit.selection.insertCursorAtPoint(t.clientX,t.clientY),t.preventDefault(),t.stopPropagation());},e.onDrop=function(t){if(!t.dataTransfer||!t.dataTransfer.files||!t.dataTransfer.files.length){if(!e.isFragmentFromEditor&&!e.draggable)return e.jodit.events.fire("paste",t),t.preventDefault(),t.stopPropagation(),!1;var o=e.jodit.selection.sel,i=e.bufferRange||(o&&o.rangeCount?o.getRangeAt(0):null),n=null;if(!e.draggable&&i)n=e.isCopyMode?i.cloneContents():i.extractContents();else if(e.draggable)if(e.isCopyMode){var s="1"===e.draggable.getAttribute("data-is-file")?["a","href"]:["img","src"],l=s[0],c=s[1];(n=e.jodit.create.inside.element(l)).setAttribute(c,e.draggable.getAttribute("data-src")||e.draggable.getAttribute("src")||""),"a"===l&&(n.textContent=n.getAttribute(c)||"");}else n=a.dataBind(e.draggable,"target");else e.getText(t)&&(n=e.jodit.create.inside.fromHTML(e.getText(t)));o&&o.removeAllRanges(),e.jodit.selection.insertCursorAtPoint(t.clientX,t.clientY),n&&(e.jodit.selection.insertNode(n,!1,!1),i&&n.firstChild&&n.lastChild&&(i.setStartBefore(n.firstChild),i.setEndAfter(n.lastChild),e.jodit.selection.selectRange(i),e.jodit.events.fire("synchro")),r.Dom.isTag(n,"img")&&e.jodit.events&&e.jodit.events.fire("afterInsertImage",n)),t.preventDefault(),t.stopPropagation();}e.isFragmentFromEditor=!1;},e.onDragStart=function(t){var o=t.target;if(e.onDragEnd(),e.isFragmentFromEditor=r.Dom.isOrContains(e.jodit.editor,o,!0),e.isCopyMode=!e.isFragmentFromEditor||a.ctrlKey(t),e.isFragmentFromEditor){var i=e.jodit.selection.sel,n=i&&i.rangeCount?i.getRangeAt(0):null;n&&(e.bufferRange=n.cloneRange());}else e.bufferRange=null;e.startDragPoint.x=t.clientX,e.startDragPoint.y=t.clientY,r.Dom.isElement(o)&&o.matches(".jodit_filebrowser_files_item")&&(o=o.querySelector("img")),r.Dom.isTag(o,"img")&&(e.draggable=o.cloneNode(!0),a.dataBind(e.draggable,"target",o),a.css(e.draggable,{"z-index":1e14,"pointer-events":"none",position:"fixed",display:"inlin-block",left:e.startDragPoint.x,top:e.startDragPoint.y,width:o.offsetWidth,height:o.offsetHeight}));},e.getText=function(t){var e=l.getDataTransfer(t);return e?e.getData(n.TEXT_HTML)||e.getData(n.TEXT_PLAIN):null},e}return i.__extends(e,t),e.prototype.afterInit=function(){this.jodit.events.off(window,".DragAndDrop").off(".DragAndDrop").off([window,this.jodit.editorDocument,this.jodit.editor],"dragstart.DragAndDrop",this.onDragStart).on(window,"dragover.DragAndDrop",this.onDrag).on([window,this.jodit.editorDocument,this.jodit.editor],"dragstart.DragAndDrop",this.onDragStart).on("drop.DragAndDrop",this.onDrop).on(window,"dragend.DragAndDrop drop.DragAndDrop mouseup.DragAndDrop",this.onDragEnd);},e.prototype.beforeDestruct=function(){this.onDragEnd(),this.jodit.events.off(window,".DragAndDrop").off(".DragAndDrop").off([window,this.jodit.editorDocument,this.jodit.editor],"dragstart.DragAndDrop",this.onDragStart);},e}(s.Plugin);e.DragAndDrop=c;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(3),a=o(5),s=o(1);n.Config.prototype.draggableTags=["img","a","jodit-media","jodit"];var l=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.dragList=[],e.isCopyMode=!1,e.draggable=null,e.wasMoved=!1,e.diffStep=10,e.startX=0,e.startY=0,e.onDragStart=function(t){var o=t.target,i=null;if(e.dragList.length){do{e.dragList.includes(o.nodeName.toLowerCase())&&(!i||o.firstChild===i&&o.lastChild===i)&&(i=o),o=o.parentNode;}while(o&&o!==e.jodit.editor);i&&(e.startX=t.clientX,e.startY=t.clientY,e.isCopyMode=r.ctrlKey(t),e.onDragEnd(),e.draggable=i.cloneNode(!0),r.dataBind(e.draggable,"target",i),e.jodit.events.on(e.jodit.editor,"mousemove touchmove",e.onDrag));}},e.onDrag=e.jodit.async.throttle((function(t){if(e.draggable){var o=t.clientY;Math.sqrt(Math.pow(t.clientX-e.startX,2)+Math.pow(o-e.startY,2))<e.diffStep||(e.wasMoved=!0,e.jodit.events.fire("hidePopup hideResizer"),e.draggable.parentNode||(r.css(e.draggable,{"z-index":1e14,"pointer-events":"none",position:"fixed",display:"inline-block",left:t.clientX,top:t.clientY,width:e.draggable.offsetWidth,height:e.draggable.offsetHeight}),e.jodit.ownerDocument.body.appendChild(e.draggable)),r.css(e.draggable,{left:t.clientX,top:t.clientY}),e.jodit.selection.insertCursorAtPoint(t.clientX,t.clientY));}}),e.jodit.defaultTimeout),e.onDragEnd=function(){e.isInDestruct||e.draggable&&(s.Dom.safeRemove(e.draggable),e.draggable=null,e.wasMoved=!1,e.jodit.events.off(e.jodit.editor,"mousemove touchmove",e.onDrag));},e.onDrop=function(){if(e.draggable&&e.wasMoved){var t=r.dataBind(e.draggable,"target");e.onDragEnd(),e.isCopyMode&&(t=t.cloneNode(!0)),e.jodit.selection.insertNode(t,!0,!1),s.Dom.isTag(t,"img")&&e.jodit.events&&e.jodit.events.fire("afterInsertImage",t),e.jodit.events.fire("synchro");}else e.onDragEnd();},e}return i.__extends(e,t),e.prototype.afterInit=function(){this.dragList=this.jodit.options.draggableTags?r.splitArray(this.jodit.options.draggableTags).filter((function(t){return t})).map((function(t){return t.toLowerCase()})):[],this.dragList.length&&this.jodit.events.on(this.jodit.editor,"mousedown touchstart dragstart",this.onDragStart).on("mouseup touchend",this.onDrop).on([this.jodit.editorWindow,this.jodit.ownerWindow],"mouseup touchend",this.onDragEnd);},e.prototype.beforeDestruct=function(){this.onDragEnd(),this.jodit.events.off(this.jodit.editor,"mousemove touchmove",this.onDrag).off(this.jodit.editor,"mousedown touchstart dragstart",this.onDragStart).off("mouseup touchend",this.onDrop).off(window,"mouseup touchend",this.onDragEnd);},e}(a.Plugin);e.DragAndDropElement=l;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(2),r=o(1),a=o(3),s=o(5),l=o(2);e.insertParagraph=function(t,e,o,i){var n,s=t.create.inside.element(o),l=t.create.inside.element("br");s.appendChild(l),i&&i.cssText&&s.setAttribute("style",i.cssText),t.selection.insertNode(s,!1,!1),t.selection.setCursorBefore(l);var c=t.selection.createRange();return c.setStartBefore("br"!==o.toLowerCase()?l:s),c.collapse(!0),t.selection.selectRange(c),r.Dom.safeRemove(e),a.scrollIntoView(s,t.editor,t.editorDocument),null===(n=t.events)||void 0===n||n.fire("synchro"),s};var c=function(t){function o(){var e=null!==t&&t.apply(this,arguments)||this;return e.brMode=!1,e.defaultTag=n.PARAGRAPH,e.checkWrapper=function(){e.jodit.isEditorMode();},e}return i.__extends(o,t),o.prototype.afterInit=function(t){var e=this;this.defaultTag=t.options.enter.toLowerCase(),this.brMode=this.defaultTag===n.BR.toLowerCase(),t.options.enterBlock||(t.options.enterBlock=this.brMode?n.PARAGRAPH:this.defaultTag),t.events.off(".enter").on("change.enter",this.checkWrapper).on("keydown.enter",(function(o){if(o.which===n.KEY_ENTER){var i=t.events.fire("beforeEnter",o);return void 0!==i?i:(t.selection.isCollapsed()||t.execCommand("Delete"),t.selection.focus(),e.onEnter(o),!1)}}));},o.prototype.onEnter=function(t){var o=this.jodit,i=o.selection,n=this.defaultTag,a=i.current(!1);a&&a!==o.editor||(a=o.create.inside.text(l.INVISIBLE_SPACE),i.insertNode(a),i.select(a));var s=this.getBlockWrapper(a),c=r.Dom.isTag(s,"li");if(!c&&!1===this.checkBR(a,t.shiftKey))return !1;if(s||this.hasPreviousBlock(a)||(s=this.wrapText(a)),!s||s===a)return e.insertParagraph(o,!1,c?"li":n),!1;if(!1===this.checkUnsplittableBox(s))return !1;if(c&&r.Dom.isEmpty(s))return this.enterInsideEmptyLIelement(s),!1;var d,u=s.tagName.toLowerCase()===this.defaultTag||c,f=i.cursorOnTheRight(s),p=i.cursorOnTheLeft(s);if((!u||r.Dom.isEmpty(s))&&(f||p))return d=f?i.setCursorAfter(s):i.setCursorBefore(s),e.insertParagraph(o,d,this.defaultTag),void(p&&!f&&i.setCursorIn(s,!0));i.splitSelection(s);},o.prototype.getBlockWrapper=function(t,e){void 0===e&&(e=n.IS_BLOCK);var o=t,i=this.jodit.editor;do{if(!o||o===i)break;if(e.test(o.nodeName))return r.Dom.isTag(o,"li")?o:this.getBlockWrapper(o.parentNode,/^li$/i)||o;o=o.parentNode;}while(o&&o!==i);return !1},o.prototype.checkBR=function(t,e){if(this.brMode||e||r.Dom.closest(t,"PRE|BLOCKQUOTE",this.jodit.editor)){var o=this.jodit.create.inside.element("br");return this.jodit.selection.insertNode(o,!0),a.scrollIntoView(o,this.jodit.editor,this.jodit.editorDocument),!1}},o.prototype.wrapText=function(t){var e=this,o=t;r.Dom.up(o,(function(t){t&&t.hasChildNodes()&&t!==e.jodit.editor&&(o=t);}),this.jodit.editor);var i=r.Dom.wrapInline(o,this.jodit.options.enter,this.jodit);if(r.Dom.isEmpty(i)){var n=this.jodit.create.inside.element("br");i.appendChild(n),this.jodit.selection.setCursorBefore(n);}return i},o.prototype.hasPreviousBlock=function(t){var e=this.jodit;return Boolean(r.Dom.prev(t,(function(t){return r.Dom.isBlock(t,e.editorWindow)||r.Dom.isImage(t,e.editorWindow)}),e.editor))},o.prototype.checkUnsplittableBox=function(t){var e=this.jodit,o=e.selection;if(!r.Dom.canSplitBlock(t,e.editorWindow)){var i=e.create.inside.element("br");return o.insertNode(i,!1),o.setCursorAfter(i),!1}},o.prototype.enterInsideEmptyLIelement=function(t){var o=!1,i=r.Dom.closest(t,"ol|ul",this.jodit.editor);if(r.Dom.prev(t,(function(t){return r.Dom.isTag(t,"li")}),i))if(r.Dom.next(t,(function(t){return r.Dom.isTag(t,"li")}),i)){var n=this.jodit.selection.createRange();n.setStartBefore(i),n.setEndAfter(t);var s=n.extractContents();i.parentNode&&i.parentNode.insertBefore(s,i),o=this.jodit.selection.setCursorBefore(i);}else o=this.jodit.selection.setCursorAfter(i);else o=this.jodit.selection.setCursorBefore(i);r.Dom.safeRemove(t),e.insertParagraph(this.jodit,o,this.defaultTag),a.$$("li",i).length||r.Dom.safeRemove(i);},o.prototype.beforeDestruct=function(t){t.events.off("keydown.enter");},o}(s.Plugin);e.enter=c;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(1),r=o(3);i.Config.prototype.showMessageErrors=!0,i.Config.prototype.showMessageErrorTime=3e3,i.Config.prototype.showMessageErrorOffsetPx=3,e.errorMessages=function(t){if(t.options.showMessageErrors){var e,o=t.create.div("jodit_error_box_for_messages"),i=function(){e=5,Array.from(o.childNodes).forEach((function(i){r.css(o,"bottom",e+"px"),e+=i.offsetWidth+t.options.showMessageErrorOffsetPx;}));};t.events.on("beforeDestruct",(function(){n.Dom.safeRemove(o);})).on("errorMessage",(function(e,r,a){t.workplace.appendChild(o);var s=t.create.div("active "+(r||""),e);o.appendChild(s),i(),t.async.setTimeout((function(){s.classList.remove("active"),t.async.setTimeout((function(){n.Dom.safeRemove(s),i();}),300);}),a||t.options.showMessageErrorTime);}));}};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(1),r=o(3);i.Config.prototype.controls.fontsize={command:"fontSize",list:["8","9","10","11","12","14","16","18","24","30","36","48","60","72","96"],template:function(t,e,o){return o},tooltip:"Font size",isActiveChild:function(t,e){var o=t.selection.current();if(o){var i=n.Dom.closest(o,(function(e){return n.Dom.isBlock(e,t.editorWindow)||e&&n.Dom.isElement(e)}),t.editor)||t.editor,a=r.css(i,"font-size");return Boolean(a&&e.args&&e.args[1].toString()===a.toString())}return !1},isActive:function(t){var e=t.selection.current();if(e){var o=n.Dom.closest(e,(function(e){return n.Dom.isBlock(e,t.editorWindow)||e&&n.Dom.isElement(e)}),t.editor)||t.editor;return r.css(o,"font-size").toString()!==r.css(t.editor,"font-size").toString()}return !1}},i.Config.prototype.controls.font={command:"fontname",exec:function(t,e,o){t.execCommand(o.command,!1,o.args?o.args[0]:void 0);},list:{"Helvetica,sans-serif":"Helvetica","Arial,Helvetica,sans-serif":"Arial","Georgia,serif":"Georgia","Impact,Charcoal,sans-serif":"Impact","Tahoma,Geneva,sans-serif":"Tahoma","'Times New Roman',Times,serif":"Times New Roman","Verdana,Geneva,sans-serif":"Verdana"},template:function(t,e,o){return '<span style="font-family: '+e+'">'+o+"</span>"},isActiveChild:function(t,e){var o=t.selection.current(),i=function(t){return t.toLowerCase().replace(/['"]+/g,"").replace(/[^a-z0-9]+/g,",")};if(o){var a=n.Dom.closest(o,(function(e){return n.Dom.isBlock(e,t.editorWindow)||e&&n.Dom.isElement(e)}),t.editor)||t.editor,s=r.css(a,"font-family").toString();return Boolean(s&&e.args&&i(e.args[0].toString())===i(s))}return !1},isActive:function(t){var e=t.selection.current();if(e){var o=n.Dom.closest(e,(function(e){return n.Dom.isBlock(e,t.editorWindow)||n.Dom.isElement(e)}),t.editor)||t.editor;return r.css(o,"font-family").toString()!==r.css(t.editor,"font-family").toString()}return !1},tooltip:"Font family"},e.font=function(t){var e=function(e,o,i){switch(e){case"fontsize":t.selection.applyCSS({fontSize:r.normalizeSize(i)});break;case"fontname":t.selection.applyCSS({fontFamily:i});}return t.events.fire("synchro"),!1};t.registerCommand("fontsize",e).registerCommand("fontname",e);};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(1);i.Config.prototype.controls.paragraph={command:"formatBlock",getLabel:function(t,e,o){var i=t.selection.current();if(i&&t.options.textIcons){var r=(n.Dom.closest(i,(function(e){return n.Dom.isBlock(e,t.editorWindow)}),t.editor)||t.editor).nodeName.toLowerCase(),a=e.list;o&&e.data&&e.data.currentValue!==r&&e.list&&a[r]&&(o.textBox.innerHTML="<span>"+t.i18n(a[r])+"</span>",o.textBox.firstChild.classList.add("jodit_icon"),e.data.currentValue=r);}return !1},exec:function(t,e,o){t.execCommand(o.command,!1,o.args?o.args[0]:void 0);},data:{currentValue:"left"},list:{p:"Normal",h1:"Heading 1",h2:"Heading 2",h3:"Heading 3",h4:"Heading 4",blockquote:"Quote"},isActiveChild:function(t,e){var o=t.selection.current();if(o){var i=n.Dom.closest(o,(function(e){return n.Dom.isBlock(e,t.editorWindow)}),t.editor);return i&&i!==t.editor&&void 0!==e.args&&i.nodeName.toLowerCase()===e.args[0]}return !1},isActive:function(t,e){var o=t.selection.current();if(o){var i=n.Dom.closest(o,(function(e){return n.Dom.isBlock(e,t.editorWindow)}),t.editor);return i&&i!==t.editor&&void 0!==e.list&&!n.Dom.isTag(i,"p")&&void 0!==e.list[i.nodeName.toLowerCase()]}return !1},template:function(t,e,o){return "<"+e+' class="jodit_list_element"><span>'+t.i18n(o)+"</span></"+e+"></li>"},tooltip:"Insert format block"},e.formatBlock=function(t){t.registerCommand("formatblock",(function(e,o,i){t.selection.focus();var r=!1;if(t.selection.eachSelection((function(e){var o=t.selection.save(),a=!!e&&n.Dom.up(e,(function(e){return n.Dom.isBlock(e,t.editorWindow)}),t.editor);a&&!n.Dom.isTag(a,"li")||!e||(a=n.Dom.wrapInline(e,t.options.enter,t)),a?(a.tagName.match(/TD|TH|TBODY|TABLE|THEAD/i)?t.selection.isCollapsed()?n.Dom.wrapInline(e,i,t):t.selection.applyCSS({},i):i===t.options.enterBlock.toLowerCase()&&n.Dom.isTag(a.parentNode,"li")?n.Dom.unwrap(a):n.Dom.replace(a,i,t.create.inside,!0,!1),r=!0,t.selection.restore(o)):t.selection.restore(o);})),!r){var a=t.create.inside.element("br"),s=t.create.inside.element(i,a);t.selection.insertNode(s,!1),t.selection.setCursorIn(s);}return t.setEditorValue(),!1}));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(2),r=o(3),a=o(6);i.Config.prototype.fullsize=!1,i.Config.prototype.globalFullsize=!0,i.Config.prototype.controls.fullsize={exec:function(t){t.toggleFullSize();},isActive:function(t){return t.isFullSize()},getLabel:function(t,e,o){var i=t.isFullSize()?"shrink":"fullsize";o&&(o.textBox.innerHTML=t.options.textIcons?"<span>"+t.i18n(i)+"</span>":a.ToolbarIcon.getIcon(i),o.textBox.firstChild.classList.add("jodit_icon"));},tooltip:"Open editor in fullsize",mode:n.MODE_SOURCE+n.MODE_WYSIWYG},e.fullsize=function(t){var e=!1,o=0,i=0,n=!1,a=function(){t.events&&(e?(o=r.css(t.container,"height"),i=r.css(t.container,"width"),r.css(t.container,{height:t.ownerWindow.innerHeight,width:t.ownerWindow.innerWidth}),n=!0):n&&r.css(t.container,{height:o||"auto",width:i||"auto"}));},s=function(o){var i,n,s;if(t.container){if(void 0===o&&(o=!t.container.classList.contains("jodit_fullsize")),t.options.fullsize=o,e=o,t.container.classList.toggle("jodit_fullsize",o),t.toolbar&&(o?null===(n=t.container.querySelector(".jodit_toolbar_container"))||void 0===n||n.appendChild(t.toolbar.container):null===(i=t.toolbar.getParentContainer())||void 0===i||i.appendChild(t.toolbar.container),r.css(t.toolbar.container,"width","auto")),t.options.globalFullsize){for(var l=t.container.parentNode;l&&l.nodeType!==Node.DOCUMENT_NODE;)l.classList.toggle("jodit_fullsize_box",o),l=l.parentNode;a();}null===(s=t.events)||void 0===s||s.fire("afterResize");}};t.options.globalFullsize&&t.events.on(t.ownerWindow,"resize",a),t.events.on("afterInit afterOpen",(function(){var e,o;t.toggleFullSize(null===(o=null===(e=t)||void 0===e?void 0:e.options)||void 0===o?void 0:o.fullsize);})).on("toggleFullSize",s).on("beforeDestruct beforeClose",(function(){s(!1);})).on("beforeDestruct",(function(){t.events&&t.events.off(t.ownerWindow,"resize",a);}));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(5),a=o(18);n.Config.prototype.commandToHotkeys={removeFormat:["ctrl+shift+m","cmd+shift+m"],insertOrderedList:["ctrl+shift+7","cmd+shift+7"],insertUnorderedList:["ctrl+shift+8, cmd+shift+8"],selectall:["ctrl+a","cmd+a"]};var s=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.onKeyPress=function(t){var o=e.specialKeys[t.which],i=(t.key||String.fromCharCode(t.which)).toLowerCase(),n=[o||i];return ["alt","ctrl","shift","meta"].forEach((function(e){t[e+"Key"]&&o!==e&&n.push(e);})),a.normalizeKeyAliases(n.join("+"))},e.specialKeys={8:"backspace",9:"tab",10:"return",13:"return",16:"shift",17:"ctrl",18:"alt",19:"pause",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"insert",46:"del",59:";",61:"=",91:"meta",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",106:"*",107:"+",109:"-",110:".",111:"/",112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",144:"numlock",145:"scroll",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},e}return i.__extends(e,t),e.prototype.afterInit=function(t){var e=this;Object.keys(t.options.commandToHotkeys).forEach((function(e){var o=t.options.commandToHotkeys[e];o&&t.registerHotkeyToCommand(o,e);}));var o=!1;t.events.off(".hotkeys").on("keydown.hotkeys",(function(i){var n=e.onKeyPress(i);if(!1===e.jodit.events.fire(n+".hotkey",i.type))return o=!0,t.events.stopPropagation("keydown"),!1}),void 0,void 0,!0).on("keyup.hotkeys",(function(){if(o)return o=!1,t.events.stopPropagation("keyup"),!1}),void 0,void 0,!0);},e.prototype.beforeDestruct=function(t){t.events&&t.events.off(".hotkeys");},e}(r.Plugin);e.hotkeys=s;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(34),r=o(10),a=o(11),s=o(21),l=o(3),c=o(2);i.Config.prototype.iframeBaseUrl="",i.Config.prototype.iframeTitle="Jodit Editor",i.Config.prototype.iframeDoctype="<!DOCTYPE html>",i.Config.prototype.iframeDefaultSrc="about:blank",i.Config.prototype.iframeStyle='html{margin:0;padding:0;min-height: 100%;}body{box-sizing:border-box;font-size:13px;line-height:1.6;padding:10px;margin:0;background:transparent;color:#000;position:relative;z-index:2;user-select:auto;margin:0px;overflow:auto;}table{width:100%;border:none;border-collapse:collapse;empty-cells: show;max-width: 100%;}th,td{padding: 2px 5px;border:1px solid #ccc;-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text}td[data-jodit-selected-cell],th[data-jodit-selected-cell]{border: 1px double #1e88e5}p{margin-top:0;}.jodit_editor .jodit_iframe_wrapper{display: block;clear: both;user-select: none;position: relative;}.jodit_editor .jodit_iframe_wrapper:after {position:absolute;content:"";z-index:1;top:0;left:0;right: 0;bottom: 0;cursor: pointer;display: block;background: rgba(0, 0, 0, 0);} .jodit_disabled{user-select: none;-o-user-select: none;-moz-user-select: none;-khtml-user-select: none;-webkit-user-select: none;-ms-user-select: none}',i.Config.prototype.iframeCSSLinks=[],i.Config.prototype.editHTMLDocumentMode=!1,e.iframe=function(t){var e=t.options;t.events.on("afterSetMode",(function(){t.isEditorMode()&&t.selection.focus();})).on("generateDocumentStructure.iframe",(function(t,o){var i=t||o.iframe.contentWindow.document;if(i.open(),i.write(e.iframeDoctype+'<html dir="'+e.direction+'" class="jodit" lang="'+n.defaultLanguage(e.language)+'">\n\t\t\t\t\t\t<head>\n\t\t\t\t\t\t\t<title>'+e.iframeTitle+"</title>\n\t\t\t\t\t\t\t"+(e.iframeBaseUrl?'<base href="'+e.iframeBaseUrl+'"/>':"")+'\n\t\t\t\t\t\t</head>\n\t\t\t\t\t\t<body class="jodit_wysiwyg" style="outline:none"></body>\n\t\t\t\t\t</html>'),i.close(),e.iframeCSSLinks&&e.iframeCSSLinks.forEach((function(t){var e=i.createElement("link");e.setAttribute("rel","stylesheet"),e.setAttribute("href",t),i.head&&i.head.appendChild(e);})),e.iframeStyle){var r=i.createElement("style");r.innerHTML=e.iframeStyle,i.head&&i.head.appendChild(r);}})).on("createEditor",(function(){if(e.iframe){var o=t.create.element("iframe");o.style.display="block",o.src="about:blank",o.className="jodit_wysiwyg_iframe",o.setAttribute("allowtransparency","true"),o.setAttribute("tabindex",e.tabIndex.toString()),o.setAttribute("frameborder","0"),t.workplace.appendChild(o),t.iframe=o;var i=t.events.fire("generateDocumentStructure.iframe",null,t),n=function(){if(t.iframe){var o=t.iframe.contentWindow.document;t.editorWindow=t.iframe.contentWindow;var i,n=function(){s.Dom.toggleAttribute(o.body,"contenteditable",t.getMode()!==c.MODE_SOURCE&&!t.getReadOnly());},a=function(t){var e=/<body.*<\/body>/im,o=e.exec(t);return o&&(t=t.replace(e,"{%%BODY%%}").replace(/<span([^>]*?)>(.*?)<\/span>/gim,"").replace(/&lt;span([^&]*?)&gt;(.*?)&lt;\/span&gt;/gim,"").replace("{%%BODY%%}",o[0].replace(/(<body[^>]+?)([\s]*["'])?contenteditable["'\s]*=[\s"']*true["']?/im,"$1"))),t};if(e.editHTMLDocumentMode){var d=t.element.tagName;if("TEXTAREA"!==d&&"INPUT"!==d)throw l.error("If enable `editHTMLDocumentMode` - source element should be INPUT or TEXTAREA");t.editor=o.documentElement,t.events.on("beforeGetNativeEditorValue",(function(){return a(o.documentElement.outerHTML)})).on("beforeSetNativeEditorValue",(function(e){return /<(html|body)/i.test(e)?o.documentElement.outerHTML!==e&&(o.open("text/html","replace"),o.write(a(e)),o.close(),t.editor=o.documentElement,n()):o.body.innerHTML=e,!0}));}else t.editor=o.body;if(t.events.on("afterSetMode afterInit afterAddPlace",n),"auto"===e.height){o.documentElement&&(o.documentElement.style.overflowY="hidden");var u=t.async.throttle((function(){t.editor&&t.iframe&&"auto"===e.height&&r.css(t.iframe,"height",t.editor.offsetHeight);}),t.defaultTimeout/2);t.events.on("change afterInit afterSetMode resize",u).on([t.iframe,t.editorWindow,o.documentElement],"load",u).on(o,"readystatechange DOMContentLoaded",u);}(i=t.editorWindow.Element.prototype).matches||(i.matches=Element.prototype.matches),o.documentElement&&t.events.on(o.documentElement,"mousedown touchend",(function(){t.selection.isFocused()||(t.selection.focus(),t.editor===o.body&&t.selection.setCursorIn(o.body));})).on(t.editorWindow,"mousedown touchstart keydown keyup touchend click mouseup mousemove scroll",(function(e){var o;null===(o=t.events)||void 0===o||o.fire(t.ownerWindow,e);}));}};return a.isPromise(i)?i.then(n):(n(),!1)}}));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(3);e.imageProcessor=function(t){t.events.on("change afterInit changePlace",t.async.debounce((function(){t.editor&&i.$$("img",t.editor).forEach((function(e){e.__jodit_imageprocessor_binded||(e.__jodit_imageprocessor_binded=!0,e.complete||e.addEventListener("load",(function o(){t.events&&t.events.fire&&t.events.fire("resize"),e.removeEventListener("load",o);})),t.events.on(e,"mousedown touchstart",(function(){t.selection.select(e);})));}));}),t.defaultTimeout));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(12),r=o(1),a=o(3),s=o(6),l=o(17),c=l.Widget.TabsWidget,d=l.Widget.FileSelectorWidget,u=o(28);i.Config.prototype.image={openOnDblClick:!0,editSrc:!0,useImageEditor:!0,editTitle:!0,editAlt:!0,editLink:!0,editSize:!0,editBorderRadius:!0,editMargins:!0,editClass:!0,editStyle:!0,editId:!0,editAlign:!0,showPreview:!0,selectImageAfterClose:!0},e.imageProperties=function(t){var e=t.i18n,o=s.ToolbarIcon.getIcon.bind(s.ToolbarIcon),i=t.options,l=t.create.fromHTML.bind(t.create),f=function(s){var f=this;if(!i.readonly){s&&s.stopImmediatePropagation();var p=this,h=new n.Dialog(t),v={check:l('<a href="javascript:void(0)" class="jodit_button  jodit_status_success">'+o("check")+"<span>"+e("Ok")+"</span></a>"),cancel:l('<a href="javascript:void(0)" class="jodit_button  jodit_status_primary">'+o("cancel")+"<span>"+e("Cancel")+"</span></a>"),remove:l('<a href="javascript:void(0)" class="jodit_button">'+o("bin")+"<span>"+e("Delete")+"</span></a>")},m=l('<form class="jodit_properties">\n\t\t\t\t\t\t\t\t<div class="jodit_grid">\n\t\t\t\t\t\t\t\t\t<div class="jodit_col-lg-2-5">\n\t\t\t\t\t\t\t\t\t\t<div class="jodit_properties_view_box">\n\t\t\t\t\t\t\t\t\t\t\t<div style="'+(i.image.showPreview?"":"display:none")+'" class="jodit_properties_image_view">\n\t\t\t\t\t\t\t\t\t\t\t\t<img class="imageViewSrc" src="" alt=""/>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t<div style="'+(i.image.editSize?"":"display:none")+'" class="jodit_form_group jodit_properties_image_sizes">\n\t\t\t\t\t\t\t\t\t\t\t\t<input type="number" class="imageWidth jodit_input"/>\n\t\t\t\t\t\t\t\t\t\t\t\t<a class="jodit_lock_helper jodit_lock_size" href="javascript:void(0)">'+o("lock")+'</a>\n\t\t\t\t\t\t\t\t\t\t\t\t<input type="number" class="imageHeight jodit_input"/>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class="jodit_col-lg-3-5 tabsbox"></div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</form>'),g=l('<div style="'+(i.image.editMargins?"":"display:none")+'" class="jodit_form_group">\n\t\t\t\t\t\t\t\t<label>'+e("Margins")+'</label>\n\t\t\t\t\t\t\t\t<div class="jodit_grid jodit_vertical_middle">\n\t\t\t\t\t\t\t\t\t<input class="jodit_col-lg-1-5 margins marginTop jodit_input" data-id="marginTop" type="text" placeholder="'+e("top")+'"/>\n\t\t\t\t\t\t\t\t\t<a style="text-align: center;" class="jodit_lock_helper jodit_lock_margin jodit_col-lg-1-5" href="javascript:void(0)">'+o("lock")+'</a>\n\t\t\t\t\t\t\t\t\t<input disabled="true" class="jodit_col-lg-1-5 margins marginRight jodit_input" data-id="marginRight" type="text" placeholder="'+e("right")+'"/>\n\t\t\t\t\t\t\t\t\t<input disabled="true" class="jodit_col-lg-1-5 margins marginBottom jodit_input" data-id="marginBottom" type="text" placeholder="'+e("bottom")+'"/>\n\t\t\t\t\t\t\t\t\t<input disabled="true" class="jodit_col-lg-1-5 margins marginLeft jodit_input" data-id="marginLeft" type="text" placeholder="'+e("left")+'"/>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div style="'+(i.image.editStyle?"":"display:none")+'" class="jodit_form_group">\n\t\t\t\t\t\t\t\t<label>'+e("Styles")+'</label>\n\t\t\t\t\t\t\t\t<input type="text" class="style jodit_input"/>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div style="'+(i.image.editClass?"":"display:none")+'" class="jodit_form_group">\n\t\t\t\t\t\t\t\t<label for="classes">'+e("Classes")+'</label>\n\t\t\t\t\t\t\t\t<input type="text" class="classes jodit_input"/>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div style="'+(i.image.editId?"":"display:none")+'" class="jodit_form_group">\n\t\t\t\t\t\t\t\t<label for="id">Id</label>\n\t\t\t\t\t\t\t\t<input type="text" class="id jodit_input"/>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div\n\t\t\t\t\t\t\t\tstyle="'+(i.image.editBorderRadius?"":"display:none")+'"\n\t\t\t\t\t\t\t\tclass="jodit_form_group"\n\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t<label for="border_radius">'+e("Border radius")+'</label>\n\t\t\t\t\t\t\t\t<input type="number" class="border_radius jodit_input"/>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div\n\t\t\t\t\t\t\t\tstyle="'+(i.image.editAlign?"":"display:none")+'"\n\t\t\t\t\t\t\t\tclass="jodit_form_group"\n\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t<label for="align">'+e("Align")+'</label>\n\t\t\t\t\t\t\t\t<select class="select align jodit_select">\n\t\t\t\t\t\t\t\t\t<option value="">'+e("--Not Set--")+'</option>\n\t\t\t\t\t\t\t\t\t<option value="left">'+e("Left")+'</option>\n\t\t\t\t\t\t\t\t\t<option value="center">'+e("Center")+'</option>\n\t\t\t\t\t\t\t\t\t<option value="right">'+e("Right")+"</option>\n\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t</div>"),b=i.filebrowser.ajax.url||i.uploader.url,y=i.image.useImageEditor,_=l('<div style="'+(i.image.editSrc?"":"display:none")+'" class="jodit_form_group">\n\t\t\t\t\t\t\t\t<label>'+e("Src")+'</label>\n\t\t\t\t\t\t\t\t<div class="jodit_input_group">\n\t\t\t\t\t\t\t\t\t<input class="jodit_input imageSrc" type="text"/>\n\t\t\t\t\t\t\t\t\t<div\n\t\t\t\t\t\t\t\t\t\tclass="jodit_input_group-buttons"\n\t\t\t\t\t\t\t\t\t\tstyle="'+(b?"":"display: none")+'"\n\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\t<a class="jodit_button jodit_rechange" href="javascript:void(0)">'+o("image")+'</a>\n\t\t\t\t\t\t\t\t\t\t\t<a\n\t\t\t\t\t\t\t\t\t\t\t\tclass="jodit_button jodit_use_image_editor" href="javascript:void(0)"\n\t\t\t\t\t\t\t\t\t\t\t\tstyle="'+(y?"":"display: none")+'"\n\t\t\t\t\t\t\t\t\t\t\t>'+o("crop")+'</a>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div style="'+(i.image.editTitle?"":"display:none")+'" class="jodit_form_group">\n\t\t\t\t\t\t\t\t<label for="imageTitle">'+e("Title")+'</label>\n\t\t\t\t\t\t\t\t<input type="text" class="imageTitle jodit_input"/>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div style="'+(i.image.editAlt?"":"display:none")+'" class="jodit_form_group">\n\t\t\t\t\t\t\t\t<label for="imageAlt">'+e("Alternative")+'</label>\n\t\t\t\t\t\t\t\t<input type="text" class="imageAlt jodit_input"/>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div style="'+(i.image.editLink?"":"display:none")+'" class="jodit_form_group">\n\t\t\t\t\t\t\t\t<label for="imageLink">'+e("Link")+'</label>\n\t\t\t\t\t\t\t\t<input type="text" class="imageLink jodit_input"/>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div style="'+(i.image.editLink?"":"display:none")+'" class="jodit_form_group">\n\t\t\t\t\t\t\t\t<label class="jodit_vertical_middle">\n\t\t\t\t\t\t\t\t\t<input type="checkbox" class="imageLinkOpenInNewTab jodit_checkbox"/>\n\t\t\t\t\t\t\t\t\t<span>'+e("Open link in new tab")+"</span>\n\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t</div>"),w=p.naturalWidth/p.naturalHeight||1,j=m.querySelector(".imageWidth"),S=m.querySelector(".imageHeight"),C=function(){a.val(m,".imageSrc",p.getAttribute("src")||"");var t=m.querySelector(".imageViewSrc");t&&t.setAttribute("src",p.getAttribute("src")||"");},x=function(){C(),function(){p.hasAttribute("title")&&a.val(m,".imageTitle",p.getAttribute("title")||""),p.hasAttribute("alt")&&a.val(m,".imageAlt",p.getAttribute("alt")||"");var e=r.Dom.closest(p,"a",t.editor);e&&(a.val(m,".imageLink",e.getAttribute("href")||""),m.querySelector(".imageLinkOpenInNewTab").checked="_blank"===e.getAttribute("target"));}(),j.value=p.offsetWidth.toString(),S.value=p.offsetHeight.toString(),function(){if(i.image.editMargins){var t=!1;a.$$(".margins",m).forEach((function(e){var o=e.getAttribute("data-id")||"",i=p.style[o];i&&(/^[0-9]+(px)?$/.test(i)&&(i=parseInt(i,10)),e.value=i.toString()||"",t||"marginTop"===o||e.value===a.val(m,".marginTop")||(t=!0));})),E=!t;var e=m.querySelector(".jodit_lock_margin");e&&(e.innerHTML=o(E?"lock":"unlock")),a.$$(".margins:not(.marginTop)",m).forEach((function(t){return E?t.setAttribute("disabled","true"):t.removeAttribute("disabled")}));}}(),a.val(m,".classes",(p.getAttribute("class")||"").replace(/jodit_focused_image[\s]*/,"")),a.val(m,".id",p.getAttribute("id")||""),a.val(m,".border_radius",(parseInt(p.style.borderRadius||"0",10)||"0").toString()),p.style.cssFloat&&-1!==["left","right"].indexOf(p.style.cssFloat.toLowerCase())?a.val(m,".align",a.css(p,"float")):"block"===a.css(p,"display")&&"auto"===p.style.marginLeft&&"auto"===p.style.marginRight&&a.val(m,".align","center"),a.val(m,".style",p.getAttribute("style")||"");},k=!0,E=!0,T={},D=m.querySelector(".tabsbox");T.Image=_,T.Advanced=g,D&&D.appendChild(c(t,T)),x(),t.events.on(h,"afterClose",(function(){h.destruct(),p.parentNode&&i.image.selectImageAfterClose&&t.selection.select(p);})),v.remove.addEventListener("click",(function(){t.selection.removeNode(p),h.close();})),i.image.useImageEditor&&a.$$(".jodit_use_image_editor",_).forEach((function(o){t.events.on(o,"mousedown touchstart",(function(){var o=p.getAttribute("src")||"",i=t.create.element("a"),r=function(){i.host===location.host||n.Confirm(e("You can only edit your own images. Download this image on the host?"),(function(o){o&&t.uploader&&t.uploader.uploadRemoteImage(i.href.toString(),(function(t){n.Alert(e("The image has been successfully uploaded to the host!"),(function(){"string"==typeof t.newfilename&&(p.setAttribute("src",t.baseurl+t.newfilename),C());}));}),(function(t){n.Alert(e("There was an error loading %s",t.message));}));}));};i.href=o,t.getInstance("FileBrowser").dataProvider.getPathByUrl(i.href.toString(),(function(e,r,a){t.getInstance("FileBrowser").openImageEditor(i.href,r,e,a,(function(){var t=(new Date).getTime();p.setAttribute("src",o+(-1!==o.indexOf("?")?"":"?")+"&_tmp="+t.toString()),C();}),(function(t){n.Alert(t.message);}));}),(function(t){n.Alert(t.message,r);}));}));})),a.$$(".jodit_rechange",_).forEach((function(e){e.addEventListener("mousedown",(function(o){e.classList.toggle("active");var i=new u.Popup(t,e);i.open(d(t,{upload:function(t){t.files&&t.files.length&&p.setAttribute("src",t.baseurl+t.files[0]),x(),i.close();},filebrowser:function(t){t&&Array.isArray(t.files)&&t.files.length&&(p.setAttribute("src",t.files[0]),i.close(),x());}},p,i.close),!0),o.stopPropagation();}));}));var z=m.querySelector(".jodit_lock_helper.jodit_lock_size"),L=m.querySelector(".jodit_lock_helper.jodit_lock_margin");z&&z.addEventListener("click",(function(){this.innerHTML=o((k=!k)?"lock":"unlock"),t.events.fire(j,"change");})),L&&L.addEventListener("click",(function(){this.innerHTML=o((E=!E)?"lock":"unlock"),E?a.$$(".margins",m).forEach((function(t){t.matches(".marginTop")||t.setAttribute("disabled","true");})):a.$$(".margins",m).forEach((function(t){t.matches(".marginTop")||t.removeAttribute("disabled");}));}));var M=function(t){var e=parseInt(j.value,10),o=parseInt(S.value,10);t.target===j?S.value=Math.round(e/w).toString():j.value=Math.round(o*w).toString();};return t.events.on([j,S],"change keydown mousedown paste",(function(e){k&&t.async.setTimeout(M.bind(f,e),{timeout:t.defaultTimeout,label:"image-properties-changeSize"});})),h.setTitle(e("Image properties")),h.setContent(m),v.check.addEventListener("click",(function(){if(i.image.editStyle&&(a.val(m,".style")?p.setAttribute("style",a.val(m,".style")):p.removeAttribute("style")),!a.val(m,".imageSrc"))return r.Dom.safeRemove(p),void h.close();p.setAttribute("src",a.val(m,".imageSrc")),p.style.borderRadius="0"!==a.val(m,".border_radius")&&/^[0-9]+$/.test(a.val(m,".border_radius"))?a.val(m,".border_radius")+"px":"",a.val(m,".imageTitle")?p.setAttribute("title",a.val(m,".imageTitle")):p.removeAttribute("title"),a.val(m,".imageAlt")?p.setAttribute("alt",a.val(m,".imageAlt")):p.removeAttribute("alt");var e=r.Dom.closest(p,"a",t.editor);a.val(m,".imageLink")?(e||(e=r.Dom.wrap(p,"a",t)),e.setAttribute("href",a.val(m,".imageLink")),m.querySelector(".imageLinkOpenInNewTab").checked?e.setAttribute("target","_blank"):e.removeAttribute("target")):e&&e.parentNode&&e.parentNode.replaceChild(p,e);var o=function(t){return t=a.trim(t),/^[0-9]+$/.test(t)?t+"px":t};j.value===p.offsetWidth.toString()&&S.value===p.offsetHeight.toString()||a.css(p,{width:a.trim(j.value)?o(j.value):null,height:a.trim(S.value)?o(S.value):null}),i.image.editMargins&&(E?a.css(p,"margin",o(a.val(m,".marginTop"))):a.$$(".margins",m).forEach((function(t){var e=t.getAttribute("data-id")||"";a.css(p,e,o(t.value));}))),i.image.editClass&&(a.val(m,".classes")?p.setAttribute("class",a.val(m,".classes")):p.removeAttribute("class")),i.image.editId&&(a.val(m,".id")?p.setAttribute("id",a.val(m,".id")):p.removeAttribute("id")),i.image.editAlign&&(a.val(m,".align")?-1!==["right","left"].indexOf(a.val(m,".align").toLowerCase())?(a.css(p,"float",a.val(m,".align")),a.clearCenterAlign(p)):(a.css(p,"float",""),a.css(p,{display:"block","margin-left":"auto","margin-right":"auto"})):(a.css(p,"float")&&-1!==["right","left"].indexOf(a.css(p,"float").toString().toLowerCase())&&a.css(p,"float",""),a.clearCenterAlign(p))),p.getAttribute("style")||p.removeAttribute("style"),t.setEditorValue(),h.close();})),v.cancel.addEventListener("click",(function(){return h.close()})),h.setFooter([[v.cancel,v.remove],v.check]),h.setSize(500),h.open(),s&&s.preventDefault(),!1}};t.events.on("beforeDestruct",(function(){t.events.off(t.editor,".imageproperties");})).on("afterInit changePlace",(function(){t.events.off(t.editor,".imageproperties"),t.events.on(t.editor,"dblclick.imageproperties",i.image.openOnDblClick?f:function(e){e.stopImmediatePropagation(),t.selection.select(this);},"img");})).on("openImageProperties",(function(t){f.call(t);}));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(2),r=o(1);i.Config.prototype.controls.indent={tooltip:"Increase Indent"};var a=function(t){return "rtl"===t?"marginRight":"marginLeft"};i.Config.prototype.controls.outdent={isDisable:function(t){var e=t.selection.current();if(e){var o=r.Dom.closest(e,(function(e){return r.Dom.isBlock(e,t.editorWindow)}),t.editor),i=a(t.options.direction);if(o&&o.style&&o.style[i])return 0>=parseInt(o.style[i],10)}return !0},tooltip:"Decrease Indent"},i.Config.prototype.indentMargin=10,e.indent=function(t){var e=a(t.options.direction),o=function(o){var i=[];return t.selection.eachSelection((function(a){var s=t.selection.save(),l=!!a&&r.Dom.up(a,(function(e){return r.Dom.isBlock(e,t.editorWindow)}),t.editor),c=t.options.enter;if(!l&&a&&(l=r.Dom.wrapInline(a,c!==n.BR?c:n.PARAGRAPH,t)),!l)return t.selection.restore(s),!1;var d=-1!==i.indexOf(l);if(l&&l.style&&!d){i.push(l);var u=l.style[e]?parseInt(l.style[e],10):0;l.style[e]=(u+=t.options.indentMargin*("outdent"===o?-1:1))>0?u+"px":"",l.getAttribute("style")||l.removeAttribute("style");}t.selection.restore(s);})),t.setEditorValue(),!1};t.registerCommand("indent",{exec:o,hotkeys:["ctrl+]","cmd+]"]}),t.registerCommand("outdent",{exec:o,hotkeys:["ctrl+[","cmd+["]});};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(17),a=r.Widget.ColorPickerWidget,s=r.Widget.TabsWidget,l=o(1),c=o(3),d=o(5),u=o(29),f=o(28),p=o(20);n.Config.prototype.toolbarInline=!0,n.Config.prototype.toolbarInlineDisableFor=[],n.Config.prototype.popup={a:[{name:"eye",tooltip:"Open link",exec:function(t,e){var o=e.getAttribute("href");e&&o&&t.ownerWindow.open(o);}},{name:"link",tooltip:"Edit link",icon:"pencil"},"unlink","brush","file"],jodit:[{name:"bin",tooltip:"Delete",exec:function(t,e){t.selection.removeNode(e),t.events.fire("hidePopup");}}],"jodit-media":[{name:"bin",tooltip:"Delete",exec:function(t,e){t.selection.removeNode(e),t.events.fire("hidePopup");}}],img:[{name:"delete",icon:"bin",tooltip:"Delete",exec:function(t,e){t.selection.removeNode(e),t.events.fire("hidePopup");}},{name:"pencil",exec:function(t,e){"img"===e.tagName.toLowerCase()&&t.events.fire("openImageProperties",e);},tooltip:"Edit"},{name:"valign",list:["Top","Middle","Bottom"],tooltip:"Vertical align",exec:function(t,e,o){if("img"===e.tagName.toLowerCase()){var i=o.args&&"string"==typeof o.args[1]?o.args[1].toLowerCase():"";c.css(e,"vertical-align",i),t.events.fire("recalcPositionPopup");}}},{name:"left",list:["Left","Right","Center","Normal"],exec:function(t,e,o){if("img"===e.tagName.toLowerCase()){var i=o.args&&"string"==typeof o.args[1]?o.args[1].toLowerCase():"";"normal"!==i?-1!==["right","left"].indexOf(i)?(c.css(e,"float",i),c.clearCenterAlign(e)):(c.css(e,"float",""),c.css(e,{display:"block","margin-left":"auto","margin-right":"auto"})):(c.css(e,"float")&&-1!==["right","left"].indexOf(c.css(e,"float").toLowerCase())&&c.css(e,"float",""),c.clearCenterAlign(e)),t.events.fire("recalcPositionPopup");}},tooltip:"Horizontal align"}],table:[{name:"brush",popup:function(t,e){var o,i,n,r,l,d,f=u.Table.getAllSelectedCells(e);return !!f.length&&(r=c.css(f[0],"color"),d=c.css(f[0],"background-color"),l=c.css(f[0],"border-color"),o=a(t,(function(e){f.forEach((function(t){c.css(t,"background-color",e);})),t.setEditorValue();}),d),i=a(t,(function(e){f.forEach((function(t){c.css(t,"color",e);})),t.setEditorValue();}),r),n=a(t,(function(e){f.forEach((function(t){c.css(t,"border-color",e);})),t.setEditorValue();}),l),s(t,{Background:o,Text:i,Border:n}))},tooltip:"Background"},{name:"valign",list:["Top","Middle","Bottom"],exec:function(t,e,o){var i=o.args&&"string"==typeof o.args[1]?o.args[1].toLowerCase():"";u.Table.getAllSelectedCells(e).forEach((function(t){c.css(t,"vertical-align",i);}));},tooltip:"Vertical align"},{name:"splitv",list:{tablesplitv:"Split vertical",tablesplitg:"Split horizontal"},tooltip:"Split"},{name:"align",icon:"left"},"\n",{name:"merge",command:"tablemerge",tooltip:"Merge"},{name:"addcolumn",list:{tableaddcolumnbefore:"Insert column before",tableaddcolumnafter:"Insert column after"},exec:function(t,e,o){var i=o.args&&"string"==typeof o.args[0]?o.args[0].toLowerCase():"";t.execCommand(i,!1,e);},tooltip:"Add column"},{name:"addrow",list:{tableaddrowbefore:"Insert row above",tableaddrowafter:"Insert row below"},exec:function(t,e,o){var i=o.args&&"string"==typeof o.args[0]?o.args[0].toLowerCase():"";t.execCommand(i,!1,e);},tooltip:"Add row"},{name:"delete",icon:"bin",list:{tablebin:"Delete table",tablebinrow:"Delete row",tablebincolumn:"Delete column",tableempty:"Empty cell"},exec:function(t,e,o){var i=o.args&&"string"==typeof o.args[0]?o.args[0].toLowerCase():"";t.execCommand(i,!1,e),t.events.fire("hidePopup");},tooltip:"Delete"}]};var h=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e._hiddenClass="jodit_toolbar_popup-inline-target-hidden",e.isSelectionStarted=!1,e.onSelectionEnd=e.jodit.async.debounce((function(){!e.isDestructed&&e.jodit.isEditorMode()&&(e.isSelectionStarted&&(e.isTargetAction||e.onChangeSelection()),e.isSelectionStarted=!1,e.isTargetAction=!1);}),e.jodit.defaultTimeout),e.isTargetAction=!1,e.isSelectionPopup=!1,e.calcWindSizes=function(){var t=e.jodit.ownerWindow,o=e.jodit.ownerDocument.documentElement;if(!o)return {left:0,top:0,width:0,height:0};var i=e.jodit.ownerDocument.body,n=o.clientTop||i.clientTop||0,r=o.clientLeft||i.clientLeft||0;return {left:r,top:n,width:o.clientWidth+(t.pageXOffset||o.scrollLeft||i.scrollLeft)-r,height:o.clientHeight+(t.pageYOffset||o.scrollTop||i.scrollTop)-n}},e.calcPosition=function(t,o){if(!e.isDestructed){e.popup.target.classList.remove(e._hiddenClass);var i=t.left+t.width/2,n=c.offset(e.jodit.workplace,e.jodit,e.jodit.ownerDocument,!0),r=t.top+t.height+10;e.target.style.left=i+"px",e.target.style.top=r+"px",e.jodit.isFullSize()&&(e.target.style.zIndex=c.css(e.jodit.container,"zIndex").toString());var a=e.container.offsetWidth/2,s=-a;e.popup.container.classList.remove("jodit_toolbar_popup-inline-top"),r+e.container.offsetHeight>o.height&&(e.target.style.top=(r=t.top-e.container.offsetHeight-10)+"px",e.popup.container.classList.add("jodit_toolbar_popup-inline-top")),0>i-a&&(s=-(t.width/2+t.left)),i+a>o.width&&(s=-(e.container.offsetWidth-(o.width-i))),e.container.style.marginLeft=s+"px",(n.top-r>50||r-(n.top+n.height)>50)&&e.popup.target.classList.add(e._hiddenClass);}},e.reCalcPosition=function(){e.__getRect&&e.calcPosition(e.__getRect(),e.calcWindSizes());},e.showPopup=function(t,o,i){if(!e.jodit.options.toolbarInline||!e.jodit.options.popup[o.toLowerCase()])return !1;if(e.isExcludedTarget(o))return !0;e.isOpened=!0,e.isTargetAction=!0;var n=e.calcWindSizes();return e.targetContainer.parentNode||e.jodit.ownerDocument.body.appendChild(e.targetContainer),e.toolbar.build(e.jodit.options.popup[o.toLowerCase()],e.container,i),e.popup.open(e.container,!1,!0),e.__getRect=t,e.calcPosition(t(),n),!0},e.hidePopup=function(t){e.isDestructed||t&&(l.Dom.isNode(t,e.jodit.editorWindow||window)||t instanceof f.Popup)&&l.Dom.isOrContains(e.target,t instanceof f.Popup?t.target:t)||(e.isTargetAction=!1,e.isOpened=!1,e.popup.close(),l.Dom.safeRemove(e.targetContainer));},e.onSelectionStart=function(t){if(!e.isDestructed&&e.jodit.isEditorMode()&&(e.isTargetAction=!1,e.isSelectionPopup=!1,!e.isSelectionStarted)){var o=Object.keys(e.jodit.options.popup).join("|"),i=l.Dom.isTag(t.target,"img")?t.target:l.Dom.closest(t.target,o,e.jodit.editor);i&&e.showPopup((function(){return c.offset(i,e.jodit,e.jodit.editorDocument)}),i.nodeName,i)||(e.isSelectionStarted=!0);}},e.checkIsTargetEvent=function(){e.isTargetAction?e.isTargetAction=!1:e.hidePopup();},e.isOpened=!1,e.onChangeSelection=function(){if(e.jodit.options.toolbarInline&&e.jodit.isEditorMode()&&!e.hideIfCollapsed()&&void 0!==e.jodit.options.popup.selection){var t=e.jodit.selection.sel;if(t&&t.rangeCount){e.isSelectionPopup=!0;var o=t.getRangeAt(0);e.showPopup((function(){return c.offset(o,e.jodit,e.jodit.editorDocument)}),"selection");}}},e}return i.__extends(e,t),e.prototype.isExcludedTarget=function(t){return -1!==c.splitArray(this.jodit.options.toolbarInlineDisableFor).map((function(t){return t.toLowerCase()})).indexOf(t.toLowerCase())},e.prototype.hideIfCollapsed=function(){return !!this.jodit.selection.isCollapsed()&&(this.hidePopup(),!0)},e.prototype.afterInit=function(t){},e.prototype.init=function(t){var e=this;this.toolbar=p.JoditToolbarCollection.makeCollection(t),this.target=t.create.div("jodit_toolbar_popup-inline-target"),this.targetContainer=t.create.div("jodit_toolbar_popup-inline-container",this.target),this.container=t.create.div(),this.popup=new f.Popup(t,this.target,void 0,"jodit_toolbar_popup-inline"),t.events.on(this.target,"mousedown keydown touchstart",(function(t){t.stopPropagation();})).on("beforeOpenPopup hidePopup afterSetMode",this.hidePopup).on("recalcPositionPopup",this.reCalcPosition).on("getDiffButtons.mobile",(function(o){if(e.toolbar===o)return c.splitArray(t.options.buttons).filter((function(t){return "|"!==t&&"\n"!==t})).filter((function(t){return 0>e.toolbar.getButtonsList().indexOf(t)}))})).on("selectionchange",this.onChangeSelection).on("afterCommand afterExec",(function(){e.isOpened&&e.isSelectionPopup&&e.onChangeSelection();})).on("showPopup",(function(t,o){var i=("string"==typeof t?t:t.nodeName).toLowerCase();e.isSelectionPopup=!1,e.showPopup(o,i,"string"==typeof t?void 0:t);})).on("mousedown keydown touchstart",this.onSelectionStart),t.events.on("afterInit changePlace",(function(){t.events.off(".inlinePopup").on([t.ownerWindow,t.editor],"scroll.inlinePopup resize.inlinePopup",e.reCalcPosition).on([t.ownerWindow],"mouseup.inlinePopup keyup.inlinePopup touchend.inlinePopup",e.onSelectionEnd).on([t.ownerWindow],"mousedown.inlinePopup keydown.inlinePopup touchstart.inlinePopup",e.checkIsTargetEvent);}));},e.prototype.beforeDestruct=function(t){this.popup&&this.popup.destruct(),delete this.popup,this.toolbar&&this.toolbar.destruct(),delete this.toolbar,l.Dom.safeRemove(this.target),l.Dom.safeRemove(this.container),l.Dom.safeRemove(this.targetContainer),t.events&&t.events.off([t.ownerWindow],"scroll resize",this.reCalcPosition).off([t.ownerWindow],"mouseup keyup touchend",this.onSelectionEnd).off([t.ownerWindow],"mousedown keydown touchstart",this.checkIsTargetEvent);},e}(d.Plugin);e.inlinePopup=h;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(2),r=o(33);i.Config.prototype.limitWords=!1,i.Config.prototype.limitChars=!1,i.Config.prototype.limitHTML=!1,e.limit=function(t){if(t&&(t.options.limitWords||t.options.limitChars)){var e=function(e,o){void 0===o&&(o="");var i=(o||(t.options.limitHTML?t.value:t.text)).replace(n.INVISIBLE_SPACE_REG_EXP,"").split(n.SPACE_REG_EXP).filter((function(t){return t.length}));if(!e||-1===n.COMMAND_KEYS.indexOf(e.which))return t.options.limitWords&&i.length>=t.options.limitWords?t.options.limitWords===i.length:t.options.limitChars&&t.options.limitChars<=i.join("").length?t.options.limitChars===i.join("").length:void 0},o=null;t.events.off(".limit").on("beforePaste.limit",(function(){o=t.observer.snapshot.make();})).on("keydown.limit keyup.limit beforeEnter.limit beforePaste.limit",(function(t){if(void 0!==e(t))return !1})).on("change.limit",t.async.debounce((function(o,i){!1===e(null,t.options.limitHTML?o:r.stripTags(o))&&(t.value=i);}),t.defaultTimeout)).on("afterPaste.limit",(function(){if(!1===e(null)&&o)return t.observer.snapshot.restore(o),!1}));}};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(1),r=o(3);i.Config.prototype.link={formTemplate:function(t){var e=t.i18n.bind(t);return '<form class="jodit_form">\n\t\t\t<div class="jodit_form_group">\n\t\t\t\t<input ref="url_input" class="jodit_input" required type="text" name="url" placeholder="http://" type="text"/>\n\t\t\t</div>\n\t\t\t<div ref="content_input_box" class="jodit_form_group">\n\t\t\t\t<input ref="content_input" class="jodit_input" name="text" placeholder="'+e("Text")+'" type="text"/>\n\t\t\t</div>\n\t\t\t<label ref="target_checkbox_box">\n\t\t\t\t<input ref="target_checkbox" class="jodit_checkbox" name="target" type="checkbox"/>\n\t\t\t\t<span>'+e("Open in new tab")+'</span>\n\t\t\t</label>\n\t\t\t<label ref="nofollow_checkbox_box">\n\t\t\t\t<input ref="nofollow_checkbox" class="jodit_checkbox" name="nofollow" type="checkbox"/>\n\t\t\t\t<span>'+e("No follow")+'</span>\n\t\t\t</label>\n\t\t\t<div class="jodit_buttons">\n\t\t\t\t<button ref="unlink" class="jodit_button jodit_unlink_button" type="button">'+e("Unlink")+'</button>\n\t\t\t\t<button ref="insert" class="jodit_button jodit_link_insert_button" type="submit">'+e("Insert")+"</button>\n\t\t\t</div>\n\t\t<form/>"},followOnDblClick:!0,processVideoLink:!0,processPastedLink:!0,removeLinkAfterFormat:!0,noFollowCheckbox:!0,openInNewTabCheckbox:!0},i.Config.prototype.controls.unlink={exec:function(t,e){var o=n.Dom.closest(e,"A",t.editor);o&&n.Dom.unwrap(o),t.events.fire("hidePopup");},tooltip:"Unlink"},i.Config.prototype.controls.link={isActive:function(t){var e=t.selection.current();return e&&!1!==n.Dom.closest(e,"a",t.editor)},popup:function(t,e,o,i){var a,s=t.i18n.bind(t),l=t.options.link,c=l.openInNewTabCheckbox,d=l.noFollowCheckbox,u=l.formClassName,f=t.create.fromHTML((0, l.formTemplate)(t),{target_checkbox_box:c,nofollow_checkbox_box:d}),p=r.refs(f),h=p.insert,v=p.unlink,m=p.content_input_box,g=p.target_checkbox,b=p.nofollow_checkbox,y=p.url_input,_=n.Dom.isImage(e,t.editorWindow),w=p.content_input;w||(w=t.create.element("input",{type:"hidden",ref:"content_input"})),u&&f.classList.add(u),_&&n.Dom.hide(m);var j=function(){return a?a.innerText:r.stripTags(t.selection.range.cloneContents(),t.editorDocument)};a=!(!e||!n.Dom.closest(e,"A",t.editor))&&n.Dom.closest(e,"A",t.editor),!_&&e&&(w.value=j()),a?(y.value=a.getAttribute("href")||"",c&&g&&(g.checked="_blank"===a.getAttribute("target")),d&&b&&(b.checked="nofollow"===a.getAttribute("rel")),h.textContent=s("Update")):n.Dom.hide(v);var S=t.observer.snapshot.make();return v&&t.events.on(v,"click",(function(e){t.observer.snapshot.restore(S),a&&n.Dom.unwrap(a),i(),e.preventDefault();})),t.events.on(f,"submit",(function(e){if(e.preventDefault(),e.stopImmediatePropagation(),!y.value.trim().length)return y.focus(),y.classList.add("jodit_error"),!1;var o;t.observer.snapshot.restore(S);var n=j()!==w.value.trim();if(a)o=[a];else if(t.selection.isCollapsed()){var r=t.create.inside.element("a");t.selection.insertNode(r),o=[r];}else o=t.selection.wrapInTag("a");return o.forEach((function(t){t.setAttribute("href",y.value),_||(w.value.trim().length?n&&(t.textContent=w.value):t.textContent=y.value),c&&g&&(g.checked?t.setAttribute("target","_blank"):t.removeAttribute("target")),d&&b&&(b.checked?t.setAttribute("rel","nofollow"):t.removeAttribute("rel"));})),i(),!1})),f},tags:["a"],tooltip:"Insert link"},e.link=function(t){t.options.link.followOnDblClick&&t.events.on("afterInit changePlace",(function(){t.events.off("dblclick.link").on(t.editor,"dblclick.link",(function(t){var e=this.getAttribute("href");e&&(location.href=e,t.preventDefault());}),"a");})),t.options.link.processPastedLink&&t.events.on("processPaste.link",(function(e,o){if(r.isURL(o)){if(t.options.link.processVideoLink){var i=r.convertMediaURLToVideoEmbed(o);if(i!==o)return t.create.inside.fromHTML(i)}var n=t.create.inside.element("a");return n.setAttribute("href",o),n.textContent=o,n}})),t.options.link.removeLinkAfterFormat&&t.events.on("afterCommand.link",(function(e){var o,i;"removeFormat"===e&&((i=t.selection.current())&&!n.Dom.isTag(i,"a")&&(i=n.Dom.closest(i,"A",t.editor)),n.Dom.isTag(i,"a")&&(i.innerHTML===i.textContent?o=t.create.inside.text(i.innerHTML):(o=t.create.inside.element("span")).innerHTML=i.innerHTML,i.parentNode&&(i.parentNode.replaceChild(o,i),t.selection.setCursorIn(o,!0))));}));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(2),r=o(9);i.Config.prototype.mediaFakeTag="jodit-media",i.Config.prototype.mediaInFakeBlock=!0,i.Config.prototype.mediaBlocks=["video","audio"],e.media=function(t){var e="jodit_fake_wrapper",o=t.options,i=o.mediaFakeTag,a=o.mediaBlocks;o.mediaInFakeBlock&&t.events.on("afterGetValueFromEditor",(function(t){var o=new RegExp("<"+i+"[^>]+data-"+e+"[^>]+>(.+?)</"+i+">","ig");o.test(t.value)&&(t.value=t.value.replace(o,"$1"));})).on("change afterInit afterSetMode changePlace",t.async.debounce((function(){t.isDestructed||t.getMode()===n.MODE_SOURCE||r.$$(a.join(","),t.editor).forEach((function(o){o["__"+e]||(o["__"+e]=!0,function(o){if(o.parentNode&&o.parentNode.getAttribute("data-jodit_iframe_wrapper"))o=o.parentNode;else {var n=void 0;(n=t.create.inside.fromHTML("<"+i+' data-jodit-temp="1" contenteditable="false" draggable="true" data-'+e+'="1"></'+i+">")).style.display="inline-block"===o.style.display?"inline-block":"block",n.style.width=o.offsetWidth+"px",n.style.height=o.offsetHeight+"px",o.parentNode&&o.parentNode.insertBefore(n,o),n.appendChild(o),o=n;}t.events.off(o,"mousedown.select touchstart.select").on(o,"mousedown.select touchstart.select",(function(){t.selection.setCursorAfter(o);}));}(o));}));}),t.defaultTimeout));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(2),r=o(22),a=o(20);i.Config.prototype.mobileTapTimeout=300,i.Config.prototype.toolbarAdaptive=!0,i.Config.prototype.controls.dots={mode:n.MODE_SOURCE+n.MODE_WYSIWYG,popup:function(t,e,o,i,n){var s=o.data;if(void 0===s){s={container:t.create.div(),toolbar:a.JoditToolbarCollection.makeCollection(t),rebuild:function(){if(n){var e=t.events.fire("getDiffButtons.mobile",n.parentToolbar);e&&s&&s.toolbar.build(r.splitArray(e),s.container);}}};var l=32,c=t.options.toolbarButtonSize;"large"===c?l=36:"small"===c&&(l=24),s.container.style.width=3*l+"px",o.data=s;}return s.rebuild(),s.container},tooltip:"Show all"},e.mobile=function(t){var e,o=0,i=r.splitArray(t.options.buttons);t.events.on("touchend",(function(i){i.changedTouches&&i.changedTouches.length&&(e=(new Date).getTime())-o>t.options.mobileTapTimeout&&(o=e,t.selection.insertCursorAtPoint(i.changedTouches[0].clientX,i.changedTouches[0].clientY));})).on("getDiffButtons.mobile",(function(e){if(e===t.toolbar)return r.splitArray(t.options.buttons).filter((function(t){return 0>i.indexOf(t)}))})),t.options.toolbarAdaptive&&t.events.on("resize afterInit recalcAdaptive changePlace afterAddPlace",(function(){if(t.options.toolbar){var e=t.container.offsetWidth,o=[];(o=r.splitArray(t.options.sizeLG>e?t.options.sizeMD>e?t.options.sizeSM>e?t.options.buttonsXS:t.options.buttonsSM:t.options.buttonsMD:t.options.buttons)).toString()!==i.toString()&&t.toolbar.build((i=o).concat(t.options.extraButtons),t.toolbar.container.parentElement||t.toolbar.getParentContainer());}})).on(t.ownerWindow,"load",(function(){return t.events.fire("recalcAdaptive")}));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(1);i.Config.prototype.controls.ul={command:"insertUnorderedList",controlName:"ul",tags:["ul"],tooltip:"Insert Unordered List"},i.Config.prototype.controls.ol={command:"insertOrderedList",controlName:"ol",tags:["ol"],tooltip:"Insert Ordered List"},e.orderedlist=function(t){t.events.on("afterCommand",(function(e){if(/insert(un)?orderedlist/i.test(e)){var o=n.Dom.up(t.selection.current(),(function(t){return t&&/^UL|OL$/i.test(t.nodeName)}),t.editor);if(o&&n.Dom.isTag(o.parentNode,"p")){var i=t.selection.save();n.Dom.unwrap(o.parentNode),Array.from(o.childNodes).forEach((function(t){n.Dom.isTag(t.lastChild,"br")&&n.Dom.safeRemove(t.lastChild);})),t.selection.restore(i);}t.setEditorValue();}}));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(10),s=o(1),l=o(5),c=o(2);n.Config.prototype.showPlaceholder=!0,n.Config.prototype.useInputsPlaceholder=!0,n.Config.prototype.placeholder="Type something";var d=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.addEvents=function(){var t=e.jodit;t.options.useInputsPlaceholder&&t.element.hasAttribute("placeholder")&&(e.placeholderElm.innerHTML=t.element.getAttribute("placeholder")||""),t.events.fire("placeholder",e.placeholderElm.innerHTML),t.events.off(".placeholder").on("change.placeholder focus.placeholder keyup.placeholder mouseup.placeholder keydown.placeholder mousedown.placeholder afterSetMode.placeholder changePlace.placeholder",e.toggle).on(window,"load",e.toggle),e.toggle();},e}return i.__extends(e,t),e.prototype.afterInit=function(t){var e=this;t.options.showPlaceholder&&(this.toggle=t.async.debounce(this.toggle.bind(this),this.jodit.defaultTimeout/10),this.placeholderElm=t.create.fromHTML('<span style="display: none;" class="jodit_placeholder">'+t.i18n(t.options.placeholder)+"</span>"),"rtl"===t.options.direction&&(this.placeholderElm.style.right="0px",this.placeholderElm.style.direction="rtl"),t.events.on("readonly",(function(t){t?e.hide():e.toggle();})).on("changePlace",this.init),this.addEvents());},e.prototype.show=function(){var t=this.jodit;if(!t.options.readonly){var e=0,o=0,i=t.editorWindow.getComputedStyle(t.editor);if(t.workplace.appendChild(this.placeholderElm),s.Dom.isElement(t.editor.firstChild)){var n=t.editorWindow.getComputedStyle(t.editor.firstChild);e=parseInt(n.getPropertyValue("margin-top"),10),o=parseInt(n.getPropertyValue("margin-left"),10),this.placeholderElm.style.fontSize=parseInt(n.getPropertyValue("font-size"),10)+"px",this.placeholderElm.style.lineHeight=n.getPropertyValue("line-height");}else this.placeholderElm.style.fontSize=parseInt(i.getPropertyValue("font-size"),10)+"px",this.placeholderElm.style.lineHeight=i.getPropertyValue("line-height");a.css(this.placeholderElm,{display:"block",marginTop:Math.max(parseInt(i.getPropertyValue("margin-top"),10),e),marginLeft:Math.max(parseInt(i.getPropertyValue("margin-left"),10),o)});}},e.prototype.hide=function(){s.Dom.safeRemove(this.placeholderElm);},e.prototype.toggle=function(){var t=this.jodit;t.editor&&!t.isInDestruct&&(t.getRealMode()===r.MODE_WYSIWYG&&this.isEmpty(t.editor)?this.show():this.hide());},e.prototype.isEmpty=function(t){if(!t.firstChild)return !0;var e=t.firstChild;if(c.MAY_BE_REMOVED_WITH_KEY.test(e.nodeName)||/^(TABLE)$/i.test(e.nodeName))return !1;var o=s.Dom.next(e,(function(t){return t&&!s.Dom.isEmptyTextNode(t)}),t);return s.Dom.isText(e)&&!o?s.Dom.isEmptyTextNode(e):!(o||!s.Dom.each(e,(function(t){return s.Dom.isEmpty(t)||s.Dom.isTag(t,"br")})))},e.prototype.beforeDestruct=function(t){this.hide(),this.jodit.events.off(".placeholder").off(window,"load",this.toggle);},e}(l.Plugin);e.placeholder=d;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(5);n.Config.prototype.controls.redo={mode:r.MODE_SPLIT,isDisable:function(t){return !t.observer.stack.canRedo()},tooltip:"Redo"},n.Config.prototype.controls.undo={mode:r.MODE_SPLIT,isDisable:function(t){return !t.observer.stack.canUndo()},tooltip:"Undo"};var s=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return i.__extends(e,t),e.prototype.beforeDestruct=function(){},e.prototype.afterInit=function(t){var e=function(e){return t.getRealMode()===r.MODE_WYSIWYG&&t.observer[e](),!1};t.registerCommand("redo",{exec:e,hotkeys:["ctrl+y","ctrl+shift+z","cmd+y","cmd+shift+z"]}),t.registerCommand("undo",{exec:e,hotkeys:["ctrl+z","cmd+z"]});},e}(a.Plugin);e.redoundo=s;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(2),s=o(1),l=o(9),c=o(19),d=o(3),u=o(5);n.Config.prototype.useIframeResizer=!0,n.Config.prototype.useTableResizer=!0,n.Config.prototype.useImageResizer=!0,n.Config.prototype.resizer={showSize:!0,hideSizeTimeout:1e3,min_width:10,min_height:10};var f=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.LOCK_KEY="resizer",e.element=null,e.isResized=!1,e.isShown=!1,e.start_x=0,e.start_y=0,e.width=0,e.height=0,e.ratio=0,e.rect=e.jodit.create.fromHTML('<div class="jodit_resizer">\n\t\t\t\t<i class="jodit_resizer-topleft"></i>\n\t\t\t\t<i class="jodit_resizer-topright"></i>\n\t\t\t\t<i class="jodit_resizer-bottomright"></i>\n\t\t\t\t<i class="jodit_resizer-bottomleft"></i>\n\t\t\t\t<span>100x100</span>\n\t\t\t</div>'),e.sizeViewer=e.rect.getElementsByTagName("span")[0],e.onResize=function(t){if(e.isResized){var o=t.clientX-e.start_x,i=t.clientY-e.start_y;if(!e.element)return;var n=e.handle.className,r=0,a=0;s.Dom.isTag(e.element,"img")?(o?(r=e.width+(n.match(/left/)?-1:1)*o,a=Math.round(r/e.ratio)):(a=e.height+(n.match(/top/)?-1:1)*i,r=Math.round(a*e.ratio)),r>c.innerWidth(e.jodit.editor,e.jodit.ownerWindow)&&(r=c.innerWidth(e.jodit.editor,e.jodit.ownerWindow),a=Math.round(r/e.ratio))):(r=e.width+(n.match(/left/)?-1:1)*o,a=e.height+(n.match(/top/)?-1:1)*i),r>e.jodit.options.resizer.min_width&&d.css(e.element,"width",e.rect.parentNode.offsetWidth>r?r:"100%"),a>e.jodit.options.resizer.min_height&&d.css(e.element,"height",a),e.updateSize(),e.showSizeViewer(e.element.offsetWidth,e.element.offsetHeight),t.stopImmediatePropagation();}},e.onClickOutside=function(t){e.isShown&&(e.isResized?(e.jodit.unlock(),e.isResized=!1,e.jodit.setEditorValue(),t.stopImmediatePropagation(),e.jodit.events.off(e.jodit.ownerWindow,"mousemove.resizer touchmove.resizer",e.onResize)):e.hide());},e.onClickElement=function(t){e.element===t&&e.isShown||(e.element=t,e.show(),s.Dom.isTag(e.element,"img")&&!e.element.complete&&e.jodit.events.on(e.element,"load",e.updateSize));},e.updateSize=function(){if(!e.isInDestruct&&e.isShown&&e.element&&e.rect){var t=c.offset(e.rect.parentNode||e.jodit.ownerDocument.documentElement,e.jodit,e.jodit.ownerDocument,!0),o=c.offset(e.element,e.jodit,e.jodit.editorDocument),i=parseInt(e.rect.style.left||"0",10),n=parseInt(e.rect.style.top||"0",10),r=o.top-1-t.top,a=o.left-1-t.left;n===r&&i===a&&e.rect.offsetWidth===e.element.offsetWidth&&e.rect.offsetHeight===e.element.offsetHeight||(d.css(e.rect,{top:r,left:a,width:e.element.offsetWidth,height:e.element.offsetHeight}),e.jodit.events&&(e.jodit.events.fire(e.element,"changesize"),isNaN(i)||e.jodit.events.fire("resize")));}},e.hide=function(){e.isResized=!1,e.isShown=!1,e.element=null,s.Dom.safeRemove(e.rect);},e.hideSizeViewer=function(){e.sizeViewer.style.opacity="0";},e}return i.__extends(e,t),e.prototype.afterInit=function(t){var e=this;l.$$("i",this.rect).forEach((function(o){t.events.on(o,"mousedown.resizer touchstart.resizer",e.onClickHandle.bind(e,o));})),t.events.on("readonly",(function(t){t&&e.hide();})).on("afterInit changePlace",this.addEventListeners.bind(this)).on("afterGetValueFromEditor.resizer",(function(t){var e=/<jodit[^>]+data-jodit_iframe_wrapper[^>]+>(.*?<iframe[^>]+>[\s\n\r]*<\/iframe>.*?)<\/jodit>/gi;e.test(t.value)&&(t.value=t.value.replace(e,"$1"));})).on("hideResizer",this.hide).on("change afterInit afterSetMode",t.async.debounce(this.onChangeEditor.bind(this),t.defaultTimeout)),this.addEventListeners(),this.onChangeEditor();},e.prototype.addEventListeners=function(){var t=this,e=this.jodit;e.events.off(e.editor,".resizer").off(e.ownerWindow,".resizer").on(e.editor,"keydown.resizer",(function(e){t.isShown&&e.which===r.KEY_DELETE&&t.element&&!s.Dom.isTag(t.element,"table")&&t.onDelete(e);})).on(e.ownerWindow,"resize.resizer",this.updateSize).on(e.ownerWindow,"mouseup.resizer keydown.resizer touchend.resizer",this.onClickOutside).on([e.ownerWindow,e.editor],"scroll.resizer",(function(){t.isShown&&!t.isResized&&t.hide();}));},e.prototype.onClickHandle=function(t,e){if(!this.element||!this.element.parentNode)return this.hide(),!1;this.handle=t,e.preventDefault(),e.stopImmediatePropagation(),this.width=this.element.offsetWidth,this.height=this.element.offsetHeight,this.ratio=this.width/this.height,this.isResized=!0,this.start_x=e.clientX,this.start_y=e.clientY,this.jodit.events.fire("hidePopup"),this.jodit.lock(this.LOCK_KEY),this.jodit.events.on(this.jodit.ownerWindow,"mousemove.resizer touchmove.resizer",this.onResize);},e.prototype.onDelete=function(t){this.element&&("JODIT"!==this.element.tagName?this.jodit.selection.select(this.element):(s.Dom.safeRemove(this.element),this.hide(),t.preventDefault()));},e.prototype.onChangeEditor=function(){var t=this,e=this.jodit;this.isShown&&(this.element&&this.element.parentNode?this.updateSize():this.hide()),e.isDestructed||l.$$("img, table, iframe",e.editor).forEach((function(o){e.getMode()!==r.MODE_SOURCE&&!o.__jodit_resizer_binded&&(s.Dom.isTag(o,"iframe")&&e.options.useIframeResizer||s.Dom.isTag(o,"img")&&e.options.useImageResizer||s.Dom.isTag(o,"table")&&e.options.useTableResizer)&&(o.__jodit_resizer_binded=!0,t.bind(o));}));},e.prototype.bind=function(t){var e,o=this;if(s.Dom.isTag(t,"iframe")){var i=t;t.parentNode&&t.parentNode.getAttribute("data-jodit_iframe_wrapper")?t=t.parentNode:(e=this.jodit.create.inside.fromHTML('<jodit data-jodit-temp="1" contenteditable="false" draggable="true" data-jodit_iframe_wrapper="1"></jodit>'),d.css(e,{display:"inline-block"===t.style.display?"inline-block":"block",width:t.offsetWidth,height:t.offsetHeight}),t.parentNode&&t.parentNode.insertBefore(e,t),e.appendChild(t),t=e),this.jodit.events.off(t,"mousedown.select touchstart.select").on(t,"mousedown.select touchstart.select",(function(){o.jodit.selection.select(t);})).off(t,"changesize").on(t,"changesize",(function(){i.setAttribute("width",t.offsetWidth+"px"),i.setAttribute("height",t.offsetHeight+"px");}));}this.jodit.events.on(t,"dragstart",this.hide).on(t,"mousedown",(function(e){a.IS_IE&&s.Dom.isTag(t,"img")&&e.preventDefault();})).on(t,"click",(function(){return o.onClickElement(t)}));},e.prototype.showSizeViewer=function(t,e){this.jodit.options.resizer.showSize&&(this.sizeViewer.offsetWidth>t||this.sizeViewer.offsetHeight>e?this.hideSizeViewer():(this.sizeViewer.style.opacity="1",this.sizeViewer.textContent=t+" x "+e,this.jodit.async.setTimeout(this.hideSizeViewer,{timeout:this.jodit.options.resizer.hideSizeTimeout,label:"hideSizeViewer"})));},e.prototype.show=function(){this.jodit.options.readonly||this.isShown||(this.isShown=!0,this.rect.parentNode||(this.jodit.markOwner(this.rect),this.jodit.workplace.appendChild(this.rect)),this.jodit.isFullSize()&&(this.rect.style.zIndex=d.css(this.jodit.container,"zIndex").toString()),this.updateSize());},e.prototype.beforeDestruct=function(t){this.hide(),this.jodit.events.off(this.jodit.ownerWindow,".resizer").off(".resizer");},e}(u.Plugin);e.resizer=f;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(2),s=o(1),l=o(6),c=o(5),d=o(8);n.Config.prototype.useSearch=!0;var u=function(t){function e(){var o=null!==t&&t.apply(this,arguments)||this;return o.template='<div class="jodit_search">\n\t\t\t<div class="jodit_search_box">\n\t\t\t\t<div class="jodit_search_inputs">\n\t\t\t\t\t<input tabindex="0" class="jodit_search-query" placeholder="'+o.jodit.i18n("Search for")+'" type="text"/>\n\t\t\t\t\t<input tabindex="0" class="jodit_search-replace" placeholder="'+o.jodit.i18n("Replace with")+'" type="text"/>\n\t\t\t\t</div>\n\t\t\t\t<div class="jodit_search_counts">\n\t\t\t\t\t<span>0/0</span>\n\t\t\t\t</div>\n\t\t\t\t<div class="jodit_search_buttons">\n\t\t\t\t\t<button tabindex="0" type="button" class="jodit_search_buttons-next">'+l.ToolbarIcon.getIcon("angle-down")+'</button>\n\t\t\t\t\t<button tabindex="0" type="button" class="jodit_search_buttons-prev">'+l.ToolbarIcon.getIcon("angle-up")+'</button>\n\t\t\t\t\t<button tabindex="0" type="button" class="jodit_search_buttons-cancel">'+l.ToolbarIcon.getIcon("cancel")+'</button>\n\t\t\t\t\t<button tabindex="0" type="button" class="jodit_search_buttons-replace">'+o.jodit.i18n("Replace")+"</button>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>",o.isOpened=!1,o.selInfo=null,o.current=!1,o.eachMap=function(t,e,i){s.Dom.findWithCurrent(t,(function(t){return !!t&&e(t)}),o.jodit.editor,i?"nextSibling":"previousSibling",i?"firstChild":"lastChild");},o.updateCounters=function(){if(o.isOpened){o.counterBox.style.display=o.queryInput.value.length?"inline-block":"none";var t=o.calcCounts(o.queryInput.value,o.jodit.selection.range);o.counterBox.textContent=t.join("/");}},o.calcCounts=function(t,e){void 0===e&&(e=!1);for(var i=[],n=0,r=0,a=!1,s=o.jodit.editor.firstChild;s&&t.length;)if(a=o.find(s,t,!0,0,a||o.jodit.editorDocument.createRange())){if(o.boundAlreadyWas(a,i))break;i.push(a),s=a.startContainer,r+=1,e&&o.boundAlreadyWas(e,[a])&&(n=r);}else s=null;return [n,r]},o.findAndReplace=function(t,e){var i=o.find(t,e,!0,0,o.jodit.selection.range);if(i&&i.startContainer&&i.endContainer){var n=o.jodit.editorDocument.createRange();try{if(i&&i.startContainer&&i.endContainer){n.setStart(i.startContainer,i.startOffset),n.setEnd(i.endContainer,i.endOffset),n.deleteContents();var r=o.jodit.create.inside.text(o.replaceInput.value);n.insertNode(r),o.jodit.selection.select(r),o.tryScrollToElement(r);}}catch(t){}return !0}return !1},o.findAndSelect=function(t,e,i){var n=o.find(t,e,i,0,o.jodit.selection.range);if(n&&n.startContainer&&n.endContainer){var r=o.jodit.editorDocument.createRange();try{r.setStart(n.startContainer,n.startOffset),r.setEnd(n.endContainer,n.endOffset),o.jodit.selection.selectRange(r);}catch(t){}return o.tryScrollToElement(n.startContainer),o.current=n.startContainer,o.updateCounters(),!0}return !1},o.find=function(t,i,n,r,a){if(t&&i.length){var l="",c={startContainer:null,startOffset:null,endContainer:null,endOffset:null};if(o.eachMap(t,(function(t){if(s.Dom.isText(t)&&null!==t.nodeValue&&t.nodeValue.length){var u=t.nodeValue;n||t!==a.startContainer?n&&t===a.endContainer&&(u=r?u.substr(0,a.startOffset):u.substr(a.endOffset)):u=r?u.substr(a.endOffset):u.substr(0,a.startOffset);var f=n?l+u:u+l,p=e.findSomePartOfString(i,f,n);if(!1!==p){var h=e.findSomePartOfString(i,u,n);!0===h?h=d.trim(i):!1===h&&!0===(h=e.findSomePartOfString(u,i,n))&&(h=d.trim(u));var v=e.getSomePartOfStringIndex(i,u,n)||0;if((n&&!r||!n&&r)&&t.nodeValue.length-u.length>0&&(v+=t.nodeValue.length-u.length),null===c.startContainer&&(c.startContainer=t,c.startOffset=v),!0===p)return c.endContainer=t,c.endOffset=v,c.endOffset+=h.length,!0;l=f;}else l="",c={startContainer:null,startOffset:null,endContainer:null,endOffset:null};}else s.Dom.isBlock(t,o.jodit.editorWindow)&&""!==l&&(l=n?l+" ":" "+l);return !1}),n),c.startContainer&&c.endContainer)return c;if(!r)return o.current=n?o.jodit.editor.firstChild:o.jodit.editor.lastChild,o.find(o.current,i,n,r+1,a)}return !1},o.open=function(t){void 0===t&&(t=!1),o.isOpened||(o.searchBox.classList.add("jodit_search-active"),o.isOpened=!0),o.jodit.events.fire("hidePopup"),o.searchBox.classList.toggle("jodit_search-and-replace",t),o.current=o.jodit.selection.current(),o.selInfo=o.jodit.selection.save();var e=(o.jodit.selection.sel||"").toString();e&&(o.queryInput.value=e),o.updateCounters(),e?o.queryInput.select():o.queryInput.focus();},o.close=function(){o.isOpened&&(o.selInfo&&(o.jodit.selection.restore(o.selInfo),o.selInfo=null),o.searchBox.classList.remove("jodit_search-active"),o.isOpened=!1);},o}return i.__extends(e,t),e.getSomePartOfStringIndex=function(t,e,o){return void 0===o&&(o=!0),this.findSomePartOfString(t,e,o,!0)},e.findSomePartOfString=function(t,e,o,i){void 0===o&&(o=!0),void 0===i&&(i=!1),t=d.trim(t.toLowerCase().replace(r.SPACE_REG_EXP," ")),e=e.toLowerCase();for(var n=o?0:e.length-1,a=o?0:t.length-1,s=0,l=null,c=o?1:-1,u=[];void 0!==e[n];n+=c){var f=t[a]===e[n];if(f||null!==l&&r.SPACE_REG_EXP.test(e[n])?(null!==l&&o||(l=n),u.push(e[n]),f&&(s+=1,a+=c)):(l=null,u.length=0,s=0,a=o?0:t.length-1),s===t.length)return !i||l}return i?null!=l&&l:!!u.length&&(o?u.join(""):u.reverse().join(""))},e.prototype.boundAlreadyWas=function(t,e){return e.some((function(e){return e.startContainer===t.startContainer&&e.endContainer===t.endContainer&&e.startOffset===t.startOffset&&e.endOffset===t.endOffset}),!1)},e.prototype.tryScrollToElement=function(t){var e=s.Dom.closest(t,s.Dom.isElement,this.jodit.editor);e||(e=s.Dom.prev(t,s.Dom.isElement,this.jodit.editor)),e&&e!==this.jodit.editor&&e.scrollIntoView();},e.prototype.afterInit=function(t){var e=this;if(t.options.useSearch){var o=this;o.searchBox=t.create.fromHTML(o.template);var i=o.searchBox.querySelector.bind(o.searchBox);o.queryInput=i("input.jodit_search-query"),o.replaceInput=i("input.jodit_search-replace"),o.closeButton=i(".jodit_search_buttons-cancel"),o.nextButton=i(".jodit_search_buttons-next"),o.prevButton=i(".jodit_search_buttons-prev"),o.replaceButton=i(".jodit_search_buttons-replace"),o.counterBox=i(".jodit_search_counts span");var n=function(){t.workplace.appendChild(e.searchBox),t.events.off(e.jodit.container,"keydown.search").on(e.jodit.container,"keydown.search",(function(i){if(t.getRealMode()===a.MODE_WYSIWYG)switch(i.which){case r.KEY_ESC:e.close();break;case r.KEY_F3:o.queryInput.value&&(t.events.fire(i.shiftKey?"searchPrevious":"searchNext"),i.preventDefault());}}));};n(),t.events.on("changePlace",n).on(o.closeButton,"click",this.close).on(o.queryInput,"mousedown",(function(){t.selection.isFocused()&&(t.selection.removeMarkers(),o.selInfo=t.selection.save());})).on(o.replaceButton,"click",(function(i){o.findAndReplace(t.selection.current()||t.editor.firstChild,o.queryInput.value),e.updateCounters(),i.preventDefault(),i.stopImmediatePropagation();})).on([o.nextButton,o.prevButton],"click",(function(e){t.events.fire(o.nextButton===this?"searchNext":"searchPrevious"),e.preventDefault(),e.stopImmediatePropagation();})).on(this.queryInput,"keydown",this.jodit.async.debounce((function(o){switch(o.which){case r.KEY_ENTER:o.preventDefault(),o.stopImmediatePropagation(),t.events.fire("searchNext")&&e.close();break;default:e.updateCounters();}}),this.jodit.defaultTimeout)).on("beforeSetMode.search",(function(){e.close();})).on("keydown.search mousedown.search",(function(){e.selInfo&&(t.selection.removeMarkers(),e.selInfo=null),e.isOpened&&(e.current=e.jodit.selection.current(),e.updateCounters());})).on("searchNext.search searchPrevious.search",(function(){return o.findAndSelect(t.selection.current()||t.editor.firstChild,o.queryInput.value,"searchNext"===t.events.current[t.events.current.length-1])})).on("search.search",(function(e,o){void 0===o&&(o=!0),t.execCommand("search",e,o);})),t.registerCommand("search",{exec:function(e,i,n){return void 0===n&&(n=!0),o.findAndSelect(t.selection.current()||t.editor.firstChild,i||"",n),!1}}),t.registerCommand("openSearchDialog",{exec:function(){return o.open(),!1},hotkeys:["ctrl+f","cmd+f"]}),t.registerCommand("openReplaceDialog",{exec:function(){return t.options.readonly||o.open(!0),!1},hotkeys:["ctrl+h","cmd+h"]});}},e.prototype.beforeDestruct=function(t){var e;s.Dom.safeRemove(this.searchBox),null===(e=t.events)||void 0===e||e.off(".search");},e}(c.Plugin);e.search=u;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(10);i.Config.prototype.allowResizeX=!1,i.Config.prototype.allowResizeY=!0,e.size=function(t){var e=function(e){n.css(t.container,"height",e),t.options.saveHeightInStorage&&t.storage.set("height",e);},o=function(e){return n.css(t.container,"width",e)},i=function(e){return n.css(t.workplace,"height",e)};if("auto"!==t.options.height&&(t.options.allowResizeX||t.options.allowResizeY)){var r=t.create.div("jodit_editor_resize",'<a tabindex="-1" href="javascript:void(0)"></a>'),a={x:0,y:0,w:0,h:0},s=!1,l=t.async.throttle((function(i){s&&(t.options.allowResizeY&&e(a.h+i.clientY-a.y),t.options.allowResizeX&&o(a.w+i.clientX-a.x),u(),t.events.fire("resize"));}),t.defaultTimeout/10);t.events.on(r,"mousedown touchstart",(function(e){s=!0,a.x=e.clientX,a.y=e.clientY,a.w=t.container.offsetWidth,a.h=t.container.offsetHeight,t.lock(),t.events.on(t.ownerWindow,"mousemove touchmove",l),e.preventDefault();})).on(t.ownerWindow,"mouseup touchsend",(function(){s&&(s=!1,t.events.off(t.ownerWindow,"mousemove touchmove",l),t.unlock());})).on("afterInit",(function(){t.container.appendChild(r);})).on("toggleFullSize",(function(t){r.style.display=t?"none":"block";}));}var c=function(){return (t.options.toolbar?t.toolbar.container.offsetHeight:0)+(t.statusbar?t.statusbar.getHeight():0)},d=function(){if(t.container&&t.container.parentNode){var e=n.css(t.container,"minHeight")-c();[t.workplace,t.iframe,t.editor].map((function(o){var i=o===t.editor?e-2:e;o&&n.css(o,"minHeight",i),t.events.fire("setMinHeight",i);}));}},u=function(){t&&!t.isDestructed&&t.options&&!t.options.inline&&(d(),t.container&&("auto"!==t.options.height||t.isFullSize())&&i(t.container.offsetHeight-c()));},f=t.async.debounce(u,t.defaultTimeout);t.events.on("toggleFullSize",(function(e){e||"auto"!==t.options.height||(i("auto"),d());})).on("afterInit changePlace",(function(){t.options.inline||(n.css(t.editor,{minHeight:"100%"}),n.css(t.container,{minHeight:t.options.minHeight,minWidth:t.options.minWidth,maxWidth:t.options.maxWidth}));var i=t.options.height;if(t.options.saveHeightInStorage&&"auto"!==i){var r=t.storage.get("height");r&&(i=r);}t.options.inline||(e(i),o(t.options.width)),u();}),void 0,void 0,!0).on(window,"load",f).on("afterInit resize updateToolbar scroll afterResize",f);};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);o(187),i.__exportStar(o(188),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(2);i.Config.prototype.beautifyHTML=!0,i.Config.prototype.useAceEditor=!0,i.Config.prototype.sourceEditor="ace",i.Config.prototype.sourceEditorNativeOptions={showGutter:!0,theme:"ace/theme/idle_fingers",mode:"ace/mode/html",wrap:!0,highlightActiveLine:!0},i.Config.prototype.sourceEditorCDNUrlsJS=["https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.7/ace.js"],i.Config.prototype.beautifyHTMLCDNUrlsJS=["https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.10.2/beautify.min.js","https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.10.2/beautify-html.min.js"],i.Config.prototype.controls.source={mode:n.MODE_SPLIT,exec:function(t){t.toggleMode();},isActive:function(t){return t.getRealMode()===n.MODE_SOURCE},tooltip:"Change mode"};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(2),r=o(2),a=o(5),s=o(1),l=o(3),c=o(189),d=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.__lock=!1,e.__oldMirrorValue="",e.tempMarkerStart="{start-jodit-selection}",e.tempMarkerStartReg=/{start-jodit-selection}/g,e.tempMarkerEnd="{end-jodit-selection}",e.tempMarkerEndReg=/{end-jodit-selection}/g,e.selInfo=[],e.insertHTML=function(t){e.sourceEditor.insertRaw(t),e.toWYSIWYG();},e.fromWYSIWYG=function(t){if(void 0===t&&(t=!1),!e.__lock||!0===t){e.__lock=!0;var o=e.jodit.getEditorValue(!1);o!==e.getMirrorValue()&&e.setMirrorValue(o),e.__lock=!1;}},e.toWYSIWYG=function(){if(!e.__lock){var t=e.getMirrorValue();t!==e.__oldMirrorValue&&(e.__lock=!0,e.jodit.setEditorValue(t),e.__lock=!1,e.__oldMirrorValue=t);}},e.getNormalPosition=function(t,e){for(var o=t;o>0;){if("<"===e[--o]&&void 0!==e[o+1]&&e[o+1].match(/[\w\/]+/i))return o;if(">"===e[o])return t}return t},e.__clear=function(t){return t.replace(n.INVISIBLE_SPACE_REG_EXP,"")},e.selectAll=function(){e.sourceEditor.selectAll();},e.onSelectAll=function(t){if("selectall"===t.toLowerCase()&&e.jodit.getRealMode()===r.MODE_SOURCE)return e.selectAll(),!1},e.getSelectionStart=function(){return e.sourceEditor.getSelectionStart()},e.getSelectionEnd=function(){return e.sourceEditor.getSelectionEnd()},e.saveSelection=function(){if(e.jodit.getRealMode()===n.MODE_WYSIWYG)e.selInfo=e.jodit.selection.save()||[],e.jodit.setEditorValue(),e.fromWYSIWYG(!0);else {e.selInfo.length=0;var t=e.getMirrorValue();if(e.getSelectionStart()===e.getSelectionEnd()){var o=e.jodit.selection.marker(!0);e.selInfo[0]={startId:o.id,collapsed:!0,startMarker:o.outerHTML};var i=e.getNormalPosition(e.getSelectionStart(),e.getMirrorValue());e.setMirrorValue(t.substr(0,i)+e.__clear(e.selInfo[0].startMarker)+t.substr(i));}else {var r=e.jodit.selection.marker(!0),a=e.jodit.selection.marker(!1);e.selInfo[0]={startId:r.id,endId:a.id,collapsed:!1,startMarker:e.__clear(r.outerHTML),endMarker:e.__clear(a.outerHTML)},i=e.getNormalPosition(e.getSelectionStart(),t);var s=e.getNormalPosition(e.getSelectionEnd(),t);e.setMirrorValue(t.substr(0,i)+e.selInfo[0].startMarker+t.substr(i,s-i)+e.selInfo[0].endMarker+t.substr(s));}e.toWYSIWYG();}},e.restoreSelection=function(){if(e.selInfo.length){if(e.jodit.getRealMode()===n.MODE_WYSIWYG)return e.__lock=!0,e.jodit.selection.restore(e.selInfo),void(e.__lock=!1);var t=e.getMirrorValue(),o=0,i=0;try{if(e.selInfo[0].startMarker&&(t=t.replace(/<span[^>]+data-jodit_selection_marker="start"[^>]*>[<>]*?<\/span>/gim,e.tempMarkerStart)),e.selInfo[0].endMarker&&(t=t.replace(/<span[^>]+data-jodit_selection_marker="end"[^>]*>[<>]*?<\/span>/gim,e.tempMarkerEnd)),e.jodit.options.beautifyHTML){var r=e.jodit.events.fire("beautifyHTML",t);l.isString(r)&&(t=r);}i=o=t.indexOf(e.tempMarkerStart),t=t.replace(e.tempMarkerStartReg,""),e.selInfo[0].collapsed&&-1!==o||(i=t.indexOf(e.tempMarkerEnd),-1===o&&(o=i)),t=t.replace(e.tempMarkerEndReg,"");}finally{t=t.replace(e.tempMarkerEndReg,"").replace(e.tempMarkerStartReg,"");}e.setMirrorValue(t),e.setMirrorSelectionRange(o,i),e.toWYSIWYG(),e.setFocusToMirror();}},e.setMirrorSelectionRange=function(t,o){e.sourceEditor.setSelectionRange(t,o);},e.onReadonlyReact=function(){e.sourceEditor.setReadOnly(e.jodit.options.readonly);},e}return i.__extends(e,t),e.prototype.getMirrorValue=function(){return this.sourceEditor.getValue()},e.prototype.setMirrorValue=function(t){this.sourceEditor.setValue(t);},e.prototype.setFocusToMirror=function(){this.sourceEditor.focus();},e.prototype.initSourceEditor=function(t){var e=this;if("area"!==t.options.sourceEditor){var o=c.createSourceEditor(t.options.sourceEditor,t,this.mirrorContainer,this.toWYSIWYG,this.fromWYSIWYG);o.onReadyAlways((function(){var i,n;null===(i=e.sourceEditor)||void 0===i||i.destruct(),e.sourceEditor=o,null===(n=t.events)||void 0===n||n.fire("sourceEditorReady",t);}));}else this.sourceEditor.onReadyAlways((function(){var e;null===(e=t.events)||void 0===e||e.fire("sourceEditorReady",t);}));},e.prototype.afterInit=function(t){var e=this;if(this.mirrorContainer=t.create.div("jodit_source"),t.workplace.appendChild(this.mirrorContainer),t.events.on("afterAddPlace changePlace afterInit",(function(){t.workplace.appendChild(e.mirrorContainer);})),this.sourceEditor=c.createSourceEditor("area",t,this.mirrorContainer,this.toWYSIWYG,this.fromWYSIWYG),t.events.off("beforeSetMode.source afterSetMode.source").on("beforeSetMode.source",e.saveSelection).on("afterSetMode.source",e.restoreSelection),this.onReadonlyReact(),t.events.on("insertHTML.source",(function(o){if(!t.options.readonly&&!e.jodit.isEditorMode())return e.insertHTML(o),!1})).on("readonly.source",this.onReadonlyReact).on("placeholder.source",(function(t){e.sourceEditor.setPlaceHolder(t);})).on("beforeCommand.source",this.onSelectAll).on("change.source",this.fromWYSIWYG),t.events.on("beautifyHTML",(function(t){return t})),t.options.beautifyHTML){var o=function(){var e,o,i=t.ownerWindow.html_beautify;return !(!i||t.isInDestruct||(null===(o=null===(e=t.events)||void 0===e?void 0:e.off("beautifyHTML"))||void 0===o||o.on("beautifyHTML",(function(t){return i(t)})),0))};o()||l.loadNext(t,t.options.beautifyHTMLCDNUrlsJS).then(o);}this.fromWYSIWYG(),this.initSourceEditor(t);},e.prototype.beforeDestruct=function(t){this.sourceEditor&&(this.sourceEditor.destruct(),delete this.sourceEditor),s.Dom.safeRemove(this.mirrorContainer);},e}(a.Plugin);e.source=d;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(190);e.createSourceEditor=function(t,e,o,n,r){var a;switch(t){case"ace":a=new i.AceEditor(e,o,n,r);break;default:a=new i.TextAreaEditor(e,o,n,r);}return a.init(e),a.onReadyAlways((function(){a.setReadOnly(e.options.readonly);})),a};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0);i.__exportStar(o(191),e),i.__exportStar(o(192),e);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(3),r=o(21),a=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.autosize=e.jodit.async.debounce((function(){e.instance.style.height="auto",e.instance.style.height=e.instance.scrollHeight+"px";}),e.jodit.defaultTimeout),e}return i.__extends(e,t),e.prototype.init=function(t){var e=this;this.instance=t.create.element("textarea",{class:"jodit_source_mirror"}),this.container.appendChild(this.instance),t.events.on(this.instance,"mousedown keydown touchstart input",t.async.debounce(this.toWYSIWYG,t.defaultTimeout)).on("setMinHeight.source",(function(t){n.css(e.instance,"minHeight",t);})).on(this.instance,"change keydown mousedown touchstart input",this.autosize).on("afterSetMode.source",this.autosize).on(this.instance,"mousedown focus",(function(e){t.events.fire(e.type,e);})),this.autosize(),this.onReady();},e.prototype.destruct=function(){r.Dom.safeRemove(this.instance);},e.prototype.getValue=function(){return this.instance.value},e.prototype.setValue=function(t){this.instance.value=t;},e.prototype.insertRaw=function(t){var e=this.getValue();if(0>this.getSelectionStart())this.setValue(e+t);else {var o=this.getSelectionStart(),i=this.getSelectionEnd();this.setValue(e.substring(0,o)+t+e.substring(i,e.length));}},e.prototype.getSelectionStart=function(){return this.instance.selectionStart},e.prototype.getSelectionEnd=function(){return this.instance.selectionEnd},e.prototype.setSelectionRange=function(t,e){this.instance.setSelectionRange(t,e);},e.prototype.focus=function(){this.instance.focus();},e.prototype.setPlaceHolder=function(t){this.instance.setAttribute("placeholder",t);},e.prototype.setReadOnly=function(t){t?this.instance.setAttribute("readonly","true"):this.instance.removeAttribute("readonly");},e.prototype.selectAll=function(){this.instance.select();},e}(o(72).SourceEditor);e.TextAreaEditor=a;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(2),r=o(3),a=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.className="jodit_ace_editor",e.proxyOnFocus=function(t){e.jodit.events.fire("focus",t);},e.proxyOnMouseDown=function(t){e.jodit.events.fire("mousedown",t);},e}return i.__extends(e,t),e.prototype.aceExists=function(){return void 0!==this.jodit.ownerWindow.ace},Object.defineProperty(e.prototype,"undoManager",{get:function(){return this.instance?this.instance.getSession().getUndoManager():null},enumerable:!0,configurable:!0}),e.prototype.updateButtons=function(){this.undoManager&&this.jodit.getRealMode()===n.MODE_SOURCE&&(this.jodit.events.fire("canRedo",this.undoManager.hasRedo()),this.jodit.events.fire("canUndo",this.undoManager.hasUndo()));},e.prototype.getLastColumnIndex=function(t){return this.instance.session.getLine(t).length},e.prototype.getLastColumnIndices=function(){for(var t=this.instance.session.getLength(),e=[],o=0,i=0;t>i;i++)o+=this.getLastColumnIndex(i),i>0&&(o+=1),e[i]=o;return e},e.prototype.getRowColumnIndices=function(t){var e=this.getLastColumnIndices();if(e[0]>=t)return {row:0,column:t};for(var o=1,i=1;e.length>i;i++)t>e[i]&&(o=i+1);return {row:o,column:t-e[o-1]-1}},e.prototype.setSelectionRangeIndices=function(t,e){var o=this.getRowColumnIndices(t),i=this.getRowColumnIndices(e);this.instance.getSelection().setSelectionRange({start:o,end:i});},e.prototype.getIndexByRowColumn=function(t,e){return this.getLastColumnIndices()[t]-this.getLastColumnIndex(t)+e},e.prototype.init=function(t){var e=this,o=function(){if(void 0===e.instance&&e.aceExists()){var o=e.jodit.create.div("jodit_source_mirror-fake");e.container.appendChild(o),e.instance=t.ownerWindow.ace.edit(o),e.instance.setTheme(t.options.sourceEditorNativeOptions.theme),e.instance.renderer.setShowGutter(t.options.sourceEditorNativeOptions.showGutter),e.instance.getSession().setMode(t.options.sourceEditorNativeOptions.mode),e.instance.setHighlightActiveLine(t.options.sourceEditorNativeOptions.highlightActiveLine),e.instance.getSession().setUseWrapMode(!0),e.instance.setOption("indentedSoftWrap",!1),e.instance.setOption("wrap",t.options.sourceEditorNativeOptions.wrap),e.instance.getSession().setUseWorker(!1),e.instance.$blockScrolling=1/0,e.instance.on("change",e.toWYSIWYG),e.instance.on("focus",e.proxyOnFocus),e.instance.on("mousedown",e.proxyOnMouseDown),t.getRealMode()!==n.MODE_WYSIWYG&&e.setValue(e.getValue());var i=e.jodit.async.debounce((function(){t.isInDestruct||(e.instance.setOption("maxLines","auto"!==t.options.height?t.workplace.offsetHeight/e.instance.renderer.lineHeight:1/0),e.instance.resize());}),2*e.jodit.defaultTimeout);t.events.on("afterResize afterSetMode",i),i(),e.onReady();}};t.events.on("afterSetMode",(function(){t.getRealMode()!==n.MODE_SOURCE&&t.getMode()!==n.MODE_SPLIT||(e.fromWYSIWYG(),o());})).on("beforeCommand",(function(o){if(t.getRealMode()!==n.MODE_WYSIWYG&&("redo"===o||"undo"===o)&&e.undoManager)return e.undoManager["has"+o.substr(0,1).toUpperCase()+o.substr(1)]&&e.instance[o](),e.updateButtons(),!1})),o(),this.aceExists()||r.loadNext(t,t.options.sourceEditorCDNUrlsJS).then((function(){t.isInDestruct||o();}));},e.prototype.destruct=function(){var t,e;this.instance.off("change",this.toWYSIWYG),this.instance.off("focus",this.proxyOnFocus),this.instance.off("mousedown",this.proxyOnMouseDown),this.instance.destroy(),null===(e=null===(t=this.jodit)||void 0===t?void 0:t.events)||void 0===e||e.off("aceInited.source");},e.prototype.setValue=function(t){if(this.jodit.options.beautifyHTML){var e=this.jodit.events.fire("beautifyHTML",t);r.isString(e)&&(t=e);}this.instance.setValue(t),this.instance.clearSelection(),this.updateButtons();},e.prototype.getValue=function(){return this.instance.getValue()},e.prototype.setReadOnly=function(t){this.instance.setReadOnly(t);},e.prototype.focus=function(){this.instance.focus();},e.prototype.getSelectionStart=function(){var t=this.instance.selection.getRange();return this.getIndexByRowColumn(t.start.row,t.start.column)},e.prototype.getSelectionEnd=function(){var t=this.instance.selection.getRange();return this.getIndexByRowColumn(t.end.row,t.end.column)},e.prototype.selectAll=function(){this.instance.selection.selectAll();},e.prototype.insertRaw=function(t){var e=this.instance.selection.getCursor(),o=this.instance.session.insert(e,t);this.instance.selection.setRange({start:e,end:o},!1);},e.prototype.setSelectionRange=function(t,e){this.setSelectionRangeIndices(t,e);},e.prototype.setPlaceHolder=function(t){},e}(o(72).SourceEditor);e.AceEditor=a;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(5),s=o(1);n.Config.prototype.showCharsCounter=!0,n.Config.prototype.showWordsCounter=!0;var l=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.reInit=function(){e.jodit.options.showCharsCounter&&e.jodit.statusbar.append(e.charCounter,!0),e.jodit.options.showWordsCounter&&e.jodit.statusbar.append(e.wordCounter,!0),e.jodit.events.off("change keyup",e.calc).on("change keyup",e.calc),e.calc();},e.calc=e.jodit.async.throttle((function(){var t=e.jodit.text;e.jodit.options.showCharsCounter&&(e.charCounter.textContent=e.jodit.i18n("Chars: %d",t.replace(r.SPACE_REG_EXP,"").length)),e.jodit.options.showWordsCounter&&(e.wordCounter.textContent=e.jodit.i18n("Words: %d",t.replace(r.INVISIBLE_SPACE_REG_EXP,"").split(r.SPACE_REG_EXP).filter((function(t){return t.length})).length));}),e.jodit.defaultTimeout),e}return i.__extends(e,t),e.prototype.afterInit=function(){this.charCounter=this.jodit.create.span(),this.wordCounter=this.jodit.create.span(),this.jodit.events.on("afterInit changePlace afterAddPlace",this.reInit),this.reInit();},e.prototype.beforeDestruct=function(){s.Dom.safeRemove(this.charCounter),s.Dom.safeRemove(this.wordCounter),this.jodit.events.off("afterInit changePlace afterAddPlace",this.reInit),delete this.charCounter,delete this.wordCounter;},e}(a.Plugin);e.stat=l;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(5),s=o(10),l=o(19),c=o(1);n.Config.prototype.toolbarSticky=!0,n.Config.prototype.toolbarDisableStickyForMobile=!0,n.Config.prototype.toolbarStickyOffset=0;var d=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.isToolbarSticked=!1,e.createDummy=function(t){r.IS_IE&&!e.dummyBox&&(e.dummyBox=e.jodit.create.div(),e.dummyBox.classList.add("jodit_sticky-dummy_toolbar"),e.jodit.container.insertBefore(e.dummyBox,t));},e.addSticky=function(t){e.isToolbarSticked||(e.createDummy(t),e.jodit.container.classList.add("jodit_sticky"),e.isToolbarSticked=!0),s.css(t,{top:e.jodit.options.toolbarStickyOffset,width:e.jodit.container.offsetWidth}),r.IS_IE&&e.dummyBox&&s.css(e.dummyBox,{height:t.offsetHeight});},e.removeSticky=function(t){e.isToolbarSticked&&(s.css(t,{width:"",top:""}),e.jodit.container.classList.remove("jodit_sticky"),e.isToolbarSticked=!1);},e}return i.__extends(e,t),e.prototype.isMobile=function(){return this.jodit&&this.jodit.options&&this.jodit.container&&this.jodit.options.sizeSM>=this.jodit.container.offsetWidth},e.prototype.afterInit=function(t){var e=this;t.events.on(t.ownerWindow,"scroll wheel mousewheel resize",(function(){var o=t.ownerWindow.pageYOffset||t.ownerDocument.documentElement&&t.ownerDocument.documentElement.scrollTop||0,i=l.offset(t.container,t,t.ownerDocument,!0),n=t.getMode()===r.MODE_WYSIWYG&&o+t.options.toolbarStickyOffset>i.top&&i.top+i.height>o+t.options.toolbarStickyOffset&&!(t.options.toolbarDisableStickyForMobile&&e.isMobile());t.options.toolbarSticky&&!0===t.options.toolbar&&(n?e.addSticky(t.toolbar.getParentContainer()):e.removeSticky(t.toolbar.getParentContainer())),t.events.fire("toggleSticky",n);}));},e.prototype.beforeDestruct=function(t){this.dummyBox&&c.Dom.safeRemove(this.dummyBox);},e}(a.Plugin);e.sticky=d;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(2),r=o(12),a=o(21);i.Config.prototype.usePopupForSpecialCharacters=!1,i.Config.prototype.specialCharacters=["!","&quot;","#","$","%","&amp;","'","(",")","*","+","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","&lt;","=","&gt;","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","[","]","^","_","`","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","{","|","}","~","&euro;","&lsquo;","&rsquo;","&ldquo;","&rdquo;","&ndash;","&mdash;","&iexcl;","&cent;","&pound;","&curren;","&yen;","&brvbar;","&sect;","&uml;","&copy;","&ordf;","&laquo;","&raquo;","&not;","&reg;","&macr;","&deg;","&sup2;","&sup3;","&acute;","&micro;","&para;","&middot;","&cedil;","&sup1;","&ordm;","&frac14;","&frac12;","&frac34;","&iquest;","&Agrave;","&Aacute;","&Acirc;","&Atilde;","&Auml;","&Aring;","&AElig;","&Ccedil;","&Egrave;","&Eacute;","&Ecirc;","&Euml;","&Igrave;","&Iacute;","&Icirc;","&Iuml;","&ETH;","&Ntilde;","&Ograve;","&Oacute;","&Ocirc;","&Otilde;","&Ouml;","&times;","&Oslash;","&Ugrave;","&Uacute;","&Ucirc;","&Uuml;","&Yacute;","&THORN;","&szlig;","&agrave;","&aacute;","&acirc;","&atilde;","&auml;","&aring;","&aelig;","&ccedil;","&egrave;","&eacute;","&ecirc;","&euml;","&igrave;","&iacute;","&icirc;","&iuml;","&eth;","&ntilde;","&ograve;","&oacute;","&ocirc;","&otilde;","&ouml;","&divide;","&oslash;","&ugrave;","&uacute;","&ucirc;","&uuml;","&yacute;","&thorn;","&yuml;","&OElig;","&oelig;","&#372;","&#374","&#373","&#375;","&sbquo;","&#8219;","&bdquo;","&hellip;","&trade;","&#9658;","&bull;","&rarr;","&rArr;","&hArr;","&diams;","&asymp;"],i.Config.prototype.controls.symbol={icon:"omega",hotkeys:["ctrl+shift+i","cmd+shift+i"],tooltip:"Insert Special Character",popup:function(t,e,o,i){var n=t.events.fire("generateSpecialCharactersTable.symbols");if(n){if(t.options.usePopupForSpecialCharacters){var a=t.create.div();return a.classList.add("jodit_symbols"),a.appendChild(n),t.events.on(n,"close_dialog",i),a}var s=r.Alert(n,t.i18n("Select Special Character"),void 0,"jodit_symbols"),l=n.querySelector("a");l&&l.focus(),t.events.on("beforeDestruct",(function(){s&&s.close();}));}}},e.symbols=function(t){var e=this;this.countInRow=17,t.events.on("generateSpecialCharactersTable.symbols",(function(){for(var o=t.create.fromHTML('<div class="jodit_symbols-container"><div class="jodit_symbols-container_table"><table><tbody></tbody></table></div><div class="jodit_symbols-container_preview"><div class="jodit_symbols-preview"></div></div></div>'),i=o.querySelector(".jodit_symbols-preview"),r=o.querySelector("table").tBodies[0],s=[],l=0;t.options.specialCharacters.length>l;){for(var c=t.create.element("tr"),d=0;e.countInRow>d&&t.options.specialCharacters.length>l;d+=1,l+=1){var u=t.create.element("td"),f=t.create.fromHTML('<a\n\t\t\t\t\t\t\t\t\t\t\tdata-index="'+l+'"\n\t\t\t\t\t\t\t\t\t\t\tdata-index-j="'+d+'"\n\t\t\t\t\t\t\t\t\t\t\thref="javascript:void(0)"\n\t\t\t\t\t\t\t\t\t\t\trole="option"\n\t\t\t\t\t\t\t\t\t\t\ttabindex="-1"\n\t\t\t\t\t\t\t\t\t>'+t.options.specialCharacters[l]+"</a>");s.push(f),u.appendChild(f),c.appendChild(u);}r.appendChild(c);}var p=e;return t.events.on(s,"focus",(function(){i.innerHTML=this.innerHTML;})).on(s,"mousedown",(function(e){a.Dom.isTag(this,"a")&&(t.selection.focus(),t.selection.insertHTML(this.innerHTML),t.events.fire(this,"close_dialog"),e&&e.preventDefault(),e&&e.stopImmediatePropagation());})).on(s,"mouseenter",(function(){a.Dom.isTag(this,"a")&&this.focus();})).on(s,"keydown",(function(e){var o=e.target;if(a.Dom.isTag(o,"a")){var i=parseInt(o.getAttribute("data-index")||"0",10),r=parseInt(o.getAttribute("data-index-j")||"0",10),l=void 0;switch(e.which){case n.KEY_UP:case n.KEY_DOWN:void 0===s[l=e.which===n.KEY_UP?i-p.countInRow:i+p.countInRow]&&(l=e.which===n.KEY_UP?Math.floor(s.length/p.countInRow)*p.countInRow+r:r)>s.length-1&&(l-=p.countInRow),s[l]&&s[l].focus();break;case n.KEY_RIGHT:case n.KEY_LEFT:void 0===s[l=e.which===n.KEY_LEFT?i-1:i+1]&&(l=e.which===n.KEY_LEFT?s.length-1:0),s[l]&&s[l].focus();break;case n.KEY_ENTER:t.events.fire(o,"mousedown"),e.stopImmediatePropagation(),e.preventDefault();}}})),o}));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(2),n=o(1),r=o(29);e.tableKeyboardNavigation=function(t){t.events.off(".tableKeyboardNavigation").on("keydown.tableKeyboardNavigation",(function(e){var o,a;if((e.which===i.KEY_TAB||e.which===i.KEY_LEFT||e.which===i.KEY_RIGHT||e.which===i.KEY_UP||e.which===i.KEY_DOWN)&&(o=t.selection.current(),a=n.Dom.up(o,(function(t){return t&&t.nodeName&&/^td|th$/i.test(t.nodeName)}),t.editor))){var s=t.selection.range;if(e.which===i.KEY_TAB||o===a||(e.which!==i.KEY_LEFT&&e.which!==i.KEY_UP||!(n.Dom.prev(o,(function(t){return e.which===i.KEY_UP?n.Dom.isTag(t,"br"):!!t}),a)||e.which!==i.KEY_UP&&n.Dom.isText(o)&&0!==s.startOffset))&&(e.which!==i.KEY_RIGHT&&e.which!==i.KEY_DOWN||!(n.Dom.next(o,(function(t){return e.which===i.KEY_DOWN?n.Dom.isTag(t,"br"):!!t}),a)||e.which!==i.KEY_DOWN&&n.Dom.isText(o)&&o.nodeValue&&s.startOffset!==o.nodeValue.length))){var l=n.Dom.up(a,(function(t){return t&&/^table$/i.test(t.nodeName)}),t.editor),c=null;switch(e.which){case i.KEY_TAB:case i.KEY_LEFT:var d=e.which===i.KEY_LEFT||e.shiftKey?"prev":"next";(c=n.Dom[d](a,(function(t){return t&&/^td|th$/i.test(t.tagName)}),l))||(r.Table.appendRow(l,"next"!==d&&l.querySelector("tr"),"next"===d,t.create.inside),c=n.Dom[d](a,(function(e){return e&&n.Dom.isCell(e,t.editorWindow)}),l));break;case i.KEY_UP:case i.KEY_DOWN:var u=0,f=0,p=r.Table.formalMatrix(l,(function(t,e,o){t===a&&(u=e,f=o);}));e.which===i.KEY_UP?void 0!==p[u-1]&&(c=p[u-1][f]):void 0!==p[u+1]&&(c=p[u+1][f]);}if(c){if(c.firstChild)e.which===i.KEY_TAB?t.selection.select(c,!0):t.selection.setCursorIn(c,e.which===i.KEY_RIGHT||e.which===i.KEY_DOWN);else {var h=t.create.inside.element("br");c.appendChild(h),t.selection.setCursorBefore(h);}return !1}}}}));};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(5),s=o(1),l=o(29),c=o(3),d=o(71);n.Config.prototype.useTableProcessor=!0,n.Config.prototype.useExtraClassesOptions=!0,n.Config.prototype.controls.table={data:{cols:10,rows:10,classList:{"table table-bordered":"Bootstrap Bordered","table table-striped":"Bootstrap Striped","table table-dark":"Bootstrap Dark"}},popup:function(t,e,o,i,n){var r=o.data&&o.data.rows?o.data.rows:10,a=o.data&&o.data.cols?o.data.cols:10,l=t.create.fromHTML('<form class="jodit_form jodit_form_inserter"><label class="jodit_form_center"><span>1</span> &times; <span>1</span></label><div class="jodit_form-table-creator-box"><div class="jodit_form-container"></div><div class="jodit_form-options">'+function(){if(!t.options.useExtraClassesOptions)return "";var e=[];if(o.data){var i=o.data.classList;Object.keys(i).forEach((function(t){e.push('<label class="jodit_vertical_middle"><input class="jodit_checkbox" value="'+t+'" type="checkbox"/>'+i[t]+"</label>");}));}return e.join("")}()+"</div></div></form>"),d=l.querySelectorAll("span")[0],u=l.querySelectorAll("span")[1],f=l.querySelector(".jodit_form-container"),p=l.querySelector(".jodit_form-table-creator-box"),h=l.querySelector(".jodit_form-options"),v=[];return f.addEventListener("mousemove",(function(t,e){var o=t.target;if(s.Dom.isTag(o,"div")){for(var i=void 0===e||isNaN(e)?parseInt(o.getAttribute("data-index")||"0",10):e||0,n=Math.ceil((i+1)/a),r=i%a+1,l=0;v.length>l;l+=1)v[l].className=l%a+1>r||n<Math.ceil((l+1)/a)?"":"hovered";u.textContent=r.toString(),d.textContent=n.toString();}})),t.events.on(f,"touchstart mousedown",(function(e){var o=e.target;if(e.preventDefault(),e.stopImmediatePropagation(),s.Dom.isTag(o,"div")){var n=parseInt(o.getAttribute("data-index")||"0",10),r=Math.ceil((n+1)/a),l=n%a+1,d=t.create.inside,u=d.element("tbody"),f=d.element("table");f.appendChild(u),f.style.width="100%";for(var p,v,m=null,g=1;r>=g;g+=1){p=d.element("tr");for(var b=1;l>=b;b+=1)v=d.element("td"),m||(m=v),v.appendChild(d.element("br")),p.appendChild(d.text("\n")),p.appendChild(d.text("\t")),p.appendChild(v);u.appendChild(d.text("\n")),u.appendChild(p);}var y=t.selection.current();if(y&&t.selection.isCollapsed()){var _=s.Dom.closest(y,(function(e){return s.Dom.isBlock(e,t.editorWindow)}),t.editor);_&&_!==t.editor&&!_.nodeName.match(/^TD|TH|TBODY|TABLE|THEADER|TFOOTER$/)&&t.selection.setCursorAfter(_);}c.$$("input[type=checkbox]:checked",h).forEach((function(t){t.value.split(/[\s]+/).forEach((function(t){f.classList.add(t);}));})),t.selection.insertNode(d.text("\n")),t.selection.insertNode(f,!1),m&&(t.selection.setCursorIn(m),c.scrollIntoView(m,t.editor,t.editorDocument)),i();}})),n&&n.parentToolbar&&t.events.off(n.parentToolbar.container,"afterOpenPopup.tableGenerator").on(n.parentToolbar.container,"afterOpenPopup.tableGenerator",(function(){!function(e){var o=e*a;if(v.length>o){for(var i=o;v.length>i;i+=1)s.Dom.safeRemove(v[i]),delete v[i];v.length=o;}for(i=0;o>i;i+=1)if(!v[i]){var n=t.create.div();n.setAttribute("data-index",i.toString()),v.push(n);}v.forEach((function(t){f.appendChild(t);}));var r=(v[0].offsetWidth||18)*a;f.style.width=r+"px",p.style.width=r+h.offsetWidth+1+"px";}(r),v[0]&&(v[0].className="hovered");}),"",!0),l},tooltip:"Insert table"};var u=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.isCell=function(t){return s.Dom.isHTMLElement(t,e.jodit.editorWindow)&&s.Dom.isTag(t,"td")||s.Dom.isTag(t,"th")},e.key="table_processor_observer",e.selectMode=!1,e.resizeDelta=0,e.createResizeHandle=function(){e.resizeHandler||(e.resizeHandler=e.jodit.create.div("jodit_table_resizer"),e.jodit.events.on(e.resizeHandler,"mousedown.table touchstart.table",e.onHandleMouseDown.bind(e)).on(e.resizeHandler,"mouseenter.table",(function(){e.jodit.async.clearTimeout(e.hideTimeout);})));},e.hideTimeout=0,e.drag=!1,e.minX=0,e.maxX=0,e.startX=0,e.onMouseMove=function(t){if(e.drag){var o=t.clientX,i=c.offset(e.resizeHandler.parentNode||e.jodit.ownerDocument.documentElement,e.jodit,e.jodit.ownerDocument,!0);e.minX>o&&(o=e.minX),o>e.maxX&&(o=e.maxX),e.resizeDelta=o-e.startX+(e.jodit.options.iframe?i.left:0),e.resizeHandler.style.left=o-(e.jodit.options.iframe?0:i.left)+"px";var n=e.jodit.selection.sel;n&&n.removeAllRanges(),t.preventDefault&&t.preventDefault();}},e.onMouseUp=function(){(e.selectMode||e.drag)&&(e.selectMode=!1,e.jodit.unlock()),e.resizeHandler&&e.drag&&(e.drag=!1,e.jodit.events.off(e.jodit.editorWindow,"mousemove.table touchmove.table",e.onMouseMove),e.resizeHandler.classList.remove("jodit_table_resizer-moved"),null===e.wholeTable?e.resizeColumns():e.resizeTable(),e.jodit.setEditorValue(),e.jodit.selection.focus());},e.onExecCommand=function(t){if(/table(splitv|splitg|merge|empty|bin|binrow|bincolumn|addcolumn|addrow)/.test(t)){t=t.replace("table","");var o=l.Table.getAllSelectedCells(e.jodit.editor);if(o.length){var i=o.shift();if(!i)return;var n=s.Dom.closest(i,"table",e.jodit.editor);switch(t){case"splitv":l.Table.splitVertical(n,e.jodit.create.inside);break;case"splitg":l.Table.splitHorizontal(n,e.jodit.create.inside);break;case"merge":l.Table.mergeSelected(n);break;case"empty":l.Table.getAllSelectedCells(e.jodit.editor).forEach((function(t){return t.innerHTML=""}));break;case"bin":s.Dom.safeRemove(n);break;case"binrow":l.Table.removeRow(n,i.parentNode.rowIndex);break;case"bincolumn":l.Table.removeColumn(n,i.cellIndex);break;case"addcolumnafter":case"addcolumnbefore":l.Table.appendColumn(n,i.cellIndex,"addcolumnafter"===t,e.jodit.create.inside);break;case"addrowafter":case"addrowbefore":l.Table.appendRow(n,i.parentNode,"addrowafter"===t,e.jodit.create.inside);}}return !1}},e}return i.__extends(e,t),Object.defineProperty(e.prototype,"isRTL",{get:function(){return "rtl"===this.jodit.options.direction},enumerable:!0,configurable:!0}),e.prototype.showResizeHandle=function(){this.jodit.async.clearTimeout(this.hideTimeout),this.jodit.workplace.appendChild(this.resizeHandler);},e.prototype.hideResizeHandle=function(){var t=this;this.hideTimeout=this.jodit.async.setTimeout((function(){s.Dom.safeRemove(t.resizeHandler);}),{timeout:this.jodit.defaultTimeout,label:"hideResizer"});},e.prototype.onHandleMouseDown=function(t){var e=this;this.drag=!0,this.jodit.events.on(this.jodit.editorWindow,"mousemove.table touchmove.table",this.onMouseMove),this.startX=t.clientX,this.jodit.lock(this.key),this.resizeHandler.classList.add("jodit_table_resizer-moved");var o,i=this.workTable.getBoundingClientRect();if(this.minX=0,this.maxX=1e6,null!==this.wholeTable)i=this.workTable.parentNode.getBoundingClientRect(),this.minX=i.left,this.maxX=this.minX+i.width;else {var n=l.Table.formalCoordinate(this.workTable,this.workCell,!0);l.Table.formalMatrix(this.workTable,(function(t,i,a){n[1]===a&&(o=t.getBoundingClientRect(),e.minX=Math.max(o.left+r.NEARBY/2,e.minX)),n[1]+(e.isRTL?-1:1)===a&&(o=t.getBoundingClientRect(),e.maxX=Math.min(o.left+o.width-r.NEARBY/2,e.maxX));}));}return !1},e.prototype.resizeColumns=function(){var t=this.resizeDelta,e=[];l.Table.setColumnWidthByDelta(this.workTable,l.Table.formalCoordinate(this.workTable,this.workCell,!0)[1],t,!0,e);var o=c.call(this.isRTL?s.Dom.prev:s.Dom.next,this.workCell,this.isCell,this.workCell.parentNode);l.Table.setColumnWidthByDelta(this.workTable,l.Table.formalCoordinate(this.workTable,o)[1],-t,!1,e);},e.prototype.resizeTable=function(){var t=this.resizeDelta*(this.isRTL?-1:1),e=this.workTable.offsetWidth,o=c.getContentWidth(this.workTable.parentNode,this.jodit.editorWindow),i=!this.wholeTable;if(this.isRTL?!i:i)this.workTable.style.width=(e+t)/o*100+"%";else {var n=this.isRTL?"marginRight":"marginLeft",r=parseInt(this.jodit.editorWindow.getComputedStyle(this.workTable)[n]||"0",10);this.workTable.style.width=(e-t)/o*100+"%",this.workTable.style[n]=(r+t)/o*100+"%";}},e.prototype.deSelectAll=function(t,e){var o=l.Table.getAllSelectedCells(t||this.jodit.editor);o.length&&o.forEach((function(t){e&&e===t||l.Table.restoreSelection(t);}));},e.prototype.setWorkCell=function(t,e){void 0===e&&(e=null),this.wholeTable=e,this.workCell=t,this.workTable=s.Dom.up(t,(function(t){return s.Dom.isTag(t,"table")}),this.jodit.editor);},e.prototype.calcHandlePosition=function(t,e,o,i){void 0===o&&(o=0),void 0===i&&(i=0);var n=c.offset(e,this.jodit,this.jodit.editorDocument);if(o>r.NEARBY&&n.width-r.NEARBY>o)this.hideResizeHandle();else {var a=c.offset(this.jodit.workplace,this.jodit,this.jodit.ownerDocument,!0),l=c.offset(t,this.jodit,this.jodit.editorDocument);if(this.resizeHandler.style.left=(o>r.NEARBY?n.left+n.width:n.left)-a.left+i+"px",Object.assign(this.resizeHandler.style,{height:l.height+"px",top:l.top-a.top+"px"}),this.showResizeHandle(),o>r.NEARBY){var d=c.call(this.isRTL?s.Dom.prev:s.Dom.next,e,this.isCell,e.parentNode);this.setWorkCell(e,!!d&&null);}else {var u=c.call(this.isRTL?s.Dom.next:s.Dom.prev,e,this.isCell,e.parentNode);u?this.setWorkCell(u):this.setWorkCell(e,!0);}}},e.prototype.afterInit=function(t){var e=this;t.options.useTableProcessor&&t.events.off(this.jodit.ownerWindow,".table").off(".table").on(this.jodit.ownerWindow,"mouseup.table touchend.table",this.onMouseUp).on(this.jodit.ownerWindow,"scroll.table",(function(){if(e.drag){var o=s.Dom.up(e.workCell,(function(t){return s.Dom.isTag(t,"table")}),t.editor);if(o){var i=o.getBoundingClientRect();e.resizeHandler.style.top=i.top+"px";}}})).on(this.jodit.ownerWindow,"mousedown.table touchend.table",(function(t){var o=s.Dom.closest(t.originalEvent.target,"TD|TH",e.jodit.editor),i=null;e.isCell(o)&&(i=s.Dom.closest(o,"table",e.jodit.editor)),i?e.deSelectAll(i,o instanceof e.jodit.editorWindow.HTMLTableCellElement&&o):e.deSelectAll();})).on("afterGetValueFromEditor.table",(function(t){var e=new RegExp("([s]*)"+r.JODIT_SELECTED_CELL_MARKER+'="1"',"g");e.test(t.value)&&(t.value=t.value.replace(e,""));})).on("change.table afterCommand.table afterSetMode.table",(function(){c.$$("table",t.editor).forEach((function(t){t[e.key]||e.observe(t);}));})).on("beforeSetMode.table",(function(){l.Table.getAllSelectedCells(t.editor).forEach((function(e){l.Table.restoreSelection(e),l.Table.normalizeTable(s.Dom.closest(e,"table",t.editor));}));})).on("keydown.table",(function(o){o.which===r.KEY_TAB&&c.$$("table",t.editor).forEach((function(t){e.deSelectAll(t);}));})).on("beforeCommand.table",this.onExecCommand.bind(this)).on("afterCommand.table",this.onAfterCommand.bind(this));},e.prototype.observe=function(t){var e,o=this;t[this.key]=!0,this.jodit.events.on(t,"mousedown.table touchstart.table",(function(i){if(!o.jodit.options.readonly){var n=s.Dom.up(i.target,o.isCell,t);n&&(n.firstChild||n.appendChild(o.jodit.create.inside.element("br")),e=n,l.Table.addSelected(n),o.selectMode=!0);}})).on(t,"mouseleave.table",(function(t){o.resizeHandler&&o.resizeHandler!==t.relatedTarget&&o.hideResizeHandle();})).on(t,"mousemove.table touchmove.table",(function(i){if(!o.jodit.options.readonly&&!o.drag&&!o.jodit.isLockedNotBy(o.key)){var n=s.Dom.up(i.target,o.isCell,t);if(n)if(o.selectMode){if(n!==e){o.jodit.lock(o.key);var r=o.jodit.selection.sel;r&&r.removeAllRanges(),i.preventDefault&&i.preventDefault();}o.deSelectAll(t);for(var a=l.Table.getSelectedBound(t,[n,e]),d=l.Table.formalMatrix(t),u=a[0][0];a[1][0]>=u;u+=1)for(var f=a[0][1];a[1][1]>=f;f+=1)l.Table.addSelected(d[u][f]);var p=d[a[1][0]][a[1][1]],h=d[a[0][0]][a[0][1]];o.jodit.events.fire("showPopup",t,(function(){var t=c.offset(h,o.jodit,o.jodit.editorDocument),e=c.offset(p,o.jodit,o.jodit.editorDocument);return {left:t.left,top:t.top,width:e.left-t.left+e.width,height:e.top-t.top+e.height}})),i.stopPropagation();}else o.calcHandlePosition(t,n,i.offsetX);}})),this.createResizeHandle();},e.prototype.onAfterCommand=function(t){var e=this;/^justify/.test(t)&&c.$$("[data-jodit-selected-cell]",this.jodit.editor).forEach((function(o){return d.alignElement(t,o,e.jodit)}));},e.prototype.beforeDestruct=function(t){t.events&&(t.events.off(this.jodit.ownerWindow,".table"),t.events.off(".table"));},e}(a.Plugin);e.TableProcessor=u;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(19),r=o(3),a=o(5),s=o(1),l=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.isOpened=!1,e}return i.__extends(e,t),e.prototype.afterInit=function(t){var e=this;this.container=t.create.div("jodit_tooltip"),this.jodit.ownerDocument.body.appendChild(this.container);var o=0;t.events.off(".tooltip").on("showTooltip.tooltip",(function(i,n){t.async.clearTimeout(o),e.open(i,n);})).on("hideTooltip.tooltip change.tooltip updateToolbar.tooltip scroll.tooltip changePlace.tooltip hidePopup.tooltip closeAllPopups.tooltip",(function(){o=t.async.setTimeout((function(){return e.close()}),e.jodit.defaultTimeout);}));},e.prototype.beforeDestruct=function(t){var e;null===(e=t)||void 0===e||e.events.off(".tooltip"),this.close(),s.Dom.safeRemove(this.container);},e.prototype.open=function(t,e){this.container.classList.add("jodit_tooltip_visible"),this.container.innerHTML=e,this.isOpened=!0,this.calcPosition(t);},e.prototype.calcPosition=function(t){var e=n.offset(t,this.jodit,this.jodit.ownerDocument,!0);r.css(this.container,{left:e.left-this.container.offsetWidth/2+e.width/2,top:e.top+e.height,position:null});},e.prototype.close=function(){this.isOpened&&(this.isOpened=!1,this.container.classList.remove("jodit_tooltip_visible"),r.css(this.container,{left:-5e3,position:"fixed"}));},e}(a.Plugin);e.tooltip=l;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(39),s=o(1),l=o(9),c=o(5),d=o(27),u=o(8);n.Config.prototype.controls.selectall={icon:"select-all",command:"selectall",tooltip:"Select all"},n.Config.prototype.showXPathInStatusbar=!0;var f=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.onContext=function(t,o){return e.menu||(e.menu=new a.ContextMenu(e.jodit)),e.menu.show(o.clientX,o.clientY,[{icon:"bin",title:t===e.jodit.editor?"Clear":"Remove",exec:function(){t!==e.jodit.editor?s.Dom.safeRemove(t):e.jodit.value="",e.jodit.setEditorValue();}},{icon:"select-all",title:"Select",exec:function(){e.jodit.selection.select(t);}}]),!1},e.onSelectPath=function(t,o){e.jodit.selection.focus();var i=o.target.getAttribute("data-path")||"/";if("/"===i)return e.jodit.execCommand("selectall"),!1;try{var n=e.jodit.editorDocument.evaluate(i,e.jodit.editor,null,XPathResult.ANY_TYPE,null).iterateNext();if(n)return e.jodit.selection.select(n),!1}catch(t){}return e.jodit.selection.select(t),!1},e.tpl=function(t,o,i,n){var r=e.jodit.create.fromHTML('<li><a role="button" data-path="'+o+'" href="javascript:void(0)" title="'+n+'" tabindex="-1"\'>'+u.trim(i)+"</a></li>"),a=r.firstChild;return e.jodit.events.on(a,"click",e.onSelectPath.bind(e,t)).on(a,"contextmenu",e.onContext.bind(e,t)),r},e.removeSelectAll=function(){e.selectAllButton&&(e.selectAllButton.destruct(),delete e.selectAllButton);},e.appendSelectAll=function(){e.removeSelectAll(),e.selectAllButton=new d.ToolbarButton(e.jodit,i.__assign({name:"selectall"},e.jodit.options.controls.selectall)),e.container&&e.container.insertBefore(e.selectAllButton.container,e.container.firstChild);},e.calcPathImd=function(){if(!e.isDestructed){var t,o,i,n=e.jodit.selection.current();e.container&&(e.container.innerHTML=r.INVISIBLE_SPACE),n&&s.Dom.up(n,(function(n){n&&e.jodit.editor!==n&&!s.Dom.isText(n)&&(t=n.nodeName.toLowerCase(),o=l.getXPathByElement(n,e.jodit.editor).replace(/^\//,""),i=e.tpl(n,o,t,e.jodit.i18n("Select %s",t)),e.container&&e.container.insertBefore(i,e.container.firstChild));}),e.jodit.editor),e.appendSelectAll();}},e.calcPath=e.jodit.async.debounce(e.calcPathImd,2*e.jodit.defaultTimeout),e.menu=null,e}return i.__extends(e,t),e.prototype.afterInit=function(){var t=this;this.jodit.options.showXPathInStatusbar&&(this.container=this.jodit.create.element("ul"),this.container.classList.add("jodit_xpath"),this.jodit.events.off(".xpath").on("mouseup.xpath change.xpath keydown.xpath changeSelection.xpath",this.calcPath).on("afterSetMode.xpath afterInit.xpath changePlace.xpath",(function(){t.jodit.options.showXPathInStatusbar&&(t.jodit.statusbar.append(t.container),t.jodit.getRealMode()===r.MODE_WYSIWYG?t.calcPath():(t.container&&(t.container.innerHTML=r.INVISIBLE_SPACE),t.appendSelectAll()));})),this.calcPath());},e.prototype.beforeDestruct=function(){this.jodit&&this.jodit.events&&this.jodit.events.off(".xpath"),this.removeSelectAll(),this.menu&&this.menu.destruct(),s.Dom.safeRemove(this.container),delete this.menu,delete this.container;},e}(c.Plugin);e.xpath=f;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(15),n=o(6);e.Alert=function(t,e,o,s){void 0===s&&(s="jodit_alert"),"function"==typeof e&&(o=e,e=void 0);var l=new i.Dialog,c=l.create.div(s),d=l.create.fromHTML('<a href="javascript:void(0)" style="float:right;" class="jodit_button">'+n.ToolbarIcon.getIcon("cancel")+"<span>"+l.i18n("Ok")+"</span></a>");return r.asArray(t).forEach((function(t){c.appendChild(a.Dom.isNode(t,l.window)?t:l.create.fromHTML(t));})),d.addEventListener("click",(function(){o&&"function"==typeof o&&!1===o(l)||l.close();})),l.setFooter([d]),l.open(c,e||"&nbsp;",!0,!0),d.focus(),l};var r=o(22),a=o(1);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(15),s=o(74),l=o(73),c=o(6),d=o(26),u=o(25),f=o(18),p=o(9),h=o(55),v=o(13),m=o(35);o(202);var g=o(1),b=o(12),y=o(203),_=o(205),w=o(206),j=o(47),S=o(40),C=o(3),x=o(75),k=S.ITEM_CLASS+"-active-true",E=function(t){function e(e,o){var i=t.call(this,e,o)||this;i.loader=i.create.div(S.F_CLASS+"_loader",S.ICON_LOADER),i.browser=i.create.div(S.F_CLASS+" non-selected"),i.status_line=i.create.div(S.F_CLASS+"_status"),i.tree=i.create.div(S.F_CLASS+"_tree"),i.files=i.create.div(S.F_CLASS+"_files"),i.state=_.ObserveObject.create({activeElements:[],elements:[],folders:[],view:"tiles",sortBy:"changed-desc",filterWord:"",onlyImages:!1}),i.errorHandler=function(t){t instanceof Error?i.status(i.i18n(t.message)):i.status(i.options.getMessage(t));},i.status=function(t,e){"string"!=typeof t&&(t=t.message),i.status_line.classList.remove("success"),i.status_line.classList.add("active");var o=i.create.div();o.textContent=t,i.status_line.appendChild(o),e&&i.status_line.classList.add("success"),i.async.setTimeout((function(){i.status_line.classList.remove("active"),g.Dom.detach(i.status_line);}),{timeout:i.options.howLongShowMsg,label:"fileBrowser.status"});},i.close=function(){i.dialog.close();},i.open=function(t,e){return void 0===e&&(e=!1),i.state.onlyImages=e,new Promise((function(e,o){if(!i.options.items||!i.options.items.url)throw C.error("Need set options.filebrowser.ajax.url");var n=0;i.events.off(i.files,"dblclick").on(i.files,"dblclick",i.onSelect(t),"a").on(i.files,"touchstart",(function(){var e=(new Date).getTime();r.EMULATE_DBLCLICK_TIMEOUT>e-n&&i.onSelect(t)(),n=e;}),"a").off("select.filebrowser").on("select.filebrowser",i.onSelect(t));var a=i.create.div();i.toolbar.build(i.options.buttons,a),i.dialog.dialogbox_header.classList.add(S.F_CLASS+"_title_box"),i.dialog.open(i.browser,a),i.events.fire("sort.filebrowser",i.state.sortBy),i.loadTree().then(e,o);}))},i.openImageEditor=function(t,e,o,n,r,a){return i.getInstance("ImageEditor").open(t,(function(t,s,l,c){("resize"===s.action?i.dataProvider.resize(o,n,e,t,s.box):i.dataProvider.crop(o,n,e,t,s.box)).then((function(t){i.options.isSuccess(t)?i.loadTree().then((function(){l(),r&&r();})):(c(C.error(i.options.getMessage(t))),a&&a(C.error(i.options.getMessage(t))));})).catch((function(t){c(t),a&&a(t);}));}))},i.elementsMap={};var s=i,l=e?e.ownerDocument:document,c=e?e.editorDocument:l;e&&(i.id=e.id),s.options=new n.OptionsDefault(v.extend(!0,{},s.options,n.Config.defaultOptions.filebrowser,o,e?e.options.filebrowser:void 0)),s.storage=d.Storage.makeStorage(i.options.filebrowser.saveStateInStorage),s.dataProvider=x.makeDataProvider(s.jodit||s,s.options),s.dialog=new a.Dialog(e||s,{fullsize:s.options.fullsize,buttons:["dialog.fullsize","dialog.close"]}),s.options.showFoldersPanel&&s.browser.appendChild(s.tree),s.browser.appendChild(s.files),s.browser.appendChild(s.status_line),i.initEventsListeners(),i.initNativeEventsListeners(),s.dialog.setSize(s.options.width,s.options.height),["getLocalFileByUrl","crop","resize","create","fileMove","folderMove","fileRename","folderRename","fileRemove","folderRemove","folder","items","permissions"].forEach((function(t){null!==i.options[t]&&(i.options[t]=v.extend(!0,{},i.options.ajax,i.options[t]));})),s.stateToView();var u=i.storage.get(S.F_CLASS+"_view");s.state.view=u&&null===i.options.view?"list"===u?"list":"tiles":"list"===s.options.view?"list":"tiles";var f=s.storage.get(S.F_CLASS+"_sortby");if(f){var h=f.split("-");s.state.sortBy=["changed","name","size"].includes(h[0])?f:"changed-desc";}else s.state.sortBy=s.options.sortBy||"changed-desc";return s.dataProvider.currentBaseUrl=p.$$("base",c).length?p.$$("base",c)[0].getAttribute("href")||"":location.protocol+"//"+location.host,s.initUploader(e),i}return i.__extends(e,t),Object.defineProperty(e.prototype,"defaultTimeout",{get:function(){return this.jodit&&this.jodit!==this?this.jodit.defaultTimeout:n.Config.defaultOptions.observer.timeout},enumerable:!0,configurable:!0}),e.prototype.loadItems=function(t,e){return void 0===t&&(t=this.dataProvider.currentPath),void 0===e&&(e=this.dataProvider.currentSource),i.__awaiter(this,void 0,Promise,(function(){var o=this;return i.__generator(this,(function(i){return this.files.classList.add("active"),this.files.appendChild(this.loader.cloneNode(!0)),[2,this.dataProvider.items(t,e).then((function(t){var e=o.options.items.process;if(e||(e=o.options.ajax.process),e){var i=e.call(self,t);o.generateItemsList(i.data.sources),o.state.activeElements=[];}})).catch((function(t){b.Alert(t.message),o.errorHandler(t);}))]}))}))},e.prototype.loadTree=function(){return i.__awaiter(this,void 0,Promise,(function(){var t,e,o,n,r,a=this;return i.__generator(this,(function(i){return t=this.dataProvider.currentPath,e=this.dataProvider.currentSource,o=function(t){throw t instanceof Error?t:o(t)},this.uploader&&(this.uploader.setPath(t),this.uploader.setSource(e)),this.tree.classList.add("active"),g.Dom.detach(this.tree),this.tree.appendChild(this.loader.cloneNode(!0)),this.options.showFoldersPanel?(n=this.dataProvider.tree(t,e).then((function(t){var e=a.options.folder.process;if(e||(e=a.options.ajax.process),e){var o=e.call(self,t);a.generateFolderTree(o.data.sources);}})).catch((function(t){a.errorHandler(o(a.jodit.i18n("Error on load folders"))),o(t);})),r=this.loadItems(t,e),[2,Promise.all([n,r]).catch(o)]):(this.tree.classList.remove("active"),[2])}))}))},e.prototype.deleteFile=function(t,e){return i.__awaiter(this,void 0,Promise,(function(){var o=this;return i.__generator(this,(function(i){return [2,this.dataProvider.fileRemove(this.dataProvider.currentPath,t,e).then((function(e){if(o.options.remove&&o.options.remove.process&&(e=o.options.remove.process.call(o,e)),!o.options.isSuccess(e))throw C.error(o.options.getMessage(e));o.status(o.options.getMessage(e)||o.i18n('File "%s" was deleted',t),!0);})).catch(this.status)]}))}))},e.prototype.generateFolderTree=function(t){var e=[];u.each(t,(function(t,o){o.folders.forEach((function(i){e.push({name:i,source:o,sourceName:t});}));})),this.state.folders=e;},e.prototype.generateItemsList=function(t){var e=this,o=[],n=this.state;u.each(t,(function(t,r){r.files&&r.files.length&&("function"==typeof e.options.sort&&r.files.sort((function(t,o){return e.options.sort(t,o,n.sortBy)})),r.files.forEach((function(a){(function(t){return !n.filterWord.length||void 0===e.options.filter||e.options.filter(t,n.filterWord)})(a)&&function(t){return !e.state.onlyImages||void 0===t.isImage||t.isImage}(a)&&o.push(w.FileBrowserItem.create(i.__assign(i.__assign({},a),{sourceName:t,source:r})));})));})),this.state.elements=o;},e.prototype.onSelect=function(t){var e=this;return function(){if(e.state.activeElements.length){var o=[],i=[];e.state.activeElements.forEach((function(t){var e=t.fileURL;e&&(o.push(e),i.push(t.isImage||!1));})),e.close();var n={baseurl:"",files:o,isImages:i};"function"!=typeof t?e.options.defaultCallback(e,n):t(n);}return !1}},e.prototype.isOpened=function(){return this.dialog.isOpened()&&"none"!==this.browser.style.display},e.prototype.elementToItem=function(t){return this.elementsMap[t.dataset.key||""].item},e.prototype.stateToView=function(){var t=this,e=this.state,o=this.files,i=this.create,n=this.options;e.on("beforeChange.activeElements",(function(){e.activeElements.forEach((function(e){var o=t.elementsMap[e.uniqueHashKey].elm;o&&o.classList.remove(k);}));})).on("change.activeElements",(function(){t.events.fire("changeSelection"),e.activeElements.forEach((function(e){var o=t.elementsMap[e.uniqueHashKey].elm;o&&o.classList.add(k);}));})).on("change.view",(function(){o.classList.remove(S.F_CLASS+"_files_view-tiles"),o.classList.remove(S.F_CLASS+"_files_view-list"),o.classList.add(S.F_CLASS+"_files_view-"+e.view),t.storage.set(S.F_CLASS+"_view",e.view);})).on("change.sortBy",(function(){t.storage.set(S.F_CLASS+"_sortby",e.sortBy);})).on("change.elements",this.async.debounce((function(){g.Dom.detach(o),e.elements.length?e.elements.forEach((function(e){t.files.appendChild(function(e){var o=e.uniqueHashKey;if(t.elementsMap[o])return t.elementsMap[o].elm;var r=i.fromHTML(n.getThumbTemplate.call(t,e,e.source,e.sourceName.toString()));return r.dataset.key=o,t.elementsMap[o]={item:e,elm:r},t.elementsMap[o].elm}(e));})):o.appendChild(i.div(S.F_CLASS+"_no_files",t.i18n("There are no files")));}),this.defaultTimeout)).on("change.folders",this.async.debounce((function(){g.Dom.detach(t.tree);var o="default",r=null,a=function(e,o,a){void 0===a&&(a=!1),e&&r&&(e!==r||a)&&n.createNewFolder&&t.dataProvider.canI("FolderCreate")&&(t.tree.appendChild(i.a("jodit_button addfolder",{href:"javascript:void(0)","data-path":f.normalizePath(e.path+"/"),"data-source":o},c.ToolbarIcon.getIcon("plus")+" "+t.i18n("Add folder"))),r=e);};e.folders.forEach((function(e){var s=e.name,l=e.source,d=e.sourceName;d&&d!==o&&(t.tree.appendChild(i.div(S.F_CLASS+"_source_title",d)),o=d);var u=i.a(S.F_CLASS+"_tree_item",{draggable:"draggable",href:"javascript:void(0)","data-path":f.normalizePath(l.path,s+"/"),"data-name":s,"data-source":d,"data-source-path":l.path},i.span(S.F_CLASS+"_tree_item_title",s));a(l,d),r=l,t.tree.appendChild(u),".."!==s&&"."!==s&&(n.deleteFolder&&t.dataProvider.canI("FolderRename")&&u.appendChild(i.element("i",{class:"jodit_icon_folder jodit_icon_folder_rename",title:t.i18n("Rename")},c.ToolbarIcon.getIcon("pencil"))),n.deleteFolder&&t.dataProvider.canI("FolderRemove")&&u.appendChild(i.element("i",{class:"jodit_icon_folder jodit_icon_folder_remove",title:t.i18n("Delete")},c.ToolbarIcon.getIcon("cancel"))));})),a(r,o,!0);}),this.defaultTimeout));},e.prototype.initEventsListeners=function(){var t=this,e=this.state,o=this;o.events.on("view.filebrowser",(function(t){t!==e.view&&(e.view=t);})).on("sort.filebrowser",(function(t){t!==e.sortBy&&(e.sortBy=t,o.loadItems());})).on("filter.filebrowser",(function(t){t!==e.filterWord&&(e.filterWord=t,o.loadItems());})).on("fileRemove.filebrowser",(function(){o.state.activeElements.length&&s.Confirm(o.i18n("Are you sure?"),"",(function(t){if(t){var e=[];o.state.activeElements.forEach((function(t){e.push(o.deleteFile(t.file||t.name||"",t.sourceName));})),o.state.activeElements=[],Promise.all(e).then((function(){return o.loadTree()}));}}));})).on("edit.filebrowser",(function(){if(1===o.state.activeElements.length){var e=t.state.activeElements[0];o.openImageEditor(e.fileURL,e.file||"",e.path,e.sourceName);}})).on("fileRename.filebrowser",(function(t,e,i){1===o.state.activeElements.length&&l.Prompt(o.i18n("Enter new name"),o.i18n("Rename"),(function(n){if(!j.isValidName(n))return o.status(o.i18n("Enter new name")),!1;o.dataProvider.fileRename(e,t,n,i).then((function(t){if(o.options.fileRename&&o.options.fileRename.process&&(t=o.options.fileRename.process.call(o,t)),!o.options.isSuccess(t))throw C.error(o.options.getMessage(t));o.state.activeElements=[],o.status(o.options.getMessage(t),!0),o.loadItems();})).catch(o.status);}),o.i18n("type name"),t);})).on("update.filebrowser",(function(){o.loadTree();}));},e.prototype.initNativeEventsListeners=function(){var t=this,e=!1,o=this;o.events.on(o.tree,"click",(function(t){var e=this.parentNode,i=e.getAttribute("data-path")||"";return s.Confirm(o.i18n("Are you sure?"),o.i18n("Delete"),(function(t){t&&o.dataProvider.folderRemove(i,e.getAttribute("data-name")||"",e.getAttribute("data-source")||"").then((function(t){if(o.options.folderRemove&&o.options.folderRemove.process&&(t=o.options.folderRemove.process.call(o,t)),!o.options.isSuccess(t))throw C.error(o.options.getMessage(t));o.state.activeElements=[],o.status(o.options.getMessage(t),!0),o.loadTree();})).catch(o.status);})),t.stopImmediatePropagation(),!1}),"a>.jodit_icon_folder_remove").on(o.tree,"click",(function(t){var e=this.parentNode,i=e.getAttribute("data-name")||"",n=e.getAttribute("data-source-path")||"";return l.Prompt(o.i18n("Enter new name"),o.i18n("Rename"),(function(t){if(!j.isValidName(t))return o.status(o.i18n("Enter new name")),!1;o.dataProvider.folderRename(n,e.getAttribute("data-name")||"",t,e.getAttribute("data-source")||"").then((function(t){if(o.options.folderRename&&o.options.folderRename.process&&(t=o.options.folderRename.process.call(o,t)),!o.options.isSuccess(t))throw C.error(o.options.getMessage(t));o.state.activeElements=[],o.status(o.options.getMessage(t),!0),o.loadTree();})).catch(o.status);}),o.i18n("type name"),i),t.stopImmediatePropagation(),!1}),"a>.jodit_icon_folder_rename").on(o.tree,"click",(function(){var t=this;this.classList.contains("addfolder")?l.Prompt(o.i18n("Enter Directory name"),o.i18n("Create directory"),(function(e){o.dataProvider.createFolder(e,t.getAttribute("data-path")||"",t.getAttribute("data-source")||"").then((function(t){return o.options.isSuccess(t)?o.loadTree():o.status(o.options.getMessage(t)),t}),o.status);}),o.i18n("type name")):(o.dataProvider.currentPath=this.getAttribute("data-path")||"",o.dataProvider.currentSource=this.getAttribute("data-source")||"",o.loadTree());}),"a").on(o.tree,"dragstart",(function(){o.options.moveFolder&&(e=this);}),"a").on(o.tree,"drop",(function(){if((o.options.moveFile||o.options.moveFolder)&&e){var t=e.getAttribute("data-path")||"";if(!o.options.moveFolder&&e.classList.contains(S.F_CLASS+"_tree_item"))return !1;if(e.classList.contains(S.ITEM_CLASS)&&(t+=e.getAttribute("data-name"),!o.options.moveFile))return !1;o.dataProvider.move(t,this.getAttribute("data-path")||"",this.getAttribute("data-source")||"",e.classList.contains(S.ITEM_CLASS)).then((function(t){o.options.isSuccess(t)?o.loadTree():o.status(o.options.getMessage(t));}),o.status),e=!1;}}),"a").on(o.files,"contextmenu",y.default(o),"a").on(o.files,"click",(function(e){h.ctrlKey(e)||(t.state.activeElements=[]);})).on(o.files,"click",(function(t){var e=o.elementToItem(this);if(e)return o.state.activeElements=h.ctrlKey(t)?i.__spreadArrays(o.state.activeElements,[e]):[e],t.stopPropagation(),!1}),"a").on(o.files,"dragstart",(function(){o.options.moveFile&&(e=this);}),"a").on(o.dialog.container,"drop",(function(t){return t.preventDefault()}));},e.prototype.initUploader=function(t){var e,o,r=this,a=this,s=v.extend(!0,{},n.Config.defaultOptions.uploader,a.options.uploader,i.__assign({},null===(o=null===(e=t)||void 0===e?void 0:e.options)||void 0===o?void 0:o.uploader)),l=function(){r.loadItems();};a.uploader=a.getInstance("Uploader",s),a.uploader.setPath(a.dataProvider.currentPath),a.uploader.setSource(a.dataProvider.currentSource),a.uploader.bind(a.browser,l,a.errorHandler),a.events.on("bindUploader.filebrowser",(function(t){a.uploader.bind(t,l,a.errorHandler);}));},e.prototype.destruct=function(){this.isInDestruct||(this.dialog.destruct(),delete this.dialog,this.events&&this.events.off(".filebrowser"),this.uploader&&this.uploader.destruct(),delete this.uploader,t.prototype.destruct.call(this));},e}(m.ViewWithToolbar);e.FileBrowser=E;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(4),n=o(6),r=o(3),a=o(40);i.Config.prototype.filebrowser={extraButtons:[],filter:function(t,e){return e=e.toLowerCase(),"string"==typeof t?-1!==t.toLowerCase().indexOf(e):"string"==typeof t.name?-1!==t.name.toLowerCase().indexOf(e):"string"!=typeof t.file||-1!==t.file.toLowerCase().indexOf(e)},sortBy:"changed-desc",sort:function(t,e,o){var i=o.toLowerCase().split("-"),n=i[0],a="asc"===i[1],s=function(t,e){return e>t?a?-1:1:t>e?a?1:-1:0};if("string"==typeof t)return s(t.toLowerCase(),e.toLowerCase());if(void 0===t[n]||"name"===n)return "string"==typeof t.name?s(t.name.toLowerCase(),e.name.toLowerCase()):"string"==typeof t.file?s(t.file.toLowerCase(),e.file.toLowerCase()):0;switch(n){case"changed":var l=new Date(t.changed).getTime(),c=new Date(e.changed).getTime();return a?l-c:c-l;case"size":return l=r.humanSizeToBytes(t.size),c=r.humanSizeToBytes(e.size),a?l-c:c-l}return 0},editImage:!0,preview:!0,showPreviewNavigation:!0,showSelectButtonInPreview:!0,contextMenu:!0,howLongShowMsg:3e3,createNewFolder:!0,deleteFolder:!0,moveFolder:!0,moveFile:!0,showFoldersPanel:!0,width:859,height:400,buttons:["filebrowser.upload","filebrowser.remove","filebrowser.update","filebrowser.select","filebrowser.edit","|","filebrowser.tiles","filebrowser.list","|","filebrowser.filter","|","filebrowser.sort"],removeButtons:[],fullsize:!1,showTooltip:!0,view:null,isSuccess:function(t){return t.success},getMessage:function(t){return void 0!==t.data.messages&&Array.isArray(t.data.messages)?t.data.messages.join(" "):""},showFileName:!0,showFileSize:!0,showFileChangeTime:!0,saveStateInStorage:!0,getThumbTemplate:function(t,e,o){var i=this.options,n=i.showFileName,r=i.showFileSize&&t.size,s=i.showFileChangeTime&&t.time,l="";return void 0!==t.file&&(l=t.file),'<a\n\t\t\tdata-is-file="'+(t.isImage?0:1)+'"\n\t\t\tdraggable="true"\n\t\t\tclass="'+a.ITEM_CLASS+'"\n\t\t\thref="'+t.fileURL+'"\n\t\t\tdata-source="'+o+'"\n\t\t\tdata-path="'+t.path+'"\n\t\t\tdata-name="'+l+'"\n\t\t\ttitle="'+l+'"\n\t\t\tdata-url="'+t.fileURL+'">\n\t\t\t\t<img\n\t\t\t\t\tdata-is-file="'+(t.isImage?0:1)+'"\n\t\t\t\t\tdata-src="'+t.fileURL+'"\n\t\t\t\t\tsrc="'+t.imageURL+'"\n\t\t\t\t\talt="'+l+'"\n\t\t\t\t\tloading="lazy"\n\t\t\t\t/>\n\t\t\t\t'+(n||r||s?'<div class="'+a.ITEM_CLASS+'-info">'+(n?'<span class="'+a.ITEM_CLASS+'-info-filename">'+l+"</span>":"")+(r?'<span class="'+a.ITEM_CLASS+'-info-filesize">'+t.size+"</span>":"")+(s?'<span class="'+a.ITEM_CLASS+'-info-filechanged">'+s+"</span>":"")+"</div>":"")+"\n\t\t\t</a>"},ajax:{url:"",async:!0,data:{},cache:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",method:"POST",processData:!0,dataType:"json",headers:{},prepareData:function(t){return t},process:function(t){return t}},create:{data:{action:"folderCreate"}},getLocalFileByUrl:{data:{action:"getLocalFileByUrl"}},resize:{data:{action:"imageResize"}},crop:{data:{action:"imageCrop"}},fileMove:{data:{action:"fileMove"}},folderMove:{data:{action:"folderMove"}},fileRename:{data:{action:"fileRename"}},folderRename:{data:{action:"folderRename"}},fileRemove:{data:{action:"fileRemove"}},folderRemove:{data:{action:"folderRemove"}},items:{data:{action:"files"}},folder:{data:{action:"folders"}},permissions:{data:{action:"permissions"}},uploader:null,defaultCallback:function(t,e){var o=t.jodit;o&&o.isJodit&&e.files&&e.files.length&&(e.files.forEach((function(t,i){var n=e.baseurl+t;e.isImages&&e.isImages[i]?o.selection.insertImage(n,null,o.options.imageDefaultWidth):o.selection.insertNode(o.create.inside.fromHTML('<a href="'+n+'" title="'+n+'">'+n+"</a>"));})),t.close());}},i.Config.prototype.controls.filebrowser={upload:{icon:"plus",isInput:!0,exec:function(){},isDisable:function(t){return !t.dataProvider.canI("FileUpload")},getContent:function(t,e){var o=t.create.fromHTML('<span class="jodit_upload_button">'+n.ToolbarIcon.getIcon("plus")+'<input type="file" accept="'+(t.state.onlyImages?"image/*":"*")+'" tabindex="-1" dir="auto" multiple=""/></span>'),i=o.querySelector("input");return t.events.on("updateToolbar",(function(){e&&e.isDisable&&(e.isDisable(t,e)?i.setAttribute("disabled","disabled"):i.removeAttribute("disabled"));})).fire("bindUploader.filebrowser",o),o}},remove:{icon:"bin",isDisable:function(t){return !t.state.activeElements.length||!t.dataProvider.canI("FileRemove")},exec:function(t){t.events.fire("fileRemove.filebrowser");}},update:{exec:function(t){t.events.fire("update.filebrowser");}},select:{icon:"check",isDisable:function(t){return !t.state.activeElements.length},exec:function(t){t.events.fire("select.filebrowser");}},edit:{icon:"pencil",isDisable:function(t){var e=t.state.activeElements;return 1!==e.length||!e[0].isImage||!(t.dataProvider.canI("ImageCrop")||t.dataProvider.canI("ImageResize"))},exec:function(t){t.events.fire("edit.filebrowser");}},tiles:{icon:"th",isActive:function(t){return "tiles"===t.state.view},exec:function(t){t.events.fire("view.filebrowser","tiles");}},list:{icon:"th-list",isActive:function(t){return "list"===t.state.view},exec:function(t){t.events.fire("view.filebrowser","list");}},filter:{isInput:!0,getContent:function(t){var e=t.create.element("input",{class:"jodit_input",placeholder:t.i18n("Filter")});return t.events.on(e,"keydown mousedown",t.async.debounce((function(){t.events.fire("filter.filebrowser",e.value);}),t.defaultTimeout)),e}},sort:{isInput:!0,getContent:function(t){var e=t.create.fromHTML('<select class="jodit_input jodit_select"><option value="changed-asc">'+t.i18n("Sort by changed")+' (⬆)</option><option value="changed-desc">'+t.i18n("Sort by changed")+' (⬇)</option><option value="name-asc">'+t.i18n("Sort by name")+' (⬆)</option><option value="name-desc">'+t.i18n("Sort by name")+' (⬇)</option><option value="size-asc">'+t.i18n("Sort by size")+' (⬆)</option><option value="size-desc">'+t.i18n("Sort by size")+" (⬇)</option></select>");return t.events.on("sort.filebrowser",(function(t){e.value!==t&&(e.value=t);})).on(e,"change",(function(){t.events.fire("sort.filebrowser",e.value);})),e}}};},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(12),r=o(1),a=o(21),s=o(40),l=s.F_CLASS+"_preview_",c=function(t,e){return void 0===t&&(t="next"),void 0===e&&(e="right"),'<a href="javascript:void(0)" class="'+l+"navigation "+l+"navigation-"+t+'">'+a.ToolbarIcon.getIcon("angle-"+e)+"</a>"};e.default=function(t){if(!t.options.contextMenu)return function(){};var e=u.makeContextMenu(t.jodit||t);return function(o){var a,u=this,f=this,p=t.options,h=function(t){return f.getAttribute(t)||""};return t.async.setTimeout((function(){e.show(o.pageX,o.pageY,[!("1"===h("data-is-file")||!p.editImage||!t.dataProvider.canI("ImageResize")&&!t.dataProvider.canI("ImageCrop"))&&{icon:"pencil",title:"Edit",exec:function(){t.openImageEditor(h("href"),h("data-name"),h("data-path"),h("data-source"));}},!!t.dataProvider.canI("FileRename")&&{icon:"italic",title:"Rename",exec:function(){return i.__awaiter(u,void 0,void 0,(function(){return i.__generator(this,(function(e){return t.events.fire("fileRename.filebrowser",h("data-name"),h("data-path"),h("data-source")),[2]}))}))}},!!t.dataProvider.canI("FileRemove")&&{icon:"bin",title:"Delete",exec:function(){return i.__awaiter(u,void 0,void 0,(function(){return i.__generator(this,(function(e){switch(e.label){case 0:return [4,t.deleteFile(h("data-name"),h("data-source"))];case 1:return e.sent(),t.state.activeElements=[],[4,t.loadTree()];case 2:return e.sent(),[2]}}))}))}},!!p.preview&&{icon:"eye",title:"Preview",exec:function(){var e,o,i=new n.Dialog(t),a=t.create.div(s.F_CLASS+"_preview",s.ICON_LOADER),u=t.create.div(s.F_CLASS+"_preview_box"),v=t.create.fromHTML(c()),m=t.create.fromHTML(c("prev","left")),g=function(e){var o=t.create.element("img");o.setAttribute("src",e);var n=function(){var e,n;t.isInDestruct||(t.events.off(o,"load"),r.Dom.detach(a),p.showPreviewNavigation&&(r.Dom.prevWithClass(f,s.ITEM_CLASS)&&a.appendChild(m),r.Dom.nextWithClass(f,s.ITEM_CLASS)&&a.appendChild(v)),a.appendChild(u),u.appendChild(o),i.setPosition(),null===(n=null===(e=t)||void 0===e?void 0:e.events)||void 0===n||n.fire("previewOpenedAndLoaded"));};t.events.on(o,"load",n),o.complete&&n();};t.events.on([v,m],"click",(function(){if(!(f=this.classList.contains(l+"navigation-next")?r.Dom.nextWithClass(f,s.ITEM_CLASS):r.Dom.prevWithClass(f,s.ITEM_CLASS)))throw d.error("Need element");r.Dom.detach(a),r.Dom.detach(u),a.innerHTML=s.ICON_LOADER,g(h("href"));})),i.container.classList.add(s.F_CLASS+"_preview_dialog"),i.setContent(a),i.setPosition(),i.open(),g(h("href")),null===(o=null===(e=t)||void 0===e?void 0:e.events)||void 0===o||o.on("beforeDestruct",(function(){i.destruct();})).fire("previewOpened");}},{icon:"upload",title:"Download",exec:function(){var e=h("href");e&&t.ownerWindow.open(e);}}],t.dialog.getZIndex()+1);}),t.defaultTimeout),null===(a=t)||void 0===a||a.events.on("beforeDestruct",(function(){e.destruct();})),o.stopPropagation(),o.preventDefault(),!1}};var d=o(3),u=o(75);},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(3),r=o(38);e.DEFAULT_SOURCE_NAME="default";var a=function(){function t(t,o){var i=this;this.parent=t,this.options=o,this.__currentPermissions=null,this.currentPath="",this.currentSource=e.DEFAULT_SOURCE_NAME,this.currentBaseUrl="",this.ajaxInstances=[],this.getPathByUrl=function(t,e,o){return i.options.getLocalFileByUrl.data.url=t,i.get("getLocalFileByUrl",(function(t){i.options.isSuccess(t)?e(t.data.path,t.data.name,t.data.source):o(n.error(i.options.getMessage(t)));}),o)};}return t.prototype.canI=function(t){var e="allow"+t;return null===this.__currentPermissions||void 0===this.__currentPermissions[e]||this.__currentPermissions[e]},t.prototype.get=function(t,e,o){var i=n.extend(!0,{},this.options.ajax,void 0!==this.options[t]?this.options[t]:this.options.ajax);i.prepareData&&(i.data=i.prepareData.call(this,i.data));var a=new r.Ajax(this.parent,i),s=a.send();return this.ajaxInstances.push(a),e&&s.then(e),o&&s.catch(o),s},t.prototype.permissions=function(t,e){return void 0===t&&(t=this.currentPath),void 0===e&&(e=this.currentSource),i.__awaiter(this,void 0,Promise,(function(){var o=this;return i.__generator(this,(function(i){return this.options.permissions?(this.options.permissions.data.path=t,this.options.permissions.data.source=e,this.options.permissions.url?[2,this.get("permissions").then((function(t){var e=o.options.permissions.process;if(e||(e=o.options.ajax.process),e){var i=e.call(self,t);i.data.permissions&&(o.__currentPermissions=i.data.permissions);}}))]:[2,Promise.resolve()]):[2,Promise.resolve()]}))}))},t.prototype.items=function(t,e){return void 0===t&&(t=this.currentPath),void 0===e&&(e=this.currentSource),i.__awaiter(this,void 0,Promise,(function(){var o;return i.__generator(this,(function(i){return (o=this.options).items?(o.items.data.path=t,o.items.data.source=e,[2,this.get("items")]):[2,Promise.reject("Set Items api options")]}))}))},t.prototype.tree=function(t,e){return void 0===t&&(t=this.currentPath),void 0===e&&(e=this.currentSource),i.__awaiter(this,void 0,Promise,(function(){return i.__generator(this,(function(o){switch(o.label){case 0:return t=n.normalizeRelativePath(t),[4,this.permissions(t,e)];case 1:return o.sent(),this.options.folder?(this.options.folder.data.path=t,this.options.folder.data.source=e,[2,this.get("folder")]):[2,Promise.reject("Set Folder Api options")]}}))}))},t.prototype.createFolder=function(t,e,o){var i=this;return this.options.create?(this.options.create.data.source=o,this.options.create.data.path=e,this.options.create.data.name=t,this.get("create").then((function(t){return i.currentPath=e,i.currentSource=o,t}))):Promise.reject("Set Create api options")},t.prototype.move=function(t,e,o,i){var n=i?"fileMove":"folderMove",r=this.options[n];return r?(r.data.from=t,r.data.path=e,r.data.source=o,this.get(n)):Promise.reject("Set Move api options")},t.prototype.fileRemove=function(t,e,o){return this.options.fileRemove?(this.options.fileRemove.data.path=t,this.options.fileRemove.data.name=e,this.options.fileRemove.data.source=o,this.get("fileRemove")):Promise.reject("Set fileRemove api options")},t.prototype.folderRemove=function(t,e,o){return this.options.folderRemove?(this.options.folderRemove.data.path=t,this.options.folderRemove.data.name=e,this.options.folderRemove.data.source=o,this.get("folderRemove")):Promise.reject("Set folderRemove api options")},t.prototype.folderRename=function(t,e,o,i){return this.options.folderRename?(this.options.folderRename.data.path=t,this.options.folderRename.data.name=e,this.options.folderRename.data.newname=o,this.options.folderRename.data.source=i,this.get("folderRename")):Promise.reject("Set folderRename api options")},t.prototype.fileRename=function(t,e,o,i){return this.options.fileRename?(this.options.fileRename.data.path=t,this.options.fileRename.data.name=e,this.options.fileRename.data.newname=o,this.options.fileRename.data.source=i,this.get("fileRename")):Promise.reject("Set fileRename api options")},t.prototype.crop=function(t,e,o,i,n){return this.options.crop||(this.options.crop={data:{}}),void 0===this.options.crop.data&&(this.options.crop.data={action:"crop"}),this.options.crop.data.newname=i||o,n&&(this.options.crop.data.box=n),this.options.crop.data.path=t,this.options.crop.data.name=o,this.options.crop.data.source=e,this.get("crop")},t.prototype.resize=function(t,e,o,i,n){return this.options.resize||(this.options.resize={data:{}}),void 0===this.options.resize.data&&(this.options.resize.data={action:"resize"}),this.options.resize.data.newname=i||o,n&&(this.options.resize.data.box=n),this.options.resize.data.path=t,this.options.resize.data.name=o,this.options.resize.data.source=e,this.get("resize")},t.prototype.destruct=function(){this.ajaxInstances.forEach((function(t){return t.destruct()})),this.ajaxInstances.length=0;},t}();e.default=a;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=function(){function t(t){var e=this;this.data=t,this.__onEvents={},this.__lockEvent={},Object.keys(t).forEach((function(o){Object.defineProperty(e,o,{set:function(i){e.fire(["beforeChange","beforeChange."+o],o,i),t[o]=i,e.fire(["change","change."+o],o,i);},get:function(){return t[o]}});}));}return t.prototype.on=function(t,e){var o=this;return Array.isArray(t)?(t.map((function(t){return o.on(t,e)})),this):(this.__onEvents[t]||(this.__onEvents[t]=[]),this.__onEvents[t].push(e),this)},t.prototype.fire=function(t){for(var e=this,o=[],n=1;arguments.length>n;n++)o[n-1]=arguments[n];if(Array.isArray(t))t.map((function(t){return e.fire.apply(e,i.__spreadArrays([t],o))}));else try{!this.__lockEvent[t]&&this.__onEvents[t]&&(this.__lockEvent[t]=!0,this.__onEvents[t].forEach((function(t){return t.call.apply(t,i.__spreadArrays([e],o))})));}catch(t){}finally{this.__lockEvent[t]=!1;}},t.create=function(e){return new t(e)},t}();e.ObserveObject=n;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(13),n=o(18),r=function(){function t(t){this.data=t,i.extend(this,t);}return t.create=function(e){return new t(e)},Object.defineProperty(t.prototype,"path",{get:function(){return n.normalizePath(this.data.source.path?this.data.source.path+"/":"/")},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"imageURL",{get:function(){var t=(new Date).getTime().toString(),e=this.data,o=e.source,i=e.thumb||e.file;return e.thumbIsAbsolute&&i?i:n.normalizeURL(o.baseurl,o.path,i||"")+"?_tmst="+t},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"fileURL",{get:function(){var t=this.data,e=t.name,o=t.file,i=t.source;return void 0!==o&&(e=o),t.fileIsAbsolute&&e?e:n.normalizeURL(i.baseurl,i.path,e||"")},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"time",{get:function(){var t=this.data.changed;return t&&("number"==typeof t?new Date(t).toLocaleString():t)||""},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"uniqueHashKey",{get:function(){var t=this.data;return [t.sourceName,t.name,t.file,this.time,t.thumb].join("_").toLowerCase().replace(/[^0-9a-z\-.]/g,"-")},enumerable:!0,configurable:!0}),t}();e.FileBrowserItem=r;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(7),a=o(12),s=o(3),l=o(6),c=o(1);n.Config.prototype.imageeditor={min_width:20,min_height:20,closeAfterSave:!1,width:"85%",height:"85%",crop:!0,resize:!0,resizeUseRatio:!0,resizeMinWidth:20,resizeMinHeight:20,cropUseRatio:!0,cropDefaultWidth:"70%",cropDefaultHeight:"70%"};var d="jodit_image_editor",u=l.ToolbarIcon.getIcon.bind(l.ToolbarIcon),f=function(t){function e(e){var o=t.call(this,e)||this;o.resizeUseRatio=!0,o.cropUseRatio=!0,o.clicked=!1,o.start_x=0,o.start_y=0,o.top_x=0,o.top_y=0,o.width=0,o.height=0,o.activeTab="resize",o.naturalWidth=0,o.naturalHeight=0,o.ratio=0,o.new_h=0,o.new_w=0,o.diff_x=0,o.diff_y=0,o.cropBox={x:0,y:0,w:0,h:0},o.resizeBox={w:0,h:0},o.calcValueByPercent=function(t,e){var o,i=e.toString(),n=parseFloat(t.toString());return (o=/^[\-+]?[0-9]+(px)?$/.exec(i))?parseInt(i,10):(o=/^([\-+]?[0-9.]+)%$/.exec(i))?Math.round(n*(parseFloat(o[1])/100)):n||0},o.calcCropBox=function(){var t=.8*o.crop_box.parentNode.offsetWidth,e=.8*o.crop_box.parentNode.offsetHeight,i=t,n=e;t>o.naturalWidth&&e>o.naturalHeight?(i=o.naturalWidth,n=o.naturalHeight):o.ratio>t/e?(i=t,n=o.naturalHeight*(t/o.naturalWidth)):(i=o.naturalWidth*(e/o.naturalHeight),n=e),s.css(o.crop_box,{width:i,height:n});},o.showCrop=function(){if(o.cropImage){o.calcCropBox();var t=o.cropImage.offsetWidth||o.image.offsetWidth||o.image.naturalWidth;o.new_w=o.calcValueByPercent(t,o.options.cropDefaultWidth);var e=o.cropImage.offsetHeight||o.image.offsetHeight||o.image.naturalHeight;o.new_h=o.cropUseRatio?o.new_w/o.ratio:o.calcValueByPercent(e,o.options.cropDefaultHeight),s.css(o.cropHandler,{backgroundImage:"url("+o.cropImage.getAttribute("src")+")",width:o.new_w,height:o.new_h,left:t/2-o.new_w/2,top:e/2-o.new_h/2}),o.jodit.events.fire(o.cropHandler,"updatesize");}},o.updateCropBox=function(){if(o.cropImage){var t=o.cropImage.offsetWidth/o.naturalWidth,e=o.cropImage.offsetHeight/o.naturalHeight;o.cropBox.x=s.css(o.cropHandler,"left")/t,o.cropBox.y=s.css(o.cropHandler,"top")/e,o.cropBox.w=o.cropHandler.offsetWidth/t,o.cropBox.h=o.cropHandler.offsetHeight/e,o.sizes.textContent=o.cropBox.w.toFixed(0)+"x"+o.cropBox.h.toFixed(0);}},o.updateResizeBox=function(){o.resizeBox.w=o.image.offsetWidth||o.naturalWidth,o.resizeBox.h=o.image.offsetHeight||o.naturalHeight;},o.setHandlers=function(){var t=o;t.jodit.events.on([t.editor.querySelector(".jodit_bottomright"),t.cropHandler],"mousedown."+d,(function(e){t.target=e.target,e.preventDefault(),e.stopImmediatePropagation(),t.clicked=!0,t.start_x=e.clientX,t.start_y=e.clientY,"crop"===t.activeTab?(t.top_x=s.css(t.cropHandler,"left"),t.top_y=s.css(t.cropHandler,"top"),t.width=t.cropHandler.offsetWidth,t.height=t.cropHandler.offsetHeight):(t.width=t.image.offsetWidth,t.height=t.image.offsetHeight);})).off(o.jodit.ownerWindow,"."+d+t.jodit.id).on(o.jodit.ownerWindow,"mousemove."+d+t.jodit.id,o.jodit.async.throttle((function(e){t.clicked&&(t.diff_x=e.clientX-t.start_x,t.diff_y=e.clientY-t.start_y,"resize"===t.activeTab&&t.resizeUseRatio||"crop"===t.activeTab&&t.cropUseRatio?t.diff_x?(t.new_w=t.width+t.diff_x,t.new_h=Math.round(t.new_w/t.ratio)):(t.new_h=t.height+t.diff_y,t.new_w=Math.round(t.new_h*t.ratio)):(t.new_w=t.width+t.diff_x,t.new_h=t.height+t.diff_y),"resize"===t.activeTab?(t.new_w>t.options.resizeMinWidth&&(s.css(t.image,"width",t.new_w+"px"),t.widthInput.value=t.new_w.toString()),t.new_h>t.options.resizeMinHeight&&(s.css(t.image,"height",t.new_h+"px"),t.heightInput.value=t.new_h.toString()),o.jodit.events.fire(t.resizeHandler,"updatesize")):(t.target!==t.cropHandler?(t.top_x+t.new_w>t.cropImage.offsetWidth&&(t.new_w=t.cropImage.offsetWidth-t.top_x),t.top_y+t.new_h>t.cropImage.offsetHeight&&(t.new_h=t.cropImage.offsetHeight-t.top_y),s.css(t.cropHandler,{width:t.new_w,height:t.new_h})):(t.top_x+t.diff_x+t.cropHandler.offsetWidth>t.cropImage.offsetWidth&&(t.diff_x=t.cropImage.offsetWidth-t.top_x-t.cropHandler.offsetWidth),s.css(t.cropHandler,"left",t.top_x+t.diff_x),t.top_y+t.diff_y+t.cropHandler.offsetHeight>t.cropImage.offsetHeight&&(t.diff_y=t.cropImage.offsetHeight-t.top_y-t.cropHandler.offsetHeight),s.css(t.cropHandler,"top",t.top_y+t.diff_y)),o.jodit.events.fire(t.cropHandler,"updatesize")),e.stopImmediatePropagation());}),5)).on(o.jodit.ownerWindow,"resize."+d+t.jodit.id,(function(){o.jodit.events.fire(t.resizeHandler,"updatesize"),t.showCrop(),o.jodit.events.fire(t.cropHandler,"updatesize");})).on(o.jodit.ownerWindow,"mouseup."+d+" "+t.jodit.id+" keydown."+d+t.jodit.id,(function(e){t.clicked&&(t.clicked=!1,e.stopImmediatePropagation());})),s.$$(".jodit_button_group",t.editor).forEach((function(e){var o=e.querySelector("input");t.jodit.events.on(e,"click change",(function(){o.checked=!o.checked,t.jodit.events.fire(o,"change");}),"button");})),t.jodit.events.on(o.editor,"click."+d,(function(){s.$$("."+d+"_slider,."+d+"_area",t.editor).forEach((function(t){return t.classList.remove("active")}));var e=this.parentNode;e.classList.add("active"),t.activeTab=e.getAttribute("data-area")||"resize";var o=t.editor.querySelector("."+d+"_area."+d+"_area_"+t.activeTab);o&&o.classList.add("active"),"crop"===t.activeTab&&t.showCrop();}),"."+d+"_slider-title").on(t.widthInput,"change."+d+" mousedown."+d+" keydown."+d,t.jodit.async.debounce((function(){var e,i=parseInt(t.widthInput.value,10);i>t.options.min_width&&(s.css(t.image,"width",i+"px"),t.resizeUseRatio&&(e=Math.round(i/t.ratio))>t.options.min_height&&(s.css(t.image,"height",e+"px"),t.heightInput.value=e.toString())),o.jodit.events.fire(t.resizeHandler,"updatesize");}),200)).on(t.heightInput,"change."+d+" mousedown."+d+" keydown."+d,t.jodit.async.debounce((function(){if(!o.isDestructed){var e,i=parseInt(t.heightInput.value,10);i>t.options.min_height&&(s.css(t.image,"height",i+"px"),t.resizeUseRatio&&(e=Math.round(i*t.ratio))>t.options.min_width&&(s.css(t.image,"width",e+"px"),t.widthInput.value=e.toString())),o.jodit.events.fire(t.resizeHandler,"updatesize");}}),200));var e=t.editor.querySelector("."+d+"_keep_spect_ratio");e&&e.addEventListener("change",(function(){o.resizeUseRatio=e.checked;}));var i=t.editor.querySelector("."+d+"_keep_spect_ratio_crop");i&&i.addEventListener("change",(function(){o.cropUseRatio=i.checked;})),t.jodit.events.on(t.resizeHandler,"updatesize",(function(){s.css(t.resizeHandler,{top:0,left:0,width:(t.image.offsetWidth||t.naturalWidth)+"px",height:(t.image.offsetHeight||t.naturalHeight)+"px"}),o.updateResizeBox();})).on(t.cropHandler,"updatesize",(function(){if(t.cropImage){var e=s.css(t.cropHandler,"left"),o=s.css(t.cropHandler,"top"),i=t.cropHandler.offsetWidth,n=t.cropHandler.offsetHeight;0>e&&(e=0),0>o&&(o=0),e+i>t.cropImage.offsetWidth&&(i=t.cropImage.offsetWidth-e,t.cropUseRatio&&(n=i/t.ratio)),o+n>t.cropImage.offsetHeight&&(n=t.cropImage.offsetHeight-o,t.cropUseRatio&&(i=n*t.ratio)),s.css(t.cropHandler,{width:i,height:n,left:e,top:o,backgroundPosition:-e-1+"px "+(-o-1)+"px",backgroundSize:t.cropImage.offsetWidth+"px "+t.cropImage.offsetHeight+"px"}),t.updateCropBox();}})),t.buttons.forEach((function(e){e.addEventListener("mousedown",(function(t){t.stopImmediatePropagation();})),e.addEventListener("click",(function(){var o={action:t.activeTab,box:"resize"===t.activeTab?t.resizeBox:t.cropBox};switch(e.getAttribute("data-action")){case"saveas":a.Prompt(t.jodit.i18n("Enter new name"),t.jodit.i18n("Save in new file"),(function(e){if(!s.trim(e))return a.Alert(t.jodit.i18n("The name should not be empty")),!1;t.onSave(e,o,t.hide,(function(t){a.Alert(t.message);}));}));break;case"save":t.onSave(void 0,o,t.hide,(function(t){a.Alert(t.message);}));break;case"reset":"resize"===t.activeTab?(s.css(t.image,{width:null,height:null}),t.widthInput.value=t.naturalWidth.toString(),t.heightInput.value=t.naturalHeight.toString(),t.jodit.events.fire(t.resizeHandler,"updatesize")):t.showCrop();}}));}));},o.hide=function(){o.dialog.close();},o.open=function(t,e){return o.jodit.async.promise((function(i){var n=(new Date).getTime();o.image=o.jodit.create.element("img"),s.$$("img,.jodit_icon-loader",o.resize_box).forEach(c.Dom.safeRemove),s.$$("img,.jodit_icon-loader",o.crop_box).forEach(c.Dom.safeRemove),s.css(o.cropHandler,"background","transparent"),o.onSave=e,o.resize_box.appendChild(o.jodit.create.element("i",{class:"jodit_icon-loader"})),o.crop_box.appendChild(o.jodit.create.element("i",{class:"jodit_icon-loader"})),/\?/.test(t)?t+="&_tst="+n:t+="?_tst="+n,o.image.setAttribute("src",t),o.dialog.open();var r=function(){o.isDestructed||(o.image.removeEventListener("load",r),o.naturalWidth=o.image.naturalWidth,o.naturalHeight=o.image.naturalHeight,o.widthInput.value=o.naturalWidth.toString(),o.heightInput.value=o.naturalHeight.toString(),o.ratio=o.naturalWidth/o.naturalHeight,o.resize_box.appendChild(o.image),o.cropImage=o.image.cloneNode(!0),o.crop_box.appendChild(o.cropImage),s.$$(".jodit_icon-loader",o.editor).forEach(c.Dom.safeRemove),"crop"===o.activeTab&&o.showCrop(),o.jodit.events.fire(o.resizeHandler,"updatesize"),o.jodit.events.fire(o.cropHandler,"updatesize"),o.dialog.setPosition(),o.jodit.events.fire("afterImageEditor"),i(o.dialog));};o.image.addEventListener("load",r),o.image.complete&&r();}))},o.options=e&&e.options?e.options.imageeditor:n.Config.defaultOptions.imageeditor;var i=o.options,r=e.i18n;o.resizeUseRatio=i.resizeUseRatio,o.cropUseRatio=i.cropUseRatio;var l=o.resizeUseRatio,f=o.cropUseRatio;o.buttons=[o.jodit.create.fromHTML('<button data-action="reset" type="button" class="jodit_button">'+u("update")+"&nbsp;"+r("Reset")+"</button>"),o.jodit.create.fromHTML('<button data-action="save" type="button" class="jodit_button jodit_button_success">'+u("save")+"&nbsp;"+r("Save")+"</button>"),o.jodit.create.fromHTML('<button data-action="saveas" type="button" class="jodit_button jodit_button_success">'+u("save")+"&nbsp;"+r("Save as ...")+"</button>")],o.activeTab=i.resize?"resize":"crop";var p=function(t,e){return void 0===e&&(e="active"),t?e:""},h=function(t,e,o){return void 0===o&&(o=!0),'<div class="jodit_form_group">\n\t\t\t<label>'+r(t)+'</label>\n\t\t\t<div class="jodit_button_group jodit_button_radio_group">\n\t\t\t\t<input '+p(o,"checked")+' type="checkbox" class="'+d+"_"+e+' jodit_input"/>\n\n\t\t\t\t<button type="button" data-yes="1" class="jodit_button jodit_status_success">'+r("Yes")+'</button>\n\n\t\t\t\t<button type="button" class="jodit_button jodit_status_danger">'+r("No")+"</button>\n\t\t\t</div>\n\t\t</div>"};return o.editor=o.jodit.create.fromHTML('<form class="'+d+' jodit_properties">\n\t\t\t\t\t\t\t<div class="jodit_grid">\n\t\t\t\t\t\t\t\t<div class="jodit_col-lg-3-4">\n\t\t\t\t\t\t\t\t'+(i.resize?'<div class="'+d+"_area "+d+'_area_resize active">\n\t\t\t\t\t\t\t\t\t\t\t\t<div class="'+d+'_box"></div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div class="'+d+'_resizer">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<i class="jodit_bottomright"></i>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</div>':"")+"\n\t\t\t\t\t\t\t\t"+(i.crop?'<div class="'+d+"_area "+d+"_area_crop "+p(!i.resize)+'">\n\t\t\t\t\t\t\t\t\t\t\t\t<div class="'+d+'_box">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="'+d+'_croper">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<i class="jodit_bottomright"></i>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<i class="jodit_sizes"></i>\n\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</div>':"")+'\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class="jodit_col-lg-1-4">\n\t\t\t\t\t\t\t\t'+(i.resize?'<div data-area="resize" class="'+d+'_slider active">\n\t\t\t\t\t\t\t\t\t\t\t\t<div class="'+d+'_slider-title">\n\t\t\t\t\t\t\t\t\t\t\t\t\t'+u("resize")+"\n\t\t\t\t\t\t\t\t\t\t\t\t\t"+r("Resize")+'\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div class="'+d+'_slider-content">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="jodit_form_group">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label for="'+d+'_width">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'+r("Width")+'\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input type="number" class="'+d+'_width jodit_input"/>\n\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="jodit_form_group">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label for="'+d+'_height">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'+r("Height")+'\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input type="number" class="'+d+'_height jodit_input"/>\n\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t'+h("Keep Aspect Ratio","keep_spect_ratio",l)+"\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</div>":"")+"\n\t\t\t\t\t\t\t\t"+(i.crop?'<div data-area="crop" class="'+d+"_slider "+p(!i.resize)+'\'">\n\t\t\t\t\t\t\t\t\t\t\t\t<div class="'+d+'_slider-title">\n\t\t\t\t\t\t\t\t\t\t\t\t\t'+u("crop")+"\n\t\t\t\t\t\t\t\t\t\t\t\t\t"+r("Crop")+'\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div class="'+d+'_slider-content">\n\t\t\t\t\t\t\t\t\t\t\t\t\t'+h("Keep Aspect Ratio","keep_spect_ratio_crop",f)+"\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</div>":"")+"\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</form>"),o.widthInput=o.editor.querySelector("."+d+"_width"),o.heightInput=o.editor.querySelector("."+d+"_height"),o.resize_box=o.editor.querySelector("."+d+"_area."+d+"_area_resize ."+d+"_box"),o.crop_box=o.editor.querySelector("."+d+"_area."+d+"_area_crop ."+d+"_box"),o.sizes=o.editor.querySelector("."+d+"_area."+d+"_area_crop .jodit_sizes"),o.resizeHandler=o.editor.querySelector("."+d+"_resizer"),o.cropHandler=o.editor.querySelector("."+d+"_croper"),o.dialog=new a.Dialog(e),o.dialog.setContent(o.editor),o.dialog.setSize(o.options.width,o.options.height),o.dialog.setTitle(o.buttons),o.setHandlers(),o}return i.__extends(e,t),e.prototype.destruct=function(){this.isDestructed||(this.dialog&&(this.dialog.destruct(),delete this.dialog),c.Dom.safeRemove(this.editor),delete this.widthInput,delete this.heightInput,delete this.resize_box,delete this.crop_box,delete this.sizes,delete this.resizeHandler,delete this.cropHandler,delete this.editor,this.jodit.events&&this.jodit.events.off("."+d),t.prototype.destruct.call(this));},e}(r.Component);e.ImageEditor=f;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(0),n=o(4),r=o(2),a=o(38),s=o(3),l=o(1),c=o(14),d=o(7);n.Config.prototype.enableDragAndDropFileToEditor=!0,n.Config.prototype.uploader={url:"",insertImageAsBase64URI:!1,imagesExtensions:["jpg","png","jpeg","gif"],headers:null,data:null,filesVariableName:function(t){return "files["+t+"]"},withCredentials:!1,pathVariableName:"path",format:"json",method:"POST",prepareData:function(t){return t},isSuccess:function(t){return t.success},getMessage:function(t){return void 0!==t.data.messages&&Array.isArray(t.data.messages)?t.data.messages.join(" "):""},process:function(t){return t.data},error:function(t){this.jodit.events.fire("errorMessage",t.message,"error",4e3);},defaultHandlerSuccess:function(t){var e=this;t.files&&t.files.length&&t.files.forEach((function(o,i){var n=t.isImages&&t.isImages[i]?["img","src"]:["a","href"],r=n[0],a=n[1],s=e.jodit.create.inside.element(r);s.setAttribute(a,t.baseurl+o),"a"===r&&(s.textContent=t.baseurl+o),c.isJoditObject(e.jodit)&&("img"===r?e.jodit.selection.insertImage(s,null,e.jodit.options.imageDefaultWidth):e.jodit.selection.insertNode(s));}));},defaultHandlerError:function(t){this.jodit.events.fire("errorMessage",t.message);},contentType:function(t){return (void 0===this.jodit.ownerWindow.FormData||"string"==typeof t)&&"application/x-www-form-urlencoded; charset=UTF-8"}};var u=function(t){function e(e,o){var i=t.call(this,e)||this;return i.path="",i.source="default",i.ajaxInstances=[],i.options=s.extend(!0,{},n.Config.defaultOptions.uploader,c.isJoditObject(e)?e.options.uploader:null,o),i}return i.__extends(e,t),e.dataURItoBlob=function(t){for(var e=atob(t.split(",")[1]),o=t.split(",")[0].split(":")[1].split(";")[0],i=new ArrayBuffer(e.length),n=new Uint8Array(i),r=0;e.length>r;r+=1)n[r]=e.charCodeAt(r);return new Blob([n],{type:o})},e.prototype.buildData=function(t){if(this.options.buildData&&"function"==typeof this.options.buildData)return this.options.buildData.call(this,t);var e=this.jodit.ownerWindow.FormData;if(void 0!==e){if(t instanceof e)return t;if("string"==typeof t)return t;var o=new e;return Object.keys(t).forEach((function(e){o.append(e,t[e]);})),o}return t},e.prototype.send=function(t,e){var o=this,i=this.buildData(t),n=function(t){var i=new a.Ajax(o.jodit||o,{xhr:function(){var t=new XMLHttpRequest;return void 0!==o.jodit.ownerWindow.FormData&&t.upload?t.upload.addEventListener("progress",(function(t){if(t.lengthComputable){var e=t.loaded/t.total;e*=100,o.jodit.progressbar.show().progress(e),100>e||o.jodit.progressbar.hide();}}),!1):o.jodit.progressbar.hide(),t},method:o.options.method||"POST",data:t,url:o.options.url,headers:o.options.headers,queryBuild:o.options.queryBuild,contentType:o.options.contentType.call(o,t),dataType:o.options.format||"json",withCredentials:o.options.withCredentials||!1});o.ajaxInstances.push(i);var n=function(){var t=o.ajaxInstances.indexOf(i);-1!==t&&o.ajaxInstances.splice(t,1);};return i.send().then((function(t){n(),e.call(o,t);})).catch((function(t){n(),o.options.error.call(o,t);}))};return i instanceof Promise?i.then(n).catch((function(t){o.options.error.call(o,t);})):n(i)},e.prototype.sendFiles=function(t,e,o,i){var n=this;if(!t)return Promise.reject(s.error("Need files"));var r=this,a=Array.from(t);if(!a.length)return Promise.reject(s.error("Need files"));var l=[];if(this.options.insertImageAsBase64URI){var c,d=void 0,u=function(){if((c=a[d])&&c.type){var t=c.type.match(/\/([a-z0-9]+)/i),o=t[1]?t[1].toLowerCase():"";if(f.options.imagesExtensions.includes(o)){var i=new FileReader;l.push(new Promise((function(t,o){i.onerror=o,i.onloadend=function(){var o={baseurl:"",files:[i.result],isImages:[!0]};"function"==typeof(e||r.options.defaultHandlerSuccess)&&(e||r.options.defaultHandlerSuccess).call(r,o),t(o);},i.readAsDataURL(c);}))),a[d]=null;}}},f=this;for(d=0;a.length>d;d+=1)u();}if((a=a.filter((function(t){return t}))).length){var p=new FormData;p.append(this.options.pathVariableName,r.path),p.append("source",r.source);var h=void 0;for(d=0;a.length>d;d+=1)if(h=a[d]){var v=h.type.match(/\/([a-z0-9]+)/i),m=v&&v[1]?v[1].toLowerCase():"",g=a[d].name||Math.random().toString().replace(".","");if(m){var b=m;["jpeg","jpg"].includes(b)&&(b="jpeg|jpg"),new RegExp(".("+b+")$","i").test(g)||(g+="."+m);}p.append(this.options.filesVariableName(d),a[d],g);}i&&i(p),r.options.data&&s.isPlainObject(r.options.data)&&Object.keys(r.options.data).forEach((function(t){p.append(t,r.options.data[t]);})),r.options.prepareData.call(this,p),l.push(r.send(p,(function(t){n.options.isSuccess.call(r,t)?"function"==typeof(e||r.options.defaultHandlerSuccess)&&(e||r.options.defaultHandlerSuccess).call(r,r.options.process.call(r,t)):(o||r.options.defaultHandlerError).call(r,s.error(r.options.getMessage.call(r,t)));})).then((function(){n.jodit.events&&n.jodit.events.fire("filesWereUploaded");})));}return Promise.all(l)},e.prototype.setPath=function(t){this.path=t;},e.prototype.setSource=function(t){this.source=t;},e.prototype.bind=function(t,o,i){var n=this,a=this,d=function(t){var d,u,f,p=t.clipboardData,h=function(t){u&&(t.append("extension",f),t.append("mimetype",u.type));};if(p&&p.files&&p.files.length)return n.sendFiles(p.files,o,i),!1;if(s.browser("ff")||r.IS_IE){if(p&&(!p.types.length||p.types[0]!==r.TEXT_PLAIN)){var v=n.jodit.create.div("",{tabindex:-1,style:"left: -9999px; top: 0; width: 0; height: 100%;line-height: 140%; overflow: hidden; position: fixed; z-index: 2147483647; word-break: break-all;",contenteditable:!0});n.jodit.ownerDocument.body.appendChild(v);var m=n.jodit&&c.isJoditObject(n.jodit)?n.jodit.selection.save():null;v.focus(),n.jodit.async.setTimeout((function(){var t=v.firstChild;if(l.Dom.safeRemove(v),t&&t.hasAttribute("src")){var r=t.getAttribute("src")||"";m&&n.jodit&&c.isJoditObject(n.jodit)&&n.jodit.selection.restore(m),a.sendFiles([e.dataURItoBlob(r)],o,i);}}),n.jodit.defaultTimeout);}}else if(p&&p.items&&p.items.length){var g=p.items;for(d=0;g.length>d;d+=1)if("file"===g[d].kind&&"image/png"===g[d].type){if(u=g[d].getAsFile()){var b=u.type.match(/\/([a-z0-9]+)/i);f=b[1]?b[1].toLowerCase():"",n.sendFiles([u],o,i,h);}t.preventDefault();break}}};this.jodit&&this.jodit.editor!==t?a.jodit.events.on(t,"paste",d):a.jodit.events.on("beforePaste",d);var u=function(t){return Boolean(t.dataTransfer&&t.dataTransfer.files&&0!==t.dataTransfer.files.length)};a.jodit.events.on(t,"dragend dragover dragenter dragleave drop",(function(t){t.preventDefault();})).on(t,"dragover",(function(e){u(e)&&(t.classList.contains("jodit_draghover")||t.classList.add("jodit_draghover"),e.preventDefault());})).on(t,"dragend",(function(e){u(e)&&(t.classList.contains("jodit_draghover")&&t.classList.remove("jodit_draghover"),e.preventDefault());})).on(t,"drop",(function(e){t.classList.remove("jodit_draghover"),u(e)&&e.dataTransfer&&e.dataTransfer.files&&(e.preventDefault(),e.stopImmediatePropagation(),n.sendFiles(e.dataTransfer.files,o,i));}));var f=t.querySelector("input[type=file]");f&&a.jodit.events.on(f,"change",(function(){a.sendFiles(this.files,o,i).then((function(){f.value="",/safari/i.test(navigator.userAgent)||(f.type="",f.type="file");}));}));},e.prototype.uploadRemoteImage=function(t,e,o){var i=this,n=this;n.send({action:"fileUploadRemote",url:t},(function(t){if(n.options.isSuccess.call(n,t))"function"==typeof e?e.call(n,i.options.process.call(i,t)):i.options.defaultHandlerSuccess.call(n,i.options.process.call(i,t));else if("function"==typeof(o||n.options.defaultHandlerError))return void(o||i.options.defaultHandlerError).call(n,s.error(n.options.getMessage.call(i,t)))}));},e.prototype.destruct=function(){this.setStatus(d.STATUSES.beforeDestruct),this.ajaxInstances.forEach((function(t){try{t.destruct();}catch(t){}})),delete this.options,t.prototype.destruct.call(this);},e}(d.Component);e.Uploader=u;},function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0});var i=o(210);e.about=i;var n=o(211);e.addcolumn=n;var r=o(212);e.addrow=r;var a=o(213);e.angle_down=a;var s=o(214);e.angle_left=s;var l=o(215);e.angle_right=l;var c=o(216);e.angle_up=c;var d=o(217);e.arrows_alt=d;var u=o(218);e.arrows_h=u;var f=o(219);e.attachment=f;var p=o(220);e.bin=p;var h=o(221);e.bold=h;var v=o(222);e.brush=v;var m=o(223);e.cancel=m;var g=o(224);e.center=g;var b=o(225);e.chain_broken=b;var y=o(226);e.check=y;var _=o(227);e.check_square=_;var w=o(228);e.copyformat=w;var j=o(229);e.crop=j;var S=o(230);e.copy=S;var C=o(231);e.cut=C;var x=o(232);e.dedent=x;var k=o(233);e.dots=k;var E=o(234);e.dropdown_arrow=E;var T=o(235);e.enter=T;var D=o(236);e.eraser=D;var z=o(237);e.eye=z;var L=o(238);e.file=L;var M=o(239);e.folder=M;var A=o(240);e.font=A;var I=o(241);e.fontsize=I;var P=o(242);e.fullsize=P;var q=o(243);e.hr=q;var O=o(244);e.image=O;var R=o(245);e.indent=R;var N=o(246);e.info_circle=N;var B=o(247);e.italic=B;var H=o(248);e.justify=H;var W=o(249);e.left=W;var F=o(250);e.link=F;var V=o(251);e.lock=V;var Y=o(252);e.menu=Y;var U=o(253);e.merge=U;var K=o(254);e.ol=K;var G=o(255);e.omega=G;var X=o(256);e.outdent=X;var J=o(257);e.palette=J;var $=o(258);e.paragraph=$;var Z=o(259);e.paste=Z;var Q=o(260);e.pencil=Q;var tt=o(261);e.plus=tt;var et=o(262);e.print=et;var ot=o(263);e.redo=ot;var it=o(264);e.resize=it;var nt=o(265);e.resizer=nt;var rt=o(266);e.right=rt;var at=o(267);e.save=at;var st=o(268);e.select_all=st;var lt=o(269);e.shrink=lt;var ct=o(270);e.source=ct;var dt=o(271);e.splitg=dt;var ut=o(272);e.splitv=ut;var ft=o(273);e.strikethrough=ft;var pt=o(274);e.subscript=pt;var ht=o(275);e.superscript=ht;var vt=o(276);e.table=vt;var mt=o(277);e.th=mt;var gt=o(278);e.th_list=gt;var bt=o(279);e.ul=bt;var yt=o(280);e.underline=yt;var _t=o(281);e.undo=_t;var wt=o(282);e.unlink=wt;var jt=o(283);e.unlock=jt;var St=o(284);e.update=St;var Ct=o(285);e.upload=Ct;var xt=o(286);e.valign=xt;var kt=o(287);e.video=kt;},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M1088 1256v240q0 16-12 28t-28 12h-240q-16 0-28-12t-12-28v-240q0-16 12-28t28-12h240q16 0 28 12t12 28zm316-600q0 54-15.5 101t-35 76.5-55 59.5-57.5 43.5-61 35.5q-41 23-68.5 65t-27.5 67q0 17-12 32.5t-28 15.5h-240q-15 0-25.5-18.5t-10.5-37.5v-45q0-83 65-156.5t143-108.5q59-27 84-56t25-76q0-42-46.5-74t-107.5-32q-65 0-108 29-35 25-107 115-13 16-31 16-12 0-25-8l-164-125q-13-10-15.5-25t5.5-28q160-266 464-266 80 0 161 31t146 83 106 127.5 41 158.5z"/> </svg> ';},function(t,e){t.exports='<svg viewBox="0 0 18.151 18.151"> <g> <g> <path d="M6.237,16.546H3.649V1.604h5.916v5.728c0.474-0.122,0.968-0.194,1.479-0.194 c0.042,0,0.083,0.006,0.125,0.006V0H2.044v18.15h5.934C7.295,17.736,6.704,17.19,6.237,16.546z"/> <path d="M11.169,8.275c-2.723,0-4.938,2.215-4.938,4.938s2.215,4.938,4.938,4.938s4.938-2.215,4.938-4.938 S13.892,8.275,11.169,8.275z M11.169,16.81c-1.983,0-3.598-1.612-3.598-3.598c0-1.983,1.614-3.597,3.598-3.597 s3.597,1.613,3.597,3.597C14.766,15.198,13.153,16.81,11.169,16.81z"/> <polygon points="11.792,11.073 10.502,11.073 10.502,12.578 9.03,12.578 9.03,13.868 10.502,13.868 10.502,15.352 11.792,15.352 11.792,13.868 13.309,13.868 13.309,12.578 11.792,12.578 "/> </g> </g> </svg> ';},function(t,e){t.exports='<svg viewBox="0 0 432 432"> <g> <g> <polygon points="203.688,96 0,96 0,144 155.688,144 "/> <polygon points="155.719,288 0,288 0,336 203.719,336 "/> <rect x="252" y="96"/> <rect/> <rect x="252" y="288"/> <rect y="384"/> <path d="M97.844,230.125c-3.701-3.703-5.856-8.906-5.856-14.141s2.154-10.438,5.856-14.141l9.844-9.844H0v48h107.719 L97.844,230.125z"/> <polygon points="232,176 232,96 112,216 232,336 232,256 432,256 432,176 "/> </g> </g> </svg> ';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M1395 736q0 13-10 23l-466 466q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393 393-393q10-10 23-10t23 10l50 50q10 10 10 23z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1203 544q0 13-10 23l-393 393 393 393q10 10 10 23t-10 23l-50 50q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l466-466q10-10 23-10t23 10l50 50q10 10 10 23z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1171 960q0 13-10 23l-466 466q-10 10-23 10t-23-10l-50-50q-10-10-10-23t10-23l393-393-393-393q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l466 466q10 10 10 23z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1395 1184q0 13-10 23l-50 50q-10 10-23 10t-23-10l-393-393-393 393q-10 10-23 10t-23-10l-50-50q-10-10-10-23t10-23l466-466q10-10 23-10t23 10l466 466q10 10 10 23z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1411 541l-355 355 355 355 144-144q29-31 70-14 39 17 39 59v448q0 26-19 45t-45 19h-448q-42 0-59-40-17-39 14-69l144-144-355-355-355 355 144 144q31 30 14 69-17 40-59 40h-448q-26 0-45-19t-19-45v-448q0-42 40-59 39-17 69 14l144 144 355-355-355-355-144 144q-19 19-45 19-12 0-24-5-40-17-40-59v-448q0-26 19-45t45-19h448q42 0 59 40 17 39-14 69l-144 144 355 355 355-355-144-144q-31-30-14-69 17-40 59-40h448q26 0 45 19t19 45v448q0 42-39 59-13 5-25 5-26 0-45-19z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1792 896q0 26-19 45l-256 256q-19 19-45 19t-45-19-19-45v-128h-1024v128q0 26-19 45t-45 19-45-19l-256-256q-19-19-19-45t19-45l256-256q19-19 45-19t45 19 19 45v128h1024v-128q0-26 19-45t45-19 45 19l256 256q19 19 19 45z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1596 1385q0 117-79 196t-196 79q-135 0-235-100l-777-776q-113-115-113-271 0-159 110-270t269-111q158 0 273 113l605 606q10 10 10 22 0 16-30.5 46.5t-46.5 30.5q-13 0-23-10l-606-607q-79-77-181-77-106 0-179 75t-73 181q0 105 76 181l776 777q63 63 145 63 64 0 106-42t42-106q0-82-63-145l-581-581q-26-24-60-24-29 0-48 19t-19 48q0 32 25 59l410 410q10 10 10 22 0 16-31 47t-47 31q-12 0-22-10l-410-410q-63-61-63-149 0-82 57-139t139-57q88 0 149 63l581 581q100 98 100 235z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M704 1376v-704q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23zm256 0v-704q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23zm256 0v-704q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23zm-544-992h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M747 1521q74 32 140 32 376 0 376-335 0-114-41-180-27-44-61.5-74t-67.5-46.5-80.5-25-84-10.5-94.5-2q-73 0-101 10 0 53-.5 159t-.5 158q0 8-1 67.5t-.5 96.5 4.5 83.5 12 66.5zm-14-746q42 7 109 7 82 0 143-13t110-44.5 74.5-89.5 25.5-142q0-70-29-122.5t-79-82-108-43.5-124-14q-50 0-130 13 0 50 4 151t4 152q0 27-.5 80t-.5 79q0 46 1 69zm-541 889l2-94q15-4 85-16t106-27q7-12 12.5-27t8.5-33.5 5.5-32.5 3-37.5.5-34v-65.5q0-982-22-1025-4-8-22-14.5t-44.5-11-49.5-7-48.5-4.5-30.5-3l-4-83q98-2 340-11.5t373-9.5q23 0 68.5.5t67.5.5q70 0 136.5 13t128.5 42 108 71 74 104.5 28 137.5q0 52-16.5 95.5t-39 72-64.5 57.5-73 45-84 40q154 35 256.5 134t102.5 248q0 100-35 179.5t-93.5 130.5-138 85.5-163.5 48.5-176 14q-44 0-132-3t-132-3q-106 0-307 11t-231 12z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M896 1152q0-36-20-69-1-1-15.5-22.5t-25.5-38-25-44-21-50.5q-4-16-21-16t-21 16q-7 23-21 50.5t-25 44-25.5 38-15.5 22.5q-20 33-20 69 0 53 37.5 90.5t90.5 37.5 90.5-37.5 37.5-90.5zm512-128q0 212-150 362t-362 150-362-150-150-362q0-145 81-275 6-9 62.5-90.5t101-151 99.5-178 83-201.5q9-30 34-47t51-17 51.5 17 33.5 47q28 93 83 201.5t99.5 178 101 151 62.5 90.5q81 127 81 275z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 16 16"> <g transform="translate(0,-1036.3622)"> <path d="m 2,1050.3622 12,-12" style="fill:none;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"/> <path d="m 2,1038.3622 12,12" style="fill:none;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"/> </g> </svg> ';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1792 1344v128q0 26-19 45t-45 19h-1664q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1664q26 0 45 19t19 45zm-384-384v128q0 26-19 45t-45 19h-896q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h896q26 0 45 19t19 45zm256-384v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm-384-384v128q0 26-19 45t-45 19h-640q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h640q26 0 45 19t19 45z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M503 1271l-256 256q-10 9-23 9-12 0-23-9-9-10-9-23t9-23l256-256q10-9 23-9t23 9q9 10 9 23t-9 23zm169 41v320q0 14-9 23t-23 9-23-9-9-23v-320q0-14 9-23t23-9 23 9 9 23zm-224-224q0 14-9 23t-23 9h-320q-14 0-23-9t-9-23 9-23 23-9h320q14 0 23 9t9 23zm1264 128q0 120-85 203l-147 146q-83 83-203 83-121 0-204-85l-334-335q-21-21-42-56l239-18 273 274q27 27 68 27.5t68-26.5l147-146q28-28 28-67 0-40-28-68l-274-275 18-239q35 21 56 42l336 336q84 86 84 204zm-617-724l-239 18-273-274q-28-28-68-28-39 0-68 27l-147 146q-28 28-28 67 0 40 28 68l274 274-18 240q-35-21-56-42l-336-336q-84-86-84-204 0-120 85-203l147-146q83-83 203-83 121 0 204 85l334 335q21 21 42 56zm633 84q0 14-9 23t-23 9h-320q-14 0-23-9t-9-23 9-23 23-9h320q14 0 23 9t9 23zm-544-544v320q0 14-9 23t-23 9-23-9-9-23v-320q0-14 9-23t23-9 23 9 9 23zm407 151l-256 256q-11 9-23 9t-23-9q-9-10-9-23t9-23l256-256q10-9 23-9t23 9q9 10 9 23t-9 23z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1472 930v318q0 119-84.5 203.5t-203.5 84.5h-832q-119 0-203.5-84.5t-84.5-203.5v-832q0-119 84.5-203.5t203.5-84.5h832q63 0 117 25 15 7 18 23 3 17-9 29l-49 49q-10 10-23 10-3 0-9-2-23-6-45-6h-832q-66 0-113 47t-47 113v832q0 66 47 113t113 47h832q66 0 113-47t47-113v-254q0-13 9-22l64-64q10-10 23-10 6 0 12 3 20 8 20 29zm231-489l-814 814q-24 24-57 24t-57-24l-430-430q-24-24-24-57t24-57l110-110q24-24 57-24t57 24l263 263 647-647q24-24 57-24t57 24l110 110q24 24 24 57t-24 57z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M813 1299l614-614q19-19 19-45t-19-45l-102-102q-19-19-45-19t-45 19l-467 467-211-211q-19-19-45-19t-45 19l-102 102q-19 19-19 45t19 45l358 358q19 19 45 19t45-19zm851-883v960q0 119-84.5 203.5t-203.5 84.5h-960q-119 0-203.5-84.5t-84.5-203.5v-960q0-119 84.5-203.5t203.5-84.5h960q119 0 203.5 84.5t84.5 203.5z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 16 16"><path d="M16 9v-6h-3v-1c0-0.55-0.45-1-1-1h-11c-0.55 0-1 0.45-1 1v3c0 0.55 0.45 1 1 1h11c0.55 0 1-0.45 1-1v-1h2v4h-9v2h-0.5c-0.276 0-0.5 0.224-0.5 0.5v5c0 0.276 0.224 0.5 0.5 0.5h2c0.276 0 0.5-0.224 0.5-0.5v-5c0-0.276-0.224-0.5-0.5-0.5h-0.5v-1h9zM12 3h-11v-1h11v1z"/></svg> ';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M621 1280h595v-595zm-45-45l595-595h-595v595zm1152 77v192q0 14-9 23t-23 9h-224v224q0 14-9 23t-23 9h-192q-14 0-23-9t-9-23v-224h-864q-14 0-23-9t-9-23v-864h-224q-14 0-23-9t-9-23v-192q0-14 9-23t23-9h224v-224q0-14 9-23t23-9h192q14 0 23 9t9 23v224h851l246-247q10-9 23-9t23 9q9 10 9 23t-9 23l-247 246v851h224q14 0 23 9t9 23z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"> <path d="M24.89,6.61H22.31V4.47A2.47,2.47,0,0,0,19.84,2H6.78A2.47,2.47,0,0,0,4.31,4.47V22.92a2.47,2.47,0,0,0,2.47,2.47H9.69V27.2a2.8,2.8,0,0,0,2.8,2.8h12.4a2.8,2.8,0,0,0,2.8-2.8V9.41A2.8,2.8,0,0,0,24.89,6.61ZM6.78,23.52a.61.61,0,0,1-.61-.6V4.47a.61.61,0,0,1,.61-.6H19.84a.61.61,0,0,1,.61.6V6.61h-8a2.8,2.8,0,0,0-2.8,2.8V23.52Zm19,3.68a.94.94,0,0,1-.94.93H12.49a.94.94,0,0,1-.94-.93V9.41a.94.94,0,0,1,.94-.93h12.4a.94.94,0,0,1,.94.93Z"/> <path d="M23.49,13.53h-9.6a.94.94,0,1,0,0,1.87h9.6a.94.94,0,1,0,0-1.87Z"/> <path d="M23.49,17.37h-9.6a.94.94,0,1,0,0,1.87h9.6a.94.94,0,1,0,0-1.87Z"/> <path d="M23.49,21.22h-9.6a.93.93,0,1,0,0,1.86h9.6a.93.93,0,1,0,0-1.86Z"/> </svg> ';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M960 896q26 0 45 19t19 45-19 45-45 19-45-19-19-45 19-45 45-19zm300 64l507 398q28 20 25 56-5 35-35 51l-128 64q-13 7-29 7-17 0-31-8l-690-387-110 66q-8 4-12 5 14 49 10 97-7 77-56 147.5t-132 123.5q-132 84-277 84-136 0-222-78-90-84-79-207 7-76 56-147t131-124q132-84 278-84 83 0 151 31 9-13 22-22l122-73-122-73q-13-9-22-22-68 31-151 31-146 0-278-84-82-53-131-124t-56-147q-5-59 15.5-113t63.5-93q85-79 222-79 145 0 277 84 83 52 132 123t56 148q4 48-10 97 4 1 12 5l110 66 690-387q14-8 31-8 16 0 29 7l128 64q30 16 35 51 3 36-25 56zm-681-260q46-42 21-108t-106-117q-92-59-192-59-74 0-113 36-46 42-21 108t106 117q92 59 192 59 74 0 113-36zm-85 745q81-51 106-117t-21-108q-39-36-113-36-100 0-192 59-81 51-106 117t21 108q39 36 113 36 100 0 192-59zm178-613l96 58v-11q0-36 33-56l14-8-79-47-26 26q-3 3-10 11t-12 12q-2 2-4 3.5t-3 2.5zm224 224l96 32 736-576-128-64-768 431v113l-160 96 9 8q2 2 7 6 4 4 11 12t11 12l26 26zm704 416l128-64-520-408-177 138q-2 3-13 7z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M384 544v576q0 13-9.5 22.5t-22.5 9.5q-14 0-23-9l-288-288q-9-9-9-23t9-23l288-288q9-9 23-9 13 0 22.5 9.5t9.5 22.5zm1408 768v192q0 13-9.5 22.5t-22.5 9.5h-1728q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1728q13 0 22.5 9.5t9.5 22.5zm0-384v192q0 13-9.5 22.5t-22.5 9.5h-1088q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1088q13 0 22.5 9.5t9.5 22.5zm0-384v192q0 13-9.5 22.5t-22.5 9.5h-1088q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1088q13 0 22.5 9.5t9.5 22.5zm0-384v192q0 13-9.5 22.5t-22.5 9.5h-1728q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1728q13 0 22.5 9.5t9.5 22.5z"/></svg>';},function(t,e){t.exports='<svg enable-background="new 0 0 24 24" viewBox="0 0 24 24" xml:space="preserve" > <circle cx="12" cy="12" r="2.2"/> <circle cx="12" cy="5" r="2.2"/> <circle cx="12" cy="19" r="2.2"/> </svg> ';},function(t,e){t.exports='<svg viewBox="0 0 10 10"> <path d="M.941 4.523a.75.75 0 1 1 1.06-1.06l3.006 3.005 3.005-3.005a.75.75 0 1 1 1.06 1.06l-3.549 3.55a.75.75 0 0 1-1.168-.136L.941 4.523z"/> </svg> ';},function(t,e){t.exports='<svg viewBox="0 0 128 128" xml:space="preserve"> <g> <polygon points="112.4560547,23.3203125 112.4560547,75.8154297 31.4853516,75.8154297 31.4853516,61.953125 16.0131836,72.6357422 0.5410156,83.3164063 16.0131836,93.9990234 31.4853516,104.6796875 31.4853516,90.8183594 112.4560547,90.8183594 112.4560547,90.8339844 127.4589844,90.8339844 127.4589844,23.3203125 "/> </g> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M832 1408l336-384h-768l-336 384h768zm1013-1077q15 34 9.5 71.5t-30.5 65.5l-896 1024q-38 44-96 44h-768q-38 0-69.5-20.5t-47.5-54.5q-15-34-9.5-71.5t30.5-65.5l896-1024q38-44 96-44h768q38 0 69.5 20.5t47.5 54.5z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1664 960q-152-236-381-353 61 104 61 225 0 185-131.5 316.5t-316.5 131.5-316.5-131.5-131.5-316.5q0-121 61-225-229 117-381 353 133 205 333.5 326.5t434.5 121.5 434.5-121.5 333.5-326.5zm-720-384q0-20-14-34t-34-14q-125 0-214.5 89.5t-89.5 214.5q0 20 14 34t34 14 34-14 14-34q0-86 61-147t147-61q20 0 34-14t14-34zm848 384q0 34-20 69-140 230-376.5 368.5t-499.5 138.5-499.5-139-376.5-368q-20-35-20-69t20-69q140-229 376.5-368t499.5-139 499.5 139 376.5 368q20 35 20 69z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M1152 512v-472q22 14 36 28l408 408q14 14 28 36h-472zm-128 32q0 40 28 68t68 28h544v1056q0 40-28 68t-68 28h-1344q-40 0-68-28t-28-68v-1600q0-40 28-68t68-28h800v544z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M1728 608v704q0 92-66 158t-158 66h-1216q-92 0-158-66t-66-158v-960q0-92 66-158t158-66h320q92 0 158 66t66 158v32h672q92 0 158 66t66 158z"/> </svg> ';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M789 559l-170 450q33 0 136.5 2t160.5 2q19 0 57-2-87-253-184-452zm-725 1105l2-79q23-7 56-12.5t57-10.5 49.5-14.5 44.5-29 31-50.5l237-616 280-724h128q8 14 11 21l205 480q33 78 106 257.5t114 274.5q15 34 58 144.5t72 168.5q20 45 35 57 19 15 88 29.5t84 20.5q6 38 6 57 0 4-.5 13t-.5 13q-63 0-190-8t-191-8q-76 0-215 7t-178 8q0-43 4-78l131-28q1 0 12.5-2.5t15.5-3.5 14.5-4.5 15-6.5 11-8 9-11 2.5-14q0-16-31-96.5t-72-177.5-42-100l-450-2q-26 58-76.5 195.5t-50.5 162.5q0 22 14 37.5t43.5 24.5 48.5 13.5 57 8.5 41 4q1 19 1 58 0 9-2 27-58 0-174.5-10t-174.5-10q-8 0-26.5 4t-21.5 4q-80 14-188 14z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1744 1408q33 0 42 18.5t-11 44.5l-126 162q-20 26-49 26t-49-26l-126-162q-20-26-11-44.5t42-18.5h80v-1024h-80q-33 0-42-18.5t11-44.5l126-162q20-26 49-26t49 26l126 162q20 26 11 44.5t-42 18.5h-80v1024h80zm-1663-1279l54 27q12 5 211 5 44 0 132-2t132-2q36 0 107.5.5t107.5.5h293q6 0 21 .5t20.5 0 16-3 17.5-9 15-17.5l42-1q4 0 14 .5t14 .5q2 112 2 336 0 80-5 109-39 14-68 18-25-44-54-128-3-9-11-48t-14.5-73.5-7.5-35.5q-6-8-12-12.5t-15.5-6-13-2.5-18-.5-16.5.5q-17 0-66.5-.5t-74.5-.5-64 2-71 6q-9 81-8 136 0 94 2 388t2 455q0 16-2.5 71.5t0 91.5 12.5 69q40 21 124 42.5t120 37.5q5 40 5 50 0 14-3 29l-34 1q-76 2-218-8t-207-10q-50 0-151 9t-152 9q-3-51-3-52v-9q17-27 61.5-43t98.5-29 78-27q19-42 19-383 0-101-3-303t-3-303v-117q0-2 .5-15.5t.5-25-1-25.5-3-24-5-14q-11-12-162-12-33 0-93 12t-80 26q-19 13-34 72.5t-31.5 111-42.5 53.5q-42-26-56-44v-383z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 24 24" > <path d="M22,20.6L3.4,2H8V0H0v8h2V3.4L20.6,22H16v2h8v-8h-2V20.6z M16,0v2h4.7l-6.3,6.3l1.4,1.4L22,3.5V8h2V0H16z M8.3,14.3L2,20.6V16H0v8h8v-2H3.5l6.3-6.3L8.3,14.3z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1600 736v192q0 40-28 68t-68 28h-1216q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h1216q40 0 68 28t28 68z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M576 576q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm1024 384v448h-1408v-192l320-320 160 160 512-512zm96-704h-1600q-13 0-22.5 9.5t-9.5 22.5v1216q0 13 9.5 22.5t22.5 9.5h1600q13 0 22.5-9.5t9.5-22.5v-1216q0-13-9.5-22.5t-22.5-9.5zm160 32v1216q0 66-47 113t-113 47h-1600q-66 0-113-47t-47-113v-1216q0-66 47-113t113-47h1600q66 0 113 47t47 113z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M352 832q0 14-9 23l-288 288q-9 9-23 9-13 0-22.5-9.5t-9.5-22.5v-576q0-13 9.5-22.5t22.5-9.5q14 0 23 9l288 288q9 9 9 23zm1440 480v192q0 13-9.5 22.5t-22.5 9.5h-1728q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1728q13 0 22.5 9.5t9.5 22.5zm0-384v192q0 13-9.5 22.5t-22.5 9.5h-1088q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1088q13 0 22.5 9.5t9.5 22.5zm0-384v192q0 13-9.5 22.5t-22.5 9.5h-1088q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1088q13 0 22.5 9.5t9.5 22.5zm0-384v192q0 13-9.5 22.5t-22.5 9.5h-1728q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1728q13 0 22.5 9.5t9.5 22.5z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1152 1376v-160q0-14-9-23t-23-9h-96v-512q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v160q0 14 9 23t23 9h96v320h-96q-14 0-23 9t-9 23v160q0 14 9 23t23 9h448q14 0 23-9t9-23zm-128-896v-160q0-14-9-23t-23-9h-192q-14 0-23 9t-9 23v160q0 14 9 23t23 9h192q14 0 23-9t9-23zm640 416q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M384 1662l17-85q6-2 81.5-21.5t111.5-37.5q28-35 41-101 1-7 62-289t114-543.5 52-296.5v-25q-24-13-54.5-18.5t-69.5-8-58-5.5l19-103q33 2 120 6.5t149.5 7 120.5 2.5q48 0 98.5-2.5t121-7 98.5-6.5q-5 39-19 89-30 10-101.5 28.5t-108.5 33.5q-8 19-14 42.5t-9 40-7.5 45.5-6.5 42q-27 148-87.5 419.5t-77.5 355.5q-2 9-13 58t-20 90-16 83.5-6 57.5l1 18q17 4 185 31-3 44-16 99-11 0-32.5 1.5t-32.5 1.5q-29 0-87-10t-86-10q-138-2-206-2-51 0-143 9t-121 11z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1792 1344v128q0 26-19 45t-45 19h-1664q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1664q26 0 45 19t19 45zm0-384v128q0 26-19 45t-45 19h-1664q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1664q26 0 45 19t19 45zm0-384v128q0 26-19 45t-45 19h-1664q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1664q26 0 45 19t19 45zm0-384v128q0 26-19 45t-45 19h-1664q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1664q26 0 45 19t19 45z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1792 1344v128q0 26-19 45t-45 19h-1664q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1664q26 0 45 19t19 45zm-384-384v128q0 26-19 45t-45 19h-1280q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1280q26 0 45 19t19 45zm256-384v128q0 26-19 45t-45 19h-1536q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1536q26 0 45 19t19 45zm-384-384v128q0 26-19 45t-45 19h-1152q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1152q26 0 45 19t19 45z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1520 1216q0-40-28-68l-208-208q-28-28-68-28-42 0-72 32 3 3 19 18.5t21.5 21.5 15 19 13 25.5 3.5 27.5q0 40-28 68t-68 28q-15 0-27.5-3.5t-25.5-13-19-15-21.5-21.5-18.5-19q-33 31-33 73 0 40 28 68l206 207q27 27 68 27 40 0 68-26l147-146q28-28 28-67zm-703-705q0-40-28-68l-206-207q-28-28-68-28-39 0-68 27l-147 146q-28 28-28 67 0 40 28 68l208 208q27 27 68 27 42 0 72-31-3-3-19-18.5t-21.5-21.5-15-19-13-25.5-3.5-27.5q0-40 28-68t68-28q15 0 27.5 3.5t25.5 13 19 15 21.5 21.5 18.5 19q33-31 33-73zm895 705q0 120-85 203l-147 146q-83 83-203 83-121 0-204-85l-206-207q-83-83-83-203 0-123 88-209l-88-88q-86 88-208 88-120 0-204-84l-208-208q-84-84-84-204t85-203l147-146q83-83 203-83 121 0 204 85l206 207q83 83 83 203 0 123-88 209l88 88q86-88 208-88 120 0 204 84l208 208q84 84 84 204z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M640 768h512v-192q0-106-75-181t-181-75-181 75-75 181v192zm832 96v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-192q0-184 132-316t316-132 316 132 132 316v192h32q40 0 68 28t28 68z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1664 1344v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 312 312"> <g transform="translate(0.000000,312.000000) scale(0.100000,-0.100000)" stroke="none"> <path d="M50 3109 c0 -7 -11 -22 -25 -35 l-25 -23 0 -961 0 -961 32 -29 32 -30 501 -2 500 -3 3 -502 2 -502 31 -30 31 -31 958 0 958 0 23 25 c13 13 30 25 37 25 9 0 12 199 12 960 0 686 -3 960 -11 960 -6 0 -24 12 -40 28 l-29 27 -503 5 -502 5 -5 502 -5 503 -28 29 c-15 16 -27 34 -27 40 0 8 -274 11 -960 11 -710 0 -960 -3 -960 -11z m1738 -698 l2 -453 -40 -40 c-22 -22 -40 -43 -40 -47 0 -4 36 -42 79 -85 88 -87 82 -87 141 -23 l26 27 455 -2 454 -3 0 -775 0 -775 -775 0 -775 0 -3 450 -2 449 47 48 47 48 -82 80 c-44 44 -84 80 -87 80 -3 0 -25 -18 -48 -40 l-41 -40 -456 2 -455 3 -3 765 c-1 421 0 771 3 778 3 10 164 12 777 10 l773 -3 3 -454z"/> <path d="M607 2492 c-42 -42 -77 -82 -77 -87 0 -6 86 -96 190 -200 105 -104 190 -197 190 -205 0 -8 -41 -56 -92 -107 -65 -65 -87 -94 -77 -98 8 -3 138 -4 289 -3 l275 3 3 275 c1 151 0 281 -3 289 -4 10 -35 -14 -103 -82 -54 -53 -103 -97 -109 -97 -7 0 -99 88 -206 195 -107 107 -196 195 -198 195 -3 0 -39 -35 -82 -78z"/> <path d="M1470 1639 c-47 -49 -87 -91 -89 -94 -5 -6 149 -165 160 -165 9 0 189 179 189 188 0 12 -154 162 -165 161 -6 0 -48 -41 -95 -90z"/> <path d="M1797 1303 c-9 -8 -9 -568 0 -576 4 -4 50 36 103 88 54 52 101 95 106 95 5 0 95 -85 199 -190 104 -104 194 -190 200 -190 6 0 46 36 90 80 l79 79 -197 196 c-108 108 -197 199 -197 203 0 4 45 52 99 106 55 55 98 103 95 108 -6 10 -568 11 -577 1z"/> </g> </svg> ';},function(t,e){t.exports='<svg role="img" viewBox="0 0 1792 1792"> <path d="M381 1620q0 80-54.5 126t-135.5 46q-106 0-172-66l57-88q49 45 106 45 29 0 50.5-14.5t21.5-42.5q0-64-105-56l-26-56q8-10 32.5-43.5t42.5-54 37-38.5v-1q-16 0-48.5 1t-48.5 1v53h-106v-152h333v88l-95 115q51 12 81 49t30 88zm2-627v159h-362q-6-36-6-54 0-51 23.5-93t56.5-68 66-47.5 56.5-43.5 23.5-45q0-25-14.5-38.5t-39.5-13.5q-46 0-81 58l-85-59q24-51 71.5-79.5t105.5-28.5q73 0 123 41.5t50 112.5q0 50-34 91.5t-75 64.5-75.5 50.5-35.5 52.5h127v-60h105zm1409 319v192q0 13-9.5 22.5t-22.5 9.5h-1216q-13 0-22.5-9.5t-9.5-22.5v-192q0-14 9-23t23-9h1216q13 0 22.5 9.5t9.5 22.5zm-1408-899v99h-335v-99h107q0-41 .5-122t.5-121v-12h-2q-8 17-50 54l-71-76 136-127h106v404h108zm1408 387v192q0 13-9.5 22.5t-22.5 9.5h-1216q-13 0-22.5-9.5t-9.5-22.5v-192q0-14 9-23t23-9h1216q13 0 22.5 9.5t9.5 22.5zm0-512v192q0 13-9.5 22.5t-22.5 9.5h-1216q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1216q13 0 22.5 9.5t9.5 22.5z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 270 270"> <path d="m240.443652,220.45085l-47.410809,0l0,-10.342138c13.89973,-8.43655 25.752896,-19.844464 34.686646,-33.469923c11.445525,-17.455846 17.496072,-37.709239 17.496072,-58.570077c0,-59.589197 -49.208516,-108.068714 -109.693558,-108.068714s-109.69263,48.479517 -109.69263,108.069628c0,20.860839 6.050547,41.113316 17.497001,58.570077c8.93375,13.625459 20.787845,25.032458 34.686646,33.469008l0,10.342138l-47.412666,0c-10.256959,0 -18.571354,8.191376 -18.571354,18.296574c0,10.105198 8.314395,18.296574 18.571354,18.296574l65.98402,0c10.256959,0 18.571354,-8.191376 18.571354,-18.296574l0,-39.496814c0,-7.073455 -4.137698,-13.51202 -10.626529,-16.537358c-25.24497,-11.772016 -41.557118,-37.145704 -41.557118,-64.643625c0,-39.411735 32.545369,-71.476481 72.549922,-71.476481c40.004553,0 72.550851,32.064746 72.550851,71.476481c0,27.497006 -16.312149,52.87161 -41.557118,64.643625c-6.487902,3.026253 -10.6256,9.464818 -10.6256,16.537358l0,39.496814c0,10.105198 8.314395,18.296574 18.571354,18.296574l65.982163,0c10.256959,0 18.571354,-8.191376 18.571354,-18.296574c0,-10.105198 -8.314395,-18.296574 -18.571354,-18.296574z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M384 544v576q0 13-9.5 22.5t-22.5 9.5q-14 0-23-9l-288-288q-9-9-9-23t9-23l288-288q9-9 23-9 13 0 22.5 9.5t9.5 22.5zm1408 768v192q0 13-9.5 22.5t-22.5 9.5h-1728q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1728q13 0 22.5 9.5t9.5 22.5zm0-384v192q0 13-9.5 22.5t-22.5 9.5h-1088q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1088q13 0 22.5 9.5t9.5 22.5zm0-384v192q0 13-9.5 22.5t-22.5 9.5h-1088q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1088q13 0 22.5 9.5t9.5 22.5zm0-384v192q0 13-9.5 22.5t-22.5 9.5h-1728q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1728q13 0 22.5 9.5t9.5 22.5z"/> </svg>';},function(t,e){t.exports='<svg x="0px" y="0px" viewBox="0 0 459 459"> <g> <g> <path d="M229.5,0C102,0,0,102,0,229.5S102,459,229.5,459c20.4,0,38.25-17.85,38.25-38.25c0-10.2-2.55-17.85-10.2-25.5 c-5.1-7.65-10.2-15.3-10.2-25.5c0-20.4,17.851-38.25,38.25-38.25h45.9c71.4,0,127.5-56.1,127.5-127.5C459,91.8,357,0,229.5,0z M89.25,229.5c-20.4,0-38.25-17.85-38.25-38.25S68.85,153,89.25,153s38.25,17.85,38.25,38.25S109.65,229.5,89.25,229.5z M165.75,127.5c-20.4,0-38.25-17.85-38.25-38.25S145.35,51,165.75,51S204,68.85,204,89.25S186.15,127.5,165.75,127.5z M293.25,127.5c-20.4,0-38.25-17.85-38.25-38.25S272.85,51,293.25,51s38.25,17.85,38.25,38.25S313.65,127.5,293.25,127.5z M369.75,229.5c-20.4,0-38.25-17.85-38.25-38.25S349.35,153,369.75,153S408,170.85,408,191.25S390.15,229.5,369.75,229.5z" /> </g> </g> </svg> ';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1534 189v73q0 29-18.5 61t-42.5 32q-50 0-54 1-26 6-32 31-3 11-3 64v1152q0 25-18 43t-43 18h-108q-25 0-43-18t-18-43v-1218h-143v1218q0 25-17.5 43t-43.5 18h-108q-26 0-43.5-18t-17.5-43v-496q-147-12-245-59-126-58-192-179-64-117-64-259 0-166 88-286 88-118 209-159 111-37 417-37h479q25 0 43 18t18 43z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M10.5 20H2a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h1V3l2.03-.4a3 3 0 0 1 5.94 0L13 3v1h1a2 2 0 0 1 2 2v1h-2V6h-1v1H3V6H2v12h5v2h3.5zM8 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm2 4h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2zm0 2v8h8v-8h-8z"/> </svg> ';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1600 736v192q0 40-28 68t-68 28h-416v416q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-416h-416q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h416v-416q0-40 28-68t68-28h192q40 0 68 28t28 68v416h416q40 0 68 28t28 68z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M448 1536h896v-256h-896v256zm0-640h896v-384h-160q-40 0-68-28t-28-68v-160h-640v640zm1152 64q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm128 0v416q0 13-9.5 22.5t-22.5 9.5h-224v160q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-160h-224q-13 0-22.5-9.5t-9.5-22.5v-416q0-79 56.5-135.5t135.5-56.5h64v-544q0-40 28-68t68-28h672q40 0 88 20t76 48l152 152q28 28 48 76t20 88v256h64q79 0 135.5 56.5t56.5 135.5z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M1664 256v448q0 26-19 45t-45 19h-448q-42 0-59-40-17-39 14-69l138-138q-148-137-349-137-104 0-198.5 40.5t-163.5 109.5-109.5 163.5-40.5 198.5 40.5 198.5 109.5 163.5 163.5 109.5 198.5 40.5q119 0 225-52t179-147q7-10 23-12 14 0 25 9l137 138q9 8 9.5 20.5t-7.5 22.5q-109 132-264 204.5t-327 72.5q-156 0-298-61t-245-164-164-245-61-298 61-298 164-245 245-164 298-61q147 0 284.5 55.5t244.5 156.5l130-129q29-31 70-14 39 17 39 59z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 24 24" > <g> <g transform="translate(-251.000000, -443.000000)"> <g transform="translate(215.000000, 119.000000)"/> <path d="M252,448 L256,448 L256,444 L252,444 L252,448 Z M257,448 L269,448 L269,446 L257,446 L257,448 Z M257,464 L269,464 L269,462 L257,462 L257,464 Z M270,444 L270,448 L274,448 L274,444 L270,444 Z M252,462 L252,466 L256,466 L256,462 L252,462 Z M270,462 L270,466 L274,466 L274,462 L270,462 Z M254,461 L256,461 L256,449 L254,449 L254,461 Z M270,461 L272,461 L272,449 L270,449 L270,461 Z"/> </g> </g> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M844 472q0 60-19 113.5t-63 92.5-105 39q-76 0-138-57.5t-92-135.5-30-151q0-60 19-113.5t63-92.5 105-39q77 0 138.5 57.5t91.5 135 30 151.5zm-342 483q0 80-42 139t-119 59q-76 0-141.5-55.5t-100.5-133.5-35-152q0-80 42-139.5t119-59.5q76 0 141.5 55.5t100.5 134 35 152.5zm394-27q118 0 255 97.5t229 237 92 254.5q0 46-17 76.5t-48.5 45-64.5 20-76 5.5q-68 0-187.5-45t-182.5-45q-66 0-192.5 44.5t-200.5 44.5q-183 0-183-146 0-86 56-191.5t139.5-192.5 187.5-146 193-59zm239-211q-61 0-105-39t-63-92.5-19-113.5q0-74 30-151.5t91.5-135 138.5-57.5q61 0 105 39t63 92.5 19 113.5q0 73-30 151t-92 135.5-138 57.5zm432-104q77 0 119 59.5t42 139.5q0 74-35 152t-100.5 133.5-141.5 55.5q-77 0-119-59t-42-139q0-74 35-152.5t100.5-134 141.5-55.5z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M1792 1344v128q0 26-19 45t-45 19h-1664q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1664q26 0 45 19t19 45zm0-384v128q0 26-19 45t-45 19h-1280q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1280q26 0 45 19t19 45zm0-384v128q0 26-19 45t-45 19h-1536q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1536q26 0 45 19t19 45zm0-384v128q0 26-19 45t-45 19h-1152q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1152q26 0 45 19t19 45z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M512 1536h768v-384h-768v384zm896 0h128v-896q0-14-10-38.5t-20-34.5l-281-281q-10-10-34-20t-39-10v416q0 40-28 68t-68 28h-576q-40 0-68-28t-28-68v-416h-128v1280h128v-416q0-40 28-68t68-28h832q40 0 68 28t28 68v416zm-384-928v-320q0-13-9.5-22.5t-22.5-9.5h-192q-13 0-22.5 9.5t-9.5 22.5v320q0 13 9.5 22.5t22.5 9.5h192q13 0 22.5-9.5t9.5-22.5zm640 32v928q0 40-28 68t-68 28h-1344q-40 0-68-28t-28-68v-1344q0-40 28-68t68-28h928q40 0 88 20t76 48l280 280q28 28 48 76t20 88z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 18 18"> <g fill-rule="evenodd" stroke="none" stroke-width="1"> <g transform="translate(-381.000000, -381.000000)"> <g transform="translate(381.000000, 381.000000)"> <path d="M0,2 L2,2 L2,0 C0.9,0 0,0.9 0,2 L0,2 Z M0,10 L2,10 L2,8 L0,8 L0,10 L0,10 Z M4,18 L6,18 L6,16 L4,16 L4,18 L4,18 Z M0,6 L2,6 L2,4 L0,4 L0,6 L0,6 Z M10,0 L8,0 L8,2 L10,2 L10,0 L10,0 Z M16,0 L16,2 L18,2 C18,0.9 17.1,0 16,0 L16,0 Z M2,18 L2,16 L0,16 C0,17.1 0.9,18 2,18 L2,18 Z M0,14 L2,14 L2,12 L0,12 L0,14 L0,14 Z M6,0 L4,0 L4,2 L6,2 L6,0 L6,0 Z M8,18 L10,18 L10,16 L8,16 L8,18 L8,18 Z M16,10 L18,10 L18,8 L16,8 L16,10 L16,10 Z M16,18 C17.1,18 18,17.1 18,16 L16,16 L16,18 L16,18 Z M16,6 L18,6 L18,4 L16,4 L16,6 L16,6 Z M16,14 L18,14 L18,12 L16,12 L16,14 L16,14 Z M12,18 L14,18 L14,16 L12,16 L12,18 L12,18 Z M12,2 L14,2 L14,0 L12,0 L12,2 L12,2 Z M4,14 L14,14 L14,4 L4,4 L4,14 L4,14 Z M6,6 L12,6 L12,12 L6,12 L6,6 L6,6 Z"/> </g> </g> </g> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M896 960v448q0 26-19 45t-45 19-45-19l-144-144-332 332q-10 10-23 10t-23-10l-114-114q-10-10-10-23t10-23l332-332-144-144q-19-19-19-45t19-45 45-19h448q26 0 45 19t19 45zm755-672q0 13-10 23l-332 332 144 144q19 19 19 45t-19 45-45 19h-448q-26 0-45-19t-19-45v-448q0-26 19-45t45-19 45 19l144 144 332-332q10-10 23-10t23 10l114 114q10 10 10 23z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M553 1399l-50 50q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l466-466q10-10 23-10t23 10l50 50q10 10 10 23t-10 23l-393 393 393 393q10 10 10 23t-10 23zm591-1067l-373 1291q-4 13-15.5 19.5t-23.5 2.5l-62-17q-13-4-19.5-15.5t-2.5-24.5l373-1291q4-13 15.5-19.5t23.5-2.5l62 17q13 4 19.5 15.5t2.5 24.5zm657 651l-466 466q-10 10-23 10t-23-10l-50-50q-10-10-10-23t10-23l393-393-393-393q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l466 466q10 10 10 23t-10 23z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 48 48"> <path d="M6 42h4v-4h-4v4zm4-28h-4v4h4v-4zm-4 20h4v-4h-4v4zm8 8h4v-4h-4v4zm-4-36h-4v4h4v-4zm8 0h-4v4h4v-4zm16 0h-4v4h4v-4zm-8 8h-4v4h4v-4zm0-8h-4v4h4v-4zm12 28h4v-4h-4v4zm-16 8h4v-4h-4v4zm-16-16h36v-4h-36v4zm32-20v4h4v-4h-4zm0 12h4v-4h-4v4zm-16 16h4v-4h-4v4zm8 8h4v-4h-4v4zm8 0h4v-4h-4v4z"/><path d="M0 0h48v48h-48z" fill="none"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 48 48"> <path d="M6 18h4v-4h-4v4zm0-8h4v-4h-4v4zm8 32h4v-4h-4v4zm0-16h4v-4h-4v4zm-8 0h4v-4h-4v4zm0 16h4v-4h-4v4zm0-8h4v-4h-4v4zm8-24h4v-4h-4v4zm24 24h4v-4h-4v4zm-16 8h4v-36h-4v36zm16 0h4v-4h-4v4zm0-16h4v-4h-4v4zm0-20v4h4v-4h-4zm0 12h4v-4h-4v4zm-8-8h4v-4h-4v4zm0 32h4v-4h-4v4zm0-16h4v-4h-4v4z"/> <path d="M0 0h48v48h-48z" fill="none"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1760 896q14 0 23 9t9 23v64q0 14-9 23t-23 9h-1728q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h1728zm-1277-64q-28-35-51-80-48-97-48-188 0-181 134-309 133-127 393-127 50 0 167 19 66 12 177 48 10 38 21 118 14 123 14 183 0 18-5 45l-12 3-84-6-14-2q-50-149-103-205-88-91-210-91-114 0-182 59-67 58-67 146 0 73 66 140t279 129q69 20 173 66 58 28 95 52h-743zm507 256h411q7 39 7 92 0 111-41 212-23 55-71 104-37 35-109 81-80 48-153 66-80 21-203 21-114 0-195-23l-140-40q-57-16-72-28-8-8-8-22v-13q0-108-2-156-1-30 0-68l2-37v-44l102-2q15 34 30 71t22.5 56 12.5 27q35 57 80 94 43 36 105 57 59 22 132 22 64 0 139-27 77-26 122-86 47-61 47-129 0-84-81-157-34-29-137-71z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M1025 1369v167h-248l-159-252-24-42q-8-9-11-21h-3l-9 21q-10 20-25 44l-155 250h-258v-167h128l197-291-185-272h-137v-168h276l139 228q2 4 23 42 8 9 11 21h3q3-9 11-21l25-42 140-228h257v168h-125l-184 267 204 296h109zm639 217v206h-514l-4-27q-3-45-3-46 0-64 26-117t65-86.5 84-65 84-54.5 65-54 26-64q0-38-29.5-62.5t-70.5-24.5q-51 0-97 39-14 11-36 38l-105-92q26-37 63-66 80-65 188-65 110 0 178 59.5t68 158.5q0 66-34.5 118.5t-84 86-99.5 62.5-87 63-41 73h232v-80h126z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"> <path d="M1025 1369v167h-248l-159-252-24-42q-8-9-11-21h-3l-9 21q-10 20-25 44l-155 250h-258v-167h128l197-291-185-272h-137v-168h276l139 228q2 4 23 42 8 9 11 21h3q3-9 11-21l25-42 140-228h257v168h-125l-184 267 204 296h109zm637-679v206h-514l-3-27q-4-28-4-46 0-64 26-117t65-86.5 84-65 84-54.5 65-54 26-64q0-38-29.5-62.5t-70.5-24.5q-51 0-97 39-14 11-36 38l-105-92q26-37 63-66 83-65 188-65 110 0 178 59.5t68 158.5q0 56-24.5 103t-62 76.5-81.5 58.5-82 50.5-65.5 51.5-30.5 63h232v-80h126z"/> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M576 1376v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm0-384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm512 384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm-512-768v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm512 384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm512 384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm-512-768v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm512 384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm0-384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm128-320v1088q0 66-47 113t-113 47h-1344q-66 0-113-47t-47-113v-1088q0-66 47-113t113-47h1344q66 0 113 47t47 113z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M512 1248v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zm0-512v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zm640 512v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zm-640-1024v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zm640 512v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zm640 512v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zm-640-1024v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zm640 512v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zm0-512v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M512 1248v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zm0-512v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zm1280 512v192q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h960q40 0 68 28t28 68zm-1280-1024v192q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h320q40 0 68 28t28 68zm1280 512v192q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h960q40 0 68 28t28 68zm0-512v192q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h960q40 0 68 28t28 68z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M384 1408q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm0-512q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm1408 416v192q0 13-9.5 22.5t-22.5 9.5h-1216q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1216q13 0 22.5 9.5t9.5 22.5zm-1408-928q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm1408 416v192q0 13-9.5 22.5t-22.5 9.5h-1216q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1216q13 0 22.5 9.5t9.5 22.5zm0-512v192q0 13-9.5 22.5t-22.5 9.5h-1216q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1216q13 0 22.5 9.5t9.5 22.5z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M176 223q-37-2-45-4l-3-88q13-1 40-1 60 0 112 4 132 7 166 7 86 0 168-3 116-4 146-5 56 0 86-2l-1 14 2 64v9q-60 9-124 9-60 0-79 25-13 14-13 132 0 13 .5 32.5t.5 25.5l1 229 14 280q6 124 51 202 35 59 96 92 88 47 177 47 104 0 191-28 56-18 99-51 48-36 65-64 36-56 53-114 21-73 21-229 0-79-3.5-128t-11-122.5-13.5-159.5l-4-59q-5-67-24-88-34-35-77-34l-100 2-14-3 2-86h84l205 10q76 3 196-10l18 2q6 38 6 51 0 7-4 31-45 12-84 13-73 11-79 17-15 15-15 41 0 7 1.5 27t1.5 31q8 19 22 396 6 195-15 304-15 76-41 122-38 65-112 123-75 57-182 89-109 33-255 33-167 0-284-46-119-47-179-122-61-76-83-195-16-80-16-237v-333q0-188-17-213-25-36-147-39zm1488 1409v-64q0-14-9-23t-23-9h-1472q-14 0-23 9t-9 23v64q0 14 9 23t23 9h1472q14 0 23-9t9-23z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1664 896q0 156-61 298t-164 245-245 164-298 61q-172 0-327-72.5t-264-204.5q-7-10-6.5-22.5t8.5-20.5l137-138q10-9 25-9 16 2 23 12 73 95 179 147t225 52q104 0 198.5-40.5t163.5-109.5 109.5-163.5 40.5-198.5-40.5-198.5-109.5-163.5-163.5-109.5-198.5-40.5q-98 0-188 35.5t-160 101.5l137 138q31 30 14 69-17 40-59 40h-448q-26 0-45-19t-19-45v-448q0-42 40-59 39-17 69 14l130 129q107-101 244.5-156.5t284.5-55.5q156 0 298 61t245 164 164 245 61 298z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M503 1271l-256 256q-10 9-23 9-12 0-23-9-9-10-9-23t9-23l256-256q10-9 23-9t23 9q9 10 9 23t-9 23zm169 41v320q0 14-9 23t-23 9-23-9-9-23v-320q0-14 9-23t23-9 23 9 9 23zm-224-224q0 14-9 23t-23 9h-320q-14 0-23-9t-9-23 9-23 23-9h320q14 0 23 9t9 23zm1264 128q0 120-85 203l-147 146q-83 83-203 83-121 0-204-85l-334-335q-21-21-42-56l239-18 273 274q27 27 68 27.5t68-26.5l147-146q28-28 28-67 0-40-28-68l-274-275 18-239q35 21 56 42l336 336q84 86 84 204zm-617-724l-239 18-273-274q-28-28-68-28-39 0-68 27l-147 146q-28 28-28 67 0 40 28 68l274 274-18 240q-35-21-56-42l-336-336q-84-86-84-204 0-120 85-203l147-146q83-83 203-83 121 0 204 85l334 335q21 21 42 56zm633 84q0 14-9 23t-23 9h-320q-14 0-23-9t-9-23 9-23 23-9h320q14 0 23 9t9 23zm-544-544v320q0 14-9 23t-23 9-23-9-9-23v-320q0-14 9-23t23-9 23 9 9 23zm407 151l-256 256q-11 9-23 9t-23-9q-9-10-9-23t9-23l256-256q10-9 23-9t23 9q9 10 9 23t-9 23z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1728 576v256q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45v-256q0-106-75-181t-181-75-181 75-75 181v192h96q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h672v-192q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1639 1056q0 5-1 7-64 268-268 434.5t-478 166.5q-146 0-282.5-55t-243.5-157l-129 129q-19 19-45 19t-45-19-19-45v-448q0-26 19-45t45-19h448q26 0 45 19t19 45-19 45l-137 137q71 66 161 102t187 36q134 0 250-65t186-179q11-17 53-117 8-23 30-23h192q13 0 22.5 9.5t9.5 22.5zm25-800v448q0 26-19 45t-45 19h-448q-26 0-45-19t-19-45 19-45l138-138q-148-137-349-137-134 0-250 65t-186 179q-11 17-53 117-8 23-30 23h-199q-13 0-22.5-9.5t-9.5-22.5v-7q65-268 270-434.5t480-166.5q146 0 284 55.5t245 156.5l130-129q19-19 45-19t45 19 19 45z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1344 1472q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm256 0q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm128-224v320q0 40-28 68t-68 28h-1472q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h427q21 56 70.5 92t110.5 36h256q61 0 110.5-36t70.5-92h427q40 0 68 28t28 68zm-325-648q-17 40-59 40h-256v448q0 26-19 45t-45 19h-256q-26 0-45-19t-19-45v-448h-256q-42 0-59-40-17-39 14-69l448-448q18-19 45-19t45 19l448 448q31 30 14 69z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1216 320q0 26-19 45t-45 19h-128v1024h128q26 0 45 19t19 45-19 45l-256 256q-19 19-45 19t-45-19l-256-256q-19-19-19-45t19-45 45-19h128v-1024h-128q-26 0-45-19t-19-45 19-45l256-256q19-19 45-19t45 19l256 256q19 19 19 45z"/></svg>';},function(t,e){t.exports='<svg viewBox="0 0 1792 1792"><path d="M1792 352v1088q0 42-39 59-13 5-25 5-27 0-45-19l-403-403v166q0 119-84.5 203.5t-203.5 84.5h-704q-119 0-203.5-84.5t-84.5-203.5v-704q0-119 84.5-203.5t203.5-84.5h704q119 0 203.5 84.5t84.5 203.5v165l403-402q18-19 45-19 12 0 25 5 39 17 39 59z"/></svg>';}])}));
});

var Jodit = unwrapExports(jodit_min);

const GithubConfig = {
    user: 'eramax',
    repoName: 'test10'
};

var deprecate = function (message) {
  if (console && console.warn) {
    console.warn("Octokat Deprecation: " + message);
  }
};

var fetchBrowser = createCommonjsModule(function (module) {

if (typeof window.fetch === 'function') {
  module.exports = window.fetch.bind(window);
} else {
  module.exports = function () {
    throw new Error('Octokat Error: window.fetch function not found. Either use the https://npmjs.com/package/whatwg-fetch polyfill or set Octokat.Fetch variable to be the fetch function');
  };
}

});

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

var _arrayFilter = arrayFilter;

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

var _arrayEach = arrayEach;

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

var _arrayMap = arrayMap;

// Both of these internal methods are really small/simple and we are only
// working with arrays anyway




// require('underscore-plus')
var plus = {
  camelize: function camelize(string) {
    if (string) {
      return string.replace(/[_-]+(\w)/g, function (m) {
        return m[1].toUpperCase();
      });
    } else {
      return '';
    }
  },
  uncamelize: function uncamelize(string) {
    if (!string) {
      return '';
    }
    return string.replace(/([A-Z])+/g, function (match) {
      var letter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return '_' + letter.toLowerCase();
    });
  },
  dasherize: function dasherize(string) {
    if (!string) {
      return '';
    }

    string = string[0].toLowerCase() + string.slice(1);
    return string.replace(/([A-Z])|(_)/g, function (m, letter) {
      if (letter) {
        return '-' + letter.toLowerCase();
      } else {
        return '-';
      }
    });
  },


  // Just _.extend(target, source)
  extend: function extend(target, source) {
    if (source) {
      return Object.keys(source).map(function (key) {
        target[key] = source[key];
      });
    }
  },


  // Just _.forOwn(obj, iterator)
  forOwn: function forOwn(obj, iterator) {
    return Object.keys(obj).map(function (key) {
      return iterator(obj[key], key);
    });
  },


  filter: _arrayFilter,
  forEach: _arrayEach,
  map: _arrayMap
};

var plus_1 = plus;

var _module$exports;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Reuse these fields because there are 2 URL structures for accessing repositores:
// - `/repos/philschatz/octokat.js/...`
// - `/repositories/20044005/...`
var REPO_FIELDS = {
  'readme': false,
  'tarball': false,
  'zipball': false,
  'compare': false,
  'deployments': {
    'statuses': false
  },
  'hooks': {
    'tests': false
  },
  'assignees': false,
  'languages': false,
  'teams': false,
  'tags': false,
  'branches': false,
  'contributors': false,
  'subscribers': false,
  'subscription': false,
  'stargazers': false,
  'comments': false,
  'downloads': false,
  'forks': false,
  'milestones': {
    'labels': false
  },
  'labels': false,
  'releases': {
    'assets': false,
    'latest': false,
    'tags': false
  },
  'events': false,
  'notifications': false,
  'merges': false,
  'statuses': false,
  'pulls': {
    'merge': false,
    'comments': false,
    'commits': false,
    'files': false,
    'events': false,
    'labels': false,
    'requested_reviewers': false,
    'reviews': {
      'comments': false,
      'events': false,
      'dismissals': false
    }
  },
  'pages': {
    'builds': {
      'latest': false
    }
  },
  'commits': {
    'comments': false,
    'status': false,
    'statuses': false
  },
  'contents': false,
  'collaborators': {
    'permission': false
  },
  'projects': false,
  'issues': {
    'events': false,
    'comments': false,
    'labels': false
  },
  'git': {
    'refs': {
      'heads': false,
      'tags': false
    },
    'trees': false,
    'blobs': false,
    'commits': false
  },
  'stats': {
    'contributors': false,
    'commit_activity': false,
    'code_frequency': false,
    'participation': false,
    'punch_card': false
  },
  'traffic': {
    'popular': {
      'referrers': false,
      'paths': false
    },
    'views': false,
    'clones': false
  }
};

var treeOptions = (_module$exports = {
  'zen': false,
  'octocat': false,
  'organizations': false,
  'issues': false,
  'emojis': false,
  'markdown': false,
  'meta': false,
  'rate_limit': false,
  'feeds': false,
  'events': false,
  'repositories': false,
  'notifications': {
    'threads': {
      'subscription': false
    }
  },
  'gitignore': {
    'templates': false
  },
  'user': {
    'repos': false,
    'orgs': false,
    'followers': false,
    'following': false,
    'emails': false,
    'issues': false,
    'public_emails': false,
    'starred': false,
    'teams': false
  },
  'orgs': {
    'repos': false,
    'issues': false,
    'members': false,
    'events': false,
    'projects': false,
    'teams': false
  },
  'projects': {
    'columns': {
      'moves': false,
      'cards': {
        'moves': false
      }
    }
  },
  'teams': {
    'members': false,
    'memberships': false,
    'repos': false
  },
  'users': {
    'repos': false,
    'orgs': false,
    'gists': false,
    'followers': false,
    'following': false,
    'keys': false,
    'starred': false,
    'received_events': {
      'public': false
    },
    'events': {
      'public': false,
      'orgs': false
    },
    // Enterprise-only:
    'site_admin': false,
    'suspended': false
  },

  'search': {
    'repositories': false,
    'commits': false,
    'issues': false,
    'users': false,
    'code': false
  },
  'gists': {
    'public': false,
    'starred': false,
    'star': false,
    'comments': false,
    'forks': false
  },
  'repos': REPO_FIELDS
}, _defineProperty(_module$exports, 'repositories', REPO_FIELDS), _defineProperty(_module$exports, 'licenses', false), _defineProperty(_module$exports, 'authorizations', {
  'clients': false
}), _defineProperty(_module$exports, 'applications', {
  'tokens': false
}), _defineProperty(_module$exports, 'enterprise', {
  'settings': {
    'license': false
  },
  'stats': {
    'issues': false,
    'hooks': false,
    'milestones': false,
    'orgs': false,
    'comments': false,
    'pages': false,
    'users': false,
    'gists': false,
    'pulls': false,
    'repos': false,
    'all': false
  }
}), _defineProperty(_module$exports, 'staff', {
  'indexing_jobs': false
}), _defineProperty(_module$exports, 'setup', {
  'api': {
    'start': false, // POST
    'upgrade': false, // POST
    'configcheck': false, // GET
    'configure': false, // POST
    'settings': { // GET/PUT
      'authorized-keys': false // GET/POST/DELETE
    },
    'maintenance': false // GET/POST
  }
}), _module$exports);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



// Daisy-Chainer
// ===============================
//
// Generates the functions so `octo.repos(...).issues.comments.fetch()` works.
// Constructs a URL for the verb methods (like `.fetch` and `.create`).

var chainer = function () {
  function Chainer(_verbMethods) {
    _classCallCheck(this, Chainer);

    this._verbMethods = _verbMethods;
  }

  _createClass(Chainer, [{
    key: 'chain',
    value: function chain(path, name, contextTree, fn) {
      var _this = this;

      if (typeof fn === 'undefined' || fn === null) {
        fn = function fn() {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          if (!args.length) {
            throw new Error('BUG! must be called with at least one argument');
          }
          var separator = '/';
          // Special-case compare because its args turn into '...' instead of the usual '/'
          if (name === 'compare') {
            separator = '...';
          }
          return _this.chain(path + '/' + args.join(separator), name, contextTree);
        };
      }

      this._verbMethods.injectVerbMethods(path, fn);

      if (typeof fn === 'function' || (typeof fn === 'undefined' ? 'undefined' : _typeof(fn)) === 'object') {
        for (name in contextTree || {}) {
          (function (name) {
            // Delete the key if it already exists
            delete fn[plus_1.camelize(name)];

            return Object.defineProperty(fn, plus_1.camelize(name), {
              configurable: true,
              enumerable: true,
              get: function get() {
                return _this.chain(path + '/' + name, name, contextTree[name]);
              }
            });
          })(name);
        }
      }

      return fn;
    }
  }]);

  return Chainer;
}();

var verbMethods = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var filter = plus_1.filter,
    forOwn = plus_1.forOwn,
    extend = plus_1.extend;

// When `origFn` is not passed a callback as the last argument then return a
// Promise, or error if no Promise can be found (see `plugins/promise/*` for
// some strategies for loading a Promise implementation)


var toPromise = function toPromise(orig) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var last = args[args.length - 1];
    if (typeof last === 'function') {
      // The last arg is a callback function
      args.pop();
      return orig.apply(undefined, args).then(function (v) {
        last(null, v);
      }).catch(function (err) {
        last(err);
      });
    } else if (typeof Promise !== 'undefined') {
      return orig.apply(undefined, args);
    } else {
      throw new Error('You must specify a callback or have a promise library loaded');
    }
  };
};

var VerbMethods = function () {
  function VerbMethods(plugins, _requester) {
    _classCallCheck(this, VerbMethods);

    this._requester = _requester;
    if (!this._requester) {
      throw new Error('Octokat BUG: request is required');
    }

    var promisePlugins = filter(plugins, function (_ref) {
      var promiseCreator = _ref.promiseCreator;
      return promiseCreator;
    });
    if (promisePlugins) {
      this._promisePlugin = promisePlugins[0];
    }

    this._syncVerbs = {};
    var iterable = filter(plugins, function (_ref2) {
      var verbs = _ref2.verbs;
      return verbs;
    });
    for (var i = 0; i < iterable.length; i++) {
      var plugin = iterable[i];
      extend(this._syncVerbs, plugin.verbs);
    }
    this._asyncVerbs = {};
    var iterable1 = filter(plugins, function (_ref3) {
      var asyncVerbs = _ref3.asyncVerbs;
      return asyncVerbs;
    });
    for (var j = 0; j < iterable1.length; j++) {
      var _plugin = iterable1[j];
      extend(this._asyncVerbs, _plugin.asyncVerbs);
    }
  }

  // Injects verb methods onto `obj`


  _createClass(VerbMethods, [{
    key: 'injectVerbMethods',
    value: function injectVerbMethods(path, obj) {
      var _this = this;

      if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' || typeof obj === 'function') {
        obj.url = path; // Mostly for testing
        forOwn(this._syncVerbs, function (verbFunc, verbName) {
          obj[verbName] = function () {
            var makeRequest = function makeRequest() {
              for (var _len2 = arguments.length, originalArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                originalArgs[_key2] = arguments[_key2];
              }

              var data = void 0,
                  method = void 0,
                  options = void 0;

              var _verbFunc = verbFunc.apply(undefined, [path].concat(originalArgs));

              method = _verbFunc.method;
              path = _verbFunc.path;
              data = _verbFunc.data;
              options = _verbFunc.options;

              return _this._requester.request(method, path, data, options);
            };
            return toPromise(makeRequest).apply(undefined, arguments);
          };
        });

        forOwn(this._asyncVerbs, function (verbFunc, verbName) {
          obj[verbName] = function () {
            var makeRequest = verbFunc(_this._requester, path); // Curried function
            return toPromise(makeRequest).apply(undefined, arguments);
          };
        });
      }

      return obj;
    }
  }]);

  return VerbMethods;
}();

exports.VerbMethods = VerbMethods;
exports.toPromise = toPromise;

});

unwrapExports(verbMethods);
var verbMethods_1 = verbMethods.VerbMethods;
var verbMethods_2 = verbMethods.toPromise;

// Converts a dictionary to a query string.
// Internal helper method
var toQueryString = function toQueryString(options, omitQuestionMark) {
  // Returns '' if `options` is empty so this string can always be appended to a URL
  if (!options || options === {}) {
    return '';
  }

  var params = [];
  var object = options || {};
  for (var key in object) {
    var value = object[key];
    if (value) {
      params.push(key + '=' + encodeURIComponent(value));
    }
  }
  if (params.length) {
    if (omitQuestionMark) {
      return '&' + params.join('&');
    } else {
      return '?' + params.join('&');
    }
  } else {
    return '';
  }
};

var querystring = toQueryString;

// new class SimpleVerbs
var simpleVerbs = {
  verbs: {
    fetch: function fetch(path, query) {
      return { method: 'GET', path: '' + path + querystring(query) };
    },
    read: function read(path, query) {
      return { method: 'GET', path: '' + path + querystring(query), options: { isRaw: true } };
    },
    remove: function remove(path, data) {
      return { method: 'DELETE', path: path, data: data, options: { isBoolean: true } };
    },
    create: function create(path, data, contentType) {
      if (contentType) {
        return { method: 'POST', path: path, data: data, options: { isRaw: true, contentType: contentType } };
      } else {
        return { method: 'POST', path: path, data: data };
      }
    },
    update: function update(path, data) {
      return { method: 'PATCH', path: path, data: data };
    },
    add: function add(path, data) {
      return { method: 'PUT', path: path, data: data, options: { isBoolean: true } };
    },
    contains: function contains(path) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return { method: 'GET', path: path + '/' + args.join('/'), options: { isBoolean: true } };
    }
  }
};

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var filter = plus_1.filter,
    map = plus_1.map;

// Request Function
// ===============================
//
// Generates the actual HTTP requests to GitHub.
// Handles ETag caching, authentication headers, boolean requests, and paged results

// # Construct the request function.
// It contains all the auth credentials passed in to the client constructor

var EVENT_ID = 0; // counter for the emitter so it is easier to match up requests

var requester = function () {
  function Requester(_instance) {
    var _clientOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var plugins = arguments[2];
    var fetchImpl = arguments[3];

    _classCallCheck$1(this, Requester);

    // Provide an option to override the default URL
    this._instance = _instance;
    this._clientOptions = _clientOptions;
    if (this._clientOptions.rootURL == null) {
      this._clientOptions.rootURL = 'https://api.github.com';
    }
    if (this._clientOptions.useETags == null) {
      this._clientOptions.useETags = true;
    }
    if (this._clientOptions.usePostInsteadOfPatch == null) {
      this._clientOptions.usePostInsteadOfPatch = false;
    }
    if (this._clientOptions.userAgent == null) {
      if (typeof window === 'undefined' || window === null) {
        // Set the `User-Agent` because it is required and NodeJS
        // does not send one by default.
        // See http://developer.github.com/v3/#user-agent-required
        this._clientOptions.userAgent = 'octokat.js';
      }
    }

    // These are updated whenever a request is made (optional)
    if (typeof this._clientOptions.emitter === 'function') {
      this._emit = this._clientOptions.emitter;
    }

    this._pluginMiddlewareAsync = map(filter(plugins, function (_ref) {
      var requestMiddlewareAsync = _ref.requestMiddlewareAsync;
      return requestMiddlewareAsync;
    }), function (plugin) {
      return plugin.requestMiddlewareAsync.bind(plugin);
    });
    this._plugins = plugins;
    this._fetchImpl = fetchImpl;
  }

  // HTTP Request Abstraction
  // =======
  //


  _createClass$1(Requester, [{
    key: 'request',
    value: function request(method, path, data) {
      var _this = this;

      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { isRaw: false, isBase64: false, isBoolean: false, contentType: 'application/json' };

      if (typeof options === 'undefined' || options === null) {
        options = {};
      }
      if (options.isRaw == null) {
        options.isRaw = false;
      }
      if (options.isBase64 == null) {
        options.isBase64 = false;
      }
      if (options.isBoolean == null) {
        options.isBoolean = false;
      }
      if (options.contentType == null) {
        options.contentType = 'application/json';
      }

      // console.log method, path, data, options, typeof cb

      // Only prefix the path when it does not begin with http.
      // This is so pagination works (which provides absolute URLs).
      if (!/^http/.test(path)) {
        path = '' + this._clientOptions.rootURL + path;
      }

      var headers = {
        'Accept': this._clientOptions.acceptHeader || 'application/json'

        // Safari/Firefox do not like setting the user-agent header
      };if (this._clientOptions.userAgent) {
        headers['User-Agent'] = this._clientOptions.userAgent;
      }

      var acc = { method: method, path: path, headers: headers, options: options, clientOptions: this._clientOptions

        // To use async.waterfall we need to pass in the initial data (`acc`)
        // so we create an initial function that just takes a callback
      };var initial = Promise.resolve(acc);

      var prev = initial;
      this._pluginMiddlewareAsync.forEach(function (p) {
        prev = prev.then(p);
      });
      return prev.then(function (acc) {
        var _acc = acc;
        method = _acc.method;
        headers = _acc.headers;


        if (options.isRaw) {
          headers['Accept'] = 'application/vnd.github.raw';
        }

        var fetchArgs = {
          // Be sure to **not** blow the cache with a random number
          // (GitHub will respond with 5xx or CORS errors)
          method: method,
          headers: headers,
          body: !options.isRaw && data && JSON.stringify(data) || data
        };

        var eventId = ++EVENT_ID;
        __guardFunc__(_this._emit, function (f) {
          return f('start', eventId, { method: method, path: path, data: data, options: options });
        });

        return _this._fetchImpl(path, fetchArgs).then(function (response) {
          var jqXHR = response;

          // Fire listeners when the request completes or fails
          if (_this._emit) {
            if (response.headers.get('X-RateLimit-Limit')) {
              var rateLimit = parseFloat(response.headers.get('X-RateLimit-Limit'));
              var rateLimitRemaining = parseFloat(response.headers.get('X-RateLimit-Remaining'));
              var rateLimitReset = parseFloat(response.headers.get('X-RateLimit-Reset'));
              // Reset time is in seconds, not milliseconds
              // if rateLimitReset
              //   rateLimitReset = new Date(rateLimitReset * 1000)

              var emitterRate = {
                remaining: rateLimitRemaining,
                limit: rateLimit,
                reset: rateLimitReset
              };

              if (response.headers.get('X-OAuth-Scopes')) {
                emitterRate.scopes = response.headers.get('X-OAuth-Scopes').split(', ');
              }
            }
            _this._emit('end', eventId, { method: method, path: path, data: data, options: options }, response.status, emitterRate);
          }

          // Return the result and Base64 encode it if `options.isBase64` flag is set.

          // Respond with the redirect URL (for archive links)
          // TODO: implement a `followRedirects` plugin
          if (response.status === 302) {
            return response.headers.get('Location');
          } else if (options.isBoolean && response.status === 204) {
            // If the request is a boolean yes/no question GitHub will indicate
            // via the HTTP Status of 204 (No Content) or 404 instead of a 200.
            return true;
          } else if (options.isBoolean && response.status === 404) {
            return false;
            // } else if (options.isBoolean) {
            //   throw new Error(`Octokat Bug? got a response to a boolean question that was not 204 or 404.  ${fetchArgs.method} ${path} Status: ${response.status}`)
          } else if (response.status >= 200 && response.status < 300 || response.status === 304 || response.status === 302 || response.status === 0) {
            // If it was a boolean question and the server responded with 204 ignore.
            var dataPromise = void 0;

            // If the status was 304 then let the cache handler pick it up. leave data blank
            if (response.status === 304) {
              dataPromise = Promise.resolve(null);
            } else {
              // TODO: use a blob if we are expecting a binary

              var contentType = response.headers.get('content-type') || '';

              // Use .indexOf instead of .startsWith because PhantomJS does not support .startsWith
              if (contentType.indexOf('application/json') === 0) {
                dataPromise = response.json();
              } else {
                // Other contentTypes:
                // - 'text/plain'
                // - 'application/octocat-stream'
                // - 'application/vnd.github.raw'
                dataPromise = response.text();
              }
            }

            return dataPromise.then(function (data) {
              acc = {
                clientOptions: _this._clientOptions,
                plugins: _this._plugins,
                data: data,
                options: options,
                jqXHR: jqXHR, // for cacheHandler
                status: response.status, // cacheHandler changes this
                request: acc, // Include the request data for plugins like cacheHandler
                requester: _this, // for Hypermedia to generate verb methods
                instance: _this._instance // for Hypermedia to be able to call `.fromUrl`
              };
              return _this._instance._parseWithContextPromise('', acc);
            });
          } else {
            return response.text().then(function (text) {
              return Promise.reject(new Error(text + ' ' + fetchArgs.method + ' ' + path + ' Status: ' + response.status));
            });
          }
        });
      });
    }
  }]);

  return Requester;
}();

function __guardFunc__(func, transform) {
  return typeof func === 'function' ? transform(func) : undefined;
}

var hypermedia = function (url) {
  // Deprecated interface. Use an Object to specify the args in the template.
  // the order of fields in the template should not matter.
  var m = void 0;
  if ((arguments.length <= 1 ? 0 : arguments.length - 1) === 0) {
    var templateParams = {};
  } else {
    if ((arguments.length <= 1 ? 0 : arguments.length - 1) > 1) {
      deprecate('When filling in a template URL pass all the field to fill in 1 object instead of comma-separated args');
    }

    var templateParams = arguments.length <= 1 ? undefined : arguments[1];
  }
  while (m = /(\{[^\}]+\})/.exec(url)) {
    // `match` is something like `{/foo}` or `{?foo,bar}` or `{foo}` (last one means it is required)
    var match = m[1];
    var param = '';
    // replace it
    switch (match[1]) {
      case '/':
        var fieldName = match.slice(2, match.length - 1); // omit the braces and the slash
        var fieldValue = templateParams[fieldName];
        if (fieldValue) {
          if (/\//.test(fieldValue)) {
            throw new Error('Octokat Error: this field must not contain slashes: ' + fieldName);
          }
          param = '/' + fieldValue;
        }
        break;
      case '+':
        fieldName = match.slice(2, match.length - 1); // omit the braces and the `+`
        fieldValue = templateParams[fieldName];
        if (fieldValue) {
          param = fieldValue;
        }
        break;
      case '?':
        // Strip off the "{?" and the trailing "}"
        // For example, the URL is `/assets{?name,label}`
        //   which turns into `/assets?name=foo.zip`
        // Used to upload releases via the repo releases API.
        //
        // When match contains `,` or
        // `args.length is 1` and args[0] is object match the args to those in the template
        var optionalNames = match.slice(2, -2 + 1).split(','); // omit the braces and the `?` before splitting
        var optionalParams = {};
        for (var j = 0; j < optionalNames.length; j++) {
          fieldName = optionalNames[j];
          optionalParams[fieldName] = templateParams[fieldName];
        }
        param = querystring(optionalParams);
        break;
      case '&':
        optionalNames = match.slice(2, -2 + 1).split(','); // omit the braces and the `?` before splitting
        optionalParams = {};
        for (var k = 0; k < optionalNames.length; k++) {
          fieldName = optionalNames[k];
          optionalParams[fieldName] = templateParams[fieldName];
        }
        param = querystring(optionalParams, true); // true means omitQuestionMark
        break;

      default:
        // This is a required field. ie `{repoName}`
        fieldName = match.slice(1, match.length - 1); // omit the braces
        if (templateParams[fieldName]) {
          param = templateParams[fieldName];
        } else {
          throw new Error('Octokat Error: Required parameter is missing: ' + fieldName);
        }
    }

    url = url.replace(match, param);
  }

  return url;
};

var VerbMethods = verbMethods.VerbMethods,
    toPromise = verbMethods.toPromise;

// Use the following plugins by default (they should be neglegible additional code)







// Checks if a response is a Buffer or not
var isBuffer = function isBuffer(data) {
  if (typeof commonjsGlobal['Buffer'] !== 'undefined') {
    return commonjsGlobal['Buffer'].isBuffer(data);
  } else {
    // If `global` is not defined then we are not running inside Node so
    // the object could never be a Buffer.
    return false;
  }
};

var uncamelizeObj = function uncamelizeObj(obj) {
  if (Array.isArray(obj)) {
    return obj.map(function (i) {
      return uncamelizeObj(i);
    });
  } else if (obj === Object(obj)) {
    var o = {};
    var iterable = Object.keys(obj);
    for (var j = 0; j < iterable.length; j++) {
      var key = iterable[j];
      var value = obj[key];
      o[plus_1.uncamelize(key)] = uncamelizeObj(value);
    }
    return o;
  } else {
    return obj;
  }
};

var OctokatBase = function OctokatBase() {
  var clientOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var plugins = clientOptions.plugins || [simpleVerbs];

  // TODO remove disableHypermedia
  var disableHypermedia = clientOptions.disableHypermedia;
  // set defaults

  if (typeof disableHypermedia === 'undefined' || disableHypermedia === null) {
    disableHypermedia = false;
  }

  // the octokat instance
  var instance = {};

  var fetchImpl = OctokatBase.Fetch || fetchBrowser;

  var request = function request(method, path, data) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { raw: false, isBase64: false, isBoolean: false };

    // replacer = new Replacer(request)

    // Use a slightly convoluted syntax so browserify does not include the
    // NodeJS Buffer in the browser version.
    // data is a Buffer when uploading a release asset file
    if (data && !isBuffer(data)) {
      data = uncamelizeObj(data);
    }

    // For each request, convert the JSON into Objects
    var requester$1 = new requester(instance, clientOptions, plugins, fetchImpl);

    return requester$1.request(method, path, data, options).then(function (val) {
      if ((options || {}).raw) {
        return val;
      }

      if (!disableHypermedia) {
        var context = {
          data: val,
          plugins: plugins,
          requester: requester$1,
          instance: instance,
          clientOptions: clientOptions
        };
        return instance._parseWithContextPromise(path, context);
      } else {
        return val;
      }
    });
  };

  var verbMethods = new VerbMethods(plugins, { request: request });
  new chainer(verbMethods).chain('', null, treeOptions, instance);

  // Special case for `me`
  instance.me = instance.user;

  instance.parse = function (data) {
    // The signature of toPromise has cb as the 1st arg
    var context = {
      requester: { request: request },
      plugins: plugins,
      data: data,
      instance: instance,
      clientOptions: clientOptions
    };
    return instance._parseWithContextPromise('', context);
  };

  // If not callback is provided then return a promise
  instance.parse = toPromise(instance.parse);

  instance._parseWithContextPromise = function (path, context) {
    var data = context.data;

    if (data) {
      context.url = data.url || path;
    }

    var responseMiddlewareAsyncs = plus_1.map(plus_1.filter(plugins, function (_ref) {
      var responseMiddlewareAsync = _ref.responseMiddlewareAsync;
      return responseMiddlewareAsync;
    }), function (plugin) {
      return plugin.responseMiddlewareAsync.bind(plugin);
    });

    var prev = Promise.resolve(context);
    responseMiddlewareAsyncs.forEach(function (p) {
      prev = prev.then(p);
    });
    return prev.then(function (val) {
      return val.data;
    });
  };

  // TODO remove this deprectaion too
  instance._fromUrlWithDefault = function (path, defaultFn) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    path = hypermedia.apply(undefined, [path].concat(args));
    verbMethods.injectVerbMethods(path, defaultFn);
    return defaultFn;
  };

  instance.fromUrl = function (path) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var defaultFn = function defaultFn() {
      deprecate('call ....fetch() explicitly instead of ...()');
      return defaultFn.fetch.apply(defaultFn, arguments);
    };

    return instance._fromUrlWithDefault.apply(instance, [path, defaultFn].concat(args));
  };

  instance._fromUrlCurried = function (path, defaultFn) {
    var fn = function fn() {
      for (var _len3 = arguments.length, templateArgs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        templateArgs[_key3] = arguments[_key3];
      }

      // This conditional logic is for the deprecated .nextPage() call
      if (defaultFn && templateArgs.length === 0) {
        return defaultFn.apply(fn);
      } else {
        return instance.fromUrl.apply(instance, [path].concat(templateArgs));
      }
    };

    if (!/\{/.test(path)) {
      verbMethods.injectVerbMethods(path, fn);
    }
    return fn;
  };

  // Add the GitHub Status API https://status.github.com/api
  instance.status = instance.fromUrl('https://status.github.com/api/status.json');
  instance.status.api = instance.fromUrl('https://status.github.com/api.json');
  instance.status.lastMessage = instance.fromUrl('https://status.github.com/api/last-message.json');
  instance.status.messages = instance.fromUrl('https://status.github.com/api/messages.json');

  return instance;
};

var base = OctokatBase;

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var hypermedia$1 = new (function () {
  function HyperMedia() {
    _classCallCheck$2(this, HyperMedia);
  }

  _createClass$2(HyperMedia, [{
    key: 'replace',
    value: function replace(instance, data) {
      if (Array.isArray(data)) {
        return this._replaceArray(instance, data);
      } else if (typeof data === 'function') {
        return data;
      } else if (data instanceof Date) {
        return data;
      } else if (data === Object(data)) {
        return this._replaceObject(instance, data);
      } else {
        return data;
      }
    }
  }, {
    key: '_replaceObject',
    value: function _replaceObject(instance, orig) {
      var acc = {};
      var iterable = Object.keys(orig);
      for (var i = 0; i < iterable.length; i++) {
        var key = iterable[i];
        var value = orig[key];
        this._replaceKeyValue(instance, acc, key, value);
      }

      return acc;
    }
  }, {
    key: '_replaceArray',
    value: function _replaceArray(instance, orig) {
      var _this = this;

      var arr = orig.map(function (item) {
        return _this.replace(instance, item);
      });
      // Convert the nextPage methods for paged results
      var iterable = Object.keys(orig);
      for (var i = 0; i < iterable.length; i++) {
        var key = iterable[i];
        var value = orig[key];
        this._replaceKeyValue(instance, arr, key, value);
      }
      return arr;
    }

    // Convert things that end in `_url` to methods which return a Promise

  }, {
    key: '_replaceKeyValue',
    value: function _replaceKeyValue(instance, acc, key, value) {
      if (/_url$/.test(key)) {
        if (/^upload_url$/.test(key)) {
          // POST https://<upload_url>/repos/:owner/:repo/releases/:id/assets?name=foo.zip
          var defaultFn = function defaultFn() {
            // TODO: Maybe always set isRaw=true when contentType is provided
            deprecate('call .upload({name, label}).create(data, contentType)' + ' instead of .upload(name, data, contentType)');
            return defaultFn.create.apply(defaultFn, arguments);
          };

          var fn = function fn() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return instance._fromUrlWithDefault.apply(instance, [value, defaultFn].concat(args))();
          };
        } else {
          var defaultFn = function defaultFn() {
            deprecate('instead of directly calling methods like .nextPage(), use .nextPage.fetch()');
            return this.fetch();
          };
          var fn = instance._fromUrlCurried(value, defaultFn);
        }

        var newKey = key.substring(0, key.length - '_url'.length);
        acc[newKey] = fn;
        // add a camelCase URL field for retrieving non-templated URLs
        // like `avatarUrl` and `htmlUrl`
        if (!/\{/.test(value)) {
          return acc[key] = value;
        }
      } else if (/_at$/.test(key)) {
        // Ignore null dates so we do not get `Wed Dec 31 1969`
        return acc[key] = value ? new Date(value) : null;
      } else {
        return acc[key] = this.replace(instance, value);
      }
    }
  }, {
    key: 'responseMiddlewareAsync',
    value: function responseMiddlewareAsync(input) {
      var instance = input.instance,
          data = input.data;

      data = this.replace(instance, data);
      input.data = data; // or throw new Error('BUG! Expected JSON data to exist')
      return Promise.resolve(input);
    }
  }]);

  return HyperMedia;
}())();

var objectMatcher = createCommonjsModule(function (module) {

// Generated by CoffeeScript 1.12.7
(function () {
  module.exports = {
    'repos': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/(repos(\/[^\/]+){2}|repositories\/([0-9]+))$/,
    'gists': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/gists\/[^\/]+$/,
    'issues': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/(repos(\/[^\/]+){2}|repositories\/([0-9]+))\/(issues|pulls)\/[^\/]+$/,
    'users': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/users\/[^\/]+$/,
    'orgs': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/orgs\/[^\/]+$/,
    'teams': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/teams\/[^\/]+$/,
    'repos.comments': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/repos\/[^\/]+\/[^\/]+\/comments\/[^\/]+$/
  };
}).call(undefined);



});

var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




var VerbMethods$1 = verbMethods.VerbMethods;



var objectChainer = new (function () {
  function ObjectChainer() {
    _classCallCheck$3(this, ObjectChainer);
  }

  _createClass$3(ObjectChainer, [{
    key: 'chainChildren',
    value: function chainChildren(chainer, url, obj) {
      return function () {
        var result = [];
        for (var key in objectMatcher) {
          var re = objectMatcher[key];
          var item = void 0;
          if (re.test(obj.url)) {
            var context = treeOptions;
            var iterable = key.split('.');
            for (var i = 0; i < iterable.length; i++) {
              var k = iterable[i];
              context = context[k];
            }
            item = chainer.chain(url, k, context, obj);
          }
          result.push(item);
        }
        return result;
      }();
    }
  }, {
    key: 'responseMiddlewareAsync',
    value: function responseMiddlewareAsync(input) {
      var plugins = input.plugins,
          requester = input.requester,
          data = input.data,
          url = input.url;
      // unless data
      //    throw new Error('BUG! Expected JSON data to exist')

      var verbMethods = new VerbMethods$1(plugins, requester);
      var chainer$1 = new chainer(verbMethods);
      if (url) {
        chainer$1.chain(url, true, {}, data);
        this.chainChildren(chainer$1, url, data);
      } else {
        chainer$1.chain('', null, {}, data);
        // For the paged results, rechain all children in the array
        if (Array.isArray(data)) {
          for (var i = 0; i < data.length; i++) {
            var datum = data[i];
            this.chainChildren(chainer$1, datum.url, datum);
          }
        }
      }

      return Promise.resolve(input);
    }
  }]);

  return ObjectChainer;
}())();

var urlValidator = createCommonjsModule(function (module) {

// Generated by CoffeeScript 1.12.7
(function () {
  module.exports = /^(https:\/\/status.github.com\/api\/(status.json|last-message.json|messages.json)$)|(https?:\/\/[^\/]+)?(\/api\/v3)?\/(zen|octocat|users|issues|gists|emojis|markdown|meta|rate_limit|feeds|events|repositories(\/\d+)?|notifications|notifications\/threads(\/[^\/]+)|notifications\/threads(\/[^\/]+)\/subscription|gitignore\/templates(\/[^\/]+)?|user(\/\d+)?|user(\/\d+)?\/(|repos|orgs|followers|following(\/[^\/]+)?|emails(\/[^\/]+)?|issues|public_emails|starred|starred(\/[^\/]+){2}|teams)|(orgs\/[^\/]+)|((organizations)(\/\d+)?)|(orgs\/[^\/]+)|(organizations\/\d+)\/(repos|issues|members|events|teams|projects)|projects\/[0-9]+|projects\/[0-9]+\/columns|projects\/columns\/[0-9]+|projects\/columns\/[0-9]+\/moves|projects\/columns\/[0-9]+\/cards|projects\/columns\/cards\/[0-9]+|projects\/columns\/cards\/[0-9]+\/moves|teams\/[^\/]+|teams\/[^\/]+\/(members(\/[^\/]+)?|memberships\/[^\/]+|repos|repos(\/[^\/]+){2})|users\/[^\/]+|users\/[^\/]+\/(repos|orgs|gists|followers|following(\/[^\/]+){0,2}|keys|starred|received_events(\/public)?|events(\/public)?|events\/orgs\/[^\/]+)|search\/(repositories|commits|issues|users|code)|gists\/(public|starred|([a-f0-9]{20,32}|[0-9]+)|([a-f0-9]{20,32}|[0-9]+)\/forks|([a-f0-9]{20,32}|[0-9]+)\/comments(\/[0-9]+)?|([a-f0-9]{20,32}|[0-9]+)\/star)|repos(\/[^\/]+){2}|(repos(\/[^\/]+){2}|repositories\/([0-9]+))\/(readme|tarball(\/[^\/]+)?|zipball(\/[^\/]+)?|compare\/([^\.{3}]+)\.{3}([^\.{3}]+)|deployments(\/[0-9]+)?|deployments\/[0-9]+\/statuses(\/[0-9]+)?|hooks|hooks\/[^\/]+|hooks\/[^\/]+\/tests|assignees|languages|teams|tags|branches(\/[^\/]+){0,2}|contributors|subscribers|subscription|stargazers|comments(\/[0-9]+)?|downloads(\/[0-9]+)?|forks|milestones|milestones\/[0-9]+|milestones\/[0-9]+\/labels|labels(\/[^\/]+)?|releases|releases\/([0-9]+)|releases\/([0-9]+)\/assets|releases\/latest|releases\/tags\/([^\/]+)|releases\/assets\/([0-9]+)|events|notifications|merges|statuses\/[a-f0-9]{40}|pages|pages\/builds|pages\/builds\/latest|commits|commits\/[a-f0-9]{40}|commits\/[a-f0-9]{40}\/(comments|status|statuses)?|contents\/|contents(\/[^\/]+)*|collaborators(\/[^\/]+)?|collaborators\/([^\/]+)\/permission|projects|(issues|pulls)|(issues|pulls)\/(events|events\/[0-9]+|comments(\/[0-9]+)?|[0-9]+|[0-9]+\/events|[0-9]+\/comments|[0-9]+\/labels(\/[^\/]+)?)|pulls\/[0-9]+\/(files|commits|merge|requested_reviewers|reviews(\/[0-9]+)?|reviews(\/[0-9]+)\/(comments|events|dismissals))|git\/(refs|refs\/(.+|heads(\/[^\/]+)?|tags(\/[^\/]+)?)|trees(\/[^\/]+)?|blobs(\/[a-f0-9]{40}$)?|commits(\/[a-f0-9]{40}$)?)|stats\/(contributors|commit_activity|code_frequency|participation|punch_card)|traffic\/(popular\/(referrers|paths)|views|clones))|licenses|licenses\/([^\/]+)|authorizations|authorizations\/((\d+)|clients\/([^\/]{20})|clients\/([^\/]{20})\/([^\/]+))|applications\/([^\/]{20})\/tokens|applications\/([^\/]{20})\/tokens\/([^\/]+)|enterprise\/(settings\/license|stats\/(issues|hooks|milestones|orgs|comments|pages|users|gists|pulls|repos|all))|staff\/indexing_jobs|users\/[^\/]+\/(site_admin|suspended)|setup\/api\/(start|upgrade|configcheck|configure|settings(authorized-keys)?|maintenance))(\?.*)?$/;
}).call(undefined);



});

var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var pathValidator = new (function () {
  function PathValidator() {
    _classCallCheck$4(this, PathValidator);
  }

  _createClass$4(PathValidator, [{
    key: 'requestMiddlewareAsync',
    value: function requestMiddlewareAsync(input) {
      var path = input.path;

      if (!urlValidator.test(path)) {
        var err = 'Octokat BUG: Invalid Path. If this is actually a valid path then please update the URL_VALIDATOR. path=' + path;
        console.warn(err);
      }
      return Promise.resolve(input);
    }
  }]);

  return PathValidator;
}())();

var base64Browser = btoa;

var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var authorization = new (function () {
  function Authorization() {
    _classCallCheck$5(this, Authorization);
  }

  _createClass$5(Authorization, [{
    key: 'requestMiddlewareAsync',
    value: function requestMiddlewareAsync(input) {
      if (input.headers == null) {
        input.headers = {};
      }
      var headers = input.headers,
          _input$clientOptions = input.clientOptions,
          token = _input$clientOptions.token,
          username = _input$clientOptions.username,
          password = _input$clientOptions.password;

      if (token || username && password) {
        if (token) {
          var auth = 'token ' + token;
        } else {
          var auth = 'Basic ' + base64Browser(username + ':' + password);
        }
        input.headers['Authorization'] = auth;
      }
      return Promise.resolve(input);
    }
  }]);

  return Authorization;
}())();

var previewHeaders = createCommonjsModule(function (module) {

// Generated by CoffeeScript 1.12.7
(function () {
  module.exports = {
    'application/vnd.github.drax-preview+json': /^(https?:\/\/[^\/]+)?(\/api\/v3)?(\/licenses|\/licenses\/([^\/]+)|\/repos\/([^\/]+)\/([^\/]+))$/,
    'application/vnd.github.v3.star+json': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/users\/([^\/]+)\/starred$/,
    'application/vnd.github.cloak-preview+json': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/search\/commits$/,
    'application/vnd.github.black-cat-preview+json': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/repos(\/[^\/]+){2}\/pulls\/[0-9]+\/(|requested_reviewers|reviews(\/[0-9]+)?|reviews(\/[0-9]+)\/(comments|events|dismissals))$/,
    'application/vnd.github.inertia-preview+json': /^(https?:\/\/[^\/]+)?(\/api\/v3)?(\/repos(\/[^\/]+){2}\/projects|\/orgs\/([^\/]+)\/projects|\/projects\/([0-9]+|[0-9]+\/columns|columns|columns\/[0-9]+|columns\/[0-9]+\/moves|columns\/[0-9]+\/cards|columns\/cards\/[0-9]+|columns\/cards\/[0-9]+\/moves))$/
  };
}).call(undefined);



});

var _createClass$6 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var DEFAULT_HEADER = function DEFAULT_HEADER(url) {
  for (var key in previewHeaders) {
    var val = previewHeaders[key];
    if (val.test(url)) {
      return key;
    }
  }
};

// Use the preview API header if one of the routes match the preview APIs
var previewApis = new (function () {
  function PreviewApis() {
    _classCallCheck$6(this, PreviewApis);
  }

  _createClass$6(PreviewApis, [{
    key: 'requestMiddlewareAsync',
    value: function requestMiddlewareAsync(input) {
      var path = input.path;

      var acceptHeader = DEFAULT_HEADER(path);
      if (acceptHeader) {
        input.headers['Accept'] = acceptHeader;
      }

      return Promise.resolve(input);
    }
  }]);

  return PreviewApis;
}())();

var _createClass$7 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$7(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var usePostInsteadOfPatch = new (function () {
  function UsePostInsteadOfPatch() {
    _classCallCheck$7(this, UsePostInsteadOfPatch);
  }

  _createClass$7(UsePostInsteadOfPatch, [{
    key: 'requestMiddlewareAsync',
    value: function requestMiddlewareAsync(input, cb) {
      var usePostInsteadOfPatch = input.clientOptions.usePostInsteadOfPatch,
          method = input.method;

      if (usePostInsteadOfPatch && method === 'PATCH') {
        input.method = 'POST';
      }
      return Promise.resolve(input);
    }
  }]);

  return UsePostInsteadOfPatch;
}())();

var pushAll = function pushAll(target, source) {
  if (!Array.isArray(source)) {
    throw new Error('Octokat Error: Calling fetchAll on a request that does not yield an array');
  }
  return target.push.apply(target, source);
};

var getMore = function getMore(fetchable, requester, acc) {
  var nextPagePromise = fetchNextPage(fetchable, requester);
  if (nextPagePromise) {
    return nextPagePromise.then(function (results) {
      pushAll(acc, results.items);
      // TODO: handle `items.next_page = string/function`, `items.nextPage = string/function`
      return getMore(results, requester, acc);
    });
  } else {
    return acc;
  }
};

// TODO: HACK to handle camelCase and hypermedia plugins
var fetchNextPage = function fetchNextPage(obj, requester) {
  if (typeof obj.next_page_url === 'string') {
    return requester.request('GET', obj.next_page_url, null, null);
  } else if (obj.next_page) {
    return obj.next_page.fetch();
  } else if (typeof obj.nextPageUrl === 'string') {
    return requester.request('GET', obj.nextPageUrl, null, null);
  } else if (obj.nextPage) {
    return obj.nextPage.fetch();
  } else {
    return false;
  }
};

// new class FetchAll
var fetchAll = {
  asyncVerbs: {
    fetchAll: function fetchAll(requester, path) {
      return function (query) {
        // TODO: Pass in the instance so we can just call fromUrl maybe? and we don't rely on hypermedia to create nextPage
        return requester.request('GET', '' + path + querystring(query), null, null).then(function (results) {
          var acc = [];
          pushAll(acc, results.items);
          // TODO: handle `items.next_page = string/function`, `items.nextPage = string/function`
          return getMore(results, requester, acc);
        });
      };
    }
  }
};

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass$8 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$8(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var pagination = new (function () {
  function Pagination() {
    _classCallCheck$8(this, Pagination);
  }

  _createClass$8(Pagination, [{
    key: 'responseMiddlewareAsync',
    value: function responseMiddlewareAsync(input) {
      var jqXHR = input.jqXHR,
          data = input.data;

      if (!jqXHR) {
        return Promise.resolve(input);
      } // The plugins are all used in `octo.parse()` which does not have a jqXHR

      // Only JSON responses have next/prev/first/last link headers
      // Add them to data so the resolved value is iterable

      if (Array.isArray(data)) {
        data = { items: data.slice() // Convert to object so we can add the next/prev/first/last link headers

          // Parse the Link headers
          // of the form `<http://a.com>; rel="next", <https://b.com?a=b&c=d>; rel="previous"`
        };var linksHeader = jqXHR.headers.get('Link');
        if (linksHeader) {
          linksHeader.split(',').forEach(function (part) {
            var _part$match = part.match(/<([^>]+)>; rel="([^"]+)"/),
                _part$match2 = _slicedToArray(_part$match, 3),
                unusedField = _part$match2[0],
                href = _part$match2[1],
                rel = _part$match2[2];
            // Add the pagination functions on the JSON since Promises resolve one value
            // Name the functions `nextPage`, `previousPage`, `firstPage`, `lastPage`


            data[rel + '_page_url'] = href;
          });
        }
        input.data = data; // or throw new Error('BUG! Expected JSON data to exist')
      }
      return Promise.resolve(input);
    }
  }]);

  return Pagination;
}())();

var _createClass$9 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$9(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cacheHandler = new (function () {
  function CacheHandler() {
    _classCallCheck$9(this, CacheHandler);

    this._cachedETags = {};
  }

  // Default cacheHandler methods


  _createClass$9(CacheHandler, [{
    key: 'get',
    value: function get(method, path) {
      return this._cachedETags[method + ' ' + path];
    }
  }, {
    key: 'add',
    value: function add(method, path, eTag, data, status) {
      return this._cachedETags[method + ' ' + path] = { eTag: eTag, data: data, status: status };
    }
  }, {
    key: 'requestMiddlewareAsync',
    value: function requestMiddlewareAsync(input) {
      var clientOptions = input.clientOptions,
          method = input.method,
          path = input.path;

      if (input.headers == null) {
        input.headers = {};
      }
      var cacheHandler = clientOptions.cacheHandler || this;
      // Send the ETag if re-requesting a URL
      if (cacheHandler.get(method, path)) {
        input.headers['If-None-Match'] = cacheHandler.get(method, path).eTag;
      } else {
        // The browser will sneak in a 'If-Modified-Since' header if the GET has been requested before
        // but for some reason the cached response does not seem to be available
        // in the jqXHR object.
        // So, the first time a URL is requested set this date to 0 so we always get a response the 1st time
        // a URL is requested.
        input.headers['If-Modified-Since'] = 'Thu, 01 Jan 1970 00:00:00 GMT';
      }

      return Promise.resolve(input);
    }
  }, {
    key: 'responseMiddlewareAsync',
    value: function responseMiddlewareAsync(input, cb) {
      var clientOptions = input.clientOptions,
          request = input.request,
          status = input.status,
          jqXHR = input.jqXHR,
          data = input.data;

      if (!jqXHR) {
        return Promise.resolve(input);
      } // The plugins are all used in `octo.parse()` which does not have a jqXHR

      // Since this can be called via `octo.parse`, skip caching when there is no jqXHR
      if (jqXHR) {
        var method = request.method,
            path = request.path; // This is also not defined when octo.parse is called

        var cacheHandler = clientOptions.cacheHandler || this;
        if (status === 304 || status === 0) {
          var ref = cacheHandler.get(method, path);
          if (ref) {
            var eTag;

            // Set a flag on the object so users know this is a cached response
            // if (typeof data !== 'string') {
            //   data.__IS_CACHED = eTag || true
            // }
            data = ref.data;
            status = ref.status;
            eTag = ref.eTag;
          } else {
            throw new Error('ERROR: Bug in Octokat cacheHandler for path \'' + method + ' ' + path + '\'. It had an eTag but not the cached response.');
          }
        } else {
          // Cache the response to reuse later
          if (method === 'GET' && jqXHR.headers.get('ETag')) {
            var eTag = jqXHR.headers.get('ETag');
            cacheHandler.add(method, path, eTag, data, jqXHR.status);
          }
        }

        input.data = data;
        input.status = status;
        return Promise.resolve(input);
      }
    }
  }]);

  return CacheHandler;
}())();

var _createClass$a = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$a(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var readBinary = new (function () {
  function ReadBinary() {
    _classCallCheck$a(this, ReadBinary);

    this.verbs = {
      readBinary: function readBinary(path, query) {
        return { method: 'GET', path: '' + path + querystring(query), options: { isRaw: true, isBase64: true } };
      }
    };
  }

  _createClass$a(ReadBinary, [{
    key: 'requestMiddlewareAsync',
    value: function requestMiddlewareAsync(input) {
      var options = input.options;

      if (options) {
        var isBase64 = options.isBase64;

        if (isBase64) {
          input.headers['Accept'] = 'application/vnd.github.raw';
          input.mimeType = 'text/plain; charset=x-user-defined';
        }
      }
      return Promise.resolve(input);
    }
  }, {
    key: 'responseMiddlewareAsync',
    value: function responseMiddlewareAsync(input) {
      var options = input.options,
          data = input.data;

      if (options) {
        var isBase64 = options.isBase64;
        // Convert the response to a Base64 encoded string

        if (isBase64) {
          // Convert raw data to binary chopping off the higher-order bytes in each char.
          // Useful for Base64 encoding.
          var converted = '';
          var iterable = __range__(0, data.length, false);
          for (var j = 0; j < iterable.length; j++) {
            var i = iterable[j];
            converted += String.fromCharCode(data.charCodeAt(i) & 0xff);
          }

          input.data = converted; // or throw new Error('BUG! Expected JSON data to exist')
        }
      }
      return Promise.resolve(input);
    }
  }]);

  return ReadBinary;
}())();

function __range__(left, right, inclusive) {
  var range = [];
  var ascending = left < right;
  var end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}

var _createClass$b = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$b(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var camelCase = new (function () {
  function CamelCase() {
    _classCallCheck$b(this, CamelCase);
  }

  _createClass$b(CamelCase, [{
    key: 'responseMiddlewareAsync',
    value: function responseMiddlewareAsync(input) {
      var data = input.data;

      data = this.replace(data);
      input.data = data; // or throw new Error('BUG! Expected JSON data to exist')
      return Promise.resolve(input);
    }
  }, {
    key: 'replace',
    value: function replace(data) {
      if (Array.isArray(data)) {
        return this._replaceArray(data);
      } else if (typeof data === 'function') {
        return data;
      } else if (data instanceof Date) {
        return data;
      } else if (data === Object(data)) {
        return this._replaceObject(data);
      } else {
        return data;
      }
    }
  }, {
    key: '_replaceObject',
    value: function _replaceObject(orig) {
      var acc = {};
      var iterable = Object.keys(orig);
      for (var i = 0; i < iterable.length; i++) {
        var key = iterable[i];
        var value = orig[key];
        this._replaceKeyValue(acc, key, value);
      }

      return acc;
    }
  }, {
    key: '_replaceArray',
    value: function _replaceArray(orig) {
      var _this = this;

      var arr = orig.map(function (item) {
        return _this.replace(item);
      });
      // Convert the nextPage methods for paged results
      var iterable = Object.keys(orig);
      for (var i = 0; i < iterable.length; i++) {
        var key = iterable[i];
        var value = orig[key];
        this._replaceKeyValue(arr, key, value);
      }
      return arr;
    }

    // Convert things that end in `_url` to methods which return a Promise

  }, {
    key: '_replaceKeyValue',
    value: function _replaceKeyValue(acc, key, value) {
      return acc[plus_1.camelize(key)] = this.replace(value);
    }
  }]);

  return CamelCase;
}())();

var ALL_PLUGINS = [objectChainer, // re-chain methods when we detect an object (issue, comment, user, etc)
pathValidator, authorization, previewApis, usePostInsteadOfPatch, simpleVerbs, fetchAll, pagination,
// Run cacheHandler after PagedResults so the link headers are remembered
// but before hypermedia so the object is still serializable
cacheHandler, readBinary, hypermedia$1, camelCase];

var Octokat = function Octokat() {
  var clientOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (clientOptions.plugins == null) {
    clientOptions.plugins = ALL_PLUGINS;
  }

  if (clientOptions.disableHypermedia) {
    deprecate('Please use the clientOptions.plugins array and just do not include the hypermedia plugin');
    clientOptions.plugins = clientOptions.plugins.filter(function (plugin) {
      return plugin !== hypermedia$1;
    });
  }

  // HACK to propagate the Fetch implementation
  if (Octokat.Fetch) {
    base.Fetch = Octokat.Fetch;
  }
  // the octokat instance
  var instance = new base(clientOptions);
  return instance;
};

// module.exports = Octokat;
var octokat = Octokat;

var octokat$1 = octokat;

const createCommit = async(filename, data, images, commitMessage) => {
    try {
        let token = localStorage.getItem('access_token');
        if (!token) return;
        const github = new octokat$1({ token: token });
        const filepath = `public/assets/${filename}`.toLowerCase();
        let repo = await github.repos(GithubConfig.user, GithubConfig.repoName).fetch();
        let main = await repo.git.refs('heads/master').fetch();
        let treeItems = [];
        for (let image of images) {
            let imageGit = await repo.git.blobs.create({ content: image.data, encoding: 'base64' });
            let imagePath = `public/assets/images/${image.name}`.toLowerCase();
            treeItems.push({
                path: imagePath,
                sha: imageGit.sha,
                mode: '100644',
                type: 'blob'
            });
        }

        let file = await repo.git.blobs.create({ content: btoa(jsonEncode(data)), encoding: 'base64' });
        treeItems.push({
            path: filepath,
            sha: file.sha,
            mode: '100644',
            type: 'blob'
        });

        console.log('treeItems', treeItems);
        let tree = await repo.git.trees.create({
            tree: treeItems,
            base_tree: main.object.sha
        });

        let commit = await repo.git.commits.create({
            message: `Created via Web - ${commitMessage}`,
            tree: tree.sha,
            parents: [main.object.sha]
        });

        main.update({ sha: commit.sha });
        console.log('Posted');
    } catch (err) {
        console.error(err);
        console.log(err);
    }
};

const jsonEncode = (str) => {
    str = str.replace(/[^\x00-\x7F]/g, function(char) {
        var hex = char.charCodeAt(0).toString(16);
        while (hex.length < 4) hex = '0' + hex;

        return '\\u' + hex;
    });

    return str;
};

/* src/Admin.svelte generated by Svelte v3.21.0 */

const { console: console_1$1 } = globals;
const file$4 = "src/Admin.svelte";

function create_fragment$6(ctx) {
	let div0;
	let h2;
	let t1;
	let form;
	let div1;
	let label0;
	let b0;
	let t3;
	let input0;
	let t4;
	let textarea;
	let t5;
	let div2;
	let label1;
	let b1;
	let t7;
	let input1;
	let t8;
	let button;
	let dispose;

	const block = {
		c: function create() {
			div0 = element("div");
			h2 = element("h2");
			h2.textContent = "New Post";
			t1 = space();
			form = element("form");
			div1 = element("div");
			label0 = element("label");
			b0 = element("b");
			b0.textContent = "Post Titel";
			t3 = space();
			input0 = element("input");
			t4 = space();
			textarea = element("textarea");
			t5 = space();
			div2 = element("div");
			label1 = element("label");
			b1 = element("b");
			b1.textContent = "Github access token";
			t7 = space();
			input1 = element("input");
			t8 = space();
			button = element("button");
			button.textContent = "Submit";
			add_location(h2, file$4, 71, 2, 1871);
			attr_dev(div0, "class", "w3-container w3-teal");
			add_location(div0, file$4, 70, 0, 1834);
			add_location(b0, file$4, 77, 6, 2004);
			attr_dev(label0, "class", "w3-text-teal");
			add_location(label0, file$4, 76, 4, 1969);
			attr_dev(input0, "class", "w3-input w3-border w3-light-grey ");
			attr_dev(input0, "type", "text");
			add_location(input0, file$4, 79, 4, 2039);
			attr_dev(div1, "class", "w3-padding-16");
			add_location(div1, file$4, 75, 2, 1937);
			add_location(textarea, file$4, 82, 2, 2115);
			add_location(b1, file$4, 85, 6, 2214);
			attr_dev(label1, "class", "w3-text-teal");
			add_location(label1, file$4, 84, 4, 2179);
			attr_dev(input1, "class", "w3-input w3-border w3-light-grey ");
			attr_dev(input1, "type", "text");
			add_location(input1, file$4, 87, 4, 2258);
			attr_dev(div2, "class", "w3-padding-16");
			add_location(div2, file$4, 83, 2, 2147);
			attr_dev(button, "class", "w3-btn w3-blue-grey");
			add_location(button, file$4, 93, 2, 2378);
			attr_dev(form, "class", "w3-container w3-margin");
			add_location(form, file$4, 74, 0, 1897);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, div0, anchor);
			append_dev(div0, h2);
			insert_dev(target, t1, anchor);
			insert_dev(target, form, anchor);
			append_dev(form, div1);
			append_dev(div1, label0);
			append_dev(label0, b0);
			append_dev(div1, t3);
			append_dev(div1, input0);
			append_dev(form, t4);
			append_dev(form, textarea);
			/*textarea_binding*/ ctx[5](textarea);
			append_dev(form, t5);
			append_dev(form, div2);
			append_dev(div2, label1);
			append_dev(label1, b1);
			append_dev(div2, t7);
			append_dev(div2, input1);
			set_input_value(input1, /*access_token*/ ctx[1]);
			append_dev(form, t8);
			append_dev(form, button);
			if (remount) run_all(dispose);

			dispose = [
				listen_dev(input1, "input", /*input1_input_handler*/ ctx[6]),
				listen_dev(button, "click", prevent_default(/*submit*/ ctx[2]), false, true, false)
			];
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*access_token*/ 2 && input1.value !== /*access_token*/ ctx[1]) {
				set_input_value(input1, /*access_token*/ ctx[1]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div0);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(form);
			/*textarea_binding*/ ctx[5](null);
			run_all(dispose);
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
	let editor;
	let area;
	let access_token = localStorage.getItem("access_token");

	const base64 = url => {
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "blob";

		request.onload = function () {
			var reader = new FileReader();
			reader.readAsDataURL(request.response);

			reader.onload = function (e) {
				console.log("DataURL:", e.target.result);
			};
		};

		request.send();
	};

	async function submit() {
		let imagesfiles = [];
		let ht = editor.value;
		console.log(ht);
		var container = document.createElement("div");
		container.innerHTML = ht;
		let images = container.getElementsByTagName("img");

		for (let i = 0; i < images.length; i++) {
			let base64 = await toDataURL(images[i].src);
			base64 = base64.replace(/^data:image\/[a-z]+;base64,/, "");

			let newimage = {
				name: getFilename(images[i].src),
				data: base64
			};

			imagesfiles.push(newimage);
			images[i].src = `/assets/images/${newimage.name}`;
		}

		console.log(container.innerHTML);
		await createCommit("filename.json", container.innerHTML, imagesfiles, "New post added");
	}

	onMount(() => {
		editor = Jodit.make(area, {
			askBeforePasteHTML: false,
			processPasteHTML: true,
			removeEmptyBlocks: false,
			defaultActionOnPaste: "insert_clear_html",
			height: "60vh",
			uploader: { insertImageAsBase64URI: true },
			events: {
				change(n) {
					
				}
			}
		});
	});

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Admin> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Admin", $$slots, []);

	function textarea_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(0, area = $$value);
		});
	}

	function input1_input_handler() {
		access_token = this.value;
		$$invalidate(1, access_token);
	}

	$$self.$capture_state = () => ({
		Jodit,
		onMount,
		createCommit,
		getFilename,
		getBlob,
		toDataURL,
		editor,
		area,
		access_token,
		base64,
		submit
	});

	$$self.$inject_state = $$props => {
		if ("editor" in $$props) editor = $$props.editor;
		if ("area" in $$props) $$invalidate(0, area = $$props.area);
		if ("access_token" in $$props) $$invalidate(1, access_token = $$props.access_token);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*access_token*/ 2) {
			 localStorage.setItem("access_token", access_token);
		}
	};

	return [
		area,
		access_token,
		submit,
		editor,
		base64,
		textarea_binding,
		input1_input_handler
	];
}

class Admin extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Admin",
			options,
			id: create_fragment$6.name
		});
	}
}

/* src/App.svelte generated by Svelte v3.21.0 */

const { console: console_1$2 } = globals;
const file$5 = "src/App.svelte";

// (24:6) <Route path="/admin">
function create_default_slot_3(ctx) {
	let current;
	const admin = new Admin({ $$inline: true });

	const block = {
		c: function create() {
			create_component(admin.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(admin, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(admin.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(admin.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(admin, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_3.name,
		type: "slot",
		source: "(24:6) <Route path=\\\"/admin\\\">",
		ctx
	});

	return block;
}

// (27:6) <Route path="/">
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
		source: "(27:6) <Route path=\\\"/\\\">",
		ctx
	});

	return block;
}

// (30:6) <Route path="/:slug" let:params>
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
		source: "(30:6) <Route path=\\\"/:slug\\\" let:params>",
		ctx
	});

	return block;
}

// (20:0) <Router>
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
			add_location(main, file$5, 22, 4, 577);
			attr_dev(div, "class", "w3-row w3-theme wapper");
			add_location(div, file$5, 20, 2, 484);
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
		source: "(20:0) <Router>",
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
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("App", $$slots, []);
	const func = x => console.log();
	const func_1 = x => $$invalidate(2, selectedPost = x);

	$$self.$capture_state = () => ({
		Route,
		Router,
		Sidebar,
		Post,
		Admin,
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

export default app;
//# sourceMappingURL=main.js.map
