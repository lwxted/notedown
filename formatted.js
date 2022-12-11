(
    function () {
        'use strict';

        const scripts = document.getElementsByTagName("script");
        const notedown_root = scripts[scripts.length - 1].src + "/../";
        const externals_root = scripts[scripts.length - 1].src + "/../externals/";
        const marked_relative_path = "marked/marked.min.js";
        const mathjax_relative_path = "MathJax/es5/tex-svg.js";
        const markdown_path = externals_root + marked_relative_path;
        const mathjax_path = externals_root + mathjax_relative_path;

        let marked;

        const loadjs = function (url, callback) {
            const script = window.document.createElement('script');
            script.src = url;
            script.onload = callback;
            window.document.head.appendChild(script);
        };

        const getBodyTagHTML = function () {
            return window.document.body.innerHTML.trim();
        };

        const renderPage = function () {
            window.document.body.innerHTML = marked.parse(getBodyTagHTML());
        };

        const main = function () {
            loadjs(markdown_path, function () {
                marked = window.marked;
                renderPage();
            });

            window.MathJax = {
                tex: {
                    // Enable $...$ as delimiter for inline math.
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    tags: 'ams'
                },
                startup: {
                    typeset: false
                }
            };

            loadjs(mathjax_path, function () {
                window.MathJax.typesetPromise();
            });
        }

        main();
    }
)()