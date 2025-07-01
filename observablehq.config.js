import {icon} from "@one-data/observable-themes/use-images";
import {title} from "./src/js/copyText.js"

export default {

  title: title,
  head: `<link rel="icon" href=${icon} type="image/png" sizes="32x32">
         <link
           rel="stylesheet"
           href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/css/flag-icons.min.css"
         />
         <meta name="viewport" content="height=device-height, 
                      width=device-width, initial-scale=1.0, 
                      minimum-scale=1.0, maximum-scale=1.0, 
                      user-scalable=no, target-densitydpi=device-dpi">`,

  root: "src",
  style: "style.css",
};
