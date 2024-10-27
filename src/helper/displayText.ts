// import boxen from 'boxen'
// import chalk from 'chalk'

let instance = null;

export default class DisplayText {
	constructor() {}

	//     poster(text: string){
	//         const textWithStyles = chalk.white.bold(text)
	// const boxenOptions: { [key: string]: unknown } = {
	//     padding: 1,
	//     margin: 1,
	//     borderStyle: "round",
	//     borderColor: "green",
	//     backgroundColor: "#555555"
	// };
	// const msgBox = boxen(textWithStyles, boxenOptions);

	// console.log(msgBox);
	//     }

	static getInstance() {
		if (!instance) {
			instance = new DisplayText();
		}
		return instance;
	}
}
