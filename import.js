function linkSources() {
    const scripts = document.getElementsByTagName("script");
    const notedown_root = scripts[scripts.length-1].src + "/../";
    const externals_root = scripts[scripts.length-1].src + "/../externals/";
    const marked_relative_path = "marked/marked.min.js";
    const mathjax_relative_path = "MathJax/es5/tex-svg.js";
    const texme_relative_path = "texme/texme.js";
    window.texme = {
        style: "none",
        renderOnLoad: false,
        markdownURL: externals_root + marked_relative_path,
        MathJaxURL: externals_root + mathjax_relative_path,
    };

    const script_import = document.createElement('script');
    script_import.src = externals_root + texme_relative_path;
    document.head.appendChild(script_import);

    var link = document.createElement('link'); 
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = notedown_root + 'style.css';
    document.head.appendChild(link);
}

function renderHeaderLevelCounter(counters) {
    let lastOneIdx = 5;
    for (; lastOneIdx >= 0; --lastOneIdx) {
        if (counters[lastOneIdx] !== 0) {
            break;
        }
    }
    return counters.slice(0, lastOneIdx + 1).join(".");
}

function insertHeaderNumbers() {
    let counters = [0, 0, 0, 0, 0, 0];
    for (let element of document.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
        const headerLevel = Number(element.tagName.substring(1));
        ++counters[headerLevel - 1];
        for (let i = headerLevel; i < 6; ++i) {
            counters[i] = 0;
        }
        element.innerHTML = `<a href="#${element.id}"><span class="section-counter counter">${renderHeaderLevelCounter(counters)}</span></a> ${element.innerHTML}`;
    }
}

function insertTitle() {
    document.body.innerHTML = `<div class="title">${document.title}</div>\n${document.body.innerHTML}`
}

linkSources();
window.onload = function () {
    texme.renderPage()
    insertTitle();
    insertHeaderNumbers();
}