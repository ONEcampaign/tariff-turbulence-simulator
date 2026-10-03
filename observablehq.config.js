import {icon} from "@one-data/observable-themes/brand";
import {title} from "./src/js/copyText.js"

export default {
  title: title,
  head: `<link rel="icon" href=${icon}>`,

  base: "/tariff-simulator",
  preserveExtension: true,

  root: "src",
  style: "style.css",

  toc: false,
  pager: false,
  sidebar: false,
  header: false,
  footer: false,
};


