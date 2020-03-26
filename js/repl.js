(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.JavascriptRepl = factory());
}(this, function () { 'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
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
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
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

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
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
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
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

    var srcdoc = "<!doctype html>\n<html>\n  <head>\n    <style>\n\t\t\thtml, body {\n\t\t\t\twidth: 100%;\n\t\t\t\theight: 100%;\n\t\t\t\tmargin: 0 !important;\n\t\t\t\tpadding: 0 !important;\n\t\t\t}\n    </style>\n\t\t<script src=\"https://d3js.org/d3.v5.min.js\"></script>\n    <script>\n      (function(){\n        function handle_message(event) {\n\t\t\t\t\ttry {\n\t\t\t\t\t\teval(event.data.script)\n\t\t\t\t\t} catch(e) {\n\t\t\t\t\t\tconsole.log(e)\n\t\t\t\t\t\t//send error bacl\n\t\t\t\t\t}\n        }\n        window.addEventListener('message', handle_message, false);\n      }).call(this);\n    </script>\n  </head>\n  <body></body>\n</html>\n";

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
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
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
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
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

    const ready = writable(false);
    const code = writable('');
    const html = writable('');
    const injectedLibraries = writable([]);
    const injectedJS = writable('');

    const files = writable([]);
    const currentFileIndex = writable(0);

    const currentFile = derived(
      [files, currentFileIndex],
      ([$files, $currentFileIndex]) => $files[$currentFileIndex]
    );

    /* src/Result.svelte generated by Svelte v3.8.1 */

    function create_fragment(ctx) {
    	var iframe_1, dispose;

    	return {
    		c() {
    			iframe_1 = element("iframe");
    			attr(iframe_1, "title", "Result");
    			attr(iframe_1, "sandbox", "allow-scripts allow-same-origin");
    			attr(iframe_1, "srcdoc", srcdoc);
    			attr(iframe_1, "width", ctx.width);
    			attr(iframe_1, "height", ctx.height);
    			dispose = listen(window, "resize", ctx.handleResize);
    		},

    		m(target, anchor) {
    			insert(target, iframe_1, anchor);
    			ctx.iframe_1_binding(iframe_1);
    		},

    		p(changed, ctx) {
    			if (changed.width) {
    				attr(iframe_1, "width", ctx.width);
    			}

    			if (changed.height) {
    				attr(iframe_1, "height", ctx.height);
    			}
    		},

    		i: noop,
    		o: noop,

    		d(detaching) {
    			if (detaching) {
    				detach(iframe_1);
    			}

    			ctx.iframe_1_binding(null);
    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $ready, $injectedJS, $injectedLibraries;

    	component_subscribe($$self, ready, $$value => { $ready = $$value; $$invalidate('$ready', $ready); });
    	component_subscribe($$self, injectedJS, $$value => { $injectedJS = $$value; $$invalidate('$injectedJS', $injectedJS); });
    	component_subscribe($$self, injectedLibraries, $$value => { $injectedLibraries = $$value; $$invalidate('$injectedLibraries', $injectedLibraries); });

    	

    	let iframe;
    	let { injectedCSS = '', width, height, code, html } = $$props;

    	let message = '';
    	onMount(() => {
    		iframe.addEventListener('load', () => {
    			ready.set(true);
    		});
    	});
      function handleResize() {
    		iframe.contentWindow.postMessage({ script: message }, '*');
      }

    	function iframe_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('iframe', iframe = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('injectedCSS' in $$props) $$invalidate('injectedCSS', injectedCSS = $$props.injectedCSS);
    		if ('width' in $$props) $$invalidate('width', width = $$props.width);
    		if ('height' in $$props) $$invalidate('height', height = $$props.height);
    		if ('code' in $$props) $$invalidate('code', code = $$props.code);
    		if ('html' in $$props) $$invalidate('html', html = $$props.html);
    	};

    	let styles;

    	$$self.$$.update = ($$dirty = { injectedCSS: 1, $ready: 1, code: 1, html: 1, $injectedJS: 1, styles: 1, iframe: 1, message: 1, $injectedLibraries: 1 }) => {
    		if ($$dirty.injectedCSS) { $$invalidate('styles', styles = injectedCSS && `{
    const style = document.createElement('style');
    style.textContent = ${JSON.stringify(injectedCSS)};
    document.head.appendChild(style);
  }`); }
    		if ($$dirty.$ready || $$dirty.code || $$dirty.html || $$dirty.$injectedJS || $$dirty.styles || $$dirty.iframe || $$dirty.message) { if($ready && (code || html)) {
        		$$invalidate('message', message = `
        ${$injectedJS}
        ${styles}
    		document.body.innerHTML = '';
    document.body.innerHTML = '${html}';
		${code}
    		`);
        		iframe.contentWindow.postMessage({ script: message }, '*');
        	} }
    		if ($$dirty.$injectedLibraries) { if($injectedLibraries.length > 0) {
            libraries = $injectedLibraries.map((lib) => {
              return `{
        const script = document.createElement('script');
        script.type= 'text/javascript';
        script.src = '${lib}';
        document.head.appendChild(script);
      }`
            });
          } }
    	};

    	return {
    		iframe,
    		injectedCSS,
    		width,
    		height,
    		code,
    		html,
    		handleResize,
    		iframe_1_binding
    	};
    }

    class Result extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, ["injectedCSS", "width", "height", "code", "html"]);
    	}
    }

    /* src/Viewer.svelte generated by Svelte v3.8.1 */

    function create_fragment$1(ctx) {
    	var current;

    	var result = new Result({
    		props: {
    		width: ctx.width,
    		height: ctx.height,
    		code: ctx.$code,
    		html: ctx.$html
    	}
    	});

    	return {
    		c() {
    			result.$$.fragment.c();
    		},

    		m(target, anchor) {
    			mount_component(result, target, anchor);
    			current = true;
    		},

    		p(changed, ctx) {
    			var result_changes = {};
    			if (changed.width) result_changes.width = ctx.width;
    			if (changed.height) result_changes.height = ctx.height;
    			if (changed.$code) result_changes.code = ctx.$code;
    			if (changed.$html) result_changes.html = ctx.$html;
    			result.$set(result_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(result.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(result.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			destroy_component(result, detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $code, $html;

    	component_subscribe($$self, code, $$value => { $code = $$value; $$invalidate('$code', $code); });
    	component_subscribe($$self, html, $$value => { $html = $$value; $$invalidate('$html', $html); });

    	
      let { width, height } = $$props;

    	$$self.$set = $$props => {
    		if ('width' in $$props) $$invalidate('width', width = $$props.width);
    		if ('height' in $$props) $$invalidate('height', height = $$props.height);
    	};

    	return { width, height, $code, $html };
    }

    class Viewer extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["width", "height"]);
    	}
    }

    /* src/Console.svelte generated by Svelte v3.8.1 */

    function create_fragment$2(ctx) {
    	var current;

    	var result = new Result({
    		props: {
    		width: ctx.width,
    		height: ctx.height,
    		html: '',
    		code: ctx.message
    	}
    	});

    	return {
    		c() {
    			result.$$.fragment.c();
    		},

    		m(target, anchor) {
    			mount_component(result, target, anchor);
    			current = true;
    		},

    		p(changed, ctx) {
    			var result_changes = {};
    			if (changed.width) result_changes.width = ctx.width;
    			if (changed.height) result_changes.height = ctx.height;
    			if (changed.message) result_changes.code = ctx.message;
    			result.$set(result_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(result.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(result.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			destroy_component(result, detaching);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $code;

    	component_subscribe($$self, code, $$value => { $code = $$value; $$invalidate('$code', $code); });

    	

      let { width, height } = $$props;

      let message = '';

    	$$self.$set = $$props => {
    		if ('width' in $$props) $$invalidate('width', width = $$props.width);
    		if ('height' in $$props) $$invalidate('height', height = $$props.height);
    	};

    	$$self.$$.update = ($$dirty = { $code: 1 }) => {
    		if ($$dirty.$code) { if($code) {
        		$$invalidate('message', message = `
    		document.body.innerHTML = '';
    var consoleOutput = '';
    var old = console.log;
    console.log = function (message) {
      if (typeof message == 'object') {
        consoleOutput += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
      } else {
        consoleOutput += message + '<br />';
      }
    };
		${$code}
    		document.body.innerHTML = '';
    document.body.innerHTML = consoleOutput;
		`);
        	} }
    	};

    	return { width, height, message };
    }

    class Console extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["width", "height"]);
    	}
    }

    /* src/ViewerConsole.svelte generated by Svelte v3.8.1 */

    function create_fragment$3(ctx) {
    	var div6, div2, div0, a0, t0, a0_class_value, div0_class_value, t1, div1, a1, t2, a1_class_value, div1_class_value, div2_class_value, t3, div5, div3, div3_class_value, t4, div4, div4_class_value, div5_resize_listener, div5_class_value, div6_class_value, current, dispose;

    	var viewer = new Viewer({
    		props: {
    		width: ctx.iframeComtainerWidth,
    		height: ctx.iframeComtainerHeight
    	}
    	});

    	var console = new Console({
    		props: {
    		width: ctx.iframeComtainerWidth,
    		height: ctx.iframeComtainerHeight
    	}
    	});

    	return {
    		c() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			t0 = text("Result");
    			t1 = space();
    			div1 = element("div");
    			a1 = element("a");
    			t2 = text("Console");
    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			viewer.$$.fragment.c();
    			t4 = space();
    			div4 = element("div");
    			console.$$.fragment.c();
    			attr(a0, "class", a0_class_value = ctx.cssStyles.viewerActions.link);
    			toggle_class(a0, "active", ctx.tab == 'viewer');
    			attr(div0, "class", div0_class_value = ctx.cssStyles.viewerActions.tabItem);
    			attr(a1, "class", a1_class_value = ctx.cssStyles.viewerActions.link);
    			toggle_class(a1, "active", ctx.tab == 'console');
    			attr(div1, "class", div1_class_value = ctx.cssStyles.viewerActions.tabItem);
    			attr(div2, "class", div2_class_value = ctx.cssStyles.viewerActions.container);
    			attr(div3, "class", div3_class_value = ctx.cssStyles.viewer);
    			toggle_class(div3, "hidden", ctx.tab != 'viewer');
    			attr(div4, "class", div4_class_value = ctx.cssStyles.console);
    			toggle_class(div4, "hidden", ctx.tab != 'console');
    			add_render_callback(() => ctx.div5_resize_handler.call(div5));
    			attr(div5, "class", div5_class_value = ctx.cssStyles.viewerConsoleContainer);
    			attr(div6, "class", div6_class_value = ctx.cssStyles.viewerContainer);

    			dispose = [
    				listen(a0, "click", ctx.click_handler),
    				listen(a1, "click", ctx.click_handler_1)
    			];
    		},

    		m(target, anchor) {
    			insert(target, div6, anchor);
    			append(div6, div2);
    			append(div2, div0);
    			append(div0, a0);
    			append(a0, t0);
    			append(div2, t1);
    			append(div2, div1);
    			append(div1, a1);
    			append(a1, t2);
    			append(div6, t3);
    			append(div6, div5);
    			append(div5, div3);
    			mount_component(viewer, div3, null);
    			append(div5, t4);
    			append(div5, div4);
    			mount_component(console, div4, null);
    			div5_resize_listener = add_resize_listener(div5, ctx.div5_resize_handler.bind(div5));
    			current = true;
    		},

    		p(changed, ctx) {
    			if ((!current || changed.cssStyles) && a0_class_value !== (a0_class_value = ctx.cssStyles.viewerActions.link)) {
    				attr(a0, "class", a0_class_value);
    			}

    			if ((changed.cssStyles || changed.tab)) {
    				toggle_class(a0, "active", ctx.tab == 'viewer');
    			}

    			if ((!current || changed.cssStyles) && div0_class_value !== (div0_class_value = ctx.cssStyles.viewerActions.tabItem)) {
    				attr(div0, "class", div0_class_value);
    			}

    			if ((!current || changed.cssStyles) && a1_class_value !== (a1_class_value = ctx.cssStyles.viewerActions.link)) {
    				attr(a1, "class", a1_class_value);
    			}

    			if ((changed.cssStyles || changed.tab)) {
    				toggle_class(a1, "active", ctx.tab == 'console');
    			}

    			if ((!current || changed.cssStyles) && div1_class_value !== (div1_class_value = ctx.cssStyles.viewerActions.tabItem)) {
    				attr(div1, "class", div1_class_value);
    			}

    			if ((!current || changed.cssStyles) && div2_class_value !== (div2_class_value = ctx.cssStyles.viewerActions.container)) {
    				attr(div2, "class", div2_class_value);
    			}

    			var viewer_changes = {};
    			if (changed.iframeComtainerWidth) viewer_changes.width = ctx.iframeComtainerWidth;
    			if (changed.iframeComtainerHeight) viewer_changes.height = ctx.iframeComtainerHeight;
    			viewer.$set(viewer_changes);

    			if ((!current || changed.cssStyles) && div3_class_value !== (div3_class_value = ctx.cssStyles.viewer)) {
    				attr(div3, "class", div3_class_value);
    			}

    			if ((changed.cssStyles || changed.tab)) {
    				toggle_class(div3, "hidden", ctx.tab != 'viewer');
    			}

    			var console_changes = {};
    			if (changed.iframeComtainerWidth) console_changes.width = ctx.iframeComtainerWidth;
    			if (changed.iframeComtainerHeight) console_changes.height = ctx.iframeComtainerHeight;
    			console.$set(console_changes);

    			if ((!current || changed.cssStyles) && div4_class_value !== (div4_class_value = ctx.cssStyles.console)) {
    				attr(div4, "class", div4_class_value);
    			}

    			if ((changed.cssStyles || changed.tab)) {
    				toggle_class(div4, "hidden", ctx.tab != 'console');
    			}

    			if ((!current || changed.cssStyles) && div5_class_value !== (div5_class_value = ctx.cssStyles.viewerConsoleContainer)) {
    				attr(div5, "class", div5_class_value);
    			}

    			if ((!current || changed.cssStyles) && div6_class_value !== (div6_class_value = ctx.cssStyles.viewerContainer)) {
    				attr(div6, "class", div6_class_value);
    			}
    		},

    		i(local) {
    			if (current) return;
    			transition_in(viewer.$$.fragment, local);

    			transition_in(console.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(viewer.$$.fragment, local);
    			transition_out(console.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div6);
    			}

    			destroy_component(viewer);

    			destroy_component(console);

    			div5_resize_listener.cancel();
    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	

      let { cssStyles, width = 0, height = 0 } = $$props;
      let iframeComtainerWidth;
      let iframeComtainerHeight;

      let tab = 'viewer';

      function showConsole() {
        $$invalidate('tab', tab = 'console');
      }
      function showResult() {
        $$invalidate('tab', tab = 'viewer');
      }

    	function click_handler() {
    		return showResult();
    	}

    	function click_handler_1() {
    		return showConsole();
    	}

    	function div5_resize_handler() {
    		iframeComtainerWidth = this.clientWidth;
    		iframeComtainerHeight = this.clientHeight;
    		$$invalidate('iframeComtainerWidth', iframeComtainerWidth);
    		$$invalidate('iframeComtainerHeight', iframeComtainerHeight);
    	}

    	$$self.$set = $$props => {
    		if ('cssStyles' in $$props) $$invalidate('cssStyles', cssStyles = $$props.cssStyles);
    		if ('width' in $$props) $$invalidate('width', width = $$props.width);
    		if ('height' in $$props) $$invalidate('height', height = $$props.height);
    	};

    	return {
    		cssStyles,
    		width,
    		height,
    		iframeComtainerWidth,
    		iframeComtainerHeight,
    		tab,
    		showConsole,
    		showResult,
    		click_handler,
    		click_handler_1,
    		div5_resize_handler
    	};
    }

    class ViewerConsole extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["cssStyles", "width", "height"]);
    	}
    }

    /* src/Editor.svelte generated by Svelte v3.8.1 */

    function add_css() {
    	var style = element("style");
    	style.id = 'svelte-5qo5ik-style';
    	style.textContent = ".codemirror-container.svelte-5qo5ik{position:relative;width:100%;height:100%;border:none;line-height:1.5;overflow:hidden}.codemirror-container.svelte-5qo5ik .CodeMirror{height:100%;background:transparent;font:400 14px/1.7 var(--font-mono);color:var(--base)}.codemirror-container.flex.svelte-5qo5ik .CodeMirror{height:auto}.codemirror-container.flex.svelte-5qo5ik .CodeMirror-lines{padding:0}.codemirror-container.svelte-5qo5ik .CodeMirror-gutters{padding:0 16px 0 8px;border:none}.codemirror-container.svelte-5qo5ik .error-loc{position:relative;border-bottom:2px solid #da106e}.codemirror-container.svelte-5qo5ik .error-line{background-color:rgba(200, 0, 0, .05)}textarea.svelte-5qo5ik{visibility:hidden}pre.svelte-5qo5ik{position:absolute;width:100%;height:100%;top:0;left:0;border:none;padding:4px 4px 4px 60px;resize:none;font-family:var(--font-mono);font-size:13px;line-height:1.7;user-select:none;pointer-events:none;color:#ccc;tab-size:2;-moz-tab-size:2}.flex.svelte-5qo5ik pre.svelte-5qo5ik{padding:0 0 0 4px;height:auto}";
    	append(document.head, style);
    }

    // (214:1) {#if !CodeMirror}
    function create_if_block(ctx) {
    	var pre, t0, t1, div;

    	return {
    		c() {
    			pre = element("pre");
    			t0 = text(ctx.code);
    			t1 = space();
    			div = element("div");
    			set_style(pre, "position", "absolute");
    			set_style(pre, "left", "0");
    			set_style(pre, "top", "0");
    			attr(pre, "class", "svelte-5qo5ik");
    			set_style(div, "position", "absolute");
    			set_style(div, "width", "100%");
    			set_style(div, "bottom", "0");
    		},

    		m(target, anchor) {
    			insert(target, pre, anchor);
    			append(pre, t0);
    			insert(target, t1, anchor);
    			insert(target, div, anchor);
    		},

    		p(changed, ctx) {
    			if (changed.code) {
    				set_data(t0, ctx.code);
    			}
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(pre);
    				detach(t1);
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var div, textarea, t, div_resize_listener;

    	var if_block = (!ctx.CodeMirror) && create_if_block(ctx);

    	return {
    		c() {
    			div = element("div");
    			textarea = element("textarea");
    			t = space();
    			if (if_block) if_block.c();
    			attr(textarea, "tabindex", "0");
    			textarea.readOnly = true;
    			textarea.value = ctx.code;
    			attr(textarea, "class", "svelte-5qo5ik");
    			add_render_callback(() => ctx.div_resize_handler.call(div));
    			attr(div, "class", "codemirror-container svelte-5qo5ik");
    			toggle_class(div, "flex", ctx.flex);
    		},

    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, textarea);
    			ctx.textarea_binding(textarea);
    			append(div, t);
    			if (if_block) if_block.m(div, null);
    			div_resize_listener = add_resize_listener(div, ctx.div_resize_handler.bind(div));
    		},

    		p(changed, ctx) {
    			if (changed.code) {
    				textarea.value = ctx.code;
    			}

    			if (!ctx.CodeMirror) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.flex) {
    				toggle_class(div, "flex", ctx.flex);
    			}
    		},

    		i: noop,
    		o: noop,

    		d(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			ctx.textarea_binding(null);
    			if (if_block) if_block.d();
    			div_resize_listener.cancel();
    		}
    	};
    }

    let codemirror_promise;

    function sleep(ms) {
    	return new Promise(fulfil => setTimeout(fulfil, ms));
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { readonly = false, errorLoc = null, flex = false, lineNumbers = true, tab = true } = $$props;
    	let w;
    	let h;
    	let { code = '' } = $$props;
    	let mode;
    	// We have to expose set and update methods, rather
    	// than making this state-driven through props,
    	// because it's difficult to update an editor
    	// without resetting scroll otherwise
    	async function set(new_code, new_mode) {
    		if (new_mode !== mode) {
    			await createEditor(mode = new_mode);		}
    		$$invalidate('code', code = new_code);
    		updating_externally = true;
    		if (editor) editor.setValue(code);
    		updating_externally = false;
    	}
    	function update(new_code) {
    		$$invalidate('code', code = new_code);
    		if (editor) {
    			const { left, top } = editor.getScrollInfo();
    			editor.setValue(code = new_code); $$invalidate('code', code);
    			editor.scrollTo(left, top);
    		}
    	}
    	function resize() {
    		editor.refresh();
    	}
    	function focus() {
    		editor.focus();
    	}
    	const modes = {
    		js: {
    			name: 'javascript',
    			json: false
    		},
    		json: {
    			name: 'javascript',
    			json: true
    		},
    	};
    	const refs = {};
    	let editor;
    	let updating_externally = false;
    	let marker;
    	let error_line;
    	let destroyed = false;
    	let CodeMirror;
    	let previous_error_line;
    	onMount(() => {
    		if (window.CodeMirror) {
    			$$invalidate('CodeMirror', CodeMirror = window.CodeMirror);
    			createEditor(mode || 'js').then(() => {
    				if (editor) editor.setValue(code || '');
    			});
    		} else {
    			codemirror_promise.then(async mod => {
    				$$invalidate('CodeMirror', CodeMirror = mod.default);
    				await createEditor(mode || 'js');
    				if (editor) editor.setValue(code || '');
    			});
    		}
    		return () => {
    			destroyed = true;
    			if (editor) editor.toTextArea();
    		}
    	});
    	let first = true;
    	async function createEditor(mode) {
    		if (destroyed || !CodeMirror) return;
    		if (editor) editor.toTextArea();
    		const opts = {
    			lineNumbers,
    			lineWrapping: true,
    			indentWithTabs: true,
    			indentUnit: 2,
    			tabSize: 2,
    			value: '',
    			mode: modes[mode] || {
    				name: mode
    			},
    			readOnly: readonly,
    			autoCloseBrackets: true,
    			autoCloseTags: true
    		};
    		if (!tab) opts.extraKeys = {
    			Tab: tab,
    			'Shift-Tab': tab
    		};
    		// Creating a text editor is a lot of work, so we yield
    		// the main thread for a moment. This helps reduce jank
    		if (first) await sleep(50);
    		if (destroyed) return;
    		$$invalidate('editor', editor = CodeMirror.fromTextArea(refs.editor, opts));
    		editor.on('change', instance => {
    			if (!updating_externally) {
    				const value = instance.getValue();
    				dispatch('change', { value });
    			}
    		});
    		if (first) await sleep(50);
    		editor.refresh();
    		first = false;
    	}

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			refs.editor = $$value;
    			$$invalidate('refs', refs);
    		});
    	}

    	function div_resize_handler() {
    		w = this.offsetWidth;
    		h = this.offsetHeight;
    		$$invalidate('w', w);
    		$$invalidate('h', h);
    	}

    	$$self.$set = $$props => {
    		if ('readonly' in $$props) $$invalidate('readonly', readonly = $$props.readonly);
    		if ('errorLoc' in $$props) $$invalidate('errorLoc', errorLoc = $$props.errorLoc);
    		if ('flex' in $$props) $$invalidate('flex', flex = $$props.flex);
    		if ('lineNumbers' in $$props) $$invalidate('lineNumbers', lineNumbers = $$props.lineNumbers);
    		if ('tab' in $$props) $$invalidate('tab', tab = $$props.tab);
    		if ('code' in $$props) $$invalidate('code', code = $$props.code);
    	};

    	$$self.$$.update = ($$dirty = { editor: 1, w: 1, h: 1, marker: 1, errorLoc: 1, previous_error_line: 1, error_line: 1 }) => {
    		if ($$dirty.editor || $$dirty.w || $$dirty.h) { if (editor && w && h) {
    				editor.refresh();
    			} }
    		if ($$dirty.marker || $$dirty.errorLoc || $$dirty.editor) { {
    				if (marker) marker.clear();
    				if (errorLoc) {
    					const line = errorLoc.line - 1;
    					const ch = errorLoc.column;
    					$$invalidate('marker', marker = editor.markText({ line, ch }, { line, ch: ch + 1 }, {
    						className: 'error-loc'
    					}));
    					$$invalidate('error_line', error_line = line);
    				} else {
    					$$invalidate('error_line', error_line = null);
    				}
    			} }
    		if ($$dirty.editor || $$dirty.previous_error_line || $$dirty.error_line) { if (editor) {
    				if (previous_error_line != null) {
    					editor.removeLineClass(previous_error_line, 'wrap', 'error-line');
    				}
    				if (error_line && (error_line !== previous_error_line)) {
    					editor.addLineClass(error_line, 'wrap', 'error-line');
    					$$invalidate('previous_error_line', previous_error_line = error_line);
    				}
    			} }
    	};

    	return {
    		readonly,
    		errorLoc,
    		flex,
    		lineNumbers,
    		tab,
    		w,
    		h,
    		code,
    		set,
    		update,
    		resize,
    		focus,
    		refs,
    		CodeMirror,
    		textarea_binding,
    		div_resize_handler
    	};
    }

    class Editor extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-5qo5ik-style")) add_css();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["readonly", "errorLoc", "flex", "lineNumbers", "tab", "code", "set", "update", "resize", "focus"]);
    	}

    	get set() {
    		return this.$$.ctx.set;
    	}

    	get update() {
    		return this.$$.ctx.update;
    	}

    	get resize() {
    		return this.$$.ctx.resize;
    	}

    	get focus() {
    		return this.$$.ctx.focus;
    	}
    }

    /* src/layouts/Default.svelte generated by Svelte v3.8.1 */

    const get_viewer_console_slot_changes = () => ({});
    const get_viewer_console_slot_context = () => ({});

    const get_editor_slot_changes = () => ({});
    const get_editor_slot_context = () => ({});

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.name = list[i].name;
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (18:8) {#each $files as { name }
    function create_each_block(ctx) {
    	var div, a, t0_value = ctx.name + "", t0, a_class_value, t1, div_class_value, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		c() {
    			div = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr(a, "class", a_class_value = ctx.cssStyles.editorActions.link);
    			toggle_class(a, "active", ctx.$currentFileIndex == ctx.i);
    			attr(div, "class", div_class_value = ctx.cssStyles.editorActions.tabItem);
    			dispose = listen(a, "click", click_handler);
    		},

    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, a);
    			append(a, t0);
    			append(div, t1);
    		},

    		p(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.$files) && t0_value !== (t0_value = ctx.name + "")) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.cssStyles) && a_class_value !== (a_class_value = ctx.cssStyles.editorActions.link)) {
    				attr(a, "class", a_class_value);
    			}

    			if ((changed.cssStyles || changed.$currentFileIndex)) {
    				toggle_class(a, "active", ctx.$currentFileIndex == ctx.i);
    			}

    			if ((changed.cssStyles) && div_class_value !== (div_class_value = ctx.cssStyles.editorActions.tabItem)) {
    				attr(div, "class", div_class_value);
    			}
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	var div3, div2, div1, div0, div0_class_value, t0, div1_class_value, t1, div2_class_value, div3_class_value, current;

    	var each_value = ctx.$files;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const editor_slot_template = ctx.$$slots.editor;
    	const editor_slot = create_slot(editor_slot_template, ctx, get_editor_slot_context);

    	const viewer_console_slot_template = ctx.$$slots["viewer-console"];
    	const viewer_console_slot = create_slot(viewer_console_slot_template, ctx, get_viewer_console_slot_context);

    	return {
    		c() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();

    			if (editor_slot) editor_slot.c();
    			t1 = space();

    			if (viewer_console_slot) viewer_console_slot.c();
    			attr(div0, "class", div0_class_value = ctx.cssStyles.editorActions.container);

    			attr(div1, "class", div1_class_value = ctx.cssStyles.editor);

    			attr(div2, "class", div2_class_value = "result-container " + ctx.cssStyles.resultContainer);
    			attr(div3, "class", div3_class_value = ctx.cssStyles.container);
    		},

    		l(nodes) {
    			if (editor_slot) editor_slot.l(div1_nodes);

    			if (viewer_console_slot) viewer_console_slot.l(div2_nodes);
    		},

    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, div0);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append(div1, t0);

    			if (editor_slot) {
    				editor_slot.m(div1, null);
    			}

    			append(div2, t1);

    			if (viewer_console_slot) {
    				viewer_console_slot.m(div2, null);
    			}

    			current = true;
    		},

    		p(changed, ctx) {
    			if (changed.cssStyles || changed.$currentFileIndex || changed.$files) {
    				each_value = ctx.$files;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if ((!current || changed.cssStyles) && div0_class_value !== (div0_class_value = ctx.cssStyles.editorActions.container)) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (editor_slot && editor_slot.p && changed.$$scope) {
    				editor_slot.p(
    					get_slot_changes(editor_slot_template, ctx, changed, get_editor_slot_changes),
    					get_slot_context(editor_slot_template, ctx, get_editor_slot_context)
    				);
    			}

    			if ((!current || changed.cssStyles) && div1_class_value !== (div1_class_value = ctx.cssStyles.editor)) {
    				attr(div1, "class", div1_class_value);
    			}

    			if (viewer_console_slot && viewer_console_slot.p && changed.$$scope) {
    				viewer_console_slot.p(
    					get_slot_changes(viewer_console_slot_template, ctx, changed, get_viewer_console_slot_changes),
    					get_slot_context(viewer_console_slot_template, ctx, get_viewer_console_slot_context)
    				);
    			}

    			if ((!current || changed.cssStyles) && div2_class_value !== (div2_class_value = "result-container " + ctx.cssStyles.resultContainer)) {
    				attr(div2, "class", div2_class_value);
    			}

    			if ((!current || changed.cssStyles) && div3_class_value !== (div3_class_value = ctx.cssStyles.container)) {
    				attr(div3, "class", div3_class_value);
    			}
    		},

    		i(local) {
    			if (current) return;
    			transition_in(editor_slot, local);
    			transition_in(viewer_console_slot, local);
    			current = true;
    		},

    		o(local) {
    			transition_out(editor_slot, local);
    			transition_out(viewer_console_slot, local);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div3);
    			}

    			destroy_each(each_blocks, detaching);

    			if (editor_slot) editor_slot.d(detaching);

    			if (viewer_console_slot) viewer_console_slot.d(detaching);
    		}
    	};
    }

    function showFile(fileIndex) {
      currentFileIndex.set(fileIndex);
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $files, $currentFileIndex;

    	component_subscribe($$self, files, $$value => { $files = $$value; $$invalidate('$files', $files); });
    	component_subscribe($$self, currentFileIndex, $$value => { $currentFileIndex = $$value; $$invalidate('$currentFileIndex', $currentFileIndex); });

    	let { cssStyles } = $$props;

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler({ i }) {
    		return showFile(i);
    	}

    	$$self.$set = $$props => {
    		if ('cssStyles' in $$props) $$invalidate('cssStyles', cssStyles = $$props.cssStyles);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		cssStyles,
    		$files,
    		$currentFileIndex,
    		click_handler,
    		$$slots,
    		$$scope
    	};
    }

    class Default extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["cssStyles"]);
    	}
    }

    /* src/layouts/Minimal.svelte generated by Svelte v3.8.1 */

    const get_viewer_slot_changes = ({ width, height }) => ({ width: width, height: height });
    const get_viewer_slot_context = ({ width, height }) => ({ width: width, height: height });

    const get_editor_slot_changes$1 = () => ({});
    const get_editor_slot_context$1 = () => ({});

    function create_fragment$6(ctx) {
    	var div3, div0, div0_class_value, t, div2, div1, div1_resize_listener, div1_class_value, div2_class_value, div3_class_value, current;

    	const editor_slot_template = ctx.$$slots.editor;
    	const editor_slot = create_slot(editor_slot_template, ctx, get_editor_slot_context$1);

    	const viewer_slot_template = ctx.$$slots.viewer;
    	const viewer_slot = create_slot(viewer_slot_template, ctx, get_viewer_slot_context);

    	return {
    		c() {
    			div3 = element("div");
    			div0 = element("div");

    			if (editor_slot) editor_slot.c();
    			t = space();
    			div2 = element("div");
    			div1 = element("div");

    			if (viewer_slot) viewer_slot.c();

    			attr(div0, "class", div0_class_value = "result-container " + ctx.cssStyles.resultContainer);

    			add_render_callback(() => ctx.div1_resize_handler.call(div1));
    			attr(div1, "class", div1_class_value = ctx.cssStyles.viewerConsoleContainer);
    			attr(div2, "class", div2_class_value = ctx.cssStyles.viewerContainer);
    			attr(div3, "class", div3_class_value = ctx.cssStyles.container);
    		},

    		l(nodes) {
    			if (editor_slot) editor_slot.l(div0_nodes);

    			if (viewer_slot) viewer_slot.l(div1_nodes);
    		},

    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div0);

    			if (editor_slot) {
    				editor_slot.m(div0, null);
    			}

    			append(div3, t);
    			append(div3, div2);
    			append(div2, div1);

    			if (viewer_slot) {
    				viewer_slot.m(div1, null);
    			}

    			div1_resize_listener = add_resize_listener(div1, ctx.div1_resize_handler.bind(div1));
    			current = true;
    		},

    		p(changed, ctx) {
    			if (editor_slot && editor_slot.p && changed.$$scope) {
    				editor_slot.p(
    					get_slot_changes(editor_slot_template, ctx, changed, get_editor_slot_changes$1),
    					get_slot_context(editor_slot_template, ctx, get_editor_slot_context$1)
    				);
    			}

    			if ((!current || changed.cssStyles) && div0_class_value !== (div0_class_value = "result-container " + ctx.cssStyles.resultContainer)) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (viewer_slot && viewer_slot.p && (changed.$$scope || changed.width || changed.height)) {
    				viewer_slot.p(
    					get_slot_changes(viewer_slot_template, ctx, changed, get_viewer_slot_changes),
    					get_slot_context(viewer_slot_template, ctx, get_viewer_slot_context)
    				);
    			}

    			if ((!current || changed.cssStyles) && div1_class_value !== (div1_class_value = ctx.cssStyles.viewerConsoleContainer)) {
    				attr(div1, "class", div1_class_value);
    			}

    			if ((!current || changed.cssStyles) && div2_class_value !== (div2_class_value = ctx.cssStyles.viewerContainer)) {
    				attr(div2, "class", div2_class_value);
    			}

    			if ((!current || changed.cssStyles) && div3_class_value !== (div3_class_value = ctx.cssStyles.container)) {
    				attr(div3, "class", div3_class_value);
    			}
    		},

    		i(local) {
    			if (current) return;
    			transition_in(editor_slot, local);
    			transition_in(viewer_slot, local);
    			current = true;
    		},

    		o(local) {
    			transition_out(editor_slot, local);
    			transition_out(viewer_slot, local);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div3);
    			}

    			if (editor_slot) editor_slot.d(detaching);

    			if (viewer_slot) viewer_slot.d(detaching);
    			div1_resize_listener.cancel();
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { cssStyles } = $$props;
      let width;
      let height;

    	let { $$slots = {}, $$scope } = $$props;

    	function div1_resize_handler() {
    		width = this.clientWidth;
    		height = this.clientHeight;
    		$$invalidate('width', width);
    		$$invalidate('height', height);
    	}

    	$$self.$set = $$props => {
    		if ('cssStyles' in $$props) $$invalidate('cssStyles', cssStyles = $$props.cssStyles);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		cssStyles,
    		width,
    		height,
    		div1_resize_handler,
    		$$slots,
    		$$scope
    	};
    }

    class Minimal extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["cssStyles"]);
    	}
    }

    /* src/layouts/MinimalReverse.svelte generated by Svelte v3.8.1 */

    const get_editor_slot_changes$2 = () => ({});
    const get_editor_slot_context$2 = () => ({});

    const get_viewer_slot_changes$1 = ({ width, height }) => ({ width: width, height: height });
    const get_viewer_slot_context$1 = ({ width, height }) => ({ width: width, height: height });

    function create_fragment$7(ctx) {
    	var div3, div1, div0, div0_resize_listener, div0_class_value, div1_class_value, t, div2, div2_class_value, div3_class_value, current;

    	const viewer_slot_template = ctx.$$slots.viewer;
    	const viewer_slot = create_slot(viewer_slot_template, ctx, get_viewer_slot_context$1);

    	const editor_slot_template = ctx.$$slots.editor;
    	const editor_slot = create_slot(editor_slot_template, ctx, get_editor_slot_context$2);

    	return {
    		c() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			if (viewer_slot) viewer_slot.c();
    			t = space();
    			div2 = element("div");

    			if (editor_slot) editor_slot.c();

    			add_render_callback(() => ctx.div0_resize_handler.call(div0));
    			attr(div0, "class", div0_class_value = ctx.cssStyles.viewerConsoleContainer);
    			attr(div1, "class", div1_class_value = ctx.cssStyles.viewerContainer);

    			attr(div2, "class", div2_class_value = "result-container " + ctx.cssStyles.resultContainer);
    			attr(div3, "class", div3_class_value = ctx.cssStyles.container);
    		},

    		l(nodes) {
    			if (viewer_slot) viewer_slot.l(div0_nodes);

    			if (editor_slot) editor_slot.l(div2_nodes);
    		},

    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div1);
    			append(div1, div0);

    			if (viewer_slot) {
    				viewer_slot.m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, ctx.div0_resize_handler.bind(div0));
    			append(div3, t);
    			append(div3, div2);

    			if (editor_slot) {
    				editor_slot.m(div2, null);
    			}

    			current = true;
    		},

    		p(changed, ctx) {
    			if (viewer_slot && viewer_slot.p && (changed.$$scope || changed.width || changed.height)) {
    				viewer_slot.p(
    					get_slot_changes(viewer_slot_template, ctx, changed, get_viewer_slot_changes$1),
    					get_slot_context(viewer_slot_template, ctx, get_viewer_slot_context$1)
    				);
    			}

    			if ((!current || changed.cssStyles) && div0_class_value !== (div0_class_value = ctx.cssStyles.viewerConsoleContainer)) {
    				attr(div0, "class", div0_class_value);
    			}

    			if ((!current || changed.cssStyles) && div1_class_value !== (div1_class_value = ctx.cssStyles.viewerContainer)) {
    				attr(div1, "class", div1_class_value);
    			}

    			if (editor_slot && editor_slot.p && changed.$$scope) {
    				editor_slot.p(
    					get_slot_changes(editor_slot_template, ctx, changed, get_editor_slot_changes$2),
    					get_slot_context(editor_slot_template, ctx, get_editor_slot_context$2)
    				);
    			}

    			if ((!current || changed.cssStyles) && div2_class_value !== (div2_class_value = "result-container " + ctx.cssStyles.resultContainer)) {
    				attr(div2, "class", div2_class_value);
    			}

    			if ((!current || changed.cssStyles) && div3_class_value !== (div3_class_value = ctx.cssStyles.container)) {
    				attr(div3, "class", div3_class_value);
    			}
    		},

    		i(local) {
    			if (current) return;
    			transition_in(viewer_slot, local);
    			transition_in(editor_slot, local);
    			current = true;
    		},

    		o(local) {
    			transition_out(viewer_slot, local);
    			transition_out(editor_slot, local);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div3);
    			}

    			if (viewer_slot) viewer_slot.d(detaching);
    			div0_resize_listener.cancel();

    			if (editor_slot) editor_slot.d(detaching);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { cssStyles } = $$props;
      let width;
      let height;

    	let { $$slots = {}, $$scope } = $$props;

    	function div0_resize_handler() {
    		width = this.clientWidth;
    		height = this.clientHeight;
    		$$invalidate('width', width);
    		$$invalidate('height', height);
    	}

    	$$self.$set = $$props => {
    		if ('cssStyles' in $$props) $$invalidate('cssStyles', cssStyles = $$props.cssStyles);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		cssStyles,
    		width,
    		height,
    		div0_resize_handler,
    		$$slots,
    		$$scope
    	};
    }

    class MinimalReverse extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["cssStyles"]);
    	}
    }

    /* src/layouts/View.svelte generated by Svelte v3.8.1 */

    const get_viewer_slot_changes$2 = ({ width, height }) => ({ width: width, height: height });
    const get_viewer_slot_context$2 = ({ width, height }) => ({ width: width, height: height });

    function create_fragment$8(ctx) {
    	var div2, div1, div0, div0_resize_listener, div0_class_value, div1_class_value, div2_class_value, current;

    	const viewer_slot_template = ctx.$$slots.viewer;
    	const viewer_slot = create_slot(viewer_slot_template, ctx, get_viewer_slot_context$2);

    	return {
    		c() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			if (viewer_slot) viewer_slot.c();

    			add_render_callback(() => ctx.div0_resize_handler.call(div0));
    			attr(div0, "class", div0_class_value = ctx.cssStyles.viewerConsoleContainer);
    			attr(div1, "class", div1_class_value = ctx.cssStyles.viewerContainer);
    			attr(div2, "class", div2_class_value = ctx.cssStyles.container);
    		},

    		l(nodes) {
    			if (viewer_slot) viewer_slot.l(div0_nodes);
    		},

    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, div0);

    			if (viewer_slot) {
    				viewer_slot.m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, ctx.div0_resize_handler.bind(div0));
    			current = true;
    		},

    		p(changed, ctx) {
    			if (viewer_slot && viewer_slot.p && (changed.$$scope || changed.width || changed.height)) {
    				viewer_slot.p(
    					get_slot_changes(viewer_slot_template, ctx, changed, get_viewer_slot_changes$2),
    					get_slot_context(viewer_slot_template, ctx, get_viewer_slot_context$2)
    				);
    			}

    			if ((!current || changed.cssStyles) && div0_class_value !== (div0_class_value = ctx.cssStyles.viewerConsoleContainer)) {
    				attr(div0, "class", div0_class_value);
    			}

    			if ((!current || changed.cssStyles) && div1_class_value !== (div1_class_value = ctx.cssStyles.viewerContainer)) {
    				attr(div1, "class", div1_class_value);
    			}

    			if ((!current || changed.cssStyles) && div2_class_value !== (div2_class_value = ctx.cssStyles.container)) {
    				attr(div2, "class", div2_class_value);
    			}
    		},

    		i(local) {
    			if (current) return;
    			transition_in(viewer_slot, local);
    			current = true;
    		},

    		o(local) {
    			transition_out(viewer_slot, local);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			if (viewer_slot) viewer_slot.d(detaching);
    			div0_resize_listener.cancel();
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { cssStyles } = $$props;
      let width;
      let height;

    	let { $$slots = {}, $$scope } = $$props;

    	function div0_resize_handler() {
    		width = this.clientWidth;
    		height = this.clientHeight;
    		$$invalidate('width', width);
    		$$invalidate('height', height);
    	}

    	$$self.$set = $$props => {
    		if ('cssStyles' in $$props) $$invalidate('cssStyles', cssStyles = $$props.cssStyles);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		cssStyles,
    		width,
    		height,
    		div0_resize_handler,
    		$$slots,
    		$$scope
    	};
    }

    class View extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, ["cssStyles"]);
    	}
    }

    /* src/Repl.svelte generated by Svelte v3.8.1 */

    function add_css$1() {
    	var style = element("style");
    	style.id = 'svelte-7fiviz-style';
    	style.textContent = "";
    	append(document.head, style);
    }

    // (147:2) <div slot="editor">
    function create_editor_slot(ctx) {
    	var div, current;

    	let editor_1_props = {};
    	var editor_1 = new Editor({ props: editor_1_props });

    	ctx.editor_1_binding(editor_1);
    	editor_1.$on("change", ctx.debounceChangeCode);

    	return {
    		c() {
    			div = element("div");
    			editor_1.$$.fragment.c();
    			attr(div, "slot", "editor");
    		},

    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(editor_1, div, null);
    			current = true;
    		},

    		p(changed, ctx) {
    			var editor_1_changes = {};
    			editor_1.$set(editor_1_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(editor_1.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(editor_1.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			ctx.editor_1_binding(null);

    			destroy_component(editor_1);
    		}
    	};
    }

    // (150:2) <div slot="viewer">
    function create_viewer_slot(ctx) {
    	var div, current;

    	var viewer = new Viewer({
    		props: {
    		width: ctx.width,
    		height: ctx.height
    	}
    	});

    	return {
    		c() {
    			div = element("div");
    			viewer.$$.fragment.c();
    			attr(div, "slot", "viewer");
    		},

    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(viewer, div, null);
    			current = true;
    		},

    		p(changed, ctx) {
    			var viewer_changes = {};
    			if (changed.width) viewer_changes.width = ctx.width;
    			if (changed.height) viewer_changes.height = ctx.height;
    			viewer.$set(viewer_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(viewer.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(viewer.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(viewer);
    		}
    	};
    }

    // (153:2) <div slot="viewer-console">
    function create_viewer_console_slot(ctx) {
    	var div, current;

    	var viewerconsole = new ViewerConsole({ props: { cssStyles: ctx.cssStyles } });

    	return {
    		c() {
    			div = element("div");
    			viewerconsole.$$.fragment.c();
    			attr(div, "slot", "viewer-console");
    		},

    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(viewerconsole, div, null);
    			current = true;
    		},

    		p(changed, ctx) {
    			var viewerconsole_changes = {};
    			if (changed.cssStyles) viewerconsole_changes.cssStyles = ctx.cssStyles;
    			viewerconsole.$set(viewerconsole_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(viewerconsole.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(viewerconsole.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(viewerconsole);
    		}
    	};
    }

    // (156:2) <div slot="console">
    function create_console_slot(ctx) {
    	var div, current;

    	var console = new Console({ props: { cssStyles: ctx.cssStyles } });

    	return {
    		c() {
    			div = element("div");
    			console.$$.fragment.c();
    			attr(div, "slot", "console");
    		},

    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(console, div, null);
    			current = true;
    		},

    		p(changed, ctx) {
    			var console_changes = {};
    			if (changed.cssStyles) console_changes.cssStyles = ctx.cssStyles;
    			console.$set(console_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(console.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(console.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(console);
    		}
    	};
    }

    // (146:0) <svelte:component this={selectedLayout} {cssStyles} bind:width={width} bind:height={height} >
    function create_default_slot(ctx) {
    	var t0, t1, t2;

    	return {
    		c() {
    			t0 = space();
    			t1 = space();
    			t2 = space();
    		},

    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d(detaching) {
    			if (detaching) {
    				detach(t0);
    				detach(t1);
    				detach(t2);
    			}
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	var updating_width, updating_height, switch_instance_anchor, current;

    	function switch_instance_width_binding(value) {
    		ctx.switch_instance_width_binding.call(null, value);
    		updating_width = true;
    		add_flush_callback(() => updating_width = false);
    	}

    	function switch_instance_height_binding(value_1) {
    		ctx.switch_instance_height_binding.call(null, value_1);
    		updating_height = true;
    		add_flush_callback(() => updating_height = false);
    	}

    	var switch_value = ctx.selectedLayout;

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			cssStyles: ctx.cssStyles,
    			$$slots: {
    			default: [create_default_slot],
    			console: [create_console_slot],
    			"viewer-console": [create_viewer_console_slot],
    			viewer: [create_viewer_slot],
    			editor: [create_editor_slot]
    		},
    			$$scope: { ctx }
    		};
    		if (ctx.width !== void 0) {
    			switch_instance_props.width = ctx.width;
    		}
    		if (ctx.height !== void 0) {
    			switch_instance_props.height = ctx.height;
    		}
    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));

    		binding_callbacks.push(() => bind(switch_instance, 'width', switch_instance_width_binding));
    		binding_callbacks.push(() => bind(switch_instance, 'height', switch_instance_height_binding));
    	}

    	return {
    		c() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p(changed, ctx) {
    			var switch_instance_changes = {};
    			if (changed.cssStyles) switch_instance_changes.cssStyles = ctx.cssStyles;
    			if (changed.$$scope || changed.cssStyles || changed.width || changed.height || changed.editor) switch_instance_changes.$$scope = { changed, ctx };
    			if (!updating_width && changed.width) {
    				switch_instance_changes.width = ctx.width;
    			}
    			if (!updating_height && changed.height) {
    				switch_instance_changes.height = ctx.height;
    			}

    			if (switch_value !== (switch_value = ctx.selectedLayout)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));

    					binding_callbacks.push(() => bind(switch_instance, 'width', switch_instance_width_binding));
    					binding_callbacks.push(() => bind(switch_instance, 'height', switch_instance_height_binding));

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $currentFile, $ready;

    	component_subscribe($$self, currentFile, $$value => { $currentFile = $$value; $$invalidate('$currentFile', $currentFile); });
    	component_subscribe($$self, ready, $$value => { $ready = $$value; $$invalidate('$ready', $ready); });

    	

      let editor;
      let manualUpdates = false;
      let currentContent = '';
      let width;
      let height;

      const layouts = new Map([
        [ 'default', Default ],
        [ 'minimal-reverse', MinimalReverse ],
        [ 'minimal', Minimal ],
        [ 'view', View ]
      ]);

      let { layout = 'default', changedCode = () => {} } = $$props;
      let { files: files$1 = [], injectedLibraries: injectedLibraries$1 = [], injectedJS: injectedJS$1 = '', debounceTime = 300, cssStyles = {
        container: 'container',
        resultContainer: 'result-container',
        viewerContainer: 'viewer-container',
        viewerConsoleContainer: 'viewer-console-container',
        editorActions: {
          container: '',
          tabItem: '',
          link: ''
        },
        viewerActions: {
          container: '',
          tabItem: '',
          link: ''
        },
        editor: 'editor',
        viewer: 'viewer',
      } } = $$props;

      const debounce = (func, delay) => {
        let inDebounce;
        return function() {
          const context = this;
          const args = arguments;
          clearTimeout(inDebounce);
          inDebounce = setTimeout(() =>
            func.apply(context, args)
          , delay);
        }
      };

      const debounceChangeCode = debounce(changeCode, debounceTime);

      function changeCode(event) {
        currentContent = event.detail.value;
        $$invalidate('manualUpdates', manualUpdates = true);
        changedCode();
        if ($currentFile.type === 'js') {
          code.set(currentContent);
        } else {
          html.set(currentContent.replace(/\n/g,''));
        }
      }


      function getContentForType(type = 'js') {
        return files$1.reduce((content, file) => {
          if(file.type === type) {
            return content + file.content;
          }
          return content;
        }, '');
      }

      function update() {
        code.set(getContentForType('js') || '');
        html.set(getContentForType('html') || '');
        if(editor) {
          editor.update($currentFile.content);
        }
      }

    	function editor_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('editor', editor = $$value);
    		});
    	}

    	function switch_instance_width_binding(value) {
    		width = value;
    		$$invalidate('width', width);
    	}

    	function switch_instance_height_binding(value_1) {
    		height = value_1;
    		$$invalidate('height', height);
    	}

    	$$self.$set = $$props => {
    		if ('layout' in $$props) $$invalidate('layout', layout = $$props.layout);
    		if ('changedCode' in $$props) $$invalidate('changedCode', changedCode = $$props.changedCode);
    		if ('files' in $$props) $$invalidate('files', files$1 = $$props.files);
    		if ('injectedLibraries' in $$props) $$invalidate('injectedLibraries', injectedLibraries$1 = $$props.injectedLibraries);
    		if ('injectedJS' in $$props) $$invalidate('injectedJS', injectedJS$1 = $$props.injectedJS);
    		if ('debounceTime' in $$props) $$invalidate('debounceTime', debounceTime = $$props.debounceTime);
    		if ('cssStyles' in $$props) $$invalidate('cssStyles', cssStyles = $$props.cssStyles);
    	};

    	let selectedLayout;

    	$$self.$$.update = ($$dirty = { files: 1, injectedJS: 1, injectedLibraries: 1, editor: 1, $currentFile: 1, $ready: 1, manualUpdates: 1, layout: 1 }) => {
    		if ($$dirty.files) { if(files$1) {
            files.set(files$1);
          } }
    		if ($$dirty.injectedJS) { if(injectedJS$1) {
            injectedJS.set(injectedJS$1);
          } }
    		if ($$dirty.injectedLibraries) { if(injectedLibraries$1) {
            injectedLibraries.set(injectedLibraries$1);
          } }
    		if ($$dirty.editor || $$dirty.$currentFile) { if(editor && $currentFile) {
            editor.update($currentFile.content);
          } }
    		if ($$dirty.files || $$dirty.$ready) { if(files$1 && $ready) {
            $$invalidate('manualUpdates', manualUpdates = false);
            update();
          } }
    		if ($$dirty.$ready || $$dirty.manualUpdates) { if($ready && !manualUpdates) {
            update();
          } }
    		if ($$dirty.layout) { $$invalidate('selectedLayout', selectedLayout = layouts.get(layout || 'default')); }
    	};

    	return {
    		editor,
    		width,
    		height,
    		layout,
    		changedCode,
    		files: files$1,
    		injectedLibraries: injectedLibraries$1,
    		injectedJS: injectedJS$1,
    		debounceTime,
    		cssStyles,
    		debounceChangeCode,
    		selectedLayout,
    		editor_1_binding,
    		switch_instance_width_binding,
    		switch_instance_height_binding
    	};
    }

    class Repl extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-7fiviz-style")) add_css$1();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, ["layout", "changedCode", "files", "injectedLibraries", "injectedJS", "debounceTime", "cssStyles"]);
    	}
    }

    return Repl;

}));
