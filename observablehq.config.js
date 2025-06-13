import {generateHeader} from "@one-data/observable-themes/header";
import {generateFooter} from "@one-data/observable-themes/footer";
import {icon} from "@one-data/observable-themes/use-images";

const projectTitle = "Tariff Simulator"

export default {

  title: projectTitle,
  head: `<link rel="icon" href=${icon} type="image/png" sizes="32x32">
         <link
           rel="stylesheet"
           href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/css/flag-icons.min.css"
         />`,

  header: generateHeader({title: projectTitle}),
  footer: generateFooter(),

  root: "src",
  style: "style.css",

  toc: false,
  sidebar: false,
  pager: false,
};
