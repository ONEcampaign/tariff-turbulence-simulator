import {icon} from "@one-data/observable-themes/brand";
import {title} from "./src/js/copyText.js"

export default {
  title: title,
  head: `<link rel="icon" href=${icon} type="image/png" sizes="32x32">`,

  base: "/trade-explorer",
  preserveExtension: true,

  root: "src",
  style: "style.css",

  toc: false,
  pager: false,
  sidebar: false,
  header: false,
  footer: false,
};


