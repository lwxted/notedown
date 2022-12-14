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

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = notedown_root + 'style.css';
        document.head.appendChild(link);

        let marked;

        const loadjs = function (url, callback) {
            const script = window.document.createElement('script');
            script.src = url;
            script.onload = callback;
            window.document.head.appendChild(script);
        };

        function htmlDecode(input) {
            var doc = new DOMParser().parseFromString(input, "text/html");
            return doc.documentElement.textContent;
        }

        const getBodyContent = function () {
            return htmlDecode(window.document.body.innerHTML.trim());
        };

        const renderPage = function () {
            window.document.body.innerHTML = `
            <div class="rendered">
                <div class="title">
                    ${document.title}
                </div>
                ${marked.parse(getBodyContent())}
            </div>`;
        };

        const calloutBlockExtension = {
            name: 'callout',
            level: 'block',
            start(src) {
                return src.match(/\{(?:note|def|warn)\}\n/)?.index;
            },
            tokenizer(src, _tokens) {
                const rule = /^\{(note|def|warn)\}\n(.*\n)([\S\s]*?)\{(?:note|def|warn)\}(?:\n\n+|$)/;
                const match = rule.exec(src);
                if (match) {
                    const token = {
                        type: 'callout',
                        style: match[1].trim(),
                        raw: match[0],
                        text: match[0].trim(),
                        title: match[2].trim(),
                        titleTokens: [],
                        content: match[3].trim(),
                        contentTokens: [],
                    }
                    this.lexer.inline(token.title, token.titleTokens);
                    const segments = token.content.split('\n\n');
                    for (let i = 0; i < segments.length; ++i) {
                        token.contentTokens.push(...this.lexer.blockTokens(segments[i]));
                    }
                    return token;
                }
            },
            renderer(token) {
                const classMap = {
                    'note': "note",
                    'warn': "warn",
                    'def': "definition",
                };
                return `<div class="${classMap[token.style]}">
                            <div class="title">
                                ${this.parser.parseInline(token.titleTokens)}
                            </div>
                            <div class="explanation">
                                ${this.parser.parse(token.contentTokens)}
                            </div>
                        </div>
                `;
            }
        };

        const extendMarked = function () {
            const headerCounters = [0, 0, 0, 0, 0, 0];

            const renderHeaderLevelCounter = function (counters) {
                let lastOneIdx = 5;
                for (; lastOneIdx >= 0; --lastOneIdx) {
                    if (counters[lastOneIdx] !== 0) {
                        break;
                    }
                }
                return counters.slice(0, lastOneIdx + 1).join(".");
            };

            const renderer = {
                heading(text, level) {
                    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
                    ++headerCounters[level - 1];
                    for (let i = level; i < 6; ++i) {
                        headerCounters[i] = 0;
                    }
                    const counter = `<span class="section-counter counter">${renderHeaderLevelCounter(headerCounters)}</span>`;
                    return `
                          <h${level}>
                            <a name="${escapedText}" href="#${escapedText}">${counter}</a>
                            ${text}
                          </h${level}>`;
                },

                image(href, title, text) {
                    return `<div class="figure">
                                <div class="image">
                                    ${(new marked.Renderer()).image(href, title, text)}
                                </div>
                                ${title ? `<div class="caption">${title}</div>` : ''}
                            </div>`;
                },
            };
            marked.use({
                renderer,
                extensions: [calloutBlockExtension]
            });
        }

        const main = function () {
            loadjs(markdown_path, function () {
                marked = window.marked;
                extendMarked();
                renderPage();
            });

            window.MathJax = {
                options: {
                    skipHtmlTags: { '[-]': ['pre'] },
                    processHtmlClass: ['language\-pseudo'],
                },
                tex: {
                    // Enable $...$ as delimiter for inline math.
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    tags: 'ams',
                    processEscapes: true,
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