import React from "react";

/* jshint esversion: 9 */

const e = React.createElement;

// var rerenderMain = () => {};
// var changePlanetParameters = (pI, pN, pV) => {};
// var getPlanetsInitial = () => { return []; };

import {setBolded, setInitalPlanets, rerenderMain, rerenderOrbits, bindChangePlanetParameters, viewFrom, rerenderOverlay, rerenderPlanets, calculateOrbits, goto} from './canvas.js';
import {round} from './math'

var bindedAddPlanet = ()=>{};

export function addPlanet(){
    bindedAddPlanet();
}

export class Main extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            planetsInitial: [
                { mass: 3000, pi: { x: 0, y: 0, z: 0 }, vi: { x: 0, y: 0, z: 0 }, name: "Sun", color: "#e6f74a", radius: 8 },
                { mass: 600, pi: { x: -1284, y: 0, z: 0 }, vi: { x: 0, y: 0, z: 1 }, name: "Big Blue", color: "#48fae5", radius: 4 }
            ],
            // planetAnimator: new PlanetAnimator(),
            viewingFrom: -1,
            selected: -1,
            renderDetailedText: false,
            renderText: false,
            orbitStepSize: 1,
            
        };

        this.calculateOrbits();
        this.resetPlanetPlayer();
        bindedAddPlanet = () => {
            this.createPlanet();
        }
        bindChangePlanetParameters((pI, pN, pV) => { this.planetParameterChange(pI, pN, pV); });
        // getPlanetsInitial = () => { return this.state.planetsInitial; };
    }

    render() {
        return <div>
            <PlanetList planetsInitial={this.state.planetsInitial} 
                        planetParameterChange={(pI, pP, pV) => {
                            this.planetParameterChange(pI, pP, pV);
                        }}
                        viewFrom={(i)=>{this.viewFrom(i);}}
                        createPlanet={()=>{this.createPlanet();}}
                        deletePlanet={()=>{this.deletePlanet();}}
                        changeSelected={(i)=>{this.changeSelected(i);}}
                        togglePlanetPlayer={()=>{this.togglePlanetPlayer();}}
                        orbitStepSize={this.state.orbitStepSize}
                        changeOrbitStepSize={(cock)=>{this.setState({orbitStepSize: cock})}}
            />
        </div>
    }



    planetParameterChange(planetIndex, planetParameter, planetValue) {
        var a = this.state.planetsInitial;
        a[planetIndex][planetParameter] = planetValue;
        this.setState({ planetsInitial: a });
        if (planetParameter == "color" || planetParameter == "") {
            this.state.planets[planetIndex][planetParameter] = this.state.planetAnimator.planets[planetIndex][planetParameter] = planetValue;
            rerenderOrbits(this.state.planets, this.state.viewingFrom, this.state.selected);
            this.state.planetAnimator.rerenderFrame();
        } else {
            this.calculateOrbits();
        }
    }

    calculateOrbits() {
        setInitalPlanets(this.state.planetsInitial);
        rerenderMain();
        // this.resetPlanetPlayer();
        // this.state.planetAnimator.rerenderFrame();
        calculateOrbits((out) => {
            // rerenderOrbits(out.planets, this.state.viewingFrom, this.state.selected);
            rerenderOrbits();
            this.setState({ planets: out.planets });
        });
    }

    viewFrom(index) {
        this.setState({ viewingFrom: index });
        viewFrom(index);
        rerenderMain();
        // this.state.planetAnimator.centerOn(index);
        // this.state.planetAnimator.rerenderFrame();
        
    }

    createPlanet() {
        this.state.planetsInitial.push(generateRandomPlanet());
        this.setState({ planetsInitial: this.state.planetsInitial });
        this.calculateOrbits();
    }

    deletePlanet(index) {
        this.state.planetsInitial.splice(index, 1);
        var v = this.props.viewFrom;
        if(v == index){
            v = -1;
        }else if(v > index){
            v-=2;
        }
        this.setState({ planetsInitial: this.state.planetsInitial, viewFrom: v });
        viewFrom(v);
        this.calculateOrbits();
    }

    changeSelected(index) {
        // console.log("cock", index)
        this.setState({ selected: index });
        setBolded(index);
        rerenderOrbits();
    }

    resetPlanetPlayer() {
        // var planets = this.state.planetsInitial.map((planet) => { return new Planet(planet.mass, planet.pi, planet.vi, planet.name, planet.color, planet.radius); });
        // this.state.planetAnimator.setPlanets(planets);
    }

    togglePlanetPlayer() {
        // this.state.planetAnimator.toggle();
    }
}

class SelectComponent extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props);
    }

    createOption(optionName, optionValue, index) {
        return e("option", {
            value: optionValue,
            key: index
        }, optionName);
    }

    render() {

        var options = this.props.options.map((option, i) => {
            return this.createOption(option.name, option.value, i);
        });

        return e("select", {
                onChange: (e) => {
                    if (e.target.options[e.target.selectedIndex]) {
                        this.props.onChange(e.target.options[e.target.selectedIndex].value);
                    }
                }
            },
            options
        );
    }
}

function AbbreviatedText (long, short){
    // return new React.Fragment;
    /*e("span", {
                        style: {
                            margin: "5px"
                        },
                        className: "text-long",
                    }, "View from this planet: "),
                    e("span", {
                        style: {
                            margin: "5px"
                        },
                        className: "text-short",
                    }, "View from this planet: ")*/
}

class PlanetList extends React.Component {
    constructor(props) {
        super(props);
    }

    createPlanetElement(planet, i) {
        return  <li key={i}
                    className="planet-element"
                    onMouseEnter={()=>{this.props.changeSelected(i);}}
                    onMouseLeave={()=>{this.props.changeSelected(-1);}}>
                        <div style={{backgroundColor: planet.color, display: "flex", jusitfyContent: "stretch", alignItems: "flex-end"}}>
                            <input  value={planet.color}
                                    style={{
                                        width:"7em",
                                        backgroundColor: "#00000000",
                                        outline: "none",
                                        border: "none",
                                    }}
                                    onChange={(e) => {
                                        this.props.planetParameterChange(i, "color", e.target.value);
                                    }}
                            />
                        </div>
                        <div style={{width: "100%", position: "relative"}}>
                            <div style={{
                                display: "grid",
                                gridTemplateRows: "100%",
                                gridTemplateColumns: "auto 30px",
                                width: "100%",
                                position: "relative",
                            }}>
                                <input className="title name-input" value={planet.name} onChange={(e) => {this.props.planetParameterChange(i, "name", e.target.value)}}/>
                                <div style={{display: "flex", justifyContent: "stretch", alignItems: "center"}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="hoverable" viewBox="0 0 16 16" onClick={()=>{this.props.deletePlanet(i);}} style={{borderRadius:"100%"}}>
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <span style={{margin: "5px"}} className="text-long">View from this planet: </span>
                                <span style={{margin: "5px"}} className="text-short">View here: </span>
                                <input type="radio" name="lock-to-center" value={i} onChange={(e)=>{this.props.viewFrom(parseInt(e.target.value));}}/>
                            </div>
                            <div style={{marginLeft: "10px"}}>
                                Mass
                                <input className="number-input" type="number" value={planet.mass} onChange={(e)=>{this.props.planetParameterChange(i,"mass", parseFloat(e.target.value))}}/>
                            </div>
                            <div style={{marginLeft: "10px"}} className="disable-1200">
                                Initial Position: (x: {round(planet.pi.x)}, y: {round(planet.pi.y)}, z: {round(planet.pi.z)})
                            </div>
                            <div style={{marginLeft: "10px"}} className="disable-1200">
                                Initial Velocity: (x: {round(planet.vi.x)}, y: {round(planet.vi.y)}, z: {round(planet.vi.z)})
                            </div>
                            <br/>
                            <span style={{marginLeft: "10px", padding: "3px"}} className="hoverable" onClick={(e)=>{goto(planet.pi.x, planet.pi.z)}}>Travel to</span>
                        </div>
                </li>;
    }

    render() {

        var elements = [];

        this.props.planetsInitial.forEach((planet, i) => {
            elements.push(this.createPlanetElement(planet, i));
            elements.push(e("hr", { key: "a" + i }));
        });

        return <React.Fragment>
        {e("ul", {
            className: "planet-list"
        },
            e("li", {
                className: "title",
                id:"penis",
            }, "Planet List",
            <div className="icon-wrap show-800" style={{width:"100%", height: "100%", margin: "0"}}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z"/></svg>
            </div>),
            e("br"),
            e("li", {

            }, "Render Settings"),
            e("li", {
                    style: {
                        marginLeft: "40px"
                    }
                }, "Orbit step size: ",
                e("input", {
                    className: "number-input",
                    type: "number",
                    value: this.props.orbitStepSize,
                    onChange: (e) => {
                        var val = parseInt(e.target.value);
                        this.props.changeOrbitStepSize(val > 0 ? val : 1);
                        rerenderMain();
                        this.setState({ x: 1 });
                    }
                }),
                e("br"),
                "Render Text: ",
                e("input", {
                    type: "checkbox",
                    checked: false,
                    onChange: (e) => {
                        // RenderSettings.renderText = !this.props.RenderSettings.renderText;
                        rerenderMain();
                        this.setState({ x: 1 });
                    }
                }),
                e("br"),
                "Render Detailed Text: ",
                e("input", {
                    type: "checkbox",
                    checked: false,
                    onChange: (e) => {
                        // RenderSettings.renderDetailedText = !this.props.RenderSettings.renderDetailedText;
                        rerenderMain();
                        this.setState({ x: 1 });
                    }
                }),
            ),
            e("br"),
            e("li", {},
                e("span", {}, "Global View: "),
                e("input", {
                    type: "radio",
                    name: "lock-to-center",
                    value: -1,
                    defaultChecked: true,
                    onChange: (e) => {
                        this.props.viewFrom(parseInt(e.target.value));
                    }
                })),
            e("hr"),
            elements,
            e("li", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }
            }, e("svg", {
                    width: "2em",
                    viewBox: "0 0 16 16",
                    xmls: "http://www.w3.org/2000/svg",
                    className: "hoverable",
                    style: {
                        borderRadius: "100%",
                    },
                    onClick: () => {
                        this.props.createPlanet();
                    }
                },
                e("path", {
                    fillRule: "evenodd",
                    d: "M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"
                }),
                e("path", {
                    fillRule: "evenodd",
                    d: "M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z",
                }),
            ))
            )}
            </React.Fragment>;
    }
}

function randomVector(minX, maxX, minY, maxY, minZ, maxZ) {
    return {
        x: (maxX - minX) * Math.random() + minX,
        y: /* (maxY - minY) * Math.random() + minY */ 0,
        z: (maxZ - minZ) * Math.random() + minZ /* 0 */,
    };
}

function randomPlanetName() {
    var type = Math.floor(Math.random() * 1);
    if (type == 0) {
        const prefixes = ["Alpha", "Proxima", "Beta", "Gamma", "Delta", "Epsilon", "Sigma", "Pera", "Sega", "Mera", "Pax"];
        const endings = ["Centauri", "Taurus", "Draconis", "Orion", "Cassiopiea", "Saggitarus", "Virginus", "Sagitarii", "Pegasi", "Ceti", "Pollux", "Ursus", "Majoris", "Minoris", "Polaris", "Equatiux", "Celestae", "Solarus", "Helios", "Lunarus", "Artimei"];

        var out = "";


        if (Math.random() < 0.7) {
            out += prefixes[Math.floor(Math.random() * prefixes.length)] + " ";
        }
        out += endings[Math.floor(Math.random() * (endings.length))];

        return out;
    }
}

function randomColor() {
    const shit = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    var out = "#";
    for (var i = 0; i < 6; i++) {
        out += shit[Math.floor(shit.length * Math.random())];
    }
    return out;
}

function generateRandomPlanet() {
    return {
        mass: Math.random() * 30000,
        pi: randomVector(-3000, 3000, -3000, 3000, -3000, 3000),
        vi: randomVector(-5, 5, -5, 5, -5, 5),
        name: randomPlanetName(),
        color: randomColor(),
        radius: Math.random() * 200,
    };
}


// default export Main;
export default Main;
// ReactDOM.render(e(Main), document.getElementById("root"));