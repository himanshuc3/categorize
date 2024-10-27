// TODO: After countless efforts and time drain,
// had to switch to cjs, because esm and ts-node is
// a bitch.
import Controller from './helper/controller';

const controller = new Controller();

controller.parseArguments();
controller.initiateSegregation();
