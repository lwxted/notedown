(
    function () {
        'use strict';
        const scripts = document.getElementsByTagName("script");
        const notedown_root = scripts[scripts.length - 1].src + "/../";
        const externals_root = scripts[scripts.length - 1].src + "/../externals/";
        const marked_relative_path = "marked/marked.min.js";
        const mathjax_relative_path = "MathJax/es5/tex-chtml.js";
        const markdown_path = externals_root + marked_relative_path;
        const mathjax_path = externals_root + mathjax_relative_path;

        let marked;

        const loadCss = function (url) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            document.head.appendChild(link);
        };

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

        const highlightInlineExtension = {
            name: 'highlight',
            level: 'inline',
            start(src) {
                return src.match(/^(==+)([^=]|[^=][\s\S]*?[^=])\1(?!=)/)?.index;
            },
            tokenizer(src) {
                const rule = /^(==+)([^=]|[^=][\s\S]*?[^=])\1(?!=)/;
                const match = rule.exec(src);
                if (match) {
                    console.log(match, src);
                    const token = {
                        type: 'highlight',
                        raw: match[0],
                        text: match[2],
                        tokens: [],
                    }
                    this.lexer.inline(token.text, token.tokens);
                    return token;
                }
            },
            renderer(token) {
                return `<mark>${this.parser.parseInline(token.tokens)}</mark>`;
            },
        };

        const calloutBlockExtension = {
            name: 'callout',
            level: 'block',
            start(src) {
                return src.match(/\{(?:note|def|warn)\}\n/)?.index;
            },
            tokenizer(src, _tokens) {
                const rule = /^\{(note|def|warn)(:[1-9]\d*)?\}\n(.*\n)([\S\s]*?)\{\/(?:note|def|warn)\2?\}(?:\n\n+|$)/;
                const match = rule.exec(src);
                if (match) {
                    const token = {
                        type: 'callout',
                        style: match[1].trim(),
                        raw: match[0],
                        text: match[0].trim(),
                        title: match[3].trim(),
                        titleTokens: [],
                        content: match[4].trim(),
                        contentTokens: [],
                    }
                    this.lexer.inline(token.title, token.titleTokens);
                    token.contentTokens.push(...this.lexer.blockTokens(token.content));
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
                extensions: [calloutBlockExtension, highlightInlineExtension],
            });
        }

        const main = function () {
            loadCss(notedown_root + 'style.css');

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

        if (window.IMPORT_GUARD) {
            return;
        }
        window.IMPORT_GUARD = true;

        main();
    }
)()