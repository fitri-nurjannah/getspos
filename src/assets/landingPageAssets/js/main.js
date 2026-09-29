$ = jQuery.noConflict();

    // loader start
    $(window).on("load",function(){ "use strict";
        setTimeout(function () {
            $(".loader").fadeOut(800);
        },1000);
    });

jQuery(function ($){

    'use strict';

    var $window = $(window);
    var windowsize = $(window).width();
    var $root = $("html, body");
    var $this = $(this);


/* ===================================
    Header Appear On Scroll
    ====================================== */

$(window).on('scroll', function () {
    if ($(this).scrollTop() > 180)   { // Set position from top to add class
        $('header').addClass('header-appear');
    }
    else {
        $('header').removeClass('header-appear');
    }
});


//scroll sections
$(".scroll").on("click", function (event) {
    event.preventDefault();
    $('html,body').animate({scrollTop: $(this.hash).offset().top - 40}, 1200);
});








    /* ===================================
       Owl Carousel
    ====================================== */

     $('.owl-testimonial').owlCarousel({
        margin:10,
        nav:false,
        loop:true,
        autoplay: true,
        autoplayTimeout: 3500,
        autoplayHoverPause:true,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:1
            },
            1000:{
                items:2
            }
        }
    });
    $('.owl-testimonial2').owlCarousel({
        margin:10,
        nav:false,
        loop:true,
        autoplay: true,
        autoplayTimeout: 3500,
        autoplayHoverPause:true,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:1
            },
            1000:{
                items:1
            }
        }
    });

    /*Testimonials 3columns*/
    $("#testimonial-slider").owlCarousel({
        items: 3,
        autoplay: false,
        autoplayHoverPause: true,
        loop: true,
        margin: 30,
        dots: true,
        nav: false,
        responsive: {
            1280: {
                items: 3,
            },
            600: {
                items: 2,
            },
            320: {
                items: 1,
            },
        }
    });


    $('.owl-team').owlCarousel({
        margin:10,
        nav:false,
        loop:true,
        bullets:false,
        autoplay: false,
        autoplayTimeout: 4000,
        autoplayHoverPause:true,
        responsive: {
            1280: {
                items: 3,
            },
            980: {
                items: 3,
            },
            600: {
                items: 2,
            },
            320: {
                items: 1,
            },
        }
    });

    $('.brand-carousel').owlCarousel({
        margin: 30,
        nav: false,
        dots: false,
        autoWidth: false,
        autoplay: 300,
        autoplayHoverPause: false,
        loop: true,
        responsive: {
            1200: {
                items: 5,
            },
            900: {
                items: 4,
            },
            768: {
                items: 3,
            },
            480: {
                items: 2,
            },
            320: {
                items: 1,
            },
        }
    });

    /*Services Box Slider*/
    $("#services-slider").owlCarousel({
        autoplay: false,
        autoplayTimeout: 3000,
        autoplayHoverPause: true,
        smartSpeed: 1200,
        loop: true,
        nav: false,
        navText: false,
        dots: false,
        mouseDrag: true,
        touchDrag: true,
        center: true,
        responsive: {
            0: {
                items: 1
            },
            640: {
                items: 3
            }
        }
    });


    /* ===================================
        Parallax
     ====================================== */
    if (windowsize > 992) {
        $(".parallaxie").parallaxie({
            speed: 0.4,
            offset: 0,
        });
    }

    /* ===================================
       Pricing Table Hover Function Toggle
    ====================================== */


    $(".price-box").hover(function () {
        if ($(window).width() > 767) {
            $(".price-box.main").removeClass("center");
            $(this).addClass("center");
        }
    }, function () {
        $(this).removeClass("center");
        $(".price-box.main").addClass("center");
    });



    /* ===================================
      ----------- Counters ----------
    ====================================== */


    $(".value_formatter").data("countToOptions", {
        formatter: function (value, options) {
            return value.toFixed(options.decimals).replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
        }
    });
    $(".counters").appear(function () {
        $(".count_nums").each(count);
    });

    function count(options) {
        var $this = $(this);
        options = $.extend({}, options || {}, $this.data("countToOptions") || {});
        $this.countTo(options);
    }

    /*  end of counter js */


    /* ===================================
         Side Menu
     ====================================== */
    if ($("#sidemenu_toggle").length) {
        $("body").addClass("pushwrap");
        $("#sidemenu_toggle").on("click", function () {
            $(".side-nav-btn").addClass("active");
            $(".side-menu").addClass("side-menu-active"), $("#close_side_menu").fadeIn(700)
        }), $(".side-nav .navbar-nav .nav-link").on("click", function () {
            $(".side-menu").removeClass("side-menu-active"), $(".pushwrap").removeClass("active"), $(".side-nav-btn").removeClass("active");
        }), $("#btn_sideNavClose").on("click", function () {
            $(".side-menu").removeClass("side-menu-active"), $(".pushwrap").removeClass("active")
            $(".side-nav-btn").removeClass("active");
        });
    }

    /* ===================================
         Wow JS
     ====================================== */

    if($(window).width() > 768){

    var wow = new WOW(
        {
            boxClass:     'wow',      // animated element css class (default is wow)
            animateClass: 'animated', // animation css class (default is animated)
            offset:       0,          // distance to the element when triggering the animation (default is 0)
            mobile:       true,       // trigger animations on mobile devices (default is true)
            live:         true,       // act on asynchronously loaded content (default is true)
            callback:     function(box) {
                // the callback is fired every time an animation is started
                // the argument that is passed in is the DOM node being animated
            },
            scrollContainer: null // optional scroll container selector, otherwise use window
        }
    );
    wow.init();

    }


/* ===================================
      Blog Measonry
  ====================================== */

$("#blog-measonry").cubeportfolio({
    layoutMode: 'grid',
    defaultFilter: '*',
    animationType: "scaleSides",
    gapHorizontal: 30,
    gapVertical: 30,
    gridAdjustment: "responsive",
    mediaQueries: [{
        width: 1500,
        cols: 3
    }, {
        width: 1100,
        cols: 3
    }, {
        width: 768,
        cols: 2
    }, {
        width: 480,
        cols: 1
    },{
        width: 320,
        cols: 1
    }],
});

/* ===================================
   init cubeportfolio
====================================== */

$('#js-grid-mosaic-flat').cubeportfolio({
    filters: '#js-filters-mosaic-flat',
    layoutMode: 'mosaic',
    sortByDimension: true,
    mediaQueries: [{
        width: 1500,
        cols: 6,
    }, {
        width: 1100,
        cols: 4,
    }, {
        width: 800,
        cols: 3,
    }, {
        width: 480,
        cols: 1,
        options: {
            gapHorizontal: 15,
            gapVertical: 15,
        }
    }],
    defaultFilter: '*',
    animationType: 'fadeOutTop',
    gapHorizontal: 0,
    gapVertical: 0,
    gridAdjustment: 'responsive',
    caption: 'fadeIn',
    displayType: 'fadeIn',
    displayTypeSpeed: 100,

    // lightbox
    lightboxDelegate: '.cbp-lightbox',
    lightboxGallery: true,
    lightboxTitleSrc: 'data-title',
    lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',

    plugins: {
        loadMore: {
            element: '#js-loadMore-mosaic-flat',
            action: 'click',
            loadItems: 3,
        }
    },
});

    /* =====================================
              Portfolio Filter
          ====================================== */

    if ($(".filtering").length) {
    // isotope
    $('.gallery').isotope({
        // options
        itemSelector: '.items'
    });

    var $gallery = $('.gallery').isotope({
        // options
    });

    // filter items on button click
    $('.filtering').on('click', 'span', function () {

        var filterValue = $(this).attr('data-filter');

        $gallery.isotope({filter: filterValue});

    });

    $('.filtering').on('click', 'span', function () {

        $(this).addClass('active').siblings().removeClass('active');

    });

    setTimeout(function (){
        $('.filtering .active').click();
    }, 1200);

    }

    /* ===================================
       ----- Type Writter Effect -----
    ====================================== */

    if ($("#typewriting").length) {
        var app = document.getElementById("typewriting");
        var typewriter = new Typewriter(app, {
            loop: true
        });
        typewriter.typeString('Creative').pauseFor(2000).deleteAll()
            .typeString('Parallax').pauseFor(2000).deleteAll()
            .typeString('Flexible').pauseFor(2000).start();
    }


    /* ------- Smooth scroll ------- */


    /*hide menu on mobile click*/
    $(".navbar-nav>li>a").on("click", function(){
        $(".navbar-collapse").collapse("hide");
    });

    /*$(".dl-menu >.menu-item >a").on("click", function(){
     $(".pushmenu-right").collapse("hide");
    });*/


    /* ----- Back to Top ----- */
    $("body").append('<a href="#" class="back-top"><i class="fa fa-angle-up"></i></a>');
    var amountScrolled = 700;
    var backBtn = $("a.back-top");
    $window.on("scroll", function () {
        if ($window.scrollTop() > amountScrolled) {
            backBtn.addClass("back-top-visible");
        } else {
            backBtn.removeClass("back-top-visible");
        }
    });
    backBtn.on("click", function () {
        $root.animate({
            scrollTop: 0
        }, 700);
        return false;
    });


    /* ===================================
      Rotating Text
      ====================================== */

    if ($("#js-rotating").length) {

    $("#js-rotating").Morphext({
        // The [in] animation type. Refer to Animate.css for a list of available animations.
        animation: "flipInX",
        // An array of phrases to rotate are created based on this separator. Change it if you wish to separate the phrases differently (e.g. So Simple | Very Doge | Much Wow | Such Cool).
        separator: ",",
        // The delay between the changing of each phrase in milliseconds.
        speed: 3000,
        complete: function () {
            // Called after the entrance animation is executed.
        }
    });
    }



/* ===================================
   Slider
====================================== */

$("#rev_slider_8_1").show().revolution({
    sliderType:"standard",
    jsFileLocation:"//localhost/revslider/revslider/public/assets/js/",
    sliderLayout:"fullscreen",
    dottedOverlay:"none",
    delay:9000,
    navigation: {
        keyboardNavigation:"off",
        keyboard_direction: "horizontal",
        mouseScrollNavigation:"off",
        mouseScrollReverse:"default",
        onHoverStop:"on",
        touch:{
            touchenabled:"on",
            touchOnDesktop:"off",
            swipe_threshold: 75,
            swipe_min_touches: 50,
            swipe_direction: "horizontal",
            drag_block_vertical: false
        }
        ,
        arrows: {
            style:"uranus",
            enable:true,
            hide_onmobile:true,
            hide_under:600,
            hide_onleave:true,
            hide_delay:200,
            hide_delay_mobile:1200,
            tmp:'<div class="hvr-pulse"></div>',
            left: {
                h_align:"left",
                v_align:"center",
                h_offset:30,
                v_offset:0
            },
            right: {
                h_align:"right",
                v_align:"center",
                h_offset:30,
                v_offset:0
            }
        }
        ,
        bullets: {
            enable:true,
            hide_onmobile:true,
            hide_under:600,
            style:"hephaistos",
            hide_onleave:true,
            hide_delay:200,
            hide_delay_mobile:1200,
            direction:"horizontal",
            h_align:"center",
            v_align:"bottom",
            h_offset:0,
            v_offset:30,
            space:5,
            tmp:''
        }
    },
    responsiveLevels:[1240,1024,778,480],
    visibilityLevels:[1240,1024,778,480],
    gridwidth:[1240,1024,778,480],
    gridheight:[868,600,500,400],
    lazyType:"smart",
    parallax: {
        type:"mouse",
        origo:"slidercenter",
        speed:2000,
        speedbg:0,
        speedls:0,
        levels:[2,3,4,5,6,7,12,16,10,50,10,11,12,13,14,55],
    },
    shadow:0,
    spinner:"off",
    stopLoop:"off",
    stopAfterLoops:-1,
    stopAtSlide:-1,
    shuffle:"off",
    autoHeight:"off",
    fullScreenAutoWidth:"off",
    fullScreenAlignForce:"off",
    fullScreenOffsetContainer: "",
    fullScreenOffset: "",
    hideThumbsOnMobile:"off",
    hideSliderAtLimit:0,
    hideCaptionAtLimit:0,
    hideAllCaptionAtLilmit:0,
    debugMode:false,
    fallbacks: {
        simplifyAll:"off",
        nextSlideOnWindowFocus:"off",
        disableFocusListener:false,
    }
});


$("#rev_slider_16_1").show().revolution({
    sliderType:"standard",
    jsFileLocation:"//localhost/revslider/revslider/public/assets/js/",
    sliderLayout:"fullscreen",
    dottedOverlay:"none",
    delay:12000,
    particles: {startSlide: "first", endSlide: "last", zIndex: "1",
        particles: {
            number: {value: 100}, color: {value: "#ffffff"},
            shape: {
                type: "circle", stroke: {width: 0, color: "#ffffff", opacity: 1},
                image: {src: ""}
            },
            opacity: {value: 0.75, random: true, min: 0.25, anim: {enable: false, speed: 3, opacity_min: 0, sync: false}},
            size: {value: 2, random: true, min: 0.5, anim: {enable: false, speed: 40, size_min: 1, sync: false}},
            line_linked: {enable: false, distance: 150, color: "#ffffff", opacity: 0.4, width: 1},
            move: {enable: true, speed: 1, direction: "top", random: true, min_speed: 3, straight: false, out_mode: "out"}},
        interactivity: {
            events: {onhover: {enable: false, mode: "repulse"}, onclick: {enable: false, mode: "repulse"}},
            modes: {grab: {distance: 400, line_linked: {opacity: 0.5}}, bubble: {distance: 400, size: 40, opacity: 0.4}, repulse: {distance: 200}}
        }
    },
    navigation: {
        keyboardNavigation:"off",
        keyboard_direction: "horizontal",
        mouseScrollNavigation:"off",
        mouseScrollReverse:"default",
        onHoverStop:"off",
        arrows: {
            style:"uranus",
            enable:true,
            hide_onmobile:false,
            hide_onleave:false,
            tmp:'',
            left: {
                h_align:"right",
                v_align:"bottom",
                h_offset:60,
                v_offset:10
            },
            right: {
                h_align:"right",
                v_align:"bottom",
                h_offset:10,
                v_offset:10
            }
        }
    },
    responsiveLevels:[1240,1024,778,480],
    visibilityLevels:[1240,1024,778,480],
    gridwidth:[1240,1024,778,480],
    gridheight:[868,768,960,720],
    lazyType:"smart",
    parallax: {
        type:"scroll",
        origo:"slidercenter",
        speed:400,
        speedbg:1500,
        speedls:1000,
        levels:[5,10,15,20,25,30,35,40,60,46,-10,-15,-20,-25,-30,55],
    },
    shadow:0,
    spinner:"off",
    stopLoop:"off",
    stopAfterLoops:-1,
    stopAtSlide:-1,
    shuffle:"off",
    autoHeight:"off",
    fullScreenAutoWidth:"off",
    fullScreenAlignForce:"off",
    fullScreenOffsetContainer: "",
    fullScreenOffset: "",
    hideThumbsOnMobile:"off",
    hideSliderAtLimit:0,
    hideCaptionAtLimit:0,
    hideAllCaptionAtLilmit:0,
    debugMode:false,
    fallbacks: {
        simplifyAll:"off",
        nextSlideOnWindowFocus:"off",
        disableFocusListener:false,
    }
});

$("#rev_slider_11_1").show().revolution({
    sliderType:"standard",
    jsFileLocation:"//localhost:82/revslider/revslider/public/assets/js/",
    sliderLayout:"fullscreen",
    dottedOverlay:"none",
    delay:20000,
    navigation: {
        onHoverStop:"off",
    },
    responsiveLevels:[1240,1024,768,480],
    visibilityLevels:[1240,1024,768,480],
    gridwidth:[1240,1024,768,480],
    gridheight:[868,600,500,400],
    lazyType:"none",
    parallax: {
        type:"mouse",
        origo:"slidercenter",
        speed:2000,
        speedbg:0,
        speedls:0,
        levels:[2,3,4,5,6,7,12,16,10,50,47,48,49,50,51,55],
    },
    shadow:0,
    spinner:"off",
    stopLoop:"on",
    stopAfterLoops:0,
    stopAtSlide:1,
    shuffle:"off",
    autoHeight:"off",
    fullScreenAutoWidth:"off",
    fullScreenAlignForce:"off",
    fullScreenOffsetContainer: "",
    disableProgressBar:"on",
    hideThumbsOnMobile:"off",
    hideSliderAtLimit:0,
    hideCaptionAtLimit:0,
    hideAllCaptionAtLilmit:0,
    debugMode:false,
    fallbacks: {
        simplifyAll:"off",
        nextSlideOnWindowFocus:"off",
        disableFocusListener:false,
    }
});

    /*arrows thumb Slider*/
$("#rev_arrows").show().revolution({
        sliderType: "standard",
        jsFileLocation: "js/revolution/",
        sliderLayout: "fullwidth",
        dottedOverlay: "none",
        delay: 9000,
        navigation: {
            keyboardNavigation: "off",
            keyboard_direction: "horizontal",
            mouseScrollNavigation: "off",
            mouseScrollReverse: "default",
            onHoverStop: "off",
            touch: {
                touchenabled: "on",
                swipe_threshold: 75,
                swipe_min_touches: 1,
                swipe_direction: "horizontal",
                drag_block_vertical: false
            },
            arrows: {
                style: "zeus",
                enable: true,
                hide_onmobile: true,
                hide_under: 600,
                hide_onleave: true,
                hide_delay: 200,
                hide_delay_mobile: 1200,
                tmp: '<div class="tp-title-wrap"> <div class="tp-arr-imgholder"></div> </div>',
                left: {
                    h_align: "left",
                    v_align: "center",
                    h_offset: 30,
                    v_offset: 0
                },
                right: {
                    h_align: "right",
                    v_align: "center",
                    h_offset: 30,
                    v_offset: 0
                }
            }
        },
        viewPort: {
            enable: true,
            outof: "pause",
            visible_area: "80%",
            presize: false
        },
        responsiveLevels: [1240, 1024, 778, 480],
        visibilityLevels: [1240, 1024, 778, 480],
        gridwidth: [1140, 1024, 768, 480],
        gridheight: [660, 650, 600, 490],
        lazyType: "none",
        parallax: {
            type: "mouse",
            origo: "slidercenter",
            speed: 2000,
            speedbg: 0,
            speedls: 0,
            levels: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20, 25, 55],
            disable_onmobile: "on"
        },
        shadow: 0,
        spinner: "off",
        stopLoop: "off",
        stopAfterLoops: -1,
        stopAtSlide: -1,
        shuffle: "off",
        autoHeight: "off",
        hideThumbsOnMobile: "off",
        hideSliderAtLimit: 0,
        hideCaptionAtLimit: 0,
        hideAllCaptionAtLilmit: 0,
        debugMode: false,
        fallbacks: {
            simplifyAll: "off",
            nextSlideOnWindowFocus: "off",
            disableFocusListener: false,
        }
    });

    /* Construction */
$("#rev_slider_1078_2").show().revolution({
        sliderType: "standard",
        jsFileLocation: "revolution/js/",
        sliderLayout: "fullscreen",
        dottedOverlay: "none",
        delay: 6000,
        navigation: {
            keyboardNavigation: "on",
            keyboard_direction: "horizontal",
            mouseScrollNavigation: "off",
            mouseScrollReverse: "default",
            onHoverStop: "off",
            touch: {
                touchenabled: "on",
                swipe_threshold: 75,
                swipe_min_touches: 1,
                swipe_direction: "horizontal",
                drag_block_vertical: false
            },
            arrows: {
                style: "zeus",
                enable: true,
                hide_onmobile: true,
                hide_under: 600,
                hide_onleave: true,
                hide_delay: 200,
                hide_delay_mobile: 1200,
                tmp: '<div class="tp-title-wrap">  	<div class="tp-arr-imgholder"></div> </div>',
                left: {
                    h_align: "left",
                    v_align: "center",
                    h_offset: 30,
                    v_offset: 0
                },
                right: {
                    h_align: "right",
                    v_align: "center",
                    h_offset: 30,
                    v_offset: 0
                }
            },
            bullets: {
                enable: false,
                hide_onmobile: false,
                hide_under: 300,
                style: "hermes",
                hide_onleave: false,
                hide_delay: 200,
                hide_delay_mobile: 1200,
                direction: "horizontal",
                h_align: "center",
                v_align: "bottom",
                h_offset: 0,
                v_offset: 30,
                space: 8,
                tmp: '<span class="tp-bullet-img-wrap">  <span class="tp-bullet-image"></span></span><span class="tp-bullet-title">{{title}}</span>'
            }
        },
        viewPort: {
            enable: true,
            outof: "pause",
            visible_area: "80%",
            presize: false
        },
        responsiveLevels: [1240, 1024, 778, 480],
        visibilityLevels: [1240, 1024, 778, 480],
        gridwidth: [1240, 1024, 778, 480],
        gridheight: [600, 600, 500, 400],
        lazyType: "none",
        parallax: {
            type: "mouse",
            origo: "slidercenter",
            speed: 2000,
            levels: [2, 3, 4, 5, 6, 7, 12, 16, 10, 50, 46, 47, 48, 49, 50, 55]
        },
        shadow: 0,
        spinner: "off",
        stopLoop: "off",
        stopAfterLoops: -1,
        stopAtSlide: -1,
        shuffle: "off",
        autoHeight: "off",
        hideThumbsOnMobile: "off",
        hideSliderAtLimit: 0,
        hideCaptionAtLimit: 0,
        hideAllCaptionAtLilmit: 0,
        debugMode: false,
        fallbacks: {
            simplifyAll: "off",
            nextSlideOnWindowFocus: "off",
            disableFocusListener: false
        }
    });


    // side dots slider
    $("#banner-main").show().revolution({
        sliderType: "standard",
        sliderLayout: "fullscreen",
        scrollbarDrag: "true",
        dottedOverlay: "none",
        navigation: {
            keyboardNavigation: "off",
            keyboard_direction: "horizontal",
            mouseScrollNavigation: "off",
            bullets: {
                style: "",
                enable: true,
                rtl: false,
                hide_onmobile: false,
                hide_onleave: false,
                hide_under: 767,
                hide_over: 9999,
                tmp: '',
                direction: "vertical",
                space: 10,
                h_align: "right",
                v_align: "center",
                h_offset: 40,
                v_offset: 0
            },
            arrows: {
                enable: false,
                hide_onmobile: true,
                hide_onleave: false,
                hide_under: 767,
                left: {
                    h_align: "left",
                    v_align: "center",
                    h_offset: 20,
                    v_offset: 30
                },
                right: {
                    h_align: "right",
                    v_align: "center",
                    h_offset: 20,
                    v_offset: 30
                }
            },
            touch: {
                touchenabled: "on",
                swipe_threshold: 75,
                swipe_min_touches: 1,
                swipe_direction: "horizontal",
                drag_block_vertical: false
            }
        },
        viewPort: {
            enable: true,
            outof: "pause",
            visible_area: "90%"
        },
        responsiveLevels: [4096, 1024, 778, 480],
        gridwidth: [1140, 1024, 750, 480],
        gridheight: [600, 500, 500, 350],
        lazyType: "none",
        parallax: {
            type: "mouse",
            origo: "slidercenter",
            speed: 9000,
            levels: [2, 3, 4, 5, 6, 7, 12, 16, 10, 50]
        },
        shadow: 0,
        spinner: "off",
        stopLoop: "off",
        stopAfterLoops: -1,
        stopAtSlide: -1,
        shuffle: "off",
        autoHeight: "off",
        hideThumbsOnMobile: "off",
        hideSliderAtLimit: 0,
        hideCaptionAtLimit: 0,
        hideAllCaptionAtLilmit: 0,
        debugMode: false,
        fallbacks: {
            simplifyAll: "off",
            nextSlideOnWindowFocus: "off",
            disableFocusListener: false
        }
    });



});





