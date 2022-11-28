const notedown_root = "./externals/";
const marked_relative_path = "marked/marked.min.js";
const mathjax_relative_path = "MathJax/es5/tex-mml-svg.js";
const texme_relative_path = "texme/texme.js";
window.texme = {
    style: "none",
};
const script_import = document.createElement('script');
script_import.setAttribute('src', notedown_root + texme_relative_path);
document.head.appendChild(script_import);