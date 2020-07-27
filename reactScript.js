/* jshint esversion: 9 */

const e = React.createElement;

var rerenderMain = () => {};

class Main extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            planetsInitial: [
                { mass: 3000, pi: { x: 0, y: 0, z: 0 }, vi: { x: 0, y: 0, z: 0 }, name: "Sun", color: "#e6f74a" },
                { mass: 600, pi: { x: -1284, y: 0, z: 0 }, vi: { x: 0, y: 0, z: 1 }, name: "Big Blue", color: "#48fae5" }
            ],
            planets: [

            ],
            viewingFrom: -1,
        };

        this.calculateOrbits();

        rerenderMain = () => {
            rerender(this.state.planets, this.state.viewingFrom);
        };
    }

    render() {
        return e("div", {

        }, e(PlanetList, {
            planetsInitial: this.state.planetsInitial,
            planetParameterChange: (pI, pP, pV) => {
                this.planetParameterChange(pI, pP, pV);
            },
            viewFrom: (i) => {
                this.viewFrom(i);
            },
            createPlanet: () => {
                this.createPlanet();
            },
            deletePlanet: (i) => {
                this.deletePlanet(i);
            }
        }));
    }

    planetParameterChange(planetIndex, planetParameter, planetValue) {
        var a = this.state.planetsInitial;
        a[planetIndex][planetParameter] = planetValue;
        this.setState({ planetsInitial: a });

        this.calculateOrbits();
    }

    calculateOrbits() {
        var planets = this.state.planetsInitial.map((planet) => { return new Planet(planet.mass, planet.pi, planet.vi, planet.name, planet.color) });
        if (currentCalculation) {
            clearInterval(currentCalculation);
        }
        calculateOrbits(planets, (out) => {
            rerender(out.planets, this.state.viewingFrom);
            this.setState({ planets: out.planets });
        });
    }

    viewFrom(index) {
        this.setState({ viewingFrom: index });
        rerender(this.state.planets, index);
    }

    createPlanet() {
        this.state.planetsInitial.push(generateRandomPlanet());
        this.setState({ planetsInitial: this.state.planetsInitial });
        this.calculateOrbits();
    }

    deletePlanet(index) {
        this.state.planetsInitial.splice(index, 1);
        this.setState({ planetsInitial: this.state.planetsInitial });
        this.calculateOrbits();
    }
}

class PlanetList extends React.Component {
    constructor(props) {
        super(props);
    }

    createPlanetElement(planet, i) {
        return e("li", {
                key: i,
                className: "planet-element",
                onMouseEnter: () => {

                },
                onMouseExit: () => {

                }
            },
            e("div", {
                style: {
                    backgroundColor: planet.color
                }
            }, ),
            e("div", {},
                e("div", {
                        style: {
                            display: "grid",
                            gridTemplateRows: "100%",
                            gridTemplateColumns: "auto 30px",
                        },
                    }, e("input", {
                        className: "title name-input",
                        defaultValue: planet.name,
                    }),
                    e("div", {
                            style: {
                                display: "flex",
                                justifyContent: "stretch",
                                alignItems: "center",
                            }
                        },
                        e("svg", {
                                width: "100%",
                                viewBox: "0 0 16 16",
                                xmls: "http://www.w3.org/2000/svg",
                                className: "hoverable",
                                onClick: () => {
                                    this.props.deletePlanet(i);
                                },
                                style: {
                                    borderRadius: "100%",
                                }
                            },
                            e("path", {
                                fillRule: "evenodd",
                                d: "M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z"
                            }),
                            e("path", {
                                fillRule: "evenodd",
                                d: "M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z"
                            }),
                        )
                    )
                ),
                e("div", {},
                    e("span", {
                        style: {
                            margin: "5px"
                        }
                    }, "View from this planet: "),
                    e("input", {
                        type: "radio",
                        name: "lock-to-center",
                        value: i,
                        onChange: (e) => {
                            this.props.viewFrom(parseInt(e.target.value));
                        }
                    })),
                e("br"),
                e("div", {
                    className: "subtitle"
                }, "Mass: ", e("input", {
                    className: "number-input",
                    defaultValue: planet.mass,
                    onChange: (e) => {
                        this.props.planetParameterChange(i, "mass", parseFloat(e.target.value));
                    }
                })),
                e("div", {
                        className: "subtitle"
                    }, `Initial Position: (x: `,
                    e("input", {
                        className: "number-input",
                        defaultValue: planet.pi.x,
                        onChange: (e) => {
                            var val = e.target.value;
                            planet.pi.x = parseFloat(val);
                            this.props.planetParameterChange(i, "pi", planet.pi);
                        }
                    }),
                    `, y: `,
                    e("input", {
                        className: "number-input",
                        defaultValue: planet.pi.y,
                        onChange: (e) => {
                            var val = e.target.value;
                            planet.pi.y = parseFloat(val);
                            this.props.planetParameterChange(i, "pi", planet.pi);
                        }
                    }),
                    `, z: `,
                    e("input", {
                        className: "number-input",
                        defaultValue: planet.pi.z,
                        onChange: (e) => {
                            var val = e.target.value;
                            planet.pi.z = parseFloat(val);
                            this.props.planetParameterChange(i, "pi", planet.pi);
                        }
                    }),
                    `)`),
                e("div", {
                        className: "subtitle"
                    },
                    `Initial Velocity: (x: `,
                    e("input", {
                        className: "number-input",
                        defaultValue: planet.vi.x,
                        onChange: (e) => {
                            var val = e.target.value;
                            planet.vi.x = parseFloat(val);
                            this.props.planetParameterChange(i, "vi", planet.vi);
                        }
                    }),
                    `, y: `,
                    e("input", {
                        className: "number-input",
                        defaultValue: planet.vi.y,
                        onChange: (e) => {
                            var val = e.target.value;
                            planet.vi.y = parseFloat(val);
                            this.props.planetParameterChange(i, "vi", planet.vi);
                        }
                    }),
                    `, z: `,
                    e("input", {
                        className: "number-input",
                        defaultValue: planet.vi.z,
                        onChange: (e) => {
                            var val = e.target.value;
                            planet.vi.z = parseFloat(val);
                            this.props.planetParameterChange(i, "vi", planet.vi);
                        }
                    }),
                    `)`),
            )
        );
    }

    render() {

        var elements = [];

        this.props.planetsInitial.forEach((planet, i) => {
            elements.push(this.createPlanetElement(planet, i));
            elements.push(e("hr", { key: "a" + i }));
        });

        return e("ul", {},
            e("li", {
                className: "title"
            }, "Planet List"),
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
        );
    }
}

function randomVector(minX, maxX, minY, maxY, minZ, maxZ) {
    return {
        x: (maxX - minX) * Math.random() + minX,
        y: (maxY - minY) * Math.random() + minY,
        z: (maxZ - minZ) * Math.random() + minZ,
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
    };
}

ReactDOM.render(e(Main), document.getElementById("root"));