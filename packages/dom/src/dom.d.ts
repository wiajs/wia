export interface DomInstance {
    length: number;

    /**  Retrieve one of the elements matched by the Dom7Instance object (jQuery syntax). **/
    [index:number]: Element;

    // CLASSES
    /** Add class to elements */
    addClass(className : string) : DomInstance;
    /** Remove specified class */
    removeClass(className : string) : DomInstance;
    /** Determine whether any of the matched elements are assigned the given class */
    hasClass(className : string) : DomInstance;
    /** Remove (if class is present) or add (if not) one or more classes from each element in the set of matched elements */
    toggleClass(className : string) : DomInstance;

    // ATTRIBUTES AND PROPERTIES
    /** Get property value */
    prop(propName : string) : any;
    /** Set single property value */
    prop(propName : string, propValue: any) : DomInstance;
    /** Set multiple properties */
    prop(propertiesObject : any) : DomInstance;
    /** Get attribute value */
    attr(attrName : string) : string;
    /** Set single attribute value */
    attr(attrName : string, attrValue : string) : DomInstance;
    /** Set multiple attributes */
    attr(attributesObject : any) : DomInstance;
    /** Remove specified attribute */
    removeAttr(attrName : string) : DomInstance;
    /** Get the current value of the first element in the set of matched elements */
    val() : any;
    /** Set the value of every matched element */
    val(newValue : any) : DomInstance;

    // DATA
    /** Store arbitrary data associated with the matched elements */
    data(key : string, value : any) : DomInstance;
    /** Return the value at the named data store for the first element in the collection, as set by data(key, value) or by an HTML5 data-* attribute */
    data(key : string) : any;
    /** Remove specified data */
    removeData(key : string): void;
    /** Returns element's data set (set of data- attributes) as plain Object */
    dataset() : any;

    // CSS TRASFORMS, TRANSITIONS
    /** Adds prefixed CSS transform property */
    transform(CSSTransformString : string) : DomInstance;
    /** Set CSS transition-duration property to collection */
    transition(transitionDuration : number) : DomInstance;

    // EVENTS
    /** Add event handler function to one or more events to the selected elements */
    on(eventName : string, handler : (event : Event) => void, useCapture? : boolean) : DomInstance;
    /** Live/delegated event handler */
    on(eventName : string, delegatedTarget : string, handler : (event : Event) => void, useCapture? : boolean) : DomInstance;
    /** Add event handler function to one or more events to the selected elements that will be executed only once */
    once(eventName : string, handler : (event : Event) => void, useCapture? : boolean) : DomInstance;
    /** Live/delegated event handler that will be executed only once */
    once(eventName : string, delegatedTarget : string, handler : (event : Event) => void, useCapture? : boolean) : DomInstance;
    /** Remove event handler */
    off(eventName : string, handler : (event : Event) => void, useCapture? : boolean) : DomInstance;
    /** Remove live/delegated event handler */
    off(eventName : string, delegatedTarget : string, handler : (event : Event) => void, useCapture? : boolean) : DomInstance;
    /** Execute all handlers added to the matched elements for the specified event */
    trigger(eventName : string, eventData : any) : DomInstance;
    /** Adds prefixed transitionEnd event handler to collection */
    transitionEnd(callback : () => void, permanent : boolean) : DomInstance;
    /** Adds prefixed animationEnd event handler to collection */
    animationEnd(callback : () => void) : DomInstance;

    // STYLES
    /** Get the current computed width for the first element in the set of matched elements */
    width() : number;
    /** Set width for the first element in the set of matched elements */
    width(value: string | number) : DomInstance;
    /** Get the current computed width for the first element in the set of matched elements, including padding and border, and margin (if includeMargin is true) */
    outerWidth(includeMargin? : boolean) : number;
    /** Set width for the first element in the set of matched elements, including padding and border, and margin (if includeMargin is true) */
    outerWidth(value: string | number) : DomInstance;
    /** Get the current computed height for the first element in the set of matched elements */
    height() : number;
    /** Set height for the first element in the set of matched elements */
    height(value: string | number) : DomInstance;
    /** Get the current computed height for the first element in the set of matched elements, including padding and border, and margin (if includeMargin is true) */
    outerHeight(includeMargin? : boolean) : number;
    /** Set height for the first element in the set of matched elements, including padding and border, and margin (if includeMargin is true) */
    outerHeight(value: string | number) : DomInstance;
    /** Get the current coordinates of the first element relative to the document */
    offset() : {top: number, left: number};
    /** Set the coordinates of the first element relative to the document */
    offset(value: string | number) : DomInstance;
    /** Set "display:none" to the matched elements */
    hide() : void;
    /** Set "display:block" to the matched elements */
    show() : void;
    /** Get value of specified CSS property for the first element */
    css(property : string) : string | number;
    /** Set specified CSS property to the matched elements */
    css(property : string, value: string | number) : DomInstance;
    /** Set multiple CSS properties to the matched elements */
    css(propertiesObject : any) : DomInstance;

    // SCROLL
    /** Get scrollTop position of element */
    scrollTop() : number;
    /** Set scrollTop "position" with animation during "duration" (in ms). Scroll top position will be set immediately if duration is not specified. If you have specified "callback" function, then it will be executed after scrolling completed */
    scrollTop(position : number, duration? : number, callback? : () => void) : DomInstance;
    /** Get scrollLeft position of element */
    scrollLeft() : number;
    /** Set scrollLeft "position" with animation during "duration" (in ms). Scroll left postion will be set immediately if duration is not specified. If you have specified "callback" function, then it will be executed after scrolling completed */
    scrollLeft(position : number, duration? : number, callback? : () => void) : DomInstance;
    /** Set scroll left and scroll top with animation during "duration" (in ms). Scroll postion will be set immediately if duration is not specified. If you have specified "callback" function, then it will be executed after scrolling completed */
    scrollTo(left : number, top : number, duration? : number, callback? : () => void) : DomInstance;

    // DOM MANIPULATION
    /** Add HTML element to the set of matched elements */
    add(html: string) : DomInstance;
    /** Create a new Dom7Instance collection with elements added to the set of matched elements */
    add(... elements : Array<Element | DomInstance>) : DomInstance;
    /** Iterate over collection, executing a callback function for each matched element */
    each(callback : (index : number, element : any) => void) : DomInstance;
    /** Get the HTML contents of the first element in the set of matched elements */
    html() : string;
    /** Set the HTML contents of every matched element */
    html(newInnerHTML : string) : DomInstance;
    /** Get the text contents of the first element in the set of matched elements */
    text() : string;
    /** Set the text contents of every matched element */
    text(newTextContent : string) : DomInstance;
    /** `.is(CSSSelector)` :
     * Check the current matched set of elements against CSS selector
     *
     * `.is(HTMLElement)` :
     * Check the current matched set of elements against HTML element or Dom7Instance collection
     * */
    is(CSSSelector : string | Element | DomInstance) : boolean;
    /** Return the position of the first element within the Dom7Instance collection relative to its sibling elements */
    index() : number;
    /** Reduce the set of matched elements to the one at the specified index */
    eq(index : number) : DomInstance;
    /** `.append(HTMLString)` :
     * Insert content, specified by the parameter, to the end of each element in the set of matched elements
     *
     * `.append(HTMLElement)` :
     * Insert specified HTML element to the end of element in the set of matched elements
     * */
    append(element : string | Element | DomInstance) : DomInstance;
    /** Insert content/elements, to the end of element specified in parameter */
    appendTo(element : string | Element | DomInstance) : DomInstance;
    /** `.prepend(newHTML)` :
     * Insert content, specified by the parameter, to the beginning of each element in the set of matched elements
     *
     * `.prepend(HTMLElement)` :
     * Insert specified HTML element to the beginning of element in the set of matched elements
     * */
    prepend(element : string | Element | DomInstance) : DomInstance;
    /** Insert content/elements, to the beginning of element specified in parameter */
    prependTo(element : string | Element | DomInstance) : DomInstance;
    /** Insert every element in the set of matched elements before the target. Target could be specified as CSS selector or HTML element or Dom7Instance collection */
    insertBefore(element : string | Element | DomInstance) : DomInstance;
    /** Insert every element in the set of matched elements after the target. Target could be specified as CSS selector or HTML element or Dom7Instance collection */
    insertAfter(element : string | Element | DomInstance) : DomInstance;
    /** Get the immediately following sibling of each element in the set of matched elements. If a selector is provided, it retrieves the next sibling only if it matches that selector */
    next(selector? : string) : DomInstance;
    /** Get all following siblings of each element in the set of matched elements, optionally filtered by a selector */
    nextAll(selector? : string) : DomInstance;
    /** Get the immediately preceding sibling of each element in the set of matched elements, optionally filtered by a selector */
    prev(selector? : string) : DomInstance;
    /** Get all preceding siblings of each element in the set of matched elements, optionally filtered by a selector */
    prevAll(selector? : string) : DomInstance;
    /** Get the siblings of each element in the set of matched elements, optionally filtered by a selector */
    siblings(selector? : string) : DomInstance;
    /** Get the first parent of each element in the current set of matched elements, optionally filtered by a selector */
    parent(selector? : string) : DomInstance;
    /** Get the ancestors of each element in the current set of matched elements, optionally filtered by a selector */
    parents(selector? : string) : DomInstance;
    /** For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree */
    closest(selector? : string) : DomInstance;
    /** Get the descendants of each element in the current set of matched elements, filtered by a selector */
    find(selector? : string) : DomInstance;
    /** Get the children of each element in the set of matched elements, optionally filtered by a selector */
    children(selector? : string) : DomInstance;
    /** Filter collection of elements */
    filter(callback : (index : number, element : any) => boolean) : DomInstance;
    /** Remove/detach matched elements from the Dom */
    remove() : DomInstance;
    /** Remove all child nodes of the set of matched elements from the DOM. Alias for `.html('')` */
    empty() : DomInstance;

    // SHORTCUTS
    /** Trigger "click" event on collection */
    click() : DomInstance;
    /** Add "click" event handler to collection */
    click(handler : (event : Event) => void) : DomInstance;
    /** Trigger "blur" event on collection */
    blur() : DomInstance;
    /** Add "blur" event handler to collection */
    blur(handler : (event : Event) => void) : DomInstance;
    /** Trigger "focus" event on collection */
    focus() : DomInstance;
    /** Add "focus" event handler to collection */
    focus(handler : (event : Event) => void) : DomInstance;
    /** Trigger "focusin" event on collection */
    focusin() : DomInstance;
    /** Add "focusin" event handler to collection */
    focusin(handler : (event : Event) => void) : DomInstance;
    /** Trigger "focusout" event on collection */
    focusout() : DomInstance;
    /** Add "focusout" event handler to collection */
    focusout(handler : (event : Event) => void) : DomInstance;
    /** Trigger "keyup" event on collection */
    keyup() : DomInstance;
    /** Add "keyup" event handler to collection */
    keyup(handler : (event : Event) => void) : DomInstance;
    /** Trigger "keydown" event on collection */
    keydown() : DomInstance;
    /** Add "keydown" event handler to collection */
    keydown(handler : (event : Event) => void) : DomInstance;
    /** Trigger "keypress" event on collection */
    keypress() : DomInstance;
    /** Add "keypress" event handler to collection */
    keypress(handler : (event : Event) => void) : DomInstance;
    /** Trigger "submit" event on collection */
    submit() : DomInstance;
    /** Add "submit" event handler to collection */
    submit(handler : (event : Event) => void) : DomInstance;
    /** Trigger "change" event on collection */
    change() : DomInstance;
    /** Add "change" event handler to collection */
    change(handler : (event : Event) => void) : DomInstance;
    /** Trigger "mousedown" event on collection */
    mousedown() : DomInstance;
    /** Add "mousedown" event handler to collection */
    mousedown(handler : (event : Event) => void) : DomInstance;
    /** Trigger "mousemove" event on collection */
    mousemove() : DomInstance;
    /** Add "mousemove" event handler to collection */
    mousemove(handler : (event : Event) => void) : DomInstance;
    /** Trigger "mouseup" event on collection */
    mouseup() : DomInstance;
    /** Add "mouseup" event handler to collection */
    mouseup(handler : (event : Event) => void) : DomInstance;
    /** Trigger "mouseenter" event on collection */
    mouseenter() : DomInstance;
    /** Add "mouseenter" event handler to collection */
    mouseenter(handler : (event : Event) => void) : DomInstance;
    /** Trigger "mouseleave" event on collection */
    mouseleave() : DomInstance;
    /** Add "mouseleave" event handler to collection */
    mouseleave(handler : (event : Event) => void) : DomInstance;
    /** Trigger "mouseout" event on collection */
    mouseout() : DomInstance;
    /** Add "mouseout" event handler to collection */
    mouseout(handler : (event : Event) => void) : DomInstance;
    /** Trigger "mouseover" event on collection */
    mouseover() : DomInstance;
    /** Add "mouseover" event handler to collection */
    mouseover(handler : (event : Event) => void) : DomInstance;
    /** Trigger "touchstart" event on collection */
    touchstart() : DomInstance;
    /** Add "touchstart" event handler to collection */
    touchstart(handler : (event : Event) => void) : DomInstance;
    /** Trigger "touchend" event on collection */
    touchend() : DomInstance;
    /** Add "touchend" event handler to collection */
    touchend(handler : (event : Event) => void) : DomInstance;
    /** Trigger "touchmove" event on collection */
    touchmove() : DomInstance;
    /** Add "touchmove" event handler to collection */
    touchmove(handler : (event : Event) => void) : DomInstance;
    /** Add "resize" event handler to collection */
    resize(handler : (event : Event) => void) : DomInstance;
    /** Add "scroll" event handler to collection */
    scroll(handler : (event : Event) => void) : DomInstance;
}

export interface Dom7
{
    (): DomInstance;
    (selector: string, context?: Element|DomInstance): DomInstance;
    (element: Element): DomInstance;
    (element: Document): DomInstance;
    (elementArray: Element[]): DomInstance;
    (event: EventTarget): DomInstance;
}

declare const Dom : Dom

export default Dom
