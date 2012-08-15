// chopsgen.js

// Copyright (c) 2011 Ross Angle
//
//   Permission is hereby granted, free of charge, to any person
//   obtaining a copy of this software and associated documentation
//   files (the "Software"), to deal in the Software without
//   restriction, including without limitation the rights to use,
//   copy, modify, merge, publish, distribute, sublicense, and/or sell
//   copies of the Software, and to permit persons to whom the
//   Software is furnished to do so, subject to the following
//   conditions:
//
//   The above copyright notice and this permission notice shall be
//   included in all copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
//   OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
//   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
//   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
//   OTHER DEALINGS IN THE SOFTWARE.
//
// Permission to use this software is also granted under the
// Perl Foundation's Artistic License 2.0. You may use either license,
// at your option.


// Chopsgen depends on chops.js and lathe.js, which are both available
// at <https://github.com/rocketnia/lathe>.
//
// Chopsgen is a static site generator framework which runs on
// JavaScript-in-the-browser. I'm using it together with JSZip
// (<http://jszip.stuartk.co.uk/>) and choppascript.js (part of Lathe)
// to maintain my website at <http://www.rocketnia.com/>.
//
// == Why Chopsgen? ==
//
// I'm mainly designing Chopsgen for my own purposes. I'm addicted to
// high-powered abstractions and clean modularity. In my free time, I
// don't want to work on copying and pasting HTML snippets, escaping
// special characters, manually resolving naming conflicts, and
// organizing my code in a strict directory structure... but I do have
// fun writing code like Chopsgen to do these steps for me. :)
//
// And I don't like the prospect of upgrading a website to the newest
// flavor of HTML. With Chopsgen, if I ever need to do that, I'll
// probably be most of the way done once I modify/extend Chopsgen
// itself.
//
// I favor static site generation because I have little to no need for
// any server-side logic, and it's very nice to be able to test on the
// local filesystem without running a server, or to toss it up onto
// some cheap or free static file hosting service. And I favor
// JavaScript-in-the-browser as a platform because it's frickin'
// everywhere. With Chopsgen, finally I don't have to go home and boot
// up my desktop to compile my site.
//
// == The Tech ==
//
// For maintaining site content, Chopsgen provides a Chops vocabulary
// for constructing hierarchies of "widgets". Some widgets render
// rather straightforwardly to HTML tags. Some just render to text.
// At least one (not shown here) renders to nothing at all but causes
// JavaScript and CSS dependencies to be added to the page.
//
// Here's a taste of what it looks like:
//
//   [h2 Example markup]
//   
//   This is a paragraph.
//   
//   So is this. It's automatically placed in a [code <p>] element.
//   You might like to visit these sites:
//   
//   [ul [li [out https://github.com/rocketnia/lathe Lathe].]
//       [li [out http://www.rocketnia.com/ My website,
//           RocketN[i I]A.com].]]
//   
//   If you say markdown is better than this, [em I keel you]. But
//   seriously, I much prefer languages with regular structure and few
//   special characters. Such as, say, this markup language:
//   
//   [cpre indented [nochops
//   [h2 Example markup]
//   
//   Ceci n'est pas une balise [code <p>].]]
//   
//   As you can't see, thanks to this [code [nochops [nochops ...]]]
//   form, the square brackets are rendered as square brackets, with
//   no need for escaping. And we can easily use < and > without
//   escaping them either.
//
// Chopsgen is tailor-made for a site composed of a hierarchy of pages
// with URLs that end in the pattern "/dir1/dir2/dir3/.../", with "/"
// as the base case. By not hardcoding the "index.html" part, I hope
// to avoid a bunch of redirects to "index.php" or "index.jsp" or
// whatever in the future. At the same time, this allows people to
// interact with the address bar as though it's a breadcrumbs
// interface. (Am I the only one who does that? :-p )
//
// To further facilitate breadcrumbs and navigation, each Chopsgen
// page has a "name" widget that other pages can import when they
// refer to that page in a hyperlink.
//
// In practice, I've never made a site big enough to need more than a
// single layer of hierarchy, so breadcrumb stuff hasn't really paid
// off for me yet.
//
// == Some History ==
//
// Before Chopsgen, rocketnia.com was built with "pengen," an
// unreleased Arc program, which used Penknife
// (<https://www.rocketnia.com/rocketnia/penknife>, a programming
// language with syntax similar to Chops) as a markup language.
//
// Before that, rocketnia.com was statically generated by a Groovy
// program with another Chops-like markup syntax. Before that, it was
// dynamically generated (wastefully!) as a PLT Scheme stateless
// servlet, using xexprs. Before that, it was just maintained as
// static files using ye olde copy and paste. :)



// TODO: The below comment is the sketch that started Chopsgen in
// action. Let's keep it here until this is version-controlled and
// open-sourced, and then let's remove it since it's not accurate.
//
/*


In pengen, a page has the following properties:

- Permalink, as a list of directories from the site root
- Update date
- Copyright date(s)
- "Renderer", the encoding format
- JavaScript dependencies
- CSS dependencies
- Text name (for use in breadcrumbs and title bar)
- Custom markup name (for use in breadcrumbs)
- Custom title bar text
- Custom breadcrumbs markup for this page
- Content markup


But really, it ought to have no JavaScript or CSS dependencies. These
should be determined statically. Furthermore, the page title should be
rendered using a text-only renderer. And in an ideal world, the
copyright and update dates would automatically prompt me to update
them.

A widget would have the following properties:

 - A way to render it as HTML5, such that it produces a list of
   dependencies on JavaScript libraries, any custom <head> JavaScript
   code it needs, and any custom CSS it needs. In generating these
   things, it's allowed to generate gensyms to use for class names,
   etc.
 - A way to render it as plain text.

A page would have the following properties:

 - Permalink, as a list of directories from the site root
 - Update date
 - Copyright date(s)
 - Name widget (for use in breadcrumbs and title bar)
 - Custom breadcrumbs widget for this page
 - Content widget


*/

// TODO: Deal with the following aspects of this library that might be
// a bit too coupled to rocketnia.com:
//
// Miscellaneous:
//  - The implicit assumption that /gs[01-9]+gs/ never appears on the
//    page except as generated via a NiceWidget. This should be
//    strongly documented somewhere (not just hidden in a TODO here).
//  - The fact that [nav ...] links have no class attribute, while
//    [out ...] links do have the hardcoded "external-link" class.
//
// Naming conflicts:
//  - Renderer state. It's monadic, but that's fine. Don't change
//    that. The issue is that when things take advantage of this
//    state, they look for particular strings as keys. It would be
//    nice to have a more modular approach to this.
//  - The page metadata for use on other pages. The only example of
//    this so far is the page name, which is used by NavLinks, but if
//    there are any more of these in the future, we might want to take
//    a more modular approach.
//
// Comprehensiveness:
//  - The lack of comprehensiveness in the widgetEnv vocabulary...
//    such as the lack of an [applet ...] op. :-p
//  - The lack of comprehensiveness in the CSS dependency support,
//    such as the inability to do once-only includes.
//  - The lack of comprehensiveness in the JS dependency support. It
//    would be nice to position certain JS code at the end of the
//    <body> or in a <script defer>.
//  - The lack of comprehensiveness in the NiceWidget interface. The
//    "manual" code support is a good baseline, but there should
//    definitely be a way to use a widget rather than manual HTML.
//
// TODO: See if the manualWidgetEnv vocabulary is comprehensive
// enough.


//"use strict";

(function ( topThis, topArgs, body ) { body( topThis, topArgs ); })(
    this, typeof arguments === "undefined" ? void 0 : arguments,
    function ( topThis, topArgs ) {

// In Node.js, this whole file is semantically in a local context, and
// certain plain variables exist that aren't on the global object.
// Here, we get the global object in Node.js by taking advantage of
// the fact that it doesn't implement ECMAScript 5's strict mode.
var root = (function () { return this; })() || topThis;
// Actually, newer versions of Node don't expose the global object
// that way either, and they probably don't put the whole file in a
// local context.
if ( !((root && typeof root === "object" && root[ "Object" ])
    || typeof GLOBAL === "undefined") )
    root = GLOBAL;

var _, $c, my;
if ( topArgs === void 0 && typeof exports === "undefined" ) {
    _ = root.rocketnia.lathe;
    $c = root.rocketnia.chops;
    my = root.rocketnia.chopsgen = {};
} else {
    // We assume Node.js and a flat directory.
    _ = require( "./lathe" );
    $c = require( "./chops" );
    my = exports;
}


var enDash = "\u2013";
var emDash = "\u2014";
var copyright = "\u00A9";

// TODO: See if this is sufficient.
my.htmlEscape = function ( content ) {
    return content.
        replace( /&/g, "&amp;" ).  // must come first
        replace( /</g, "&lt;" ).
        replace( />/g, "&gt;" ).
        // TODO: See if the following can be removed.
        replace( /\u2013/g, "&ndash;" ).
        replace( /\u2014/g, "&mdash;" ).
        replace( /\u00A9/g, "&copy;" );
};

// TODO: See if this is sufficient.
function attrEscape( content ) {
    return my.htmlEscape( content ).  // must come first
        replace( "\"", "&quot;" ).
        replace( "'", "&#39;" );
}


_.rulebook( my, "widgetToHtml" );
_.rulebook( my, "widgetToTitle" );

_.rule( my.widgetToHtml, function ( widget, path, state ) {
    if ( !_.isString( widget ) )
        return _.fail( "It wasn't a string." );
    return _.win( { state: state, html: my.htmlEscape( widget ) } );
} );

_.rule( my.widgetToTitle, function ( widget ) {
    if ( !_.isString( widget ) )
        return _.fail( "It wasn't a string." );
    return _.win( my.htmlEscape( widget ) );
} );

_.rule( my.widgetToHtml, function ( widget, path, state ) {
    if ( !_.likeArray( widget ) )
        return _.fail( "It wasn't likeArray." );
    var widgetData = _.arrMap( widget, function ( it ) {
        var result = my.widgetToHtml( it, path, state );
        state = result.state;
        return result;
    } );
    return _.win( {
        state: state,
        js: _.arrMappend( widgetData,
            function ( it ) { return it.js || []; } ),
        css: _.arrMappend( widgetData,
            function ( it ) { return it.css || []; } ),
        html: _.arrMap( widgetData, _.pluckfn( "html" ) ).join( "" )
    } );
} );

_.rule( my.widgetToTitle, function ( widget ) {
    if ( !_.likeArray( widget ) )
        return _.fail( "It wasn't likeArray." );
    return _.win( _.arrMap( widget, function ( it ) {
        return my.widgetToTitle( it );
    } ).join( "" ) );
} );

function relDirs( from, to ) {
    if ( to.length === 0 )
        return _.arrMap( from, _.kfn( "../" ) ).join( "" );
    else if ( from.length === 0 )
        return _.arrCut( to ).join( "/" ) + "/";
    else if ( from[ 0 ] === to[ 0 ] )
        return relDirs( _.arrCut( from, 1 ), _.arrCut( to, 1 ) );
    else
        return relDirs( from, [] ) + relDirs( [], to );
}

// This is used as an abstraction for paths in the directory structure
// of the static site, which also serve as URLs.
function Path( dirs, file ) {
    if ( !_.isString( file ) || _.arrAny( dirs, function ( it ) {
            return !_.isString( it ) || /^\.?\.?$|\?|#|^$/.test( it );
        } ) )
        throw new Error( "Invalid path." );
    this.dirs_ = dirs;
    this.file_ = file;
}

// When rendering a page that can be accessed from multiple places
// (particularly an error page), page-relative URLs ("foo.txt",
// "../foo.txt") don't work out so well. The next best thing is a
// host-relative URL ("/bar/foo.txt", "/foo.txt"), which we can only
// get if we know exactly what path the static site will be copied to
// on the host. That path is basePath.
//
// It's still marginally useful for consistent breadcrumb-rendering to
// know what the path is. That's realPath.
//
// TODO: See if there's a way to render breadcrumbs that avoids this
// mixing of concerns.
//
function MaskedPath( realPath, basePath ) {
    this.realPath_ = realPath;
    this.basePath_ = basePath;
}

my.toPath = function ( x, opt_base ) {
    if ( x instanceof Path || x instanceof MaskedPath ) {
        return x;
    } else if ( _.isString( x ) ) {
        var m = /^\/([^\/#?]*(?:[#?].*)?)$/.exec( x );
        if ( m ) return new Path( [], m[ 1 ] );
        m = /^\/((?:[^\/?#]+\/)*[^\/?#]+)\/([^\/#?]*(?:[#?].*)?)$/.
            exec( x );
        if ( m ) return new Path( m[ 1 ].split( "/" ), m[ 2 ] );
        if ( opt_base === void 0 ) return null;
        var base = my.toPath( opt_base );
        if ( !(base instanceof Path) )
            return null;
        m = /^[^\/#?]*(?:[#?].*)?$/.exec( x );
        if ( m ) return new Path( base.dirs_, m[ 0 ] );
        m = /^((?:[^\/?#]+\/)*[^\/?#]+)\/([^\/#?]*(?:[#?].*)?)$/.
            exec( x );
        if ( m )
            return new Path(
                base.dirs_.concat( m[ 1 ].split( "/" ) ), m[ 2 ] );
        return null;
    }
    return null;
};

my.maskPath = function ( realPath, basePath ) {
    return new MaskedPath(
        my.toPath( realPath ), my.toPath( basePath ) );
};

Path.prototype.linkWouldBeRedundant = function ( base ) {
    if ( /404/.test( this.abs() ) )
        2 + 2;
    return (base instanceof Path && _.jsonIso(
            [ this.dirs_, this.file_ ], [ base.dirs_, base.file_ ] ))
        || (base instanceof MaskedPath
            && this.linkWouldBeRedundant( base.realPath_ ));
};

MaskedPath.prototype.linkWouldBeRedundant = function ( base ) {
    throw new Error( "A MaskedPath is being linked to." );
};

Path.prototype.abs = function () {
    return _.arrMap( this.dirs_, function ( dir ) {
        return "/" + dir;
    } ).join( "" ) + "/" + this.file_;
};

MaskedPath.prototype.abs = function () {
    throw new Error( "A MaskedPath is being linked to." );
};

Path.prototype.plus = function ( child ) {
    if ( this.file_ !== "" )
        throw new Error( "Can't add a non-dir path to anything." );
    child = my.toPath( child );
    if ( !(child instanceof Path) )
        throw new Error( "Can't add a path to a non-Path." );
    return new Path( this.dirs_.concat( child.dirs_ ), child.file_ );
};

MaskedPath.prototype.plus = function ( child ) {
    throw new Error( "Can't add a MaskedPath to anything." );
};

Path.prototype.from = function ( base ) {
    if ( base instanceof MaskedPath )
        return base.basePath_.plus( this ).abs();
    return relDirs( base.dirs_, this.dirs_ ) + this.file_;
};

MaskedPath.prototype.from = function ( base ) {
    throw new Error( "A MaskedPath is being linked to." );
};

// This returns all the /-terminated paths contained in this one (even
// this one, if it's /-terminated). A / after a ? or # doesn't count.
Path.prototype.familyDirs = function () {
    var result = [];
    for ( var i = this.dirs_.length; 0 <= i; i-- )
        result.unshift( new Path( this.dirs_.slice( 0, i ), "" ) );
    return result;
};

MaskedPath.prototype.familyDirs = function () {
    throw new Error( "A MaskedPath is being linked to." );
};

function HtmlTag( name, attrs, body ) {
    if ( !/^[-:a-z][-:a-z01-9]*$/.test( name ) )
        throw new Error( "An HTML tag name was too weird to let " +
            "fly: " + JSON.stringify( name ) );
    var len = attrs.length;
    for ( var i = 0; i < len; i++ ) {
        var attr = attrs[ i ][ 0 ];
        if ( !/^[-:a-z]*$/.test( attr ) )
            throw new Error( "An attribute name was too weird to " +
                "let fly: " + JSON.stringify( attr ) );
        for ( var j = i + 1; j < len; j++ )
            if ( attrs[ j ][ 0 ] === attr )
                throw new Error( "At least two attribute names in " +
                    + "an HtmlTag were the same." );
    }
    
    this.name_ = name;
    this.attrs_ = attrs;
    this.body_ = body;
}

_.rule( my.widgetToHtml, function ( widget, path, state ) {
    if ( !(widget instanceof HtmlTag) )
        return _.fail( "It wasn't an HtmlTag." );
    var name = widget.name_;
    var openTag = "<" + name + _.arrMap( widget.attrs_, function (
        kv ) {
        
        var v = kv[ 1 ];
        // TODO: Make Path a manual widget.
        if ( v instanceof Path )
            v = v.from( path );
        var rendered = my.manualWidgetToText( v, path, state );
        state = rendered.state;
        return " " +
            kv[ 0 ] + "=" + "\"" + attrEscape( rendered.text ) + "\"";
    } ).join( "" ) + ">";
    var body = my.widgetToHtml( widget.body_, path, state );
    return _.win( { state: body.state, js: body.js, css: body.css,
        html: openTag + body.html + "</" + name + ">" } );
} );

my.tag = function ( name, var_args ) {
    var attrs = _.pair( _.arrCut( arguments, 1 ) );
    return function ( var_args ) {
        return new HtmlTag( name, attrs, _.arrCut( arguments ) );
    };
};

// This is a wrapper widget that behaves just like its child but gets
// special treatment in the paragraph-separating algorithm (in
// widgetEnv[ " block" ]). In fact, these, strings, and Arrays are the
// only kinds of widgets that get special treatment there, so it's
// necessary to wrap any custom paragraph-like widget in one of these
// so it doesn't get wrapped in a <p> element.
function BlockWidget( widget ) {
    this.widget_ = widget;
}

my.blockWidget = function ( widget ) {
    return new BlockWidget( widget );
};

_.rule( my.widgetToHtml, function ( widget, path, state ) {
    if ( !(widget instanceof BlockWidget) )
        return _.fail( "It wasn't a BlockWidget." );
    return _.win( my.widgetToHtml( widget.widget_, path, state ) );
} );

function getPage( state, path ) {
    if ( !(_.likeObjectLiteral( state ) && "pages" in state) )
        return null;
    var pages = state[ "pages" ];
    if ( !_.likeObjectLiteral( pages ) )
        return null;
    return pages[ my.toPath( path ).abs() ];
}

function NameNavLink( path ) {
    this.path_ = path;
}

_.rule( my.widgetToHtml, function ( widget, path, state ) {
    if ( !(widget instanceof NameNavLink) )
        return _.fail( "It wasn't a NameNavLink." );
    var name = getPage( state, widget.path_ ).name;
    return _.win( my.widgetToHtml(
        widget.path_.linkWouldBeRedundant( path ) ? name :
            my.tag( "a", "href", widget.path_ )( name ),
        path, state ) );
} );

my.nameNavLink = function ( path ) {
    return new NameNavLink( path );
};

function NavLink( path, content ) {
    this.path_ = path;
    this.content_ = content;
}

_.rule( my.widgetToHtml, function ( widget, path, state ) {
    if ( !(widget instanceof NavLink) )
        return _.fail( "It wasn't a NavLink." );
    return _.win( my.widgetToHtml(
        widget.path_.linkWouldBeRedundant( path ) ? widget.content_ :
            my.tag( "a", "href", widget.path_ )( widget.content_ ),
        path, state ) );
} );

function HtmlRawWidget( html ) {
    this.html_ = html;
}

_.rule( my.widgetToHtml, function ( widget, path, state ) {
    if ( !(widget instanceof HtmlRawWidget) )
        return _.fail( "It wasn't an HtmlRawWidget." );
    return _.win( { state: state, html: widget.html_ } );
} );

function DepsWidget( deps ) {
    this.js_ = _.arrCut( deps.js || [] );
    this.css_ = _.arrCut( deps.css || [] );
}

_.rule( my.widgetToHtml, function ( widget, path, state ) {
    if ( !(widget instanceof DepsWidget) )
        return _.fail( "It wasn't a DepsWidget." );
    return _.win( {
        state: state, js: widget.js_, css: widget.css_, html: "" } );
} );

my.depsWidget = function ( deps, body ) {
    return [ my.blockWidget( new DepsWidget( deps ) ), body ];
};


function JsIncludeOnce( deps ) {
    this.deps_ = deps;
}

var includeOnceJsObjects = {};
function includeOnceJs( url ) {
    return includeOnceJsObjects[ url ] ||
        (includeOnceJsObjects[ url ] = new JsIncludeOnce(
            [ { "type": "external", "url": url } ] ));
}

function pushState( state, dynavar, val ) {
    if ( !_.likeObjectLiteral( state ) )
        throw new Error( "The state wasn't of the right type." );
    if ( !(dynavar in state) )
        return _.copdate( state, dynavar, _.kfn( [ val ] ) );
    if ( !_.likeArray( state[ dynavar ] ) )
        throw new Error( "The state wasn't of the right type." );
    return _.copdate( state, dynavar, function ( stack ) {
        return _.arrPlus( [ val ], stack );
    } );
}

function unpushState( state, dynavar ) {
    if ( !(_.likeObjectLiteral( state ) && dynavar in state
        && _.likeArray( state[ dynavar ] )) )
        throw new Error( "The state wasn't of the right type." );
    return _.copdate( state, dynavar, function ( stack ) {
        if ( stack.length === 0 )
            throw new Error( "There weren't enough to unpush." );
        return _.arrCut( stack, 1 );
    } );
}

function NiceWidget( details ) {
    var js = [];
    var css = [];
    var html = [];
    function stateless( result ) {
        return function ( tok, path, state ) {
            return { "state": state, "val": result };
        };
    }
    function process( k, v ) {
        if ( _.likeArray( v ) )
            return void _.arrEach( v, function( v ) {
                process( k, v );
            } );
        if ( k === "includeOnceJs" ) {
            js.push( stateless( includeOnceJs( v ) ) );
        } else if ( k === "manualJs" ) {
            var widget = my.parseManual( v );
            js.push( function ( tok, path, state ) {
                state = pushState( state, "token", tok );
                var rendered =
                    my.manualWidgetToText( widget, path, state );
                state = unpushState( rendered.state, "token" );
                return { state: state,
                    val: { type: "embedded", code: rendered.text } };
            } );
        } else if ( k === "manualCss" ) {
            var widget = my.parseManual( v );
            css.push( function ( tok, path, state ) {
                state = pushState( state, "token", tok );
                var rendered =
                    my.manualWidgetToText( widget, path, state );
                state = unpushState( rendered.state, "token" );
                return { state: state,
                    val: { type: "embedded", code: rendered.text } };
            } );
        } else if ( k === "manualHtml" ) {
            var widget = my.parseManual( v );
            html.push( function ( tok, path, state ) {
                state = pushState( state, "token", tok );
                var rendered =
                    my.manualWidgetToText( widget, path, state );
                state = unpushState( rendered.state, "token" );
                return { state: state, js: [], css: [],
                    html: rendered.text };
            } );
        } else if ( k === "widgetHtml" ) {
            html.push( function ( tok, path, state ) {
                state = pushState( state, "token", tok );
                var rendered = my.widgetToHtml( v, path, state );
                state = unpushState( rendered.state, "token" );
                return { state: state, js: rendered.js,
                    css: rendered.css, html: rendered.html };
            } );
        } else {
            throw new Error( "Unrecognized widget() keyword arg." );
        }
    }
    _.arrEach( details, function ( detail ) {
        _.objOwnEach( detail, process );
    } );
    this.js_ = js;
    this.css_ = css;
    this.html_ = html;
}

my.widget = function ( var_args ) {
    return new NiceWidget( _.arrCut( arguments ) );
};

_.rule( my.widgetToHtml, function ( widget, path, state ) {
    if ( !(widget instanceof NiceWidget) )
        return _.fail( "It wasn't a NiceWidget." );
    // TODO: Beware overflow... but note that if we ever have more
    // than 2^53 NiceWidgets on one page, we'll have much bigger
    // problems to deal with than just this one case of overflow. :-p
    var tok = "gs" + state[ "counter" ] + "gs";
    state = _.copdate( state, "counter",
        function ( it ) { return it + 1 } );
    var js = [];
    var css = [];
    var html = [];
    _.arrEach( widget.js_, function ( jsFunc ) {
        var monad = jsFunc( tok, path, state );
        js.push( monad[ "val" ] );
        state = monad[ "state" ];
    } );
    _.arrEach( widget.css_, function ( cssFunc ) {
        var monad = cssFunc( tok, path, state );
        css.push( monad[ "val" ] );
        state = monad[ "state" ];
    } );
    _.arrEach( widget.html_, function ( htmlFunc ) {
        var monad = htmlFunc( tok, path, state );
        js = js.concat( monad[ "js" ] );
        css = css.concat( monad[ "css" ] );
        html.push( monad[ "html" ] );
        state = monad[ "state" ];
    } );
    return _.win(
        { state: state, js: js, css: css, html: html.join( "" ) } );
} );


_.rulebook( my, "manualWidgetToText" );

_.rule( my.manualWidgetToText, function ( widget, path, state ) {
    if ( !_.isString( widget ) )
        return _.fail( "It wasn't a string." );
    return _.win( { state: state, text: widget } );
} );

_.rule( my.manualWidgetToText, function ( widget, path, state ) {
    if ( !_.likeArray( widget ) )
        return _.fail( "It wasn't likeArray." );
    var widgetText = _.arrMap( widget, function ( it ) {
        var result = my.manualWidgetToText( it, path, state );
        state = result.state;
        return result.text;
    } );
    return _.win( { state: state, text: widgetText.join( "" ) } );
} );

function WidgetToken() {}

_.rule( my.manualWidgetToText, function ( widget, path, state ) {
    if ( !(widget instanceof WidgetToken) )
        return _.fail( "It wasn't a WidgetToken." );
    if ( !(_.likeObjectLiteral( state ) && "token" in state
        && _.likeArray( state.token )) )
        throw new Error( "The state wasn't the right type." );
    if ( state.token.length === 0 )
        throw new Error( "The token stack was empty." );
    return _.win( { state: state, text: state.token[ 0 ] } );
} );



function ltrimParse( env, chops ) {
    return $c.parseInlineChops( env,
        $c.letChopLtrimRegex( chops, /^\s*/ ).rest );
}

function ltrimParser( func ) {
    return function ( chops, env ) {
        return func( ltrimParse( env, chops ) );
    };
}

function ltrimBlockParser( func ) {
    return function ( chops, env ) {
        return my.blockWidget( func( ltrimParse( env, chops ) ) );
    };
}

function ltrimBlockDocParser( func ) {
    return function ( chops, env ) {
        return my.blockWidget( func(
            $c.parseDocumentOfChops( env, $c.chopParas( chops ) ) ) );
    };
}

function manualChops( chops ) {
    return $c.parseInlineChops(
        $c.ChopsEnvObj.of( manualWidgetEnv ), chops );
}

function ltrimClassBlockParser( tagName ) {
    return function ( chops, env ) {
        var apart = $c.letChopWords( chops, 1 );
        if ( !apart ) throw new Error( "need a class" );
        return my.blockWidget(
            my.tag( tagName, "class", manualChops( apart[ 0 ] ) )(
                ltrimParse( env, apart[ 1 ] )
            ) );
    };
}

function ltrimClassBlockDocParser( tagName ) {
    return function ( chops, env ) {
        var apart = $c.letChopWords( chops, 1 );
        if ( !apart ) throw new Error( "need a class" );
        return my.blockWidget(
            my.tag( tagName, "class", manualChops( apart[ 0 ] ) )(
                $c.parseDocumentOfChops(
                    env, $c.chopParas( apart[ 1 ] ) )
            ) );
    };
}

function arrFlat( arr ) {
    return _.acc( function ( y ) {
        function recur( elem ) {
            if ( _.likeArray( elem ) )
                _.arrEach( elem, recur );
            else
                y( elem );
        }
        recur( arr );
    } );
}

var quoteLevel = 0;

var widgetEnv = {
    " block": function ( chops ) {
        var blocks = [];
        var thisBlock = [];
        function bankBlock() {
            if ( thisBlock.length !== 0 ) {
                thisBlock =
                    $c.letChopLtrimRegex( thisBlock, /^\s*/ ).rest;
                thisBlock =
                    $c.letChopRtrimRegex( thisBlock, /\s*$/ ).rest;
            }
            if ( thisBlock.length !== 0 ) {
                blocks.push(
                    my.blockWidget( my.tag( "p" )( thisBlock ) ) );
                thisBlock = [];
            }
        }
        _.arrEach( arrFlat( chops ), function ( it ) {
            if ( it instanceof BlockWidget ) {
                bankBlock();
                blocks.push( it );
            } else {
                thisBlock.push( it );
            }
        } );
        bankBlock();
        return blocks;
    },
    "": function ( chops, env ) {
        return [ "[", $c.parseInlineChops( env, chops ), "]" ];
    },
    "i": ltrimParser( my.tag( "i" ) ),
    "em": ltrimParser( my.tag( "em" ) ),
    "cite": ltrimParser( my.tag( "cite" ) ),
    "sup": ltrimParser( my.tag( "sup" ) ),
    "sub": ltrimParser( my.tag( "sub" ) ),
    "code": ltrimParser( my.tag( "code" ) ),
    "h1": ltrimBlockParser( my.tag( "h1" ) ),
    "h2": ltrimBlockParser( my.tag( "h2" ) ),
    "h3": ltrimBlockParser( my.tag( "h3" ) ),
    "p": ltrimBlockParser( my.tag( "p" ) ),
    "cpre": ltrimClassBlockParser( "pre" ),
    "pre": ltrimBlockParser( my.tag( "pre" ) ),
    "ul": ltrimBlockDocParser( my.tag( "ul" ) ),
    "li": ltrimBlockParser( my.tag( "li" ) ),
    "cdiv": ltrimClassBlockDocParser( "div" ),
    "cdl": ltrimClassBlockDocParser( "dl" ),
    "dl": ltrimBlockDocParser( my.tag( "tr" ) ),
    "dt": ltrimBlockParser( my.tag( "dt" ) ),
    "dd": ltrimBlockParser( my.tag( "dd" ) ),
    "ctable": ltrimClassBlockDocParser( "table" ),
    "tr": ltrimBlockDocParser( my.tag( "tr" ) ),
    "td": ltrimBlockParser( my.tag( "td" ) ),
    "dash": function ( chops, env ) { return emDash; },                "html": "/index.html",

    "en": function ( chops, env ) { return enDash; },
    "copyright": function ( chops, env ) { return copyright; },
    "pct": function ( chops, env ) { return "%"; },
    // TODO: Turn "quote" and "quotepunc" into custom widget types
    // that manipulate the state they pass to their children.
    // TODO: Figure out how [quotepunc . Foo [quote foo [quote foo]]]
    // should behave. Should the period go all the way to the inside?
    "quote": function ( chops, env ) {
        var q = quoteLevel % 2 === 0 ? "\"" : "'";
        quoteLevel++;
        try {
            return [ q, $c.parseInlineChops( env,
                $c.letChopLtrimRegex( chops, /^\s*/ ).rest ), q ];
        } finally { quoteLevel--; }
    },
    "quotepunc": function ( chops, env ) {
        var apart = $c.letChopWords( chops, 1 );
        if ( !apart ) throw new Error( "quotepunc needs an arg" );
        var q = quoteLevel % 2 === 0 ? "\"" : "'";
        quoteLevel++;
        try {
            return [ q, $c.parseInlineChops( env, apart[ 1 ] ),
                $c.unchops( apart[ 0 ] ), q ];
        } finally { quoteLevel--; }
    },
    "out": function ( chops, env ) {
        var apart = $c.letChopWords( chops, 1 );
        if ( !apart ) throw new Error( "out needs an arg" );
        return my.tag( "a", "class", "external-link",
            "href", $c.unchops( apart[ 0 ] ) )(
            $c.parseInlineChops( env, apart[ 1 ] )
        );
    },
    "file": function ( chops, env ) {
        var apart = $c.letChopWords( chops, 1 );
        if ( !apart ) throw new Error( "file needs an arg" );
        return my.tag( "a",
            "href", my.toPath( $c.unchops( apart[ 0 ] ) ) )(
            $c.parseInlineChops( env, apart[ 1 ] )
        );
    },
    "nav": function ( chops, env ) {
        var apart = $c.letChopWords( chops, 1 );
        if ( !apart ) throw new Error( "nav needs an arg" );
        var path = my.toPath( $c.unchops( apart[ 0 ] ) );
        if ( apart[ 1 ].length === 0 )
            return new NameNavLink( path );
        else
            return new NavLink(
                path, $c.parseInlineChops( env, apart[ 1 ] ) );
    },
    "nochops": function ( chops, env ) {
        return $c.unchops( $c.letChopLtrimRegex(
            chops, /^(?:(?!\n)\s)*[\n|]?/ ).rest );
    }
};

var manualWidgetEnv = {
    "tok": function ( chops, env ) {
        return new WidgetToken();
    },
    "nochops": function ( chops, env ) {
        return $c.unchops( $c.letChopLtrimRegex(
            chops, /^(?:(?!\n)\s)*[\n|]?/ ).rest );
    },
    "just": function ( chops, env ) {
        return $c.parseInlineChops( env, $c.letChopLtrimRegex(
            chops, /^(?:(?!\n)\s)*[\n|]?/ ).rest );
    }
};

my.parseInLocal = function ( locals, source ) {
    return $c.parseChopline(
        $c.ChopsEnvObj.of( _.shadow( widgetEnv, locals ) ), source );
};

my.parseIn = function ( source ) {
    return my.parseInLocal( {}, source );
};

my.parseLocal = function ( locals, source ) {
    return $c.parseChopup(
        $c.ChopsEnvObj.of( _.shadow( widgetEnv, locals ) ), source );
};

my.parse = function ( source ) {
    return my.parseLocal( {}, source );
};

my.parseHtml = function ( source, path ) {
    return my.widgetToHtml(
        my.parse( source ), my.toPath( path ), { counter: 0 } );
};

my.parseManualLocal = function ( locals, source ) {
    return $c.parseChopline(
        $c.ChopsEnvObj.of( _.shadow( manualWidgetEnv, locals ) ),
        source );
};

my.parseManual = function ( source ) {
    return my.parseManualLocal( {}, source );
};


function renderCssDependency( dep, path ) {
    var media = dep.media;
    var mediaPart = media === void 0 ? "" :
        " media=\"" + attrEscape( media ) + "\"";
    if ( dep.type === "external" ) {
        return "<link rel=\"stylesheet\"" + mediaPart + " href=\"" +
            attrEscape( my.toPath( dep.url ).from( path ) ) + "\" />";
    } else if ( dep.type === "embedded" ) {
        var code = dep.code;
        var match = /<\s*[\/!]/.exec( code )
        if ( match )
            throw new Error(
                "Embedded CSS code shouldn't contain the character " +
                "sequence " + _.blahpp( match[ 0 ] ) + "." );
        return "<style" + mediaPart + " type=\"text/css\">" +
            code + "</style>";
    } else if ( dep.type === "ie" ) {
        return "<!--[if " + dep.on + "]>" +
            renderCssDependency( dep.use, path ) + "<![endif]-->";
    } else {
        throw new Error( "Invalid CSS dependency." );
    }
}

function renderJsDependency( dep, path ) {
    if ( dep.type === "external" ) {
        return "<script type=\"text/javascript\" src=\"" +
            attrEscape( my.toPath( dep.url ).from( path ) ) + "\">" +
            "</script>";
    } else if ( dep.type === "embedded" ) {
        var code = dep.code;
        var match = /<\s*[\/!]/.exec( code )
        if ( match )
            throw new Error(
                "Embedded JavaScript code shouldn't contain the " +
                "character sequence " + _.blahpp( match[ 0 ] ) + "."
                );
        return "<script type=\"text/javascript\">" +
            code + "</script>";
    } else if ( dep.type === "ie" ) {
        return "<!--[if " + dep.on + "]>" +
            renderJsDependency( dep.use, path ) + "<![endif]-->";
    } else {
        throw new Error( "Invalid JS dependency." );
    }
}

function renderJsDependencies( deps, path ) {
    var deduped = [];
    var included = [];
    function add( deps ) {
        _.arrEach( deps, function ( dep ) {
            if ( dep instanceof JsIncludeOnce ) {
                if ( !_.arrAny( included,
                    function ( it ) { return it === dep; } ) ) {
                    included.push( dep );
                    add( dep.deps_ );
                }
            } else {
                deduped.push( renderJsDependency( dep, path ) );
            }
        } );
    }
    add( deps );
    return deduped.join( "" );
}

function makePages() { return {}; }

my.makePage = function (
    permalink, usesAbsolute, is404, name, title, icon, body ) {
    
    return { permalink: my.toPath( permalink ),
        usesAbsolute: usesAbsolute, is404: is404,
        name: name, title: title, icon: icon, body: body };
};

my.definePage = function ( pages, page ) {
    pages[ page.permalink.abs() ] = page;
};

function renderPage( pages, page, atpath, opts ) {
    
    atpath = my.toPath( atpath );
    
    var body = my.widgetToHtml( page.body, atpath,
        { "counter": 0, "pages": pages } );
    
    var html = "<!DOCTYPE html>\n" +
        "<html lang=\"en\">" +
        "<head>" +
        "<meta http-equiv=\"Content-Type\" " +
            "content=\"text/html;charset=UTF-8\" />" +
        "<title>" + my.widgetToTitle( page.title ) + "</title>" +
        renderJsDependencies( body.js || [], atpath ) +
        _.arrMap( body.css || [], function ( css ) {
            return renderCssDependency( css, atpath );
        } ).join( "" ) +
        "<link rel=\"shortcut icon\" href=\"" +
            attrEscape( my.toPath( page.icon ).from( atpath ) ) +
            "\" />" +
        "</head>" +
        "<body>" + body.html + "</body>" +
        "</html>";
    
    if ( !page.is404 || !opts[ "allowPhp" ] )
        return { "type": "html", "text": html };
    var php = html.replace( /<\?/g, "<<?php?>?");
    php = "<?php header( \"HTTP/1.1 404 Not Found\" ); ?>\n" + php;
    return { "type": "php", "text": php };
}

my.renderPages = function ( pages, basePath, opt_opts ) {
    opt_opts = _.opt( opt_opts ).or( { "allowPhp": false } ).bam();
    basePath = my.toPath( basePath );
    return _.objMap( pages, function ( page, permalink ) {
        return renderPage( pages, page,
            page.usesAbsolute ?
                my.maskPath( permalink, basePath ) : permalink,
            opt_opts );
    } );
};

my.renderPagesToText = function ( pages, basePath, opt_opts ) {
    return _.objMappend( my.renderPages( pages, basePath, opt_opts ),
        function ( page, permalink ) {
            var obj = {};
            obj[ my.toPath( permalink ).plus( {
                "html": "/index.html",
                "php": "/index.php"
            }[ page[ "type" ] ] ).abs() ] = page[ "text" ];
            return obj;
        } );
};


} );
