import React from "react";
import ReactDOM from "react-dom";

import {Main, addPlanet} from "./ui.jsx";

// console.log("hello from index.js")

// ReactDOM.render(
//     <React.Fragment>
//         <div class="icon-wrap">
//             <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z"/></svg>
//         </div>
//         <div class="icon-wrap">
//             <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>
//         </div>
//     </React.Fragment>, 
    // document.getElementById("mobile-tool"));

document.getElementById("cock").addEventListener("click", (e) => {
    console.log('cock');document.getElementById('root').className='show';
});

document.getElementById("balls").addEventListener("click", (e) => {
    // console.log('balls');document.getElementById('root').className='show';
    addPlanet();
});

ReactDOM.render(<Main></Main>, document.getElementById("root"));
