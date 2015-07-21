(function() {
    "use strict";

    var data;

    var currentPage;

    if (typeof String.prototype.endsWith != "function") {
        String.prototype.endsWith = function(str) {
            return this.substring(this.length - str.length, this.length) === str;
        };
    }

    function renderDOM() {
        var toolbar = document.createElement("div");
        toolbar.id = "toolbar";

        var toolbarIcon = document.createElement("div");
        toolbarIcon.id = "toolbar-icon";
        toolbarIcon.classList.add("material-icon");

        var title = document.createElement("span");
        title.id = "title";
        title.classList.add("font-title");
        title.textContent = data.title;

        var pageTitle = document.createElement("span");
        pageTitle.id = "page-title";
        pageTitle.classList.add("font-title");

        var space = document.createElement("div");
        space.classList.add("flex-space");

        var prevIcon = document.createElement("div");
        prevIcon.id = "prev-icon";
        prevIcon.classList.add("material-icon-button");
        prevIcon.addEventListener("click", prevClick);

        var nextIcon = document.createElement("div");
        nextIcon.id = "next-icon";
        nextIcon.classList.add("material-icon-button");
        nextIcon.addEventListener("click", nextClick);

        var secondRow = document.createElement("div");
        secondRow.id = "second-row";

        var secondPageTitle = document.createElement("span");
        secondPageTitle.id = "second-page-title";
        secondPageTitle.classList.add("font-title");

        var secondSpace = document.createElement("div");
        secondSpace.classList.add("flex-space");

        var fullscreenIcon = document.createElement("div");
        fullscreenIcon.id = "fullscreen-icon";
        fullscreenIcon.classList.add("material-icon-button");
        fullscreenIcon.addEventListener("click", fullscreenClick);

        secondRow.appendChild(secondPageTitle);
        secondRow.appendChild(secondSpace);
        secondRow.appendChild(fullscreenIcon);

        toolbar.appendChild(toolbarIcon);
        toolbar.appendChild(title);
        toolbar.appendChild(pageTitle);
        toolbar.appendChild(space);
        toolbar.appendChild(prevIcon);
        toolbar.appendChild(nextIcon);
        toolbar.appendChild(secondRow);

        insertBeforePage(toolbar);

        var panel = document.createElement("div");
        panel.id = "material-panel";

        var imageContainer = document.createElement("div");
        imageContainer.id = "image-container";

        var image = document.createElement("img");
        image.id = "image";
        image.setAttribute("hidefocus", "true");

        imageContainer.appendChild(image);

        var notes = document.createElement("div");
        notes.id = "notes";

        panel.appendChild(imageContainer);
        panel.appendChild(notes);

        insertBeforePage(panel);
    }

    function insertBeforePage(element) {
        document.body.insertBefore(element, document.getElementById("page"));
    }

    function addStyle() {
        var style = document.createElement("link");
        style.setAttribute("rel", "stylesheet");
        style.setAttribute("href", "Resources/Style.css");
        document.getElementsByTagName("head")[0].appendChild(style);
    }

    function getData() {
        var i, p;

        // Get page
        var page = document.getElementById("page");

        // Get title
        var title = page.querySelector("#documentTitle span").textContent;
        if (title.endsWith(".ep")) {
            title = title.slice(0, -3);
        }

        // Get all pages
        var pagesElements = page.querySelectorAll(".Page");
        var pages = [];
        for (i = 0; i < pagesElements.length; i++) {
            p = pagesElements[i];
            pages.push({
                id: p.id,
                title: p.querySelector(".Texts .Title").textContent,
                note: p.querySelector(".Texts .Note") && p.querySelector(".Texts .Note").nextElementSibling ? p.querySelector(".Texts .Note").nextElementSibling.innerHTML : "",
                src: p.querySelector(".Image img").src,
                map: p.querySelector(".Image map") ? p.querySelector(".Image map") : "",
                index: i
            });

        }

        // Return data
        return {
            title: title,
            pages: pages
        };
    }

    function updateTitle() {
        document.title = data.title + " - Pencil";
    }

    function setPageTitle(title, index) {
        title = "[" + (index + 1) + "/" + data.pages.length + "] " + title;
        document.getElementById("page-title").textContent = title;
        document.getElementById("second-page-title").textContent = title;
    }

    function checkHash() {
        var hash = window.location.hash.substr(1);
        var page = findPageById(hash);
        if (page) {
            setPageTitle(page.title, page.index);
            currentPage = page;
            updateNavigators();
            loadPage(page);
        } else {
            goToPage(data.pages[0].id);
        }
    }

    function loadPage(page) {
        var image = document.getElementById("image");
        image.src = page.src;
        image.setAttribute("usemap", "#" + page.map.getAttribute("name"));

        var notes = document.getElementById("notes");
        notes.innerHTML = page.note || "<span style=\"color: #9E9E9E;\">There are no notes :)</span>";

        if (!page.mapResize) {
            try {
                window.imageMapResize(currentPage.map);
                var evt = document.createEvent("UIEvents");
                evt.initUIEvent("resize", true, false, window, 0);
                window.dispatchEvent(evt);
            } catch (e) {
                console.log(e);
            }
            page.mapResize = true;
        }

    }

    function goToPage(id) {
        var page = findPageById(id);
        if (page) {
            window.location.hash = id;
        }
    }

    function getPreviousPage() {
        if (data.pages[currentPage.index - 1]) {
            return data.pages[currentPage.index - 1];
        }
        return false;
    }

    function getNextPage() {
        if (data.pages[currentPage.index + 1]) {
            return data.pages[currentPage.index + 1];
        }
        return false;
    }

    function updateNavigators() {
        var prev = document.getElementById("prev-icon");
        var next = document.getElementById("next-icon");

        if (getPreviousPage()) {
            prev.classList.add("on");
        } else {
            prev.classList.remove("on");
        }

        if (getNextPage()) {
            next.classList.add("on");
        } else {
            next.classList.remove("on");
        }
    }

    function prevClick() {
        goToPage(getPreviousPage().id);
    }

    function nextClick() {
        goToPage(getNextPage().id);
    }

    function fullscreenClick() {
        var image = document.getElementById("image-container");
        image.classList.add("fullscreen");
        if (image.requestFullscreen) {
            image.requestFullscreen();
        } else if (image.msRequestFullscreen) {
            image.msRequestFullscreen();
        } else if (image.mozRequestFullScreen) {
            image.mozRequestFullScreen();
        } else if (image.webkitRequestFullscreen) {
            image.webkitRequestFullscreen();
        }
    }

    function addFullscreenExitListeners() {
        document.addEventListener("webkitfullscreenchange", fullscreenExitHandler, false);
        document.addEventListener("mozfullscreenchange", fullscreenExitHandler, false);
        document.addEventListener("fullscreenchange", fullscreenExitHandler, false);
        document.addEventListener("MSFullscreenChange", fullscreenExitHandler, false);
    }

    function fullscreenExitHandler() {
        if ((document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) !== true) {
            document.getElementById("image-container").classList.remove("fullscreen");
        }
    }

    function findPageById(id) {
        for (var i = 0; i < data.pages.length; i++) {
            if (data.pages[i].id === id) {
                return data.pages[i];
            }
        }
        return false;
    }

    function setupHashChange() {
        window.addEventListener("hashchange", checkHash);
    }

    function setupKeyActions() {
        window.addEventListener("keydown", keyDownListener);
    }

    function keyDownListener(event) {
        var key = event.keyCode || event.which;
        if (key === 37) {
            if (getPreviousPage()) {
                goToPage(getPreviousPage().id);
            }
            return;
        }
        if (key === 39) {
            if (getNextPage()) {
                goToPage(getNextPage().id);
            }
            return;
        }
    }

    function moveMaps() {
        var mapsElement = document.createElement("div");
        mapsElement.id = "maps-element";
        var maps = document.getElementById("page").querySelectorAll("map");
        for (var i = 0; i < maps.length; i++) {
            mapsElement.appendChild(maps[i]);
        }
        document.body.appendChild(mapsElement);
    }

    var lastNoMapClick = 0;
    var noMapClickActive = false;

    function noMapClick() {
        if (noMapClickActive) {
            return;
        }
        noMapClickActive = true;
        var usemap = document.getElementById("image").getAttribute("usemap");
        var map = document.getElementById("maps-element").querySelector("[name=\"" + usemap.substr(1) + "\"]");
        var areas = map.querySelectorAll("area");
        var i, element, coord;

        for (i = 0; i < areas.length; i++) {
            coord = areas[i].getAttribute("coords").split(",");
            coord = {
                left: coord[0],
                top: coord[1],
                right: coord[2],
                bottom: coord[3]
            };
            coord.height = coord.bottom - coord.top;
            coord.width = coord.right - coord.left;
            element = document.createElement("div");
            element.id = "no-map-click-" + lastNoMapClick;
            element.classList.add("no-map-click");
            element.style.left = coord.left + "px";
            element.style.top = coord.top + "px";
            element.style.height = coord.height + "px";
            element.style.width = coord.width + "px";
            document.getElementById("image-container").appendChild(element);

            setTimeout(function() {
                element.parentNode.removeChild(document.getElementById("no-map-click-" + lastNoMapClick));
                noMapClickActive = false;
            }, 500);
        }
    }

    function setupNoMapClick() {
        document.getElementById("image").addEventListener("click", noMapClick);
    }

    function start() {
        addStyle();
        data = getData();
        moveMaps();
        document.getElementById("page").parentNode.removeChild(document.getElementById("page"));
        renderDOM();
        updateTitle();
        checkHash();
        document.body.scrollTop = 0;
        setupHashChange();
        setupKeyActions();
        setupNoMapClick();
        addFullscreenExitListeners();
        document.body.classList.add("ready");
    }

    window.addEventListener("load", start);
})();

/*! Image Map Resizer
 *  Desc: Resize HTML imageMap to scaled image.
 *  Copyright: (c) 2014-15 David J. Bradshaw - dave@bradshaw.net
 *  License: MIT
 */

(function() {
    'use strict';

    function scaleImageMap() {

        function resizeMap() {
            function resizeAreaTag(cachedAreaCoords) {
                function scaleCoord(e) {
                    return e * scallingFactor[(1 === (isWidth = 1 - isWidth) ? 'width' : 'height')];
                }

                var isWidth = 0;

                return cachedAreaCoords.split(',').map(Number).map(scaleCoord).map(Math.floor).join(',');
            }

            var scallingFactor = {
                width: displayedImage.width / sourceImage.width,
                height: displayedImage.height / sourceImage.height
            };

            for (var i = 0; i < areasLen; i++) {
                areas[i].coords = resizeAreaTag(cachedAreaCoordsArray[i]);
            }
        }

        function start() {
            var
                displayedWidth = null,
                displayedHeight = null;

            //WebKit asyncs image loading, so we have to catch the load event.
            sourceImage.onload = function sourceImageOnLoadF() {
                displayedWidth = displayedImage.width;
                displayedHeight = displayedImage.height;

                if ((displayedWidth !== sourceImage.width) || (displayedHeight !== sourceImage.height)) {
                    resizeMap();
                }
            };

            //IE11 can late load this image, so make sure we have the correct sizes (#10)
            displayedImage.onload = function() {
                if (null !== displayedWidth && displayedImage.width !== displayedWidth) {
                    resizeMap();
                }
            };

            //Make copy of image, so we can get the actual size measurements
            sourceImage.src = displayedImage.src;
        }

        function listenForResize() {
            function debounce() {
                clearTimeout(timer);
                timer = setTimeout(resizeMap, 250);
            }
            if (window.addEventListener) {
                window.addEventListener('resize', debounce, false);
            } else if (window.attachEvent) {
                window.attachEvent('onresize', debounce);
            }
        }

        function listenForFocus() {
            if (window.addEventListener) {
                window.addEventListener('focus', resizeMap, false);
            } else if (window.attachEvent) {
                window.attachEvent('onfocus', resizeMap);
            }
        }

        function getCoords(e) {
            // normalize coord-string to csv format without any space chars
            return e.coords.replace(/ *, */g, ',').replace(/ +/g, ',');
        }

        var
        /*jshint validthis:true */
            map = this,
            areas = map.getElementsByTagName('area'),
            areasLen = areas.length,
            cachedAreaCoordsArray = Array.prototype.map.call(areas, getCoords),
            displayedImage = document.querySelector('img[usemap="#' + map.name + '"]'),
            sourceImage = new Image(),
            timer = null;

        start();
        listenForResize();
        listenForFocus();
    }



    function factory() {
        function init(element) {
            if (!element.tagName) {
                throw new TypeError('Object is not a valid DOM element');
            } else if ('MAP' !== element.tagName.toUpperCase()) {
                throw new TypeError('Expected <MAP> tag, found <' + element.tagName + '>.');
            }

            scaleImageMap.call(element);
        }

        return function imageMapResizeF(target) {
            switch (typeof(target)) {
                case 'undefined':
                case 'string':
                    Array.prototype.forEach.call(document.querySelectorAll(target || 'map'), init);
                    break;
                case 'object':
                    init(target);
                    break;
                default:
                    throw new TypeError('Unexpected data type (' + typeof(target) + ').');
            }
        };
    }


    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') { //Node for browserfy
        module.exports = factory();
    } else {
        window.imageMapResize = factory();
    }


    if ('jQuery' in window) {
        jQuery.fn.imageMapResize = function $imageMapResizeF() {
            return this.filter('map').each(scaleImageMap).end();
        };
    }

})();